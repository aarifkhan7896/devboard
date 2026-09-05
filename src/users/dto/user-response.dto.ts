import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadataDto } from '../../common/pagination/pagination-metadata.dto';

export class UserResponseDto {
  @ApiProperty({
    type: String,
    example: '68babc1234567890abcdef12',
  })
  _id!: string;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    type: String,
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    type: Boolean,
    example: true,
  })
  active!: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-09-05T10:00:00.000Z',
  })
  createdAt?: Date;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  entities!: UserResponseDto[];

  @ApiProperty({ type: PaginationMetadataDto })
  metadata!: PaginationMetadataDto;
}
