import { HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { responseMessages } from './response-info';

export const ALLOWED_VALUES = new Set(['name', 'email', 'createdAt']);

export const parseSort = (sort: string): Record<string, 1 | -1> => {
  const result: Record<string, 1 | -1> = {};

  for (const item of (sort ?? '-createdAt')?.split(',')) {
    const part = item.trim();

    if (!part) continue;

    if (part.startsWith('-')) {
      result[part.slice(1)] = -1;
    } else {
      result[part] = 1;
    }
  }

  return result;
};

export const validateUserId = (id: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpException(
      responseMessages.invalidUserId,
      HttpStatus.BAD_REQUEST,
    );
  }

  return new Types.ObjectId(id);
};
