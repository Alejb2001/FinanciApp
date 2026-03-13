import { Request, Response } from 'express';
import { Category } from '../models/category.model';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ data: categories });
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findById(req.params['id']);
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.json({ data: category });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const category = new Category(req.body);
  await category.save();
  res.status(201).json({ data: category });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findByIdAndUpdate(req.params['id'], req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.json({ data: category });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findByIdAndDelete(req.params['id']);
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.status(204).send();
};
