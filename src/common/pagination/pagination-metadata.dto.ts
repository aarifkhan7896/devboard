import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadataDto {
  @ApiProperty({ type: Number, example: 1 })
  page!: number;

  @ApiProperty({ type: Number, example: 100 })
  limit!: number;

  @ApiProperty({ type: Number, example: 500 })
  total!: number;

  @ApiProperty({ type: Number, example: 5 })
  totalPages!: number;

  @ApiProperty({ type: Boolean, example: true })
  hasNextPage!: boolean;

  @ApiProperty({ type: Boolean, example: false })
  hasPreviousPage!: boolean;
}
