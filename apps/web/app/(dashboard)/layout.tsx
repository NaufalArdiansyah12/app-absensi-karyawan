"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  CheckSquare,
  DollarSign,
  ShieldAlert,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  LayoutDashboard,
  Users,
  Clock,
  Gauge,
  FileText,
  CalendarDays,
  ClipboardCheck,
  AlertTriangle,
  UserCheck,
  Award,
  TrendingUp,
  Calculator,
  Wallet,
  Gift,
  MinusCircle,
  Timer,
  Sparkles,
  ShieldCheck,
  Percent,
  Receipt,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const gmNav = [
  { title: "Dashboard", href: "/gm", icon: LayoutDashboard },
  { title: "Kondisi Perusahaan", href: "/gm/perusahaan", icon: Building2 },
  { title: "Monitoring Karyawan", href: "/gm/karyawan", icon: Users },
  { title: "Monitoring Absensi", href: "/gm/absensi", icon: Clock },
  { title: "Monitoring Kedisiplinan", href: "/gm/kedisiplinan", icon: Gauge },
  { title: "Approval Cuti", href: "/gm/cuti", icon: CalendarDays },
  { title: "Approval Izin", href: "/gm/izin", icon: ClipboardCheck },
  { title: "Laporan", href: "/gm/laporan", icon: FileText },
];

const hrNav = [
  { title: "Dashboard", href: "/hr", icon: LayoutDashboard },
  { title: "Monitoring Absensi", href: "/hr/absensi", icon: Clock },
  { title: "Monitoring Keterlambatan", href: "/hr/keterlambatan", icon: AlertTriangle },
  { title: "Monitoring Izin", href: "/hr/izin", icon: ClipboardCheck },
  { title: "Monitoring Cuti", href: "/hr/cuti", icon: CalendarDays },
  { title: "Monitoring Kedisiplinan", href: "/hr/kedisiplinan", icon: Gauge },
  { title: "Approval Akhir Cuti/Izin", href: "/hr/approval", icon: CheckSquare },
  { title: "Validasi Data Karyawan", href: "/hr/karyawan", icon: UserCheck },
  { title: "Evaluasi Kedisiplinan", href: "/hr/evaluasi-kedisiplinan", icon: Award },
  { title: "Evaluasi Kinerja", href: "/hr/evaluasi-kinerja", icon: TrendingUp },
  { title: "Laporan HR", href: "/hr/laporan", icon: FileText },
];

const financeNav = [
  { title: "Dashboard", href: "/finance", icon: LayoutDashboard },
  { title: "Perhitungan Payroll", href: "/finance/perhitungan", icon: Calculator },
  { title: "Gaji Pokok", href: "/finance/gaji-pokok", icon: Wallet },
  { title: "Tunjangan", href: "/finance/tunjangan", icon: Gift },
  { title: "Potongan", href: "/finance/potongan", icon: MinusCircle },
  { title: "Lembur", href: "/finance/lembur", icon: Timer },
  { title: "Bonus", href: "/finance/bonus", icon: Sparkles },
  { title: "BPJS", href: "/finance/bpjs", icon: ShieldCheck },
  { title: "Pajak", href: "/finance/pajak", icon: Percent },
  { title: "Slip Gaji", href: "/finance/slip-gaji", icon: Receipt },
  { title: "Rekap Payroll", href: "/finance/rekap", icon: FileText },
];

const otherNav = [
  { title: "GM", href: "/gm", icon: CheckSquare },
  { title: "HR", href: "/hr", icon: CalendarCheck },
  { title: "Finance", href: "/finance", icon: DollarSign },
  { title: "Super User", href: "/super-user", icon: ShieldAlert },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const navItems = pathname.startsWith("/gm")
    ? gmNav
    : pathname.startsWith("/hr")
    ? hrNav
    : pathname.startsWith("/finance")
    ? financeNav
    : otherNav;
  const navBtn = `flex h-11 items-center gap-3 rounded-2xl transition-all ${
    open ? "px-3" : "w-11 justify-center self-center"
  }`;

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

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen w-full flex-col gap-6 bg-[radial-gradient(circle_at_50%_0%,#F5F3F0_0%,#E8E5E1_100%)] p-6 md:p-8">
        <Navbar user={currentUser} />

        <div className="flex flex-1 items-start gap-6">
          <aside
            className={`sticky top-8 flex h-[calc(100vh-8rem)] min-h-[500px] shrink-0 flex-col justify-between rounded-[28px] border border-white/80 bg-white/80 px-2 py-4 shadow-sm backdrop-blur transition-[width] duration-200 ${
              open ? "w-56" : "w-16"
            }`}
          >
            <nav className="flex flex-col gap-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/gm" || item.href === "/hr" || item.href === "/finance"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    aria-label={item.title}
                    className={`${navBtn} ${
                      active
                        ? "bg-zinc-950 text-white shadow-md"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {open && <span className="truncate text-sm font-semibold">{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setOpen(!open)}
                title={open ? "Perkecil sidebar" : "Perbesar sidebar"}
                aria-label={open ? "Perkecil sidebar" : "Perbesar sidebar"}
                aria-expanded={open}
                className={`${navBtn} text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900`}
              >
                {open ? <PanelLeftClose className="h-5 w-5 shrink-0" /> : <PanelLeftOpen className="h-5 w-5 shrink-0" />}
                {open && <span className="truncate text-sm font-semibold">Perkecil</span>}
              </button>
              <button
                onClick={handleLogout}
                title="Keluar"
                aria-label="Keluar"
                className={`${navBtn} text-zinc-400 hover:bg-zinc-100 hover:text-rose-600`}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {open && <span className="truncate text-sm font-semibold">Keluar</span>}
              </button>
            </div>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
