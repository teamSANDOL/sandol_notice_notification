import { NoticeService } from "./notice.service";

describe("NoticeService.cronJob", () => {
  it("저장/발행이 reject해도 예외를 전파하지 않는다", async () => {
    const notice = { title: "t", toJSON: () => ({}) };
    const repo = { save: jest.fn().mockRejectedValue(new Error("db down")) };
    const amqp = {
      publishEvent: jest.fn().mockRejectedValue(new Error("amqp down")),
    };
    const svc = new NoticeService(
      repo as never,
      {} as never,
      {} as never,
      amqp as never,
    );
    jest
      .spyOn(svc, "findNewNoticeUsingCrawling")
      .mockResolvedValue([notice] as never);
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    await expect(svc.cronJob()).resolves.toBeUndefined();

    repo.save.mockResolvedValue([notice]);
    await expect(svc.cronJob()).resolves.toBeUndefined();
    expect(amqp.publishEvent).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
