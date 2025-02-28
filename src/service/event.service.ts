import { DiscordService } from "@/service/discord.service";
import amqplib, { Channel, Connection } from "amqplib";

export class EventService {
  public static instance: EventService;
  constructor(private conn: Connection, private ch: Channel) {}
  public static async get() {
    if (!this.instance) {
      const conn = await amqplib.connect(`amqp://${process.env.AMQP_URL}`);
      const ch = await conn.createChannel();

      this.instance = new EventService(conn, ch);
    }

    return this.instance;
  }

  public async subscribeAllListener() {
    DiscordService.get().registerEventSubscription();
  }

  public async publishEvent(eventName: EVENT_NAME, content: string) {
    await this.ch.assertExchange(eventName, "fanout", {
      autoDelete: true,
    });
    this.ch.publish(eventName, "", Buffer.from(content));
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  public async subscribeEvent(eventName: EVENT_NAME, callback: Function) {
    // 채널 연결

    // exchange 생성
    await this.ch.assertExchange(eventName, "fanout", {
      autoDelete: true,
    });

    // queue 생성
    const assertQueue = await this.ch.assertQueue(eventName, {
      autoDelete: false,
    });

    // queue 바인딩
    await this.ch.bindQueue(assertQueue.queue, eventName, "");

    this.ch.consume(
      assertQueue.queue,
      async (msg) => {
        const content = msg?.content?.toString();
        if (!content) {
          console.log("Consumer cancelled by server");
        } else {
          await callback(content);
        }
      },
      { noAck: true }
    );
  }
}

export enum EVENT_NAME {
  NEW_NOTICE = "NEW_NOTICE",
}
