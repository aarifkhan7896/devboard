import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserRecordDto {
  @ApiPropertyOptional({
    description: 'User email',
    type: String,
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'User password',
    type: String,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
