export interface Category {
  _id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
  icon?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
