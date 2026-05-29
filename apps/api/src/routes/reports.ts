import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/summary', asyncHandler(async (req, res) => {
  const q = z.object({ days: z.coerce.number().int().min(1).max(365).default(30) }).parse(req.query);
  const from = new Date(); from.setDate(from.getDate() - q.days);
  const today = new Date(); today.setHours(0,0,0,0);

  const [sales, expenses, products, customers, lowProducts, movements] = await Promise.all([
    prisma.sale.findMany({ where: { businessId: req.user!.businessId, status: 'COMPLETED', createdAt: { gte: from } }, include: { items: { include: { product: { include: { category: true } } } } }, orderBy: { createdAt: 'asc' } }),
    prisma.expense.findMany({ where: { businessId: req.user!.businessId, paidAt: { gte: from } } }),
    prisma.product.findMany({ where: { businessId: req.user!.businessId, status: 'ACTIVE' }, include: { category: true } }),
    prisma.customer.count({ where: { businessId: req.user!.businessId } }),
    prisma.product.findMany({ where: { businessId: req.user!.businessId, status: 'ACTIVE' }, orderBy: { stock: 'asc' }, take: 100 }),
    prisma.inventoryMovement.findMany({ where: { businessId: req.user!.businessId }, include: { product: true, user: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' }, take: 10 })
  ]);

  const revenue = sales.reduce((s, sale) => s + Number(sale.total), 0);
  const profit = sales.reduce((s, sale) => s + sale.items.reduce((x, item) => x + (Number(item.unitPrice) - Number(item.cost)) * item.quantity - Number(item.discount), 0), 0) - expenses.reduce((s,e)=>s+Number(e.amount),0);
  const unitsSold = sales.reduce((s, sale) => s + sale.items.reduce((x, i) => x + i.quantity, 0), 0);
  const inventoryValue = products.reduce((s,p)=>s+Number(p.cost)*p.stock,0);
  const lowStock = lowProducts.filter(p => p.stock <= p.lowStockThreshold);

  const trendMap = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let i = q.days - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate()-i); const key = d.toISOString().slice(0,10); trendMap.set(key, { date: key, revenue: 0, orders: 0 }); }
  sales.forEach(s => { const key = s.createdAt.toISOString().slice(0,10); const day = trendMap.get(key); if (day) { day.revenue += Number(s.total); day.orders += 1; } });

  const bestMap = new Map<string, any>();
  const catMap = new Map<string, any>();
  for (const sale of sales) for (const item of sale.items) {
    const p = item.product;
    const current = bestMap.get(p.id) || { id: p.id, name: p.name, sku: p.sku, quantity: 0, revenue: 0 };
    current.quantity += item.quantity; current.revenue += Number(item.total); bestMap.set(p.id, current);
    const cat = p.category?.name || 'بدون تصنيف';
    const c = catMap.get(cat) || { name: cat, revenue: 0, quantity: 0 };
    c.revenue += Number(item.total); c.quantity += item.quantity; catMap.set(cat, c);
  }

  res.json({ data: {
    kpis: { revenue, profit, orders: sales.length, unitsSold, customers, inventoryValue, lowStockCount: lowStock.length, expenses: expenses.reduce((s,e)=>s+Number(e.amount),0) },
    revenueTrend: Array.from(trendMap.values()),
    bestSellingProducts: Array.from(bestMap.values()).sort((a,b)=>b.quantity-a.quantity).slice(0,8),
    topCategories: Array.from(catMap.values()).sort((a,b)=>b.revenue-a.revenue).slice(0,8),
    lowStock: lowStock.slice(0,12),
    recentActivity: movements
  } });
}));

router.get('/export/sales.csv', asyncHandler(async (req, res) => {
  const sales = await prisma.sale.findMany({ where: { businessId: req.user!.businessId }, include: { customer: true }, orderBy: { createdAt: 'desc' } });
  const rows = ['invoiceNumber,date,customer,total,paymentMethod,status', ...sales.map(s => [s.invoiceNumber, s.createdAt.toISOString(), s.customer?.name || '', s.total, s.paymentMethod, s.status].join(','))];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sales.csv"');
  res.send(rows.join('\n'));
}));
export default router;
