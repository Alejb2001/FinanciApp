import { Schema, model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  amount: number;
  description: string;
  date: Date;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true },
);

// Index for common query patterns
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1, date: -1 });

export const Expense = model<IExpense>('Expense', expenseSchema);
