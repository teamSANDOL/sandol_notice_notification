import { routingControllersOptions } from "@/config/controller.config";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

import "reflect-metadata";
import { getMetadataArgsStorage } from "routing-controllers";

import { routingControllersToSpec } from "routing-controllers-openapi";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { defaultMetadataStorage } = require("class-transformer/cjs/storage");

const storage = getMetadataArgsStorage();

const schemas = validationMetadatasToSchemas({
  classTransformerMetadataStorage: defaultMetadataStorage,
  refPointerPrefix: "#/components/schemas/",
});

export const swaggerSpec = routingControllersToSpec(
  storage,
  routingControllersOptions,
  {
    components: { schemas },
    info: {
      description: "산돌이 공지사항 알림이 REST API Swagger 문서",
      title: "Sandol Notice Notification API",
      version: "1.0.0",
    },
  }
);
