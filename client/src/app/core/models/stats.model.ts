export interface CategoryStatItem {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

export interface CategoryStatsResponse {
  period: string;
  items: CategoryStatItem[];
}

export interface MonthlyStatItem {
  month: number;
  label: string;
  total: number;
}

export interface MonthlyStatsResponse {
  year: number;
  months: MonthlyStatItem[];
}
