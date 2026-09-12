import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Enter email', required: true })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Enter password', required: true })
  @IsString()
  @MinLength(8)
  password!: string;
}
