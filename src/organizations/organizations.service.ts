import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Organization } from './schemas/organization.schema';
import { Model, Types } from 'mongoose';
import { Membership } from './schemas/membership.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { MembershipRole } from './enum/membership-role.enum';
import { validateMongoId } from '../common/utils';
import { PaginationDto } from '../common/pagination/pagination.dto';
import { createPagination } from '../common/pagination/pagination.util';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { PaginatedResponse } from '../common/pagination/pagination.interface';
import { responseMessages } from '../common/response-info';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel('Organization')
    private readonly organizationModel: Model<Organization>,

    @InjectModel('Membership')
    private readonly membershipModel: Model<Membership>,
  ) {}

  private readonly logger = new Logger(OrganizationsService.name);

  /**
   * Creates a new organization and assigns the authenticated user as an admin member.
   *
   * @param createOrganizationDto - DTO containing the organization details.
   * @param userId - The authenticated user's ID.
   * @returns The created organization document.
   */
  async createOrganization(
    createOrganizationDto: CreateOrganizationDto,
    userId: string,
  ) {
    this.logger.log(`Creating organization for userId: ${userId}`);

    const id = validateMongoId(userId);
    const organization = await this.organizationModel.create(
      createOrganizationDto,
    );

    await this.membershipModel.create({
      userId: id,
      organizationId: organization._id,
      role: MembershipRole.ADMIN,
    });

    this.logger.log(
      `Organization created successfully with id: ${organization._id}`,
    );

    return organization;
  }

  /**
   * Fetches an organization by its ID.
   *
   * @param id - The organization identifier.
   * @returns The organization record if found.
   */
  async findOrganizationById(id: string) {
    const orgId = validateMongoId(id);
    this.logger.log(`Fetching organization details for id: ${id}`);

    const organization = await this.organizationModel
      .findById(orgId)
      .lean()
      .exec();

    if (!organization) {
      throw new HttpException(
        responseMessages.noRecordFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return organization;
  }

  /**
   * Retrieves all organizations associated with a specific user.
   *
   * @param userId - The authenticated user's ID.
   * @returns Membership records populated with organization information.
   */
  async findUserOrganizations(
    paginationDto: PaginationDto,
    userId: string,
  ): Promise<PaginatedResponse<OrganizationResponseDto>> {
    this.logger.log(`Fetching organizations for userId: ${userId}`);

    const { page, limit } = paginationDto;

    const id = validateMongoId(userId);

    const [results] = await this.membershipModel.aggregate([
      {
        $match: {
          userId: id,
        },
      },
      {
        $lookup: {
          from: 'organization',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization',
        },
      },
      {
        $unwind: {
          path: '$organization',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                __v: 0,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    if (!results || !results.total || results.total.length === 0) {
      throw new HttpException(
        responseMessages.noRecordFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const totalCount = results.total[0].count;
    const responseData: OrganizationResponseDto[] = results.data;

    // const memberships = await this.membershipModel
    //   .find({ userId: id })
    //   .populate('organizationId')
    //   .skip((page - 1) * limit)
    //   .limit(limit)
    //   .lean()
    //   .exec();

    return createPagination<OrganizationResponseDto>(
      paginationDto,
      totalCount,
      responseData,
    );
  }
}
