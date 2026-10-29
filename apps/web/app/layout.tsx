import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NUTRILIFE HRIS - Manajemen Kehadiran & Penggajian",
  description: "Sistem Manajemen Kehadiran, Perizinan, Kedisiplinan, dan Penggajian Karyawan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
