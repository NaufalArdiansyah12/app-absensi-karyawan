"use client";

import { useState } from "react";
import { AlertTriangle, ChevronRight, Clock, Timer, Users } from "lucide-react";
import { AttModal } from "@/components/gm-modals";
import {
  AttBadge, DatePicker, Empty, Kpi, PageHead, card, input, linkBtn, th, useGMData,
} from "@/components/gm-shared";

export default function LateMonitoringPage() {
  const { attendances } = useGMData();
  const [date, setDate] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<any | null>(null);

  const lates = attendances.filter((a) => a.status === "TERLAMBAT");
  const rows = lates
    .filter((a) => (!date || a.date === date) && (a.userName || "").toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);
  const totalMinutes = rows.reduce((s, a) => s + (a.lateMinutes || 0), 0);
  const uniqueUsers = new Set(rows.map((a) => a.userId)).size;

  return (
    <div className="flex flex-col gap-6">
      <PageHead title="Monitoring Keterlambatan" desc="Daftar catatan keterlambatan check-in karyawan beserta akumulasi menit." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Total Kejadian Telat" value={rows.length} icon={AlertTriangle} />
        <Kpi label="Karyawan Terlambat" value={uniqueUsers} icon={Users} />
        <Kpi label="Total Menit Telat" value={`${totalMinutes} mnt`} icon={Timer} />
        <Kpi label="Rata-rata Telat" value={`${rows.length ? Math.round(totalMinutes / rows.length) : 0} mnt`} icon={Clock} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Catatan Keterlambatan</h2>
            <p className="text-xs text-zinc-500">{rows.length} kejadian terlambat</p>
          </div>
          <div className="flex items-center gap-2">
            <DatePicker value={date} onChange={setDate} />
            <input
              type="search"
              aria-label="Cari karyawan"
              placeholder="Cari nama..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${input} w-48`}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className={th}>Karyawan</th>
                <th className={th}>Tanggal</th>
                <th className={th}>Jam Masuk</th>
                <th className={th}>Durasi Telat</th>
                <th className={th}>Jarak GPS</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
              {rows.length === 0 && <Empty cols={7} text="Tidak ada catatan keterlambatan." />}
              {rows.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-zinc-50/50">
                  <td className="py-3.5 font-bold text-zinc-900">{a.userName}</td>
                  <td className="py-3.5 text-zinc-500">{a.date}</td>
                  <td className="py-3.5">{a.checkInTime}</td>
                  <td className="py-3.5 font-bold text-rose-600">+{a.lateMinutes || 0} menit</td>
                  <td className="py-3.5 text-zinc-500">{a.checkInDistanceMeters} m</td>
                  <td className="py-3.5"><AttBadge status={a.status} late={a.lateMinutes} /></td>
                  <td className="py-3.5 text-right">
                    <button onClick={() => setSel(a)} className={linkBtn}>Detail <ChevronRight className="h-3 w-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && <AttModal sel={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
