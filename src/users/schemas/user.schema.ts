import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the document type so TypeScript recognizes the document instance
export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  password?: string;

  @Prop({ default: true })
  active!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// password encryption and decryption using Schema

// UserSchema.pre<UserDocument>('save', async function () {
//   // Only hash the password if it has been modified or is new
//   if (!this.isModified('password')) {
//     return;
//   }

//   const saltRounds = appConfig.bcryptSaltRounds;
//   this.password = await bcrypt.hash(this.password, saltRounds);
// });

// UserSchema.methods.comparePassword = async function (
//   candidatePassword: string,
// ): Promise<boolean> {
//   return await bcrypt.compare(candidatePassword, this.password);
// };
