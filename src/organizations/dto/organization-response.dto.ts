import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadataDto } from '../../common/pagination/pagination-metadata.dto';

export class OrganizationResponseDto {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class MembershipReponseDto {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  organization!: OrganizationResponseDto;
}

export class PaginatedOrganizationResponseDto {
  @ApiProperty({ type: [MembershipReponseDto] })
  entities!: MembershipReponseDto[];

  @ApiProperty({ type: PaginationMetadataDto })
  metadata!: PaginationMetadataDto;
}
