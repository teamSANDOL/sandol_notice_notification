import { DormitoryNoticeService } from "@/service/dormitory-notice.service";
import { NoticeService } from "@/service/notice.service";
import cron from "node-cron";
export class CronService {
  public static async allCronJobBy1Minute() {
    // 1분마다 실행
    cron.schedule(
      "*/60 * * * * *", //
      CronService.repeatTaskBy1Minute
    );
    // 서버 실행시 실행하도록!
    CronService.repeatTaskBy1Minute();
  }

  public static async repeatTaskBy1Minute() {
    console.log("반복 작업 시작!");

    try {
      // 1. 공지사항 크롤링
      const noticeService = await NoticeService.get();
      await noticeService.cronJob();

      // 2. 기숙사 공지사항 크롤링
      const dormitoryNoticeService = await DormitoryNoticeService.get();
      await dormitoryNoticeService.cronJob();

      // 3. 셔틀버스 시간표 변경 크롤링
    } catch (err) {
      console.error("CRON ERROR!", err);
    }
  }
}
