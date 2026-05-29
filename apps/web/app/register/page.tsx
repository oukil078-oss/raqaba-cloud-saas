import { RegisterForm } from '@/components/AuthForm';
import { Logo } from '@/components/marketing/Navbar';
export default function Page(){return <main className="grid min-h-screen place-items-center bg-cloud-grid px-5 py-10"><div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-card"><div className="mb-8 flex justify-center"><Logo/></div><h1 className="mb-2 text-center text-3xl font-black">إنشاء حساب رقابة</h1><p className="mb-6 text-center text-slate-500">جهز متجرك السحابي خلال دقائق.</p><RegisterForm/></div></main>}
