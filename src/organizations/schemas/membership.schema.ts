import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MembershipRole } from '../enum/membership-role.enum';

// Define the document type so TypeScript recognizes the document instance
export type MembershipDocument = Membership & Document;

@Schema({ collection: 'membership', timestamps: true, versionKey: false })
export class Membership {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: MembershipRole,
    default: MembershipRole.MEMBER,
  })
  role!: MembershipRole;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

MembershipSchema.index(
  {
    userId: 1,
    organizationId: 1,
  },
  {
    unique: true,
  },
);
