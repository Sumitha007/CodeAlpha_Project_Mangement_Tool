import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}
