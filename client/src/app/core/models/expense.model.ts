import { Category } from './category.model';

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category: Category | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  amount: number;
  description: string;
  date: string;
  category: string; // Category _id
}

export type UpdateExpenseDto = Partial<CreateExpenseDto>;

export interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
}
