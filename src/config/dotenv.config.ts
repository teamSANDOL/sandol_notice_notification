import { NODE_ENV } from "@/share/const/node-env";
import dotenv from "dotenv";
import path from "path";
const isDevEnv = process.env.NODE_ENV !== NODE_ENV.PROD;

dotenv.config({
  debug: isDevEnv,
  path: path.resolve(process.cwd(), isDevEnv ? ".env.dev" : ".env"),
});
