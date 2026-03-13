import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Budget } from '../models/budget.model';
import { Expense } from '../models/expense.model';

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

export const getStatus = async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const budgets = await Budget.find().populate('category', 'name color icon');

  const items = await Promise.all(
    budgets.map(async (budget) => {
      const expenseFilter: Record<string, unknown> = {
        date: { $gte: startOfMonth, $lte: endOfMonth },
      };

      if (budget.type === 'category' && budget.category) {
        const catId = (budget.category as unknown as { _id: Types.ObjectId })._id;
        expenseFilter['category'] = catId;
      }

      const agg = await Expense.aggregate([
        { $match: expenseFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent: number = agg[0]?.total ?? 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        budget,
        spent,
        remaining: budget.amount - spent,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok',
      };
    }),
  );

  res.json({
    data: {
      period: { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() },
      items,
    },
  });
};
