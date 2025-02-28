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
    //     EVENT_TOPIC.NOTICE_DORMITORY,
    //     (msg?: string) => {
    //       console.log("msg: ", msg);
    //     }
    //   );
    // } catch (err) {
    //   console.log("err: ", err);
    // }
  }

  public async publishEvent(routeKey: EVENT_TOPIC, content: string) {
    await this.ch.assertExchange(EventService.EXCHANGE_NAME, "topic", {
      durable: true,
      autoDelete: true,
    });

    this.ch.publish(
      EventService.EXCHANGE_NAME, //
      routeKey,
      Buffer.from(content)
    );
  }

  public async subscribeEvent(
    routeKey: EVENT_TOPIC,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    callback: Function
  ) {
    // 채널 연결

    // exchange 생성 (있다면 있는것으로 조회)
    await this.ch.assertExchange(
      EventService.EXCHANGE_NAME, //
      "topic",
      { autoDelete: true, durable: true }
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
      routeKey
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

export enum EVENT_TOPIC {
  NOTICE = "notice",
  NOTICE_DORMITORY = "notice.dormitory",
  SHUTTLEBUS = "shuttlebus",
}
