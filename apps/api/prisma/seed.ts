import { PrismaClient, MovementType, PaymentMethod, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('DemoPass123!', 12);
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  const business = await prisma.business.create({
    data: { name: 'متجر النخبة الجزائر', slug: 'elite-alger', phone: '0550 12 34 56', address: 'حي الأعمال، الجزائر العاصمة', wilaya: 'الجزائر', currency: 'DZD', taxRate: 0, subscriptionPlan: 'PRO' }
  });
  const [owner, manager, cashier] = await Promise.all([
    prisma.user.create({ data: { businessId: business.id, fullName: 'أمين بن يوسف', email: 'owner@raqaba.dz', phone: '0550 00 00 01', role: UserRole.OWNER, passwordHash } }),
    prisma.user.create({ data: { businessId: business.id, fullName: 'سارة مراد', email: 'manager@raqaba.dz', phone: '0550 00 00 02', role: UserRole.MANAGER, passwordHash } }),
    prisma.user.create({ data: { businessId: business.id, fullName: 'ليلى منصوري', email: 'cashier@raqaba.dz', phone: '0550 00 00 03', role: UserRole.CASHIER, passwordHash } })
  ]);
  const cats = await Promise.all([
    prisma.category.create({ data: { businessId: business.id, name: 'ملابس', icon: 'shirt', color: '#2563eb' } }),
    prisma.category.create({ data: { businessId: business.id, name: 'عطور وتجميل', icon: 'sparkles', color: '#06b6d4' } }),
    prisma.category.create({ data: { businessId: business.id, name: 'إلكترونيات', icon: 'smartphone', color: '#8b5cf6' } }),
    prisma.category.create({ data: { businessId: business.id, name: 'هدايا وإكسسوارات', icon: 'gift', color: '#f59e0b' } }),
    prisma.category.create({ data: { businessId: business.id, name: 'صيدلية', icon: 'heart-pulse', color: '#10b981' } })
  ]);
  const productData = [
    ['قميص قطني رجالي Premium','CL-TSH-001','613100000001','Atlas Wear',cats[0].id,2900,1450,42,8],
    ['فستان نسائي سهرة أزرق','CL-DRS-002','613100000002','Mode DZ',cats[0].id,7800,4200,12,4],
    ['عطر Oud Royal 50ml','BE-PRF-101','613100000101','Nour',cats[1].id,6200,3100,18,5],
    ['كريم عناية بالبشرة Argan','BE-SKN-130','613100000130','Sahara Beauty',cats[1].id,1800,900,7,10],
    ['سماعات Bluetooth Pro','EL-AUD-221','613100000221','TechNova',cats[2].id,5400,3300,24,6],
    ['شاحن سريع USB-C 30W','EL-CHR-044','613100000044','DZ Power',cats[2].id,2200,1150,55,12],
    ['ساعة ذكية Fit DZ','EL-WCH-310','613100000310','TechNova',cats[2].id,12500,8500,9,3],
    ['علبة هدايا فاخرة','GF-BOX-011','613100000011','Giftline',cats[3].id,950,420,80,15],
    ['محفظة جلدية رجالية','AC-WAL-087','613100000087','Tlemcen Leather',cats[3].id,3500,1800,16,5],
    ['ميزان حرارة رقمي','PH-THR-009','613100000009','MediCare',cats[4].id,1650,950,6,8]
  ] as const;
  const products = [] as any[];
  for (const p of productData) {
    const product = await prisma.product.create({ data: { businessId: business.id, name: p[0], sku: p[1], barcode: p[2], brand: p[3], categoryId: p[4], price: p[5], cost: p[6], stock: p[7], lowStockThreshold: p[8], description: 'منتج تجريبي واقعي لإظهار لوحة التحكم.' } });
    products.push(product);
    await prisma.inventoryMovement.create({ data: { businessId: business.id, productId: product.id, userId: owner.id, type: MovementType.STOCK_IN, quantity: product.stock, previousStock: 0, newStock: product.stock, reason: 'رصيد افتتاحي من بيانات التجربة' } });
  }
  const customers = await Promise.all([
    prisma.customer.create({ data: { businessId: business.id, name: 'نوال قاسمي', phone: '0555 24 31 90', address: 'باب الزوار', notes: 'زبونة دائمة، تفضل الدفع نقداً' } }),
    prisma.customer.create({ data: { businessId: business.id, name: 'رياض حمادي', phone: '0661 98 44 10', address: 'القبة' } }),
    prisma.customer.create({ data: { businessId: business.id, name: 'مريم شريف', phone: '0770 11 56 30', address: 'وهران' } })
  ]);
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { businessId: business.id, name: 'توزيع الجزائر الكبرى', contact: 'كمال', phone: '021 77 11 20', address: 'الحراش' } }),
    prisma.supplier.create({ data: { businessId: business.id, name: 'Beauty Import DZ', contact: 'سليم', phone: '0558 20 20 20', address: 'سطيف' } })
  ]);

  async function createSale(dayOffset: number, customerIdx: number, itemIndexes: number[]) {
    const date = new Date(); date.setDate(date.getDate() - dayOffset);
    const items = itemIndexes.map((idx) => ({ product: products[idx], quantity: idx % 2 + 1, unitPrice: Number(products[idx].price), cost: Number(products[idx].cost), discount: 0, total: Number(products[idx].price) * (idx % 2 + 1) }));
    const subtotal = items.reduce((s,i)=>s+i.total,0); const discount = subtotal > 10000 ? 500 : 0; const total = subtotal - discount;
    const sale = await prisma.sale.create({ data: { businessId: business.id, customerId: customers[customerIdx].id, userId: cashier.id, invoiceNumber: `RC-2026-${String(dayOffset+1).padStart(5,'0')}`, subtotal, discount, total, paymentMethod: dayOffset % 3 === 0 ? PaymentMethod.BARIDIMOB : PaymentMethod.CASH, createdAt: date, items: { create: items.map(i => ({ productId: i.product.id, quantity: i.quantity, unitPrice: i.unitPrice, cost: i.cost, discount: i.discount, total: i.total })) } } });
    for (const i of items) {
      await prisma.inventoryMovement.create({ data: { businessId: business.id, productId: i.product.id, userId: cashier.id, type: MovementType.SALE, quantity: -i.quantity, previousStock: i.product.stock, newStock: i.product.stock - i.quantity, referenceType: 'Sale', referenceId: sale.id, reason: `بيع ${sale.invoiceNumber}`, createdAt: date } });
      await prisma.product.update({ where: { id: i.product.id }, data: { stock: { decrement: i.quantity } } });
    }
    await prisma.customer.update({ where: { id: customers[customerIdx].id }, data: { totalSpent: { increment: total } } });
  }
  await createSale(0,0,[0,2,7]);
  await createSale(1,1,[4,5]);
  await createSale(3,2,[1,8]);
  await createSale(5,0,[2,3,7]);
  await createSale(9,1,[6]);
  await createSale(12,2,[0,5,8]);

  await prisma.purchase.create({ data: { businessId: business.id, supplierId: suppliers[0].id, userId: manager.id, reference: 'PO-2026-00001', subtotal: 86000, shippingCost: 3000, total: 89000, status: 'RECEIVED', receivedAt: new Date(), items: { create: [{ productId: products[0].id, quantity: 20, unitCost: 1450, total: 29000 }, { productId: products[5].id, quantity: 50, unitCost: 1150, total: 57500 }] } } });
  await prisma.expense.createMany({ data: [
    { businessId: business.id, title: 'إيجار المحل', category: 'RENT', amount: 65000, paidAt: new Date(Date.now()-5*86400000) },
    { businessId: business.id, title: 'حملة إعلانات فيسبوك', category: 'MARKETING', amount: 12000, paidAt: new Date(Date.now()-2*86400000) },
    { businessId: business.id, title: 'نقل البضاعة', category: 'TRANSPORT', amount: 4500, paidAt: new Date(Date.now()-1*86400000) }
  ] });
  await prisma.notification.createMany({ data: [
    { businessId: business.id, type: 'SYSTEM', title: 'مرحباً بك في رقابة', message: 'تم تجهيز بيانات تجريبية واقعية لتبدأ الاستكشاف.' },
    { businessId: business.id, type: 'LOW_STOCK', title: 'منتج يحتاج إعادة طلب', message: 'كريم عناية بالبشرة قريب من حد المخزون المنخفض.' }
  ] });
  console.log('Seed complete: owner@raqaba.dz / DemoPass123!');
}
main().finally(async () => prisma.$disconnect());
