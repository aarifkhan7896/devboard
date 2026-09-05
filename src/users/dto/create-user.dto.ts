import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: true,
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: true,
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsString()
  email!: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'SecurePassword123',
    required: true,
  })
  @IsString()
  password!: string;
}
