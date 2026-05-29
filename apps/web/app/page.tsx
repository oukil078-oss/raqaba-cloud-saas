import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">رقابة كلاود</h1>
        <p className="mt-4">نظام POS سحابي</p>
        <div className="mt-8 flex gap-4">
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded">دخول</Link>
          <Link href="/register" className="bg-gray-200 px-4 py-2 rounded">ابدأ الآن</Link>
        </div>
      </div>
    </main>
  );
}
