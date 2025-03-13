import { IsInt, IsOptional, IsPositive } from "class-validator";
import "reflect-metadata";

export class PaginationQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  public page?: number;

  @IsInt()
  @IsOptional()
  public size?: number;
}

export class CursorPaginationQuery extends PaginationQuery {
  @IsInt()
  @IsOptional()
  public cursor?: number;
}
