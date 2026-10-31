import amqplib from "amqplib";
jest.mock("amqplib", () => ({
  __esModule: true,
  default: { connect: jest.fn() },
}));

import { AmqpService, EventTopic } from "./amqp.service";

describe("AmqpService.subscribeEvent", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("접속 실패 후 백오프 재시도로 구독에 성공한다", async () => {
    jest.useFakeTimers();
    const ch = {
      assertExchange: jest.fn(),
      assertQueue: jest.fn().mockResolvedValue({ queue: "q" }),
      bindQueue: jest.fn(),
      consume: jest.fn(),
    };
    const connect = jest
      .mocked(amqplib.connect)
      .mockRejectedValueOnce(new Error("connect EHOSTUNREACH"))
      .mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue(ch),
      } as never);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);

    await new AmqpService().subscribeEvent(
      "q",
      EventTopic.enum.Notice,
      jest.fn(),
    );
    await jest.advanceTimersByTimeAsync(1000);

    expect(connect).toHaveBeenCalledTimes(2);
    expect(ch.consume).toHaveBeenCalledTimes(1);
  });
});
