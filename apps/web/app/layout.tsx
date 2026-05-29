import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'رقابة كلاود | إدارة المخزون والمبيعات في الجزائر',
  description: 'نظام POS سحابي عربي لإدارة المخزون، المبيعات، الزبائن والتقارير من الهاتف والكمبيوتر للمتاجر الجزائرية.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
