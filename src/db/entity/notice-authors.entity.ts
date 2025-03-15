import { TimeStampEntity } from "@/db/entity/timestamp.entity";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "notice_authors" })
export class NoticeAuthors extends TimeStampEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100, unique: true })
  name: string;
}
