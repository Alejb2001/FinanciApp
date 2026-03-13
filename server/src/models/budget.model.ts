import { Schema, model, Document, Types } from 'mongoose';

export type BudgetType = 'general' | 'category';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface IBudget extends Document {
  type: BudgetType;
  amount: number;
  period: BudgetPeriod;
  category?: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    type: { type: String, enum: ['general', 'category'], required: true },
    amount: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ['weekly', 'monthly', 'yearly'], required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true },
);

// Enforce: if type === 'category', category field must exist
budgetSchema.pre('validate', function (next) {
  if (this.type === 'category' && !this.category) {
    next(new Error('A category budget must reference a category'));
  } else {
    next();
  }
});

export const Budget = model<IBudget>('Budget', budgetSchema);
