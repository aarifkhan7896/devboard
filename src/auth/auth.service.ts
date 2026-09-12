import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async validateUser(email: string, pass: string) {
    // 1. Find user and EXPLICITLY request the password field using +password
    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw new HttpException(
        responseMessages.invalidCredentials,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Compare incoming plain-text password with stored hash
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new HttpException(
        responseMessages.invalidCredentials,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. Password matched! Strip the hash before returning the user object
    user.password = undefined;
    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
