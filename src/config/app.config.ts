import 'dotenv/config';
import getenv from 'getenv';

export const appConfig = {
  port: getenv.int('PORT', 3000),

  database: {
    mongodbUri: getenv('MONGODB_URI', 'mongodb://localhost:27017/devboard'),
  },

  jwt: {
    secret: getenv('JWT_SECRET', 'APP_VAULT'),
    expiresIn: getenv('JWT_EXPIRES_IN', '15m'),
  },

  bcryptSaltRounds: getenv.int('BCRYPT_SALT_ROUNDS', 'APP_VAULT'),
};
