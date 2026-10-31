jest.mock("amqplib", () => ({
  __esModule: true,
  default: { connect: jest.fn() },
}));

import amqplib from "amqplib";
import { EventEmitter } from "node:events";
import { AmqpService, EventTopic } from "./amqp.service";

function fakeConn() {
  const ch = Object.assign(new EventEmitter(), {
    assertExchange: jest.fn(),
    assertQueue: jest.fn().mockResolvedValue({ queue: "q" }),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
  });
  const conn = Object.assign(new EventEmitter(), {
    createChannel: jest.fn().mockResolvedValue(ch),
    close: jest.fn().mockResolvedValue(undefined),
  });
  return { conn, ch };
}

describe("AmqpService 재연결", () => {
  let first: ReturnType<typeof fakeConn>;
  let second: ReturnType<typeof fakeConn>;
  let service: AmqpService;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    first = fakeConn();
    second = fakeConn();
    jest
      .mocked(amqplib.connect)
      .mockReset()
      .mockResolvedValueOnce(first.conn as never)
      .mockResolvedValue(second.conn as never);
    service = new AmqpService();
    await service.subscribeEvent("q", EventTopic.enum.Notice, jest.fn());
    await jest.advanceTimersByTimeAsync(0);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("close 후 재연결하고 이전 구독을 다시 건다", async () => {
    expect(first.ch.consume).toHaveBeenCalledTimes(1);
    expect(service.status).toBe("connected");

    first.conn.emit("close");
    expect(service.status).toBe("retrying");
    await jest.advanceTimersByTimeAsync(0);

    expect(amqplib.connect).toHaveBeenCalledTimes(2);
    expect(second.ch.consume).toHaveBeenCalledTimes(1);
    expect(service.status).toBe("connected");
  });

  it("재연결 중 publishEvent는 던지기만 하고 프로세스에 영향이 없다", async () => {
    jest
      .mocked(amqplib.connect)
      .mockReset()
      .mockRejectedValue(new Error("down"));
    first.conn.emit("close");

    await expect(
      service.publishEvent(EventTopic.enum.Notice, "x"),
    ).rejects.toThrow("재연결 중");
    await jest.advanceTimersByTimeAsync(1000);
    expect(service.status).toBe("retrying");
  });

  it("종료 중 close는 재연결하지 않는다", async () => {
    await service.onModuleDestroy();
    first.conn.emit("close");
    await jest.advanceTimersByTimeAsync(60_000);

    expect(amqplib.connect).toHaveBeenCalledTimes(1);
  });
});
