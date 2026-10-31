import { Injectable } from "@nestjs/common";
import amqplib, { Channel } from "amqplib";
import z from "zod";

const EVENT_TOPIC = {
  Notice: "notice",
  NoticeDormitory: "notice.dormitory",
  ShuttleSchedule: "shuttlebus",
} as const;

@Injectable()
export class AmqpService {
  public static EXCHANGE_NAME = process.env.SCHOOL_NOTIFICATION_EXCHANGE!;
  private ch?: Channel;

  public async publishEvent(eventTopic: EventTopic, content: string) {
    if (!this.ch) {
      this.ch = await this.getChannel();
    }
    this.ch.publish(
      AmqpService.EXCHANGE_NAME, //
      eventTopic,
      Buffer.from(content),
    );
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
    void this.subscribeWithRetry(queueName, eventTopic, callback);
  }

  private async subscribeWithRetry(
    queueName: string,
    eventTopic: EventTopic,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    callback: Function,
  ): Promise<void> {
    for (let delay = 1000; ; delay = Math.min(delay * 2, 30_000)) {
      try {
        await this.subscribe(queueName, eventTopic, callback);
        return;
      } catch (err) {
        console.warn(
          `AMQP 구독 실패(${queueName}), ${delay}ms 후 재시도:`,
          err,
        );
        this.ch = undefined;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private async subscribe(
    queueName: string,
    eventTopic: EventTopic,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    callback: Function,
  ) {
    if (!this.ch) {
      this.ch = await this.getChannel();
    }

    // queue 생성
    const assertQueue = await this.ch.assertQueue(
      queueName, // 임의의 큐 (랜덤 문자열 Queue 생성으로 소비자가 없으면 자동으로 제거되는 큐를 생성한다.)
      { autoDelete: true, durable: true },
    );

    // queue 바인딩
    await this.ch.bindQueue(
      assertQueue.queue,
      AmqpService.EXCHANGE_NAME,
      eventTopic,
    );

    this.ch.consume(assertQueue.queue, async (msg) => {
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

    this.ch = await conn.createChannel();
    // exchange 생성 (있다면 있는것으로 조회)
    await this.ch.assertExchange(
      AmqpService.EXCHANGE_NAME, //
      "topic",
      // { durable: true }
    );

    return this.ch;
  }
}

export const EventTopic = z.nativeEnum(EVENT_TOPIC);
export type EventTopic = z.infer<typeof EventTopic>;
