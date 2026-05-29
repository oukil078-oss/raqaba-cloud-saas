'use client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="grid min-h-screen place-items-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
        <button 
          onClick={() => router.push('/')}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          العودة للرئيسية
        </button>
      </div>
    </main>
  );
}
