import { ApiProperty } from '@nestjs/swagger';

import { responseMessages } from '../../common/response-info';

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'User Id',
    example: '6a9b0f25612bcd8f1c516941',
  })
  userId!: string;

  @ApiProperty({
    description: 'Response message',
    example: responseMessages.userCreatedSuccessfully,
  })
  message!: string;
}
