import { Request, Response } from 'express';
import { Budget } from '../models/budget.model';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { type } = req.query;
  const filter: Record<string, unknown> = {};
  if (type) filter['type'] = type;

  const budgets = await Budget.find(filter)
    .populate('category', 'name color icon')
    .sort({ createdAt: -1 });

  res.json({ data: budgets });
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  const budget = await Budget.findById(req.params['id']).populate('category', 'name color icon');
  if (!budget) {
    res.status(404).json({ message: 'Budget not found' });
    return;
  }
  res.json({ data: budget });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const budget = new Budget(req.body);
  await budget.save();
  await budget.populate('category', 'name color icon');
  res.status(201).json({ data: budget });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const budget = await Budget.findByIdAndUpdate(req.params['id'], req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name color icon');
  if (!budget) {
    res.status(404).json({ message: 'Budget not found' });
    return;
  }
  res.json({ data: budget });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const budget = await Budget.findByIdAndDelete(req.params['id']);
  if (!budget) {
    res.status(404).json({ message: 'Budget not found' });
    return;
  }
  res.status(204).send();
};
