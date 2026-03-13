import { Category } from './category.model';

export type BudgetType = 'general' | 'category';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  _id: string;
  type: BudgetType;
  amount: number;
  period: BudgetPeriod;
  category?: Category | string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDto {
  type: BudgetType;
  amount: number;
  period: BudgetPeriod;
  category?: string; // Category _id — required when type === 'category'
  startDate: string;
  endDate?: string;
}

export type UpdateBudgetDto = Partial<CreateBudgetDto>;

export interface BudgetFilters {
  type?: BudgetType;
}
