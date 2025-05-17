import { NoticeAuthors } from "@/db/entity/notice-authors.entity";
import { TimeStampEntity } from "@/db/entity/timestamp.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: "notice" })
export class Notices extends TimeStampEntity {
  @PrimaryColumn("bigint", {
    transformer: {
      from: (value: string) => Number(value),
      to: (value: number) => value,
    },
  })
  id: number;

  @Column({ type: "varchar", length: 2083 })
  url: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @ManyToOne(() => NoticeAuthors, { eager: true, nullable: false })
  @JoinColumn({ name: "author_id" })
  author: NoticeAuthors;

  public toJSON() {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      author: this.author.name,
      createAt: this.createdAt,
    };
  }

  // public static toDiscordMessageOfJSON(json: string) {
  //   const { url, title, author, createAt } = JSON.parse(json);
  //   return `[(${createAt})${title}](${url})\n작성기관: ${author}`;
  // }
}
