import { NoticeAuthors } from "@/entity/notice-authors.entity";
import { TimeStampEntity } from "@/entity/timestamp.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: "dormitory_notices" })
export class DormitoryNotices extends TimeStampEntity {
  @PrimaryColumn("bigint")
  id: number;

  @Column({ type: "varchar", length: 2083 })
  url: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @ManyToOne(() => NoticeAuthors, { eager: true, nullable: false })
  @JoinColumn({ name: "author_id" })
  author: NoticeAuthors;
}
