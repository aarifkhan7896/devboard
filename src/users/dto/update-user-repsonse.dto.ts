import { ApiProperty } from '@nestjs/swagger';

import { responseMessages } from '../../common/response-info';

export class UpdateUserResponseDto {
  @ApiProperty({
    description: 'Updated user Id',
    type: String,
    example: '6a9b0f25612bcd8f1c516941',
  })
  userId!: string;

  @ApiProperty({
    description: 'Response message',
    type: String,
    example: responseMessages.userDetailsUpdatedSuccessfully,
  })
  message!: string;
}
