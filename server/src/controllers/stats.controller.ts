import { Request, Response } from 'express';
import { Expense } from '../models/expense.model';

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTH_NAMES  = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** GET /api/stats/by-category?year=YYYY&month=M */
export const getByCategory = async (req: Request, res: Response): Promise<void> => {
  const now   = new Date();
  const year  = parseInt(req.query['year']  as string, 10) || now.getFullYear();
  const month = parseInt(req.query['month'] as string, 10) || now.getMonth() + 1;

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59, 999);

  const items = await Expense.aggregate([
    { $match: { date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'cat',
      },
    },
    { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        name:  { $ifNull: ['$cat.name',  'Sin categoría'] },
        color: { $ifNull: ['$cat.color', '#bdbdbd'] },
        total: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.json({
    data: {
      period: `${MONTH_NAMES[month - 1]} ${year}`,
      items,
    },
  });
};

/** GET /api/stats/monthly?year=YYYY */
export const getMonthly = async (req: Request, res: Response): Promise<void> => {
  const now  = new Date();
  const year = parseInt(req.query['year'] as string, 10) || now.getFullYear();

  const start = new Date(year, 0, 1);
  const end   = new Date(year, 11, 31, 23, 59, 59, 999);

  const raw = await Expense.aggregate([
    { $match: { date: { $gte: start, $lte: end } } },
    { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' } } },
    { $sort: { _id: 1 } },
  ]);

  const months = MONTH_LABELS.map((label, i) => {
    const found = raw.find((r) => r._id === i + 1);
    return { month: i + 1, label, total: found?.total ?? 0 };
  });

  res.json({ data: { year, months } });
};
