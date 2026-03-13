import { Request, Response } from 'express';
import { Expense } from '../models/expense.model';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { category, startDate, endDate } = req.query;

  const filter: Record<string, unknown> = {};
  if (category) filter['category'] = category;
  if (startDate || endDate) {
    filter['date'] = {};
    if (startDate) (filter['date'] as Record<string, unknown>)['$gte'] = new Date(startDate as string);
    if (endDate) (filter['date'] as Record<string, unknown>)['$lte'] = new Date(endDate as string);
  }

  const expenses = await Expense.find(filter)
    .populate('category', 'name color icon')
    .sort({ date: -1 });

  res.json({ data: expenses });
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  const expense = await Expense.findById(req.params['id']).populate('category', 'name color icon');
  if (!expense) {
    res.status(404).json({ message: 'Expense not found' });
    return;
  }
  res.json({ data: expense });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const expense = new Expense(req.body);
  await expense.save();
  await expense.populate('category', 'name color icon');
  res.status(201).json({ data: expense });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const expense = await Expense.findByIdAndUpdate(req.params['id'], req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name color icon');
  if (!expense) {
    res.status(404).json({ message: 'Expense not found' });
    return;
  }
  res.json({ data: expense });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const expense = await Expense.findByIdAndDelete(req.params['id']);
  if (!expense) {
    res.status(404).json({ message: 'Expense not found' });
    return;
  }
  res.status(204).send();
};
