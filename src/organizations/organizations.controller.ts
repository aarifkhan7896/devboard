import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationDto } from '../common/pagination/pagination.dto';
import {
  OrganizationResponseDto,
  PaginatedOrganizationResponseDto,
} from './dto/organization-response.dto';
import { PaginatedResponse } from '../common/pagination/pagination.interface';
import { responseMessages } from '../common/response-info';

@Controller('organizations')
@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create organization',
    description: 'Creates a new organization for the authenticated user.',
  })
  @ApiBody({
    type: CreateOrganizationDto,
    description: 'Organization details to create',
  })
  @ApiCreatedResponse({
    description: 'Organization created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, invalid or missing JWT token',
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization ID',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: responseMessages.invalidUserId,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: responseMessages.internalServerError,
      },
    },
  })
  async create(@Body() dto: CreateOrganizationDto, @Req() request: Request) {
    this.logger.log('Creating organization for authenticated user');

    const user = request.user as {
      userId: string;
      email: string;
    };

    return this.organizationsService.createOrganization(dto, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get my organizations',
    description: 'Returns all organizations for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Organizations retrieved successfully',
    type: PaginatedOrganizationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, invalid or missing JWT token',
  })
  @ApiBadRequestResponse({
    description: 'Invalid pagination or user ID',
  })
  @ApiNotFoundResponse({
    description: responseMessages.noRecordFound,
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: responseMessages.noRecordFound,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: responseMessages.internalServerError,
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records per page',
    example: 100,
  })
  async findCurrentUserOrganizations(
    @Query() paginationDto: PaginationDto,
    @Req() request: Request,
  ): Promise<PaginatedResponse<OrganizationResponseDto>> {
    this.logger.log('Fetching organizations for authenticated user');

    const user = request.user as {
      userId: string;
    };

    return this.organizationsService.findUserOrganizations(
      paginationDto,
      user.userId,
    );
  }

  @Get(':organizationId')
  @ApiOperation({
    summary: 'Get organization by ID',
    description: 'Returns a single organization by its identifier.',
  })
  @ApiOkResponse({
    description: 'Organization retrieved successfully',
    type: OrganizationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, invalid or missing JWT token',
  })
  @ApiNotFoundResponse({
    description: responseMessages.noRecordFound,
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: responseMessages.noRecordFound,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization ID',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: responseMessages.invalidUserId,
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: responseMessages.internalServerError,
      },
    },
  })
  async findOne(@Param('organizationId') organizationId: string) {
    this.logger.log(`Fetching organization details for id: ${organizationId}`);
    return this.organizationsService.findOrganizationById(organizationId);
  }
}
