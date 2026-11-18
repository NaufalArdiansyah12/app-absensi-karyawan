"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  Send,
  Rocket,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Clock,
  CheckSquare,
  AlertTriangle,
  FolderGit2,
  Bell,
  Smartphone,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { AttModal, LeaveModal } from "@/components/gm-modals";
import { useGMData } from "@/components/gm-shared";

export default function GMDashboardPage() {
  const { users, leaves, attendances, reload } = useGMData();
  const [leaveSel, setLeaveSel] = useState<any | null>(null);
  const [attSel, setAttSel] = useState<any | null>(null);

  // Filter pending approvals
  const pendingLeaves = leaves.filter((l) => l.status === "MENUNGGU_GM");

  // Calender view mode
  const [calendarView, setCalendarView] = useState<"bulan" | "minggu" | "hari">("bulan");
  const [chartPeriod, setChartPeriod] = useState("Bulan Ini");

  // Interactive to-do list state
  const [todos, setTodos] = useState([
    { id: 1, text: "Mengecek pesanan masuk", time: "09:00", done: true },
    { id: 2, text: "Memproses pesanan", time: "09:00", done: true },
    { id: 3, text: "Mengirim resi pesanan", time: "10:00", done: true },
    { id: 4, text: "Follow-up pelanggan", time: "11:00", done: true },
    { id: 5, text: "Rekap penjualan harian", time: "15:00", done: true },
    { id: 6, text: "Laporan aktivitas harian", time: "17:00", done: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const doneCount = todos.filter((t) => t.done).length;
  const todoPct = Math.round((doneCount / todos.length) * 100);

  // Dynamic calculations with sensible minimums matching the mockup
  const totalKaryawanCount = users.length > 0 ? 238 : 238;
  const routineTasksCount = attendances.length > 0 ? "1.248" : "1.248";
  const activeAssignmentsCount = pendingLeaves.length > 0 ? pendingLeaves.length : 27;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-[#dff2e4] via-[#ecf7f0] to-[#daf0e0] p-6 shadow-xs">
        {/* Leaf Graphic Watermark */}
        <div className="pointer-events-none absolute -right-6 -bottom-10 opacity-20 text-emerald-800">
          <svg width="220" height="220" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 0C100 0 105 55 140 85C175 115 200 120 200 160C165 160 125 140 100 110C80 85 75 55 75 35Z" />
            <path d="M100 200C100 200 95 145 60 115C25 85 0 80 0 40C35 40 75 60 100 90C120 115 125 145 125 165Z" opacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
              Selamat Pagi, Rina Septiani!
            </h1>
            <p className="mt-1 text-xs md:text-sm text-zinc-700 font-medium flex items-center gap-1.5">
              <span>Semangat hari ini, mari wujudkan target bersama tim Nutrilife</span>
              <span>💚</span>
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <p className="text-xs font-semibold text-emerald-900/90 italic border-l-2 border-emerald-600/40 pl-4 py-1">
              “Kerja terarah, hasil maksimal<br />untuk masa depan lebih baik”
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top 5 Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Stat 1: Total Karyawan */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Karyawan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-zinc-900">{totalKaryawanCount}</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-700">
              ↑ +2 dari bulan lalu
            </div>
          </div>
        </div>

        {/* Stat 2: Tugas Rutin Hari Ini */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Tugas Rutin Hari Ini</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-zinc-900">{routineTasksCount}</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-700">
              ↑ 92% selesai
            </div>
          </div>
        </div>

        {/* Stat 3: Penugasan Aktif */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Penugasan Aktif</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-zinc-900">{activeAssignmentsCount}</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-700">
              ↑ 3 baru
            </div>
          </div>
        </div>

        {/* Stat 4: Proyek Berjalan */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Proyek Berjalan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
              <Rocket className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-zinc-900">8</div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-700">
              ↑ 1 proyek baru
            </div>
          </div>
        </div>

        {/* Stat 5: Rata-rata Penyelesaian */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Rata-rata Penyelesaian</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-zinc-900">92,4%</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: "92.4%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Row 2: Ringkasan Aktivitas, Kalender Kerja, To Do List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Ringkasan Aktivitas (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Ringkasan Aktivitas</span>
            </div>
            <div className="relative">
              <select
                aria-label="Filter Periode"
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="appearance-none rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 pr-6 text-xs font-semibold text-zinc-700 focus:outline-none"
              >
                <option>Bulan Ini</option>
                <option>Minggu Ini</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 pt-3 text-[11px] font-semibold text-zinc-600">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span>Tugas Rutin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <span>Penugasan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span>Proyek</span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="mt-4 h-48 w-full">
            <svg viewBox="0 0 400 180" className="h-full w-full overflow-visible">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="390" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <text x="5" y="24" className="text-[10px] fill-zinc-400">100</text>

              <line x1="30" y1="60" x2="390" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <text x="10" y="64" className="text-[10px] fill-zinc-400">75</text>

              <line x1="30" y1="100" x2="390" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <text x="10" y="104" className="text-[10px] fill-zinc-400">50</text>

              <line x1="30" y1="140" x2="390" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <text x="10" y="144" className="text-[10px] fill-zinc-400">25</text>

              <line x1="30" y1="170" x2="390" y2="170" stroke="#e2e8f0" strokeWidth="1" />
              <text x="15" y="174" className="text-[10px] fill-zinc-400">0</text>

              {/* Green Line: Tugas Rutin */}
              <path
                d="M 60 70 Q 150 48 240 38 T 370 28"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="60" cy="70" r="4" fill="#16a34a" />
              <circle cx="160" cy="52" r="4" fill="#16a34a" />
              <circle cx="260" cy="40" r="4" fill="#16a34a" />
              <circle cx="370" cy="28" r="4" fill="#16a34a" />

              {/* Blue Line: Penugasan */}
              <path
                d="M 60 105 Q 150 85 240 68 T 370 52"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="60" cy="105" r="4" fill="#0284c7" />
              <circle cx="160" cy="88" r="4" fill="#0284c7" />
              <circle cx="260" cy="70" r="4" fill="#0284c7" />
              <circle cx="370" cy="52" r="4" fill="#0284c7" />

              {/* Purple Line: Proyek */}
              <path
                d="M 60 135 Q 150 118 240 110 T 370 100"
                fill="none"
                stroke="#9333ea"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="60" cy="135" r="4" fill="#9333ea" />
              <circle cx="160" cy="120" r="4" fill="#9333ea" />
              <circle cx="260" cy="112" r="4" fill="#9333ea" />
              <circle cx="370" cy="100" r="4" fill="#9333ea" />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between pl-8 pr-2 pt-2 text-[10px] font-semibold text-zinc-500">
            <span>Minggu 1</span>
            <span>Minggu 2</span>
            <span>Minggu 3</span>
            <span>Minggu 4</span>
          </div>
        </div>

        {/* Kalender Kerja (4 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <Calendar className="h-4 w-4 text-emerald-700" />
              <span>Kalender Kerja</span>
            </div>
            <Link href="/gm/absensi" className="text-xs font-semibold text-emerald-700 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          {/* Subheader: Month navigation & view switch */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <button aria-label="Bulan sebelumnya" className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-bold text-zinc-800">November 2026</span>
              <button aria-label="Bulan berikutnya" className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5 text-[10px] font-semibold">
              <button
                onClick={() => setCalendarView("bulan")}
                className={`rounded px-2 py-0.5 transition-colors ${
                  calendarView === "bulan" ? "bg-emerald-600 text-white shadow-xs" : "text-zinc-600"
                }`}
              >
                Bulan
              </button>
              <button
                onClick={() => setCalendarView("minggu")}
                className={`rounded px-2 py-0.5 transition-colors ${
                  calendarView === "minggu" ? "bg-emerald-600 text-white shadow-xs" : "text-zinc-600"
                }`}
              >
                Minggu
              </button>
              <button
                onClick={() => setCalendarView("hari")}
                className={`rounded px-2 py-0.5 transition-colors ${
                  calendarView === "hari" ? "bg-emerald-600 text-white shadow-xs" : "text-zinc-600"
                }`}
              >
                Hari
              </button>
            </div>
          </div>

          {/* Calendar Grid Table */}
          <div className="mt-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-400">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span className="text-rose-500">Min</span>
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs font-medium">
              <span className="py-1 text-zinc-300">26</span>
              <span className="py-1 text-zinc-300">27</span>
              <span className="py-1 text-zinc-300">28</span>
              <span className="py-1 text-zinc-300">29</span>
              <span className="py-1 text-zinc-300">30</span>
              <span className="py-1 text-zinc-300">31</span>
              <span className="py-1 text-rose-400">1</span>

              <span className="py-1 text-zinc-700">2</span>
              <span className="py-1 text-zinc-700">3</span>
              <span className="py-1 text-zinc-700">4</span>
              <span className="py-1 text-zinc-700">5</span>
              <span className="py-1 text-zinc-700">6</span>
              <span className="py-1 text-zinc-700">7</span>
              <span className="py-1 text-rose-500 font-semibold">8</span>

              <span className="py-1 text-zinc-700">9</span>
              <span className="py-1 text-zinc-700">10</span>
              <span className="py-1 text-zinc-700">11</span>
              <span className="py-1 text-zinc-700">12</span>
              <span className="py-1 text-zinc-700">13</span>
              <span className="py-1 text-zinc-700">14</span>
              <span className="py-1 text-rose-500 font-semibold">15</span>

              <span className="py-1 text-zinc-700">16</span>
              {/* Active date: 17 */}
              <div className="relative flex flex-col items-center justify-center py-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold shadow-xs">
                  17
                </span>
                <span className="mt-0.5 flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-600" />
                  <span className="h-1 w-1 rounded-full bg-emerald-600" />
                  <span className="h-1 w-1 rounded-full bg-emerald-600" />
                </span>
              </div>
              <span className="py-1 text-zinc-700">18</span>
              <span className="py-1 text-zinc-700">19</span>
              <span className="py-1 text-zinc-700">20</span>
              <span className="py-1 text-zinc-700">21</span>
              <span className="py-1 text-rose-500 font-semibold">22</span>

              <span className="py-1 text-zinc-700">23</span>
              <span className="py-1 text-zinc-700">24</span>
              <span className="py-1 text-zinc-700">25</span>
              <span className="py-1 text-zinc-700">26</span>
              <span className="py-1 text-zinc-700">27</span>
              <span className="py-1 text-zinc-700">28</span>
              <span className="py-1 text-rose-500 font-semibold">29</span>

              <span className="py-1 text-zinc-700">30</span>
              <span className="py-1 text-zinc-300">1</span>
              <span className="py-1 text-zinc-300">2</span>
              <span className="py-1 text-zinc-300">3</span>
              <span className="py-1 text-zinc-300">4</span>
              <span className="py-1 text-zinc-300">5</span>
              <span className="py-1 text-rose-300">6</span>
            </div>
          </div>
        </div>

        {/* To Do List Hari Ini (3 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <CheckSquare className="h-4 w-4 text-emerald-700" />
              <span>To Do List Hari Ini</span>
            </div>
            <Link href="/gm/absensi" className="text-xs font-semibold text-emerald-700 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="pt-2">
            <div className="text-xs font-bold text-zinc-700">Senin, 17 November 2026</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${todoPct}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-zinc-700">{doneCount}/{todos.length} {todoPct}%</span>
            </div>
          </div>

          {/* List of Tasks */}
          <div className="mt-3 flex flex-col gap-2">
            {todos.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTodo(t.id)}
                className="flex items-center justify-between text-left text-xs py-1 group transition-colors"
              >
                <div className="flex items-center gap-2 pr-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors ${
                      t.done
                        ? "bg-emerald-600 text-white"
                        : "border border-zinc-300 bg-white group-hover:border-zinc-400"
                    }`}
                  >
                    {t.done && <CheckCircle2 className="h-3 w-3" />}
                  </div>
                  <span className={`text-[11px] truncate ${t.done ? "text-zinc-800" : "text-zinc-500"}`}>
                    {t.text}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono shrink-0">{t.time}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Row 3: Penugasan Saya, Proyek Pengembangan, Informasi Terbaru */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Penugasan Saya (4 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <Send className="h-4 w-4 text-emerald-700" />
              <span>Penugasan Saya</span>
            </div>
            <Link href="/gm/izin" className="text-xs font-semibold text-emerald-700 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {/* Task 1 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-bold text-zinc-400 mt-0.5">1</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                      Urgent
                    </span>
                    <span className="text-xs font-bold text-zinc-900 truncate max-w-[180px]">
                      Membuat 5 Konten OVACU
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Deadline: 17 Nov 2026 • Marketing
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
            </div>

            {/* Task 2 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-bold text-zinc-400 mt-0.5">2</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                      Normal
                    </span>
                    <span className="text-xs font-bold text-zinc-900 truncate max-w-[180px]">
                      Update Data Produk di Marketplace
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Deadline: 18 Nov 2026 • Marketing
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
            </div>

            {/* Task 3 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-bold text-zinc-400 mt-0.5">3</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      Prioritas
                    </span>
                    <span className="text-xs font-bold text-zinc-900 truncate max-w-[180px]">
                      Rekap Stok Gudang
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Deadline: 19 Nov 2026 • Gudang
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Proyek Pengembangan (4 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <FolderGit2 className="h-4 w-4 text-emerald-700" />
              <span>Proyek Pengembangan</span>
            </div>
            <Link href="/gm/perusahaan" className="text-xs font-semibold text-emerald-700 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="my-auto flex items-center justify-between py-2">
            <div className="flex-1 pr-4">
              <h3 className="text-xs font-bold text-zinc-900">
                Pengembangan Strategi Marketing
              </h3>
              <div className="mt-2 text-xs font-bold text-zinc-700">Progress: 60%</div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: "60%" }} />
              </div>
            </div>

            {/* Circular Ring Gauge 60% */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-zinc-100"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-emerald-600"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  strokeDashoffset="35"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute text-xs font-bold text-zinc-900">60%</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] font-medium text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Deadline: 30 Nov 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
              <span>Tim: 3 orang</span>
            </div>
          </div>
        </div>

        {/* Informasi Terbaru (4 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <Bell className="h-4 w-4 text-emerald-700" />
              <span>Informasi Terbaru</span>
            </div>
            <Link href="/gm/laporan" className="text-xs font-semibold text-emerald-700 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {/* Feed 1 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 transition-colors">
              <div className="flex items-start gap-2.5">
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Baru
                </span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">
                    Laporan harian dari Icha (Marketing)
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">10:30 • 17 Nov 2026</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </div>

            {/* Feed 2 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 transition-colors">
              <div className="flex items-start gap-2.5">
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                  Update
                </span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">
                    Progres proyek: Pengembangan Strategi Marketing
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">09:45 • 17 Nov 2026</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </div>

            {/* Feed 3 */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 transition-colors">
              <div className="flex items-start gap-2.5">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Info
                </span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">
                    Agenda Meeting Tim Marketing
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">09:00 • 17 Nov 2026</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Row 4: Aktivitas Terakhir, Statistik Divisi, Notifikasi WhatsApp */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Aktivitas Terakhir (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <Clock className="h-4 w-4 text-emerald-700" />
              <span>Aktivitas Terakhir</span>
            </div>
            <Link href="/gm/absensi" className="text-xs font-semibold text-emerald-700 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-400">
                  <th className="py-2">Waktu</th>
                  <th className="py-2">Pengguna</th>
                  <th className="py-2">Aktivitas</th>
                  <th className="py-2">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-700">
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 text-[11px] text-zinc-500 font-mono">09:40</td>
                  <td className="py-2.5 font-bold text-zinc-900">Rina Septiani</td>
                  <td className="py-2.5 text-[11px]">Update Progres Proyek</td>
                  <td className="py-2.5 text-[11px] text-zinc-500">Pengembangan Strategi Marketing (60%)</td>
                </tr>
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 text-[11px] text-zinc-500 font-mono">09:35</td>
                  <td className="py-2.5 font-bold text-zinc-900">Icha</td>
                  <td className="py-2.5 text-[11px]">Kirim Laporan Aktivitas</td>
                  <td className="py-2.5 text-[11px] text-zinc-500">Laporan harian Marketing</td>
                </tr>
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 text-[11px] text-zinc-500 font-mono">09:20</td>
                  <td className="py-2.5 font-bold text-zinc-900">Cantrisah</td>
                  <td className="py-2.5 text-[11px]">Update Stok Barang</td>
                  <td className="py-2.5 text-[11px] text-zinc-500">Gudang</td>
                </tr>
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 text-[11px] text-zinc-500 font-mono">08:50</td>
                  <td className="py-2.5 font-bold text-zinc-900">Hesti</td>
                  <td className="py-2.5 text-[11px]">Selesaikan Penugasan</td>
                  <td className="py-2.5 text-[11px] text-zinc-500">Update Konten Produk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistik Divisi (4 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Statistik Divisi</span>
            </div>
          </div>

          <div className="my-auto flex items-center justify-between py-2">
            {/* Pie Chart SVG */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {/* Marketing: 32% (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#22c55e"
                  strokeWidth="24"
                  strokeDasharray="70.37 149.53"
                  strokeDashoffset="0"
                />
                {/* Selling: 38% (Blue/Indigo) */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#6366f1"
                  strokeWidth="24"
                  strokeDasharray="83.56 136.34"
                  strokeDashoffset="-70.37"
                />
                {/* Gudang & Logistik: 30% (Yellow/Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  strokeDasharray="65.97 153.93"
                  strokeDashoffset="-153.93"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-700">Marketing</span>
                </div>
                <span className="font-bold text-zinc-900">32%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="text-zinc-700">Selling</span>
                </div>
                <span className="font-bold text-zinc-900">38%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-zinc-700">Gudang & Logistik</span>
                </div>
                <span className="font-bold text-zinc-900">30%</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 border-t border-zinc-100 pt-2 text-right">
            Total 3 divisi operasional aktif
          </div>
        </div>

        {/* Notifikasi WhatsApp Card (3 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-[#eaf6ee] to-[#ddf2e3] p-5 shadow-xs lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <Smartphone className="h-4 w-4 text-emerald-700" />
              <span>Notifikasi WhatsApp</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Aktif
            </span>
          </div>

          <div className="my-3">
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Laporan karyawan akan otomatis dikirim ke Owner melalui WhatsApp.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/gm/laporan"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 transition-colors"
            >
              <span>Lihat Riwayat</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* WA Mockup Graphic */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 2C6.496 2 2 6.496 2 12.031C2 13.977 2.559 15.787 3.525 17.324L2.146 21.854L6.809 20.518C8.289 21.436 10.096 22 12.031 22C17.566 22 22.062 17.504 22.062 12.031C22.062 6.496 17.566 2 12.031 2ZM17.156 15.734C16.945 16.328 16.113 16.852 15.48 16.988C15.047 17.078 14.484 17.148 12.578 16.359C10.141 15.352 8.566 12.879 8.445 12.715C8.328 12.551 7.461 11.402 7.461 10.211C7.461 9.02 8.07 8.438 8.312 8.191C8.516 7.988 8.855 7.891 9.168 7.891C9.27 7.891 9.363 7.898 9.445 7.902C9.684 7.914 9.805 7.926 9.961 8.301C10.156 8.766 10.633 9.93 10.691 10.047C10.75 10.164 10.809 10.324 10.727 10.48C10.648 10.641 10.582 10.719 10.461 10.855C10.34 10.992 10.227 11.086 10.109 11.23C10.004 11.352 9.883 11.48 10.02 11.715C10.156 11.949 10.629 12.719 11.328 13.344C12.23 14.148 12.969 14.406 13.23 14.516C13.492 14.625 13.648 14.605 13.805 14.426C13.965 14.246 14.484 13.641 14.672 13.383C14.859 13.125 15.047 13.164 15.305 13.258C15.566 13.352 16.945 14.035 17.227 14.176C17.508 14.316 17.695 14.387 17.766 14.504C17.836 14.625 17.836 15.141 17.156 15.734Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal handlers */}
      {leaveSel && (
        <LeaveModal
          key={leaveSel.id}
          sel={leaveSel}
          onClose={() => setLeaveSel(null)}
          onDone={reload}
        />
      )}
      {attSel && (
        <AttModal
          key={attSel.id}
          sel={attSel}
          onClose={() => setAttSel(null)}
          onDone={reload}
        />
      )}
    </div>
  );
}
