import { NoticeAuthors } from "@/entity/notice-authors.entity";
import { TimeStampEntity } from "@/entity/timestamp.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: "notice" })
export class Notices extends TimeStampEntity {
  @PrimaryColumn("bigint")
  id: number;

  @Column({ type: "varchar", length: 2083 })
  url: string;

  @Column({ type: "varchar", length: 2083, name: "short_url" })
  shortUrl: string;

  @ManyToOne(() => NoticeAuthors, { eager: true, nullable: false })
  @JoinColumn({ name: "author_id" })
  author: NoticeAuthors;
}
