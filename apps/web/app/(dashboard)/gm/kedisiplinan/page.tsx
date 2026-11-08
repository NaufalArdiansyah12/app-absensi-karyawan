"use client";

import { useState } from "react";
import { AlertTriangle, ChevronRight, Gauge, Timer } from "lucide-react";
import Modal from "@/components/Modal";
import {
  AttBadge, Bar, Empty, Kpi, PageHead, btnDark, card, discipline, linkBtn, th, useGMData,
} from "@/components/gm-shared";

export default function DisciplinePage() {
  const { users, attendances } = useGMData();
  const [sel, setSel] = useState<any | null>(null);

  const rows = discipline(users, attendances).sort((a, b) => b.telat - a.telat || a.pct - b.pct);
  const withData = rows.filter((r) => r.hadir > 0);
  const avg = withData.length ? Math.round(withData.reduce((s, r) => s + r.pct, 0) / withData.length) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHead title="Monitoring Kedisiplinan" desc="Tingkat ketepatan waktu dan keterlambatan tiap karyawan." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Kpi label="Rata-rata Tepat Waktu" value={`${avg}%`} icon={Gauge} />
        <Kpi label="Karyawan Pernah Terlambat" value={rows.filter((r) => r.telat > 0).length} icon={AlertTriangle} />
        <Kpi label="Total Menit Terlambat" value={rows.reduce((s, r) => s + r.menitTelat, 0)} icon={Timer} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Peringkat Kedisiplinan</h2>
          <p className="text-xs text-zinc-500">Diurutkan dari paling sering terlambat</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className={th}>Karyawan</th>
                <th className={th}>Hadir</th>
                <th className={th}>Terlambat</th>
                <th className={th}>Menit Terlambat</th>
                <th className={th}>Tepat Waktu</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
              {rows.length === 0 && <Empty cols={6} text="Belum ada data." />}
              {rows.map((r) => (
                <tr key={r.user.id} className="transition-colors hover:bg-zinc-50/50">
                  <td className="py-3.5">
                    <div className="font-bold text-zinc-900">{r.user.name}</div>
                    <div className="text-[11px] text-zinc-400">{r.user.division}</div>
                  </td>
                  <td className="py-3.5">{r.hadir}</td>
                  <td className="py-3.5">{r.telat}x</td>
                  <td className="py-3.5">{r.menitTelat}</td>
                  <td className="py-3.5"><Bar pct={r.pct} /></td>
                  <td className="py-3.5 text-right">
                    <button onClick={() => setSel(r)} className={linkBtn}>Detail <ChevronRight className="h-3 w-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <Modal title="Riwayat Kedisiplinan" onClose={() => setSel(null)}>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-bold text-zinc-900">{sel.user.name}</div>
              <div className="text-xs text-zinc-500">
                {sel.hadir} hadir • {sel.telat}x terlambat • {sel.menitTelat} menit
              </div>
            </div>
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {attendances
                .filter((a) => a.userId === sel.user.id)
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-2.5 text-xs">
                    <span className="font-semibold text-zinc-800">{a.date} • {a.checkInTime}</span>
                    <AttBadge status={a.status} late={a.lateMinutes} />
                  </li>
                ))}
              {sel.hadir === 0 && <li className="py-4 text-center text-xs text-zinc-400">Belum ada presensi.</li>}
            </ul>
            <button onClick={() => setSel(null)} className={`${btnDark} w-full justify-center py-2.5`}>Tutup</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
