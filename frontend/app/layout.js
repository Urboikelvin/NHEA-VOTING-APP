import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NHEA 2025 - Nigerian Healthcare Excellence Awards',
  description: 'Celebrating excellence in Nigerian healthcare',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}