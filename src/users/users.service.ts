import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { responseMessages } from '../common/response-info';
import { PaginationDto } from '../common/pagination/pagination.dto';
import { createPagination } from '../common/pagination/pagination.util';
import { parseSort, validateUserId } from '../common/utils';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { appConfig } from '../config/app.config';
import { UpdateUserRecordDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}
  private readonly logger = new Logger(UsersService.name);

  async createUser(userData: CreateUserDto) {
    const existingUser = await this.userModel
      .findOne(
        {
          email: userData.email,
        },
        { email: 1 },
      )
      .lean()
      .exec();

    if (existingUser) {
      this.logger.log(`User with email ${userData.email} already exists`);
      throw new HttpException(
        responseMessages.emailAlreadyExists,
        HttpStatus.CONFLICT,
      );
    }

    const { password, ...restData } = userData;

    const hashedPassword = await bcrypt.hash(
      password,
      appConfig.bcryptSaltRounds,
    );

    const user = await this.userModel.create({
      ...restData,
      password: hashedPassword,
    });

    this.logger.log(`User created successfully with ID: ${user._id}`);

    return {
      userId: user._id.toString(),
      message: responseMessages.userCreatedSuccessfully,
    };
  }

  async getUserById(id: string) {
    const userId = validateUserId(id);
    this.logger.log(`Retrieving user with ID: ${id}`);

    const user = await this.userModel
      .findById(userId, {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        active: 1,
        createdAt: 1,
      })
      .lean()
      .exec();

    if (!user) {
      this.logger.log(`User with ID ${id} not found`);
      throw new HttpException(
        responseMessages.userNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async deleteUserById(id: string) {
    const userId = validateUserId(id);
    this.logger.log(`Deleting user with ID: ${id}`);

    const result = await this.userModel.deleteOne({ _id: userId }).exec();

    if (result.deletedCount === 0) {
      throw new HttpException(
        responseMessages.userNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      count: result.deletedCount,
      message: responseMessages.userDeletedSuccessfully,
    };
  }

  async getUsers(paginationDto: PaginationDto, sort: string) {
    const { page, limit } = paginationDto;
    const sortQuery = parseSort(sort);

    const [result] = await this.userModel.aggregate([
      {
        $facet: {
          data: [
            { $sort: sortQuery },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                active: 1,
                createdAt: 1,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const { data, total } = result;

    if (data.length === 0 && total.length === 0) {
      throw new HttpException(
        responseMessages.noRecordFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const totalCount = result.total[0].count;
    const responseData: UserResponseDto[] = result.data;

    return createPagination(paginationDto, totalCount, responseData);
  }

  async updateUserDetails(
    id: string,
    updateUserRecordDto: UpdateUserRecordDto,
  ) {
    const userId = validateUserId(id);

    const { password, ...restData } = updateUserRecordDto;

    const updateData = password
      ? {
          ...restData,
          password: await bcrypt.hash(password, appConfig.bcryptSaltRounds),
        }
      : restData;

    const result = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        {
          returnDocument: 'after',
          runValidators: true,
        },
      )
      .exec();

    if (!result) {
      this.logger.warn(`User not found while updating. userId=${id}`);

      throw new HttpException(
        responseMessages.userNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`User details updated successfully. userId=${id}`);

    return {
      userId: result._id.toString(),
      message: responseMessages.userDetailsUpdatedSuccessfully,
    };
  }

  async validateUser(email: string, pass: string) {
    // 1. Find user and EXPLICITLY request the password field using +password
    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    // 2. Compare incoming plain-text password with stored hash
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    // 3. Password matched! Strip the hash before returning the user object
    user.password = undefined;
    return user;
  }
}
