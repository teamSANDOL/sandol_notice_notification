import { Controller } from "@tsed/di";
import { QueryParams } from "@tsed/platform-params";
import { Get } from "@tsed/schema";

@Controller("/hello-world")
export class HelloWorldController {
  @Get("/")
  get(@QueryParams("id") id: number) {
    console.log("q: ", id);
    return "hello";
  }
}
