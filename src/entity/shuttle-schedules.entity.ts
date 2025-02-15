import { TimeStampEntity } from "@/entity/timestamp.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "shuttle_schedules" })
export class ShuttleSchedules extends TimeStampEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 2083, name: "image_url" })
  imageUrl: string;

  @Column({ type: "varchar", length: 100 })
  place: string;
}
