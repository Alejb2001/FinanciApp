import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    color: { type: String, required: true, default: '#1a73e8' },
    icon: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Category = model<ICategory>('Category', categorySchema);
