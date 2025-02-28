import amqplib, { Channel } from "amqplib";

export class EventService {
  public static EXCHANGE_NAME = "SCHOOL.NOTIFICATIONS";
  public static instance: EventService;
  constructor(private ch: Channel) {}
  public static async get() {
    if (!this.instance) {
      const conn = await amqplib.connect(`amqp://${process.env.AMQP_URL}`);
      const ch = await conn.createChannel();

      this.instance = new EventService(ch);
    }

    return this.instance;
  }

  public static async subscribeAllListener() {
    // const eventService = await EventService.get();
    // try {
    //   eventService.subscribeEvent(
    //     EVENT_TOPIC.SHUTTLE_SCHEDULE,
    //     (msg?: string) => {
    //       console.log("msg: ", msg);
    //     }
    //   );
    // } catch (err) {
    //   console.log("err: ", err);
    // }
  }

  public async publishEvent(
    routeKey: keyof typeof EVENT_TOPIC,
    content: string
  ) {
    await this.ch.assertExchange(
      EventService.EXCHANGE_NAME, //
      "topic",
      // { durable: true }
    );

    this.ch.publish(
      EventService.EXCHANGE_NAME, //
      EVENT_TOPIC[routeKey],
      Buffer.from(content)
    );
  }

  public async subscribeEvent(
    routeKey: keyof typeof EVENT_TOPIC,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    callback: Function
  ) {
    // 채널 연결

    // exchange 생성 (있다면 있는것으로 조회)
    await this.ch.assertExchange(
      EventService.EXCHANGE_NAME, //
      "topic",
      // { durable: true }
    );

    // queue 생성
    const assertQueue = await this.ch.assertQueue(
      "", //
      { autoDelete: true, durable: true }
    );

    // queue 바인딩
    await this.ch.bindQueue(
      assertQueue.queue,
      EventService.EXCHANGE_NAME,
      EVENT_TOPIC[routeKey]
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
}

export const EVENT_TOPIC = {
  NOTICE: process.env.SCHOOL_NOTIFICATIONS_TOPIC_NOTICE ?? "",
  NOTICE_DORMITORY:
    process.env.SCHOOL_NOTIFICATIONS_TOPIC_NOTICE_DORMITORY ?? "",
  SHUTTLE_SCHEDULE:
    process.env.SCHOOL_NOTIFICATIONS_TOPIC_SHUTTLE_SCHEDULE ?? "",
} as const;
