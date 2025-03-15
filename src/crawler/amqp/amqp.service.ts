import { Injectable } from "@nestjs/common";
import amqplib, { Channel } from "amqplib";

@Injectable()
export class AmqpService {
  public static EXCHANGE_NAME = "SCHOOL.NOTIFICATIONS";
  private ch: Channel;

  public async publishEvent(
    routeKey: keyof typeof EVENT_TOPIC,
    content: string,
  ) {
    this.ch.publish(
      AmqpService.EXCHANGE_NAME, //
      EVENT_TOPIC[routeKey],
      Buffer.from(content),
    );
  }

  public async subscribeEvent(
    routeKey: keyof typeof EVENT_TOPIC,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    callback: Function,
  ) {
    // queue 생성
    const assertQueue = await this.ch.assertQueue(
      "", // 임의의 큐 (랜덤 문자열 Queue 생성으로 소비자가 없으면 자동으로 제거되는 큐를 생성한다.)
      { autoDelete: true, durable: true },
    );

    // queue 바인딩
    await this.ch.bindQueue(
      assertQueue.queue,
      AmqpService.EXCHANGE_NAME,
      EVENT_TOPIC[routeKey],
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

  async onModuleInit(): Promise<void> {
    const conn = await amqplib.connect(`amqp://${process.env.AMQP_URL}`);

    this.ch = await conn.createChannel();
    // exchange 생성 (있다면 있는것으로 조회)
    await this.ch.assertExchange(
      AmqpService.EXCHANGE_NAME, //
      "topic",
      // { durable: true }
    );

    await this.subscribeEvent("NOTICE", async (content: string) => {
      console.log("content: ", content);
    });
  }
}

export const EVENT_TOPIC = {
  NOTICE: process.env.SCHOOL_NOTIFICATIONS_TOPIC_NOTICE ?? "",
  NOTICE_DORMITORY:
    process.env.SCHOOL_NOTIFICATIONS_TOPIC_NOTICE_DORMITORY ?? "",
  SHUTTLE_SCHEDULE:
    process.env.SCHOOL_NOTIFICATIONS_TOPIC_SHUTTLE_SCHEDULE ?? "",
} as const;
