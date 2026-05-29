'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Barcode, Bell, Boxes, ChartNoAxesCombined, CheckCircle2, Cloud, Lock, Smartphone, Store } from 'lucide-react';

const stats = [{label:'مبيعات اليوم',value:'128,400 دج'},{label:'منتجات نشطة',value:'1,248'},{label:'تنبيهات مخزون',value:'7'}];
const rows = ['عطر Oud Royal 50ml','سماعات Bluetooth Pro','قميص قطني Premium','شاحن سريع USB-C'];

export function Hero() {
  return <section className="marketing-gradient relative min-h-screen overflow-hidden pt-28 text-white">
    <div className="absolute inset-0 opacity-30" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize:'72px 72px'}} />
    <div className="absolute left-10 top-32 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
    <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-10 xl:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] xl:gap-20 2xl:gap-24">
      <motion.div initial={{opacity:0, y:24}} animate={{opacity:1, y:0}} transition={{duration:.6}} className="relative z-20 max-w-2xl xl:max-w-[560px] xl:justify-self-end">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100"><Cloud size={18}/> نظام POS سحابي مصمم للمتاجر الجزائرية</div>
        <h1 className="max-w-2xl text-5xl font-black leading-[1.12] tracking-tight md:text-6xl 2xl:text-7xl">راقب مخزونك ومبيعاتك من الهاتف والكمبيوتر</h1>
        <p className="mt-6 max-w-xl text-xl leading-9 text-blue-100">رقابة كلاود تجمع نقطة البيع، المخزون، الزبائن، الموردين والتقارير في منصة عربية واحدة. ابدأ خلال دقائق وتحكم في متجرك عن بُعد بثقة.</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link href="/register" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-7 text-base font-black text-raqaba-900 shadow-glow">جرّب مجاناً <ArrowLeft size={20}/></Link><Link href="/features" className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-7 text-base font-black text-white backdrop-blur hover:bg-white/15">شاهد المزايا</Link></div>
        <div className="mt-8 grid max-w-xl gap-3 text-sm text-blue-100 sm:grid-cols-3">{['نسخ احتياطي سحابي','باركود و SKU','تقارير أرباح يومية'].map(x=><div key={x} className="flex items-center gap-2"><CheckCircle2 className="text-cyan-300" size={18}/>{x}</div>)}</div>
      </motion.div>
      <motion.div initial={{opacity:0, scale:.96}} animate={{opacity:1, scale:1}} transition={{duration:.7, delay:.1}} className="relative z-10 min-h-[430px] overflow-visible md:min-h-[560px] xl:min-h-0 xl:w-full xl:max-w-[680px] xl:justify-self-start xl:py-10">
        <Phone className="absolute right-0 top-16 hidden rotate-6 min-[1800px]:block" title="البيع السريع" icon={<Smartphone/>}/>
        <Phone className="absolute bottom-8 left-0 hidden -rotate-6 min-[1800px]:block" title="تنبيهات المخزون" icon={<Bell/>}/>
        <div className="device-shine float relative mx-auto w-full max-w-[min(100%,620px)] xl:mx-0 xl:max-w-[560px] 2xl:max-w-[600px] rounded-[2rem] border border-white/15 bg-slate-950/70 p-3 shadow-2xl shadow-blue-950/50 backdrop-blur-xl">
          <div className="rounded-[1.5rem] bg-[#f7fbff] p-5 text-ink">
            <div className="mb-5 flex items-center justify-between"><div><p className="text-sm text-slate-500">لوحة التحكم</p><h3 className="text-2xl font-black">متجر النخبة الجزائر</h3></div><div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">متصل الآن</div></div>
            <div className="grid gap-3 sm:grid-cols-3">{stats.map(s=><div key={s.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{s.label}</p><b className="mt-1 block text-xl">{s.value}</b></div>)}</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_.8fr]"><div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><b>حركة المبيعات</b><ChartNoAxesCombined className="text-raqaba-600"/></div><div className="flex h-36 items-end gap-2">{[35,55,42,70,62,88,76,95,66,82].map((h,i)=><span key={i} className="flex-1 rounded-t-xl bg-gradient-to-t from-raqaba-700 to-cyan-300" style={{height:`${h}%`}} />)}</div></div><div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><b className="mb-3 block">بحث باركود</b><div className="mb-3 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500"><Barcode size={18}/> 613100000101</div><div className="space-y-2">{rows.map((r,i)=><div key={r} className="flex items-center justify-between rounded-2xl border border-slate-100 p-2 text-sm"><span>{r}</span><span className={i===3?'text-rose-600 font-bold':'text-emerald-600 font-bold'}>{i===3?'منخفض':'متوفر'}</span></div>)}</div></div></div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
}
function Phone({title, icon, className}: {title:string; icon: React.ReactNode; className?: string}) { return <div className={`device-shine z-10 w-48 rounded-[2.2rem] border border-white/20 bg-slate-950/70 p-2 shadow-glow backdrop-blur ${className}`}><div className="rounded-[1.7rem] bg-white p-4 text-ink"><div className="mx-auto mb-4 h-1 w-16 rounded-full bg-slate-200"/><div className="grid h-12 w-12 place-items-center rounded-2xl bg-raqaba-50 text-raqaba-600">{icon}</div><h4 className="mt-4 font-black">{title}</h4><div className="mt-4 space-y-2"><span className="block h-3 rounded-full bg-slate-100"/><span className="block h-3 w-2/3 rounded-full bg-slate-100"/><span className="block h-16 rounded-2xl bg-gradient-to-br from-raqaba-100 to-cyan-100"/></div></div></div> }
export function StoreTypesStrip() { const items = [['محلات الملابس',Store],['العطور والتجميل',Cloud],['الإلكترونيات',Smartphone],['الهدايا',Boxes],['الصيدليات',Lock]]; return <div className="relative -mt-12 z-20 mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 md:grid-cols-5">{items.map(([label,Icon]: any)=><div key={label} className="rounded-3xl border border-white/70 bg-white/90 p-5 text-center shadow-card backdrop-blur"><Icon className="mx-auto mb-3 text-raqaba-600"/><b>{label}</b></div>)}</div> }
