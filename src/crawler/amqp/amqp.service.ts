import { Injectable } from "@nestjs/common";
import amqplib, { Channel, ChannelModel } from "amqplib";
import z from "zod";

const EVENT_TOPIC = {
  Notice: "notice",
  NoticeDormitory: "notice.dormitory",
  ShuttleSchedule: "shuttlebus",
} as const;

@Injectable()
export class AmqpService {
  public static EXCHANGE_NAME = process.env.SCHOOL_NOTIFICATION_EXCHANGE!;
  private conn?: ChannelModel;
  private ch?: Channel;
  // subscribeEvent로 등록된 구독. 재연결 시 모두 다시 건다.
  private subs: {
    queueName: string;
    eventTopic: EventTopic;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    callback: Function;
    active: boolean;
  }[] = [];
  private connecting?: Promise<void>;
  private closing = false;

  public get status(): "connected" | "retrying" {
    return this.ch ? "connected" : "retrying";
  }

  // 채널이 없으면 재연결을 기다리지 않고 바로 던진다(호출부 try/catch가 warn 처리).
  // 백그라운드 재연결만 깨워 두고, 이 호출의 이벤트는 유실된다.
  public async publishEvent(eventTopic: EventTopic, content: string) {
    if (!this.ch) {
      this.ensureConnected();
      throw new Error(
        "AMQP 연결이 없어 이벤트를 발행하지 못했습니다(재연결 중)",
      );
    }
    this.ch.publish(
      AmqpService.EXCHANGE_NAME, //
      eventTopic,
      Buffer.from(content),
    );
  }

  async onModuleDestroy(): Promise<void> {
    this.closing = true;
    await this.conn?.close().catch(() => undefined);
  }

  async onModuleInit(): Promise<void> {
    if (EVENT_TOPIC.Notice !== process.env.SCHOOL_NOTIFICATIONS_TOPIC_NOTICE) {
      throw new Error("SCHOOL_NOTIFICATIONS_TOPIC_NOTICE is not set");
    }
    if (
      EVENT_TOPIC.NoticeDormitory !==
      process.env.SCHOOL_NOTIFICATIONS_TOPIC_NOTICE_DORMITORY
    ) {
      throw new Error("SCHOOL_NOTIFICATIONS_TOPIC_NOTICE_DORMITORY is not set");
    }
    if (
      EVENT_TOPIC.ShuttleSchedule !==
      process.env.SCHOOL_NOTIFICATIONS_TOPIC_SHUTTLE_SCHEDULE
    ) {
      throw new Error("SCHOOL_NOTIFICATIONS_TOPIC_SHUTTLE_SCHEDULE is not set");
    }

    if (!AmqpService.EXCHANGE_NAME) {
      throw Error(
        `SCHOOL_NOTIFICATION_EXCHANGE is not set => ${AmqpService.EXCHANGE_NAME}`,
      );
    }
  }

  // AMQP가 내려가 있어도 부팅(Nest 초기화)을 막거나 죽이지 않도록
  // 백그라운드에서 지수 백오프(1s~30s)로 재시도한다. 호출자는 기다리지 않는다.
  public async subscribeEvent(
    queueName = "",
    eventTopic: EventTopic,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    callback: Function,
  ): Promise<void> {
    this.subs.push({ queueName, eventTopic, callback, active: false });
    this.ensureConnected();
  }

  // 동시에 하나의 재연결 루프만 돈다.
  private ensureConnected(): void {
    if (this.connecting || this.closing) return;
    this.connecting = this.connectLoop().finally(() => {
      this.connecting = undefined;
      // 루프 종료 직전에 추가된 구독이 있으면 다시 돈다.
      if (this.subs.some((s) => !s.active)) this.ensureConnected();
    });
  }

  private async connectLoop(): Promise<void> {
    for (let delay = 1000; !this.closing; delay = Math.min(delay * 2, 30_000)) {
      try {
        if (!this.ch) await this.getChannel();
        for (const sub of this.subs) {
          if (!sub.active) {
            await this.subscribe(sub);
            sub.active = true;
          }
        }
        return;
      } catch (err) {
        console.warn(`AMQP 연결/구독 실패, ${delay}ms 후 재시도:`, err);
        await Promise.resolve()
          .then(() => this.conn?.close())
          .catch(() => undefined);
        this.resetConnection();
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private resetConnection(): void {
    this.conn = undefined;
    this.ch = undefined;
    this.subs.forEach((s) => (s.active = false));
  }

  private async subscribe({
    queueName,
    eventTopic,
    callback,
  }: AmqpService["subs"][number]) {
    const ch = this.ch!;

    // queue 생성
    const assertQueue = await ch.assertQueue(
      queueName, // 임의의 큐 (랜덤 문자열 Queue 생성으로 소비자가 없으면 자동으로 제거되는 큐를 생성한다.)
      { autoDelete: true, durable: true },
    );

    // queue 바인딩
    await ch.bindQueue(
      assertQueue.queue,
      AmqpService.EXCHANGE_NAME,
      eventTopic,
    );

    await ch.consume(assertQueue.queue, async (msg) => {
      const content = msg?.content?.toString();
      if (!content) {
        console.log("Consumer cancelled by server");
      } else {
        try {
          await callback(content);
        } catch (err) {
          console.warn("AMQP 메시지 처리 실패:", err);
        }
      }
    });
  }

  async getChannel(): Promise<Channel> {
    const conn = await amqplib.connect(`amqp://${process.env.AMQP_URL}`);
    this.conn = conn;
    // 'error'를 처리하지 않으면 uncaught exception으로 프로세스가 죽는다.
    conn.on("error", (err) => console.warn("AMQP 연결 오류:", err));
    conn.on("close", () => {
      if (this.conn !== conn) return;
      this.resetConnection();
      if (this.closing) return;
      console.warn("AMQP 연결이 끊겼습니다. 재연결합니다.");
      this.ensureConnected();
    });

    const ch = await conn.createChannel();
    ch.on("error", (err) => console.warn("AMQP 채널 오류:", err));
    this.ch = ch;
    // exchange 생성 (있다면 있는것으로 조회)
    await ch.assertExchange(
      AmqpService.EXCHANGE_NAME, //
      "topic",
      // { durable: true }
    );

    return ch;
  }
}

export const EventTopic = z.nativeEnum(EVENT_TOPIC);
export type EventTopic = z.infer<typeof EventTopic>;
