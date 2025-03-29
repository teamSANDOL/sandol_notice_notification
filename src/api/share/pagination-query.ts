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

export class PaginationResult<T = any> {
  items: T[];
  total: number;
  page: number;
  size: number; // Renamed from limit to size

  constructor(items: T[], total: number, page: number, size: number) {
    // Updated parameter name
    this.items = items;
    this.total = total;
    this.page = page;
    this.size = size; // Updated assignment
  }

  static of<T>(data: {
    items: T[];
    total: number;
    page: number;
    size: number; // Updated parameter name
  }): PaginationResult<T> {
    return new PaginationResult(data.items, data.total, data.page, data.size); // Updated argument
  }
}
