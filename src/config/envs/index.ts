import dotenv from "dotenv-flow";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

export const isProduction = process.env.NODE_ENV === "production";

const envPath = !isProduction ? ".env.dev" : ".env";
export const config = dotenv.config({
  debug: !isProduction,
  // path: path.resolve(process.cwd(), !isProduction ? ".env.dev" : ".env"),
  files: [envPath],
});

export const envs = process.env;
