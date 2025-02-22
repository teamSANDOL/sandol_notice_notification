import { WebhookClient } from "discord.js";

export class DiscordService {
  public static async get() {
    return new DiscordService();
  }

  public async sendMessage(
    message: string,
    to: keyof typeof DISCORD_WEBHOOK_URL
  ) {
    const client = new WebhookClient({ url: DISCORD_WEBHOOK_URL[to] });
    await client.send({
      content: message,
    });
  }
}

export const DISCORD_WEBHOOK_URL = {
  NOTICE: process.env.NOTICE_WEBHOOK_URL ?? "",
  DORMITORY_NOTICE: process.env.DORMITORY_NOTICE_WEBHOOK_URL ?? "",
} as const;
