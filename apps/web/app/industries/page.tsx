import { Gem, Gift, HeartPulse, Home, Shirt, Smartphone, Sparkles, Store } from 'lucide-react';
import { SimplePage } from '@/components/marketing/SimplePage';
import { Card } from '@/components/ui/Card';
const industries=[['محلات الملابس',Shirt],['العطور والتجميل',Sparkles],['الإلكترونيات',Smartphone],['الهدايا والإكسسوارات',Gift],['الديكور المنزلي',Home],['الصيدليات',HeartPulse],['المجوهرات',Gem],['متاجر عامة',Store]];
export default function Page(){return <SimplePage eyebrow="لكل تجارة" title="مصمم لمختلف أنواع المتاجر الجزائرية" description="التصنيفات، الحقول والتقارير مرنة لتناسب نشاطك بدون تطوير خاص."><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{industries.map(([t,Icon]: any)=><Card key={t} className="text-center"><Icon className="mx-auto mb-5 text-raqaba-600" size={42}/><h3 className="text-xl font-black">{t}</h3><p className="mt-3 text-sm leading-6 text-slate-600">مخزون، مبيعات، باركود وتقارير حسب طبيعة النشاط.</p></Card>)}</div></SimplePage>}
