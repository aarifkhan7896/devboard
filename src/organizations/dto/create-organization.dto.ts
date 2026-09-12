import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Design' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ example: 'acme-design' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  slug!: string;

  @ApiPropertyOptional({ example: 'Our product design organization' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}
