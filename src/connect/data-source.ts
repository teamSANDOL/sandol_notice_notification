import { join } from "path";
import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ["./src/entity/*.entity.*"],
  synchronize: true,
  logging: ["error", "query"],
  migrations: [],
  ssl: false,
  subscribers: [],
});
