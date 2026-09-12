import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { responseMessages } from '../common/response-info';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  /**
   * Validates a user's credentials by checking the email and comparing the provided password to the stored hash.
   *
   * @param email - The user's email address.
   * @param pass - The plain-text password to validate.
   * @returns The authenticated user without the password field.
   */
  async validateUser(email: string, pass: string) {
    this.logger.log(`Validating user credentials for email: ${email}`);

    // 1. Find user and EXPLICITLY request the password field using +password
    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      this.logger.log(`User not found for login attempt: ${email}`);
      throw new HttpException(
        responseMessages.invalidCredentials,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Compare incoming plain-text password with stored hash
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      this.logger.log(`Invalid password attempt for email: ${email}`);
      throw new HttpException(
        responseMessages.invalidCredentials,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. Password matched! Strip the hash before returning the user object
    user.password = undefined;
    return user;
  }

  /**
   * Generates a JWT access token for the authenticated user.
   *
   * @param user - The authenticated user payload.
   * @returns An object containing the generated access token.
   */
  async login(user: any) {
    this.logger.log(`Generating access token for user: ${user.email}`);

    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
