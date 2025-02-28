import { NoticeService } from "@/service/notice.service";
import cron from "node-cron";
export class CronService {
  public static async allCronJobBy2Minute() {
    // 10초마다 실행
    cron.schedule(
      "*/10 * * * * *", //
      CronService.repeatTaskBy2Minute
    );
    // 서버 실행시 실행하도록!
    CronService.repeatTaskBy2Minute();
  }

  public static async repeatTaskBy2Minute() {
    try {
      const noticeService = await NoticeService.get();
      await noticeService.cronJob();
    } catch (err) {
      console.error("NOTICE SERVICE ERROR!", err);
    }
  }
}
