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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
