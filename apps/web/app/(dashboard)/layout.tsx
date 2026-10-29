"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  MapPin,
  CalendarCheck,
  CheckSquare,
  DollarSign,
  ShieldAlert,
  LogOut,
  Building2,
  Clock,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("nutrilife_user");
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch {}
    } else {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("nutrilife_user");
    localStorage.removeItem("nutrilife_token");
    router.replace("/login");
  };

  const navItems = [
    {
      title: "Super User (Master)",
      href: "/super-user",
      icon: ShieldAlert,
      roleBadge: "SUPER_USER",
    },
    {
      title: "GM (Approval Tahap 1)",
      href: "/gm",
      icon: CheckSquare,
      roleBadge: "GM",
    },
    {
      title: "HR (Verifikasi & Final Cuti)",
      href: "/hr",
      icon: CalendarCheck,
      roleBadge: "HR",
    },
    {
      title: "Finance (Kalkulasi Payroll)",
      href: "/finance",
      icon: DollarSign,
      roleBadge: "FINANCE",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white shadow-sm">
            NL
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">NUTRILIFE HRIS</div>
            <div className="text-[10px] text-slate-500">v2.0 Monorepo Cloudflare</div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 rounded-xl bg-slate-100 p-3">
            <div className="text-xs font-semibold text-slate-800">{currentUser?.name || "Memuat..."}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>{currentUser?.role || "GUEST"} • {currentUser?.division || "DIV"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Navigasi Modul RBAC
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <span className="flex-1">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
          <div className="text-sm font-semibold text-slate-700">
            Nutrilife Enterprise HR & Payroll Management
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
              Edge Runtime (D1 + R2)
            </span>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
