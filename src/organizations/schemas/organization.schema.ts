import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Define the document type so TypeScript recognizes the document instance
export type OrganizationDocument = Organization & Document;

@Schema({ collection: 'organization', timestamps: true, versionKey: false })
export class Organization {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug!: string;

  @Prop({
    trim: true,
    default: '',
  })
  description!: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
