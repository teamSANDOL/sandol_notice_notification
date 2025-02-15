import { NoticeAuthors } from "@/entity/notice-authors.entity";
import { TimeStampEntity } from "@/entity/timestamp.entity";
import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";

@Entity({ name: "dormitory_notices" })
export class DormitoryNotices extends TimeStampEntity {
  @PrimaryColumn("bigint")
  id: number;

  @Column({ type: "varchar", length: 2083 })
  url: string;

  @Column({ type: "varchar", length: 2083 })
  short_url: string;

  @ManyToOne(() => NoticeAuthors, { eager: true, nullable: false })
  author: NoticeAuthors;
}
