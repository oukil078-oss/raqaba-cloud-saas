import Link from 'next/link';
import { Barcode, BellRing, ChartSpline, Cloud, DatabaseZap, LockKeyhole, PackageSearch, ReceiptText, ShieldCheck, Smartphone, UsersRound, WandSparkles } from 'lucide-react';
import { MarketingNavbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Hero, StoreTypesStrip } from '@/components/marketing/Hero';
import { Card, SectionTitle } from '@/components/ui/Card';

const features = [
  ['مخزون حي لحظة بلحظة', PackageSearch, 'كل عملية بيع أو شراء تحدث المخزون تلقائياً مع سجل حركة كامل.'],
  ['نقطة بيع سريعة', ReceiptText, 'أنشئ فاتورة، أضف خصم، اختر طريقة الدفع واطبع وصل البيع.'],
  ['بحث باركود و SKU', Barcode, 'اعثر على المنتج في ثواني من الهاتف أو الكمبيوتر.'],
  ['تقارير أرباح حقيقية', ChartSpline, 'مبيعات يومية وشهرية، أفضل المنتجات، التصنيفات ومؤشرات الربح.'],
  ['زبائن وموردون', UsersRound, 'تاريخ شراء، ملاحظات، معلومات تواصل وطلبات موردين.'],
  ['تنبيهات ذكية', BellRing, 'إشعارات عند انخفاض المخزون أو العمليات المهمة.']
];
const why = ['مصمم RTL من البداية وليس ترجمة سطحية','عملة الدينار الجزائري وتجربة مناسبة للمتاجر المحلية','يعمل من أي جهاز مع نسخ احتياطي سحابي','إعداد سريع لفريقك وصلاحيات واضحة'];

export default function HomePage(){ 
  return (
    <>
      <MarketingNavbar/>
      <Hero/>
      <StoreTypesStrip/>
      <main>
        <section className="px-5 py-24">
          <SectionTitle eyebrow="لماذا رقابة؟" title="الطريقة الأسهل لتفهم ما يحدث داخل متجرك" description="بدلاً من دفاتر متفرقة وجداول Excel، رقابة تعطيك نظام تشغيل يومي واضح لكل تجارة: بيع، شراء، مخزون وتقارير."/>
          <div className="mx-auto mt-14 grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
            {why.map((w,i)=><Card key={w} className="relative overflow-hidden"><span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-raqaba-50 text-xl font-black text-raqaba-700">{i+1}</span><p className="font-bold leading-7">{w}</p></Card>)}
          </div>
        </section>
        <section className="bg-white px-5 py-24">
          <SectionTitle eyebrow="المزايا الأساسية" title="كل أدوات المتجر في لوحة واحدة" description="عمليات حقيقية وليست أرقاماً مزيفة: المبيعات تخصم من المخزون، المشتريات تضيف مخزوناً، والتقارير تُبنى من بياناتك."/>
          <div className="mx-auto mt-14 grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([title,Icon,desc]: any)=><Card key={title} className="group hover:border-raqaba-200 hover:shadow-card"><div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-raqaba-600 to-cyan-400 text-white shadow-glow"><Icon/></div><h3 className="text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-600">{desc}</p></Card>)}
          </div>
        </section>
        <section className="marketing-gradient px-5 py-24 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 font-black text-cyan-200">سطح مكتب + هاتف</p>
              <h2 className="text-4xl font-black leading-tight md:text-6xl">متجرك معك حتى عندما لا تكون في المحل</h2>
              <p className="mt-6 text-lg leading-9 text-blue-100">تابع المبيعات اليومية، راقب المنتجات المنخفضة، وافتح تقارير الأداء من أي مكان. فريقك يبيع من نقطة البيع وأنت ترى الصورة الكاملة فوراً.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {['جلسات آمنة','صلاحيات موظفين','نسخ احتياطي','تجربة موبايل'].map(x=><div key={x} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4"><ShieldCheck className="text-cyan-200"/>{x}</div>)}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-glow backdrop-blur">
              <div className="rounded-[1.5rem] bg-white p-6 text-ink">
                <div className="mb-5 flex items-center gap-3"><DatabaseZap className="text-raqaba-600"/><b>نسخ احتياطي مشفر</b></div>
                <div className="space-y-3">
                  {['آخر مزامنة: منذ 42 ثانية','قاعدة بيانات PostgreSQL','سجل نشاط لكل عملية','استرجاع آمن للبيانات'].map(x=><div key={x} className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-700">{x}</div>)}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="px-5 py-24">
          <SectionTitle eyebrow="الأسعار" title="ابدأ صغيراً وتوسع بثقة" description="خطط واضحة للمتاجر الصغيرة والمتوسطة بدون تعقيد."/>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              ['Starter','4,900 دج','لمحل صغير'],
              ['Pro','8,900 دج','الأكثر اختياراً'],
              ['Business','اتصل بنا','لفروع متعددة']
            ].map((p,i)=>(
              <Card key={p[0]} className={i===1?'border-raqaba-400 shadow-card ring-4 ring-raqaba-100':''}>
                <h3 className="text-2xl font-black">{p[0]}</h3>
                <p className="mt-3 text-4xl font-black text-raqaba-700">{p[1]}</p>
                <p className="mt-2 text-slate-500">{p[2]}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  <li>✓ منتجات ومخزون</li>
                  <li>✓ مبيعات وفواتير</li>
                  <li>✓ تقارير وتحليلات</li>
                  <li>✓ دعم عربي</li>
                </ul>
                <Link href="/register" className="mt-7 inline-flex w-full justify-center rounded-2xl bg-raqaba-600 px-5 py-3 font-black text-white">ابدأ الآن</Link>
              </Card>
            ))}
          </div>
        </section>
        <section className="bg-white px-5 py-24">
          <SectionTitle eyebrow="أسئلة شائعة" title="كل ما تحتاج معرفته قبل البدء"/>
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {[
              ['هل يعمل من الهاتف؟','نعم، الواجهة متجاوبة وتعمل من الهاتف والكمبيوتر.'],
              ['هل يدعم الباركود؟','نعم، SKU وBarcode للبحث السريع وإضافة المنتجات.'],
              ['هل البيانات آمنة؟','تُحفظ البيانات في قاعدة PostgreSQL ويمكن نشرها بإعدادات إنتاج آمنة.'],
              ['هل يناسب الصيدليات؟','نعم، يمكن تخصيص التصنيفات والمنتجات وحدود المخزون لأي نشاط.']
            ].map(([q,a])=>(
              <details key={q} className="rounded-3xl border border-slate-200 p-5"><summary className="cursor-pointer font-black">{q}</summary><p className="mt-3 leading-7 text-slate-600">{a}</p></details>
            ))}
          </div>
        </section>
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-ink p-10 text-center text-white shadow-card md:p-16">
            <WandSparkles className="mx-auto mb-5 text-cyan-300" size={42}/>
            <h2 className="text-4xl font-black">جاهز لتحويل متجرك إلى نظام سحابي؟</h2>
            <p className="mx-auto mt-5 max-w-2xl text-blue-100">ابدأ بحساب تجريبي، أضف منتجاتك، واجعل كل عملية بيع مرتبطة بمخزون وتقارير واضحة.</p>
            <Link href="/register" className="mt-8 inline-flex rounded-2xl bg-white px-8 py-4 font-black text-ink">أنشئ حسابك الآن</Link>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  );
}
