import { IsInt, IsString } from "class-validator";
import "reflect-metadata";

export class NoticeAuthorResponse {
  @IsInt()
  id: number;
  @IsString()
  name: string;
}
