import { NODE_ENV } from "@/share/const/node-env";
import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  type: "postgres",
  host:
    NODE_ENV.LOCAL === process.env.NODE_ENV
      ? "localhost"
      : process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ["./src/entity/*.entity.*"],
  synchronize: process.env.NODE_ENV === NODE_ENV.PROD ? true : false,
  logging: ["error"],
  migrations: [],
  ssl: false,
  subscribers: [],
});
