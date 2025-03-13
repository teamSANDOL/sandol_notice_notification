import { IsString } from "class-validator";
import { Get, JsonController } from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

class UserResponse {
  @IsString()
  name: string;

  @IsString({ each: true })
  hobbies: string[];
}

@JsonController("/notice")
export class NoticeController {
  @Get()
  @ResponseSchema(UserResponse, { isArray: true })
  getAll() {
    return [
      { id: 1, name: "First user!", hobbies: [] },
      { id: 2, name: "Second user!", hobbies: ["fishing", "cycling"] },
    ];
  }
}
