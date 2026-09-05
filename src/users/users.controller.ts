import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { responseMessages } from '../common/response-info';
import { PaginationDto } from '../common/pagination/pagination.dto';
import {
  PaginatedUserResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import { PaginatedResponse } from '../common/pagination/pagination.interface';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { ALLOWED_VALUES } from '../common/utils';
import { UpdateUserRecordDto } from './dto/update-user.dto';
import { UpdateUserResponseDto } from './dto/update-user-repsonse.dto';

@ApiTags('Users')
@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private logger = new Logger(UsersController.name);

  @Get('users')
  @ApiOperation({ summary: 'Get user details' })
  @ApiOkResponse({
    description: responseMessages.getUser,
    type: PaginatedUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: responseMessages.invalidUserId,
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: responseMessages.invalidUserId,
      },
    },
  })
  @ApiNotFoundResponse({
    description: responseMessages.userNotFound,
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: responseMessages.noRecordFound,
      },
    },
  })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({
    name: 'limit',
    description: 'Number of records per page',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    description: 'Sort fields. Prefix with "-" for descending order.',
    example: '-name,email',
    required: false,
  })
  async getUsers(
    @Query() paginationDto: PaginationDto,
    @Query('sort') sort: string,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    try {
      if (sort) {
        const isInvalid = sort.split(',').some((item) => {
          const field = item.trim().replace(/^-/, '');
          return !ALLOWED_VALUES.has(field);
        });

        if (isInvalid) {
          throw new HttpException(
            responseMessages.invalidKeyProvided,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return await this.usersService.getUsers(paginationDto, sort);
    } catch (error) {
      throw error;
    }
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get user details by id' })
  @ApiOkResponse({
    description: responseMessages.getUser,
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: responseMessages.invalidUserId,
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: responseMessages.invalidUserId,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: responseMessages.userNotFound,
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The Id of the user to retrieve',
    required: true,
  })
  async getUserById(@Param('id') id: string) {
    try {
      return await this.usersService.getUserById(id);
    } catch (error) {
      this.logger.log(`Error retrieving user by Id: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  @Post('user/create')
  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse({
    description: responseMessages.userCreatedSuccessfully,
    type: CreateUserResponseDto,
  })
  @ApiConflictResponse({
    description: responseMessages.emailAlreadyExists,
    schema: {
      example: {
        statusCode: HttpStatus.CONFLICT,
        message: responseMessages.emailAlreadyExists,
      },
    },
  })
  @ApiBody({ type: CreateUserDto, description: 'User data for creation' })
  async createUser(
    @Body() userData: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    try {
      return await this.usersService.createUser(userData);
    } catch (error) {
      this.logger.log(`Error creating user: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  @Delete('user/:id')
  @ApiOperation({ summary: 'Delete user by Id' })
  @ApiOkResponse({
    description: 'Delete user by Id',
    schema: {
      example: {
        count: 1,
        message: responseMessages.userDeletedSuccessfully,
      },
    },
  })
  @ApiBadRequestResponse({
    description: responseMessages.invalidUserId,
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: responseMessages.invalidUserId,
      },
    },
  })
  @ApiNotFoundResponse({
    description: responseMessages.userNotFound,
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: responseMessages.userNotFound,
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The Id of the user to delete',
    required: true,
  })
  async deleteUserById(@Param('id') id: string) {
    try {
      return await this.usersService.deleteUserById(id);
    } catch (error) {
      this.logger.log(`Error deleting user by Id: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  @Patch('user/:id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiOkResponse({
    description: 'User details updated successfully',
    type: UpdateUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: responseMessages.invalidUserId,
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: responseMessages.invalidUserId,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: responseMessages.userNotFound,
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'User Id',
    type: String,
    example: '6a9b0f25612bcd8f1c516941',
  })
  @ApiBody({
    description: 'User details to update',
    type: UpdateUserRecordDto,
  })
  async updateUserDetails(
    @Param('id') id: string,
    @Body() updateUserRecordDto: UpdateUserRecordDto,
  ): Promise<UpdateUserResponseDto> {
    try {
      return this.usersService.updateUserDetails(id, updateUserRecordDto);
    } catch (error) {
      this.logger.log(`Error updating user by Id: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
