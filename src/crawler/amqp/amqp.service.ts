import { Injectable } from "@nestjs/common";
import amqplib, { Channel } from "amqplib";
import z from "zod";

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

  public async subscribeEvent(
    queueName = "",
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
        await callback(content);
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

const EVENT_TOPIC = {
  Notice: "notice",
  NoticeDormitory: "notice.dormitory",
  ShuttleSchedule: "shuttlebus",
} as const;

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

export const EventTopic = z.nativeEnum(EVENT_TOPIC);
export type EventTopic = z.infer<typeof EventTopic>;

if (!AmqpService.EXCHANGE_NAME) {
  throw Error("SCHOOL_NOTIFICATION_EXCHANGE is not set");
}
