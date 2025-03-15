import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";

export class TimeStampEntity {
  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @DeleteDateColumn({ type: "timestamptz", name: "deleted_at" })
  deletedAt: Date;
}
