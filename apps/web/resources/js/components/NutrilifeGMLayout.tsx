import { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  Gauge,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Calendar,
  AlertTriangle,
  CheckSquare,
  UserCheck,
  Award,
  TrendingUp,
  Bell,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function NutrilifeLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 36C20 36 21 27 27 21C33 15 37 13 37 7C31 7 24 10 19 16C16 19.5 15 24 15 27"
        fill="#22C55E"
      />
      <path
        d="M20 36C20 36 18 25 11 20C4 15 3 9 3 4C9 4 17 7 21 13C24 18 24 23 23 27"
        fill="#4ADE80"
        opacity="0.9"
      />
    </svg>
  );
}

interface NavSection {
  title?: string;
  items: {
    title: string;
    href: string;
    icon: any;
    exact?: boolean;
  }[];
}

const gmNavSections: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/gm", icon: LayoutDashboard, exact: true },
      { title: "Penugasan Karyawan", href: "/gm/penugasan", icon: CheckSquare },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { title: "Monitoring Karyawan", href: "/gm/karyawan", icon: Users },
      { title: "Monitoring Absensi", href: "/gm/absensi", icon: Clock },
      { title: "Monitoring Kedisiplinan", href: "/gm/kedisiplinan", icon: Gauge },
    ],
  },
  {
    title: "Approval",
    items: [
      { title: "Approval Cuti", href: "/gm/cuti", icon: CalendarDays },
      { title: "Approval Izin", href: "/gm/izin", icon: ClipboardCheck },
    ],
  },
  {
    title: "Evaluasi & Laporan",
    items: [
      { title: "Kondisi Perusahaan", href: "/gm/perusahaan", icon: Building2 },
      { title: "Laporan Aktivitas", href: "/gm/laporan", icon: FileText },
    ],
  },
];

const hrNavSections: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/hr", icon: LayoutDashboard, exact: true },
      { title: "Evaluasi Karyawan", href: "/hr/evaluasi", icon: Award },
    ],
  },
  {
    title: "Monitoring HR",
    items: [
      { title: "Monitoring Absensi", href: "/hr/absensi", icon: Clock },
      { title: "Monitoring Karyawan", href: "/hr/monitoring-karyawan", icon: Users },
      { title: "Monitoring Keterlambatan", href: "/hr/keterlambatan", icon: AlertTriangle },
      { title: "Monitoring Cuti", href: "/hr/cuti", icon: CalendarDays },
      { title: "Monitoring Izin", href: "/hr/izin", icon: ClipboardCheck },
      { title: "Monitoring Kedisiplinan", href: "/hr/kedisiplinan", icon: Gauge },
    ],
  },
  {
    title: "Approval HR",
    items: [
      { title: "Approval Tahap Final", href: "/hr/approval", icon: UserCheck },
    ],
  },
];

export default function NutrilifeGMLayout({
  children,
  currentUser,
  onLogout,
}: {
  children: React.ReactNode;
  currentUser: any;
  onLogout: () => void;
}) {
  const { url } = usePage();
  const pathname = url.split("?")[0];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState("Senin, 17 November 2026 | 09:45 WIB");
  const [userDropdown, setUserDropdown] = useState(false);
  const [pendingCount, setPendingCount] = useState(3);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
      ];
      const dayName = days[now.getDay()];
      const d = now.getDate();
      const m = months[now.getMonth()];
      const y = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${dayName}, ${d} ${m} ${y} | ${hh}:${mm} WIB`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHR = pathname.startsWith("/hr");
  const navSections = isHR ? hrNavSections : gmNavSections;
  const notifHref = isHR ? "/hr/approval" : "/gm/cuti";

  useEffect(() => {
    fetch("/api/leaves/pending")
      .then((r) => r.json())
      .then((data: any) => {
        if (data?.pendingLeaves) {
          const count = isHR
            ? data.pendingLeaves.filter((l: any) => l.status === "MENUNGGU_HR").length
            : data.pendingLeaves.filter((l: any) => l.status === "MENUNGGU_GM").length;
          setPendingCount(count);
        }
      })
      .catch(() => {});
  }, [pathname, isHR]);

  const userName = currentUser?.name || (isHR ? "Siti Rahma (HR)" : "Budi Santoso (GM)");
  const userRole = currentUser?.role || (isHR ? "HR Specialist" : "General Manager");

  const isItemActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <div className={`flex min-h-screen bg-[#F4F6F5] text-zinc-800 antialiased ${isDarkMode ? "dark" : ""}`}>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0A3020] text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-emerald-900/60">
            <Link href={isHR ? "/hr" : "/gm"} className="flex items-center gap-3">
              <NutrilifeLogo className="h-9 w-9" />
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                  Nutrilife
                </span>
                <span className="text-[10px] font-semibold text-emerald-300/90 tracking-wider uppercase block">
                  {isHR ? "HR Portal" : "GM Executive"}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-emerald-200 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                {sec.title && (
                  <p className="px-3 text-[11px] font-semibold text-emerald-300/60 uppercase tracking-wider mb-2">
                    {sec.title}
                  </p>
                )}
                {sec.items.map((item) => {
                  const active = isItemActive(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-emerald-600 text-white shadow-xs font-bold"
                          : "text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-emerald-300/80"}`} />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer: Theme Toggle & Logout */}
          <div className="p-4 border-t border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[#09291b] p-1 rounded-full border border-emerald-900">
              <button
                type="button"
                onClick={() => setIsDarkMode(false)}
                className={`p-1.5 rounded-full transition-colors ${
                  !isDarkMode ? "bg-amber-400 text-zinc-950" : "text-emerald-300 hover:text-white"
                }`}
                title="Light mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsDarkMode(true)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDarkMode ? "bg-emerald-500 text-white" : "text-emerald-300 hover:text-white"
                }`}
                title="Dark mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-emerald-200/80 hover:text-rose-300 px-2 py-1 rounded-lg transition-colors"
              title="Keluar"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white px-5 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Date Time Badge */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-700">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <Link
              href={notifHref}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
              title="Notifikasi"
            >
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {pendingCount}
                </span>
              )}
            </Link>

            {/* Help Question Icon */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
              title="Bantuan & Panduan"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 hover:bg-zinc-100 transition-colors"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white shadow-xs overflow-hidden ring-1 ring-emerald-600/30">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden text-left lg:block">
                  <div className="text-xs font-bold leading-tight text-zinc-900">{userName}</div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span>{userRole}</span>
                    <ChevronDown className="h-3 w-3 text-zinc-400" />
                  </div>
                </div>
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-zinc-100 text-xs">
                    <p className="font-bold text-zinc-900">{userName}</p>
                    <p className="text-[11px] text-zinc-500">{userRole}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Inner Content */}
        <main className="flex-1 p-5 md:p-6 lg:p-7 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
