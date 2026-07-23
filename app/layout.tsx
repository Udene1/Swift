import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SwiftDeliver | Global Parcel Tracking & Customs Clearance Network',
  description: 'SwiftDeliver provides real-time express parcel tracking, customs duty clearance status, printable PDF payment receipts, and global logistics telemetry.',
  keywords: ['parcel tracking', 'customs duty', 'express shipping', 'logistics', 'PDF receipt', 'SwiftDeliver'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0b1329] text-slate-100 min-h-screen flex flex-col selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
