import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class PaginationQuery {
  @ApiPropertyOptional({
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  public readonly page: number;

  @ApiPropertyOptional({
    default: 10,
  })
  @IsNumber()
  @Type(() => Number)
  public readonly size: number;
}
