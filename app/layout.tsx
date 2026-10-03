import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zmajstrujmy | System Inicjatyw Obywatelskich",
  description: "Zarządzanie oddolnymi inicjatywami społecznymi i wolontariatem.",
};

import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <AuthProvider>
          <AuthGuard>
            <Navbar />
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
