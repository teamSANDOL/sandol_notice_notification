import { Notices } from "@/entity/notices.entity";
import { EVENT_NAME, EventService } from "@/service/event.service";
import { WebhookClient } from "discord.js";

export class DiscordService {
  public static get() {
    return new DiscordService();
  }

  public async registerEventSubscription() {
    const eventService = await EventService.get();
    eventService.subscribeEvent(EVENT_NAME.NEW_NOTICE, (notice: string) => {
      console.log("이벤트 수신!", notice);
      this.sendMessage(
        Notices.discordMessageOfJSON(notice),
        DISCORD_WEBHOOK_URL.NOTICE
      );
    });
  }

  public async sendMessage(message: string, to: DISCORD_WEBHOOK_URL) {
    const client = new WebhookClient({ url: WEBHOOK_MAP[to] });
    await client.send({
      content: message,
    });
  }
}

export enum DISCORD_WEBHOOK_URL {
  NOTICE = "NOTICE",
  DORMITORY_NOTICE = "DORMITORY_NOTICE",
}

const WEBHOOK_MAP: Record<DISCORD_WEBHOOK_URL, string> = {
  [DISCORD_WEBHOOK_URL.NOTICE]: process.env.NOTICE_WEBHOOK_URL ?? "",
  [DISCORD_WEBHOOK_URL.DORMITORY_NOTICE]:
    process.env.DORMITORY_NOTICE_WEBHOOK_URL ?? "",
};
