import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { responseMessages } from '../common/response-info';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate a user and return a JWT access token.',
  })
  @ApiBody({
    description: 'User login credentials',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: responseMessages.invalidCredentials,
  })
  @ApiResponse({
    status: 401,
    description: responseMessages.invalidEmailOrPassword,
  })
  async loginUser(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt received for email: ${loginDto.email}`);

    const { email, password } = loginDto;

    const user = await this.authService.validateUser(email, password);

    if (!user) {
      this.logger.warn(`Unauthorized login attempt for email: ${email}`);
      throw new UnauthorizedException(responseMessages.invalidEmailOrPassword);
    }

    const tokenResponse = await this.authService.login(user);
    this.logger.log(`Login successful for email: ${email}`);

    return tokenResponse;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current authenticated user',
    description:
      'Returns the authenticated user information extracted from the JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '64e8b9d5f2d9a1b4c7d0d1a2' },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, invalid or missing JWT token',
  })
  getMe(@Req() request: Request) {
    this.logger.log('Fetching current authenticated user from JWT');
    return request.user;
  }
}
