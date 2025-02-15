import { TimeStampEntity } from "@/entity/timestamp.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "school_meal_menu" })
export class SchoolMealMenu extends TimeStampEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 2083, name: "image_url", nullable: false })
  imageUrl: string;

  @Column({ type: "varchar", length: 100 })
  place: string;
}
