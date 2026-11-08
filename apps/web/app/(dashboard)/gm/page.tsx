"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Clock, Users } from "lucide-react";
import { AttModal, LeaveModal } from "@/components/gm-modals";
import {
  AttBadge, Bar, CalendarWidget, Empty, Kpi, LeaveBadge, PageHead, card, linkBtn, th, typeLabel, useGMData,
} from "@/components/gm-shared";

export default function GMDashboardPage() {
  const { leaves, attendances, reload } = useGMData();
  const [leaveSel, setLeaveSel] = useState<any | null>(null);
  const [attSel, setAttSel] = useState<any | null>(null);

  const pending = leaves.filter((l) => l.status === "MENUNGGU_GM");
  const hadir = attendances.filter((a) => a.status === "TEPAT_WAKTU" || a.status === "TERLAMBAT");
  const onTime = hadir.filter((a) => a.status === "TEPAT_WAKTU").length;
  const late = hadir.length - onTime;
  const pct = hadir.length ? Math.round((onTime / hadir.length) * 100) : 0;
  const recent = [...attendances].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="flex flex-col gap-6 xl:col-span-8">
        <PageHead title="Dashboard GM" desc="Ringkasan operasional dan antrean approval hari ini." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kpi label="Total Presensi" value={attendances.length} icon={Users} />
          <Kpi label="Tepat Waktu" value={onTime} icon={CheckCircle2} />
          <Kpi label="Terlambat" value={late} icon={AlertTriangle} />
          <Kpi label="Menunggu Approval" value={pending.length} icon={Clock} />
        </div>

        <div className={`${card} flex flex-col gap-5`}>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Antrean Cuti & Izin</h2>
            <p className="text-xs text-zinc-500">Menunggu persetujuan GM (Tahap 1 dari 2)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className={th}>Karyawan</th>
                  <th className={th}>Jenis</th>
                  <th className={th}>Progres</th>
                  <th className={th}>Status</th>
                  <th className={th}>Periode</th>
                  <th className={`${th} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {pending.length === 0 && <Empty cols={6} text="Tidak ada permohonan yang menunggu persetujuan GM." />}
                {pending.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{l.userName}</div>
                      <div className="text-[11px] text-zinc-400">{l.userDivision}</div>
                    </td>
                    <td className="py-3.5">{typeLabel(l.type)}</td>
                    <td className="py-3.5"><Bar pct={0} /></td>
                    <td className="py-3.5"><LeaveBadge status={l.status} /></td>
                    <td className="py-3.5 text-zinc-500">
                      {l.startDate} s/d {l.endDate}
                      <div className="text-[11px] text-zinc-400">{l.durationDays} hari</div>
                    </td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => setLeaveSel(l)} className={linkBtn}>Proses <ChevronRight className="h-3 w-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${card} flex flex-col gap-5`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Kehadiran Terbaru</h2>
              <p className="text-xs text-zinc-500">Check-in GPS real-time</p>
            </div>
            <Link href="/gm/absensi" className={linkBtn}>Lihat semua <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className={th}>Karyawan</th>
                  <th className={th}>Masuk</th>
                  <th className={th}>Pulang</th>
                  <th className={th}>Jarak</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {recent.length === 0 && <Empty cols={6} text="Belum ada data kehadiran." />}
                {recent.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{a.userName}</div>
                      <div className="text-[11px] text-zinc-400">{a.date}</div>
                    </td>
                    <td className="py-3.5">{a.checkInTime || "-"}</td>
                    <td className="py-3.5">{a.checkOutTime || "-"}</td>
                    <td className="py-3.5 text-zinc-500">{a.checkInDistanceMeters} m</td>
                    <td className="py-3.5"><AttBadge status={a.status} late={a.lateMinutes} /></td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => setAttSel(a)} className={linkBtn}>Detail <ChevronRight className="h-3 w-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:col-span-4">
        <CalendarWidget />
        <div className={`${card} flex flex-col gap-4`}>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Kedisiplinan</h2>
            <p className="text-xs text-zinc-500">Ringkasan kehadiran tepat waktu</p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white/90 p-5 shadow-sm">
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-zinc-700">
                <span>Tepat Waktu</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-zinc-900" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-2 text-center">
              {[["Total", attendances.length], ["Tepat", onTime], ["Telat", late]].map(([label, v]) => (
                <div key={label as string}>
                  <div className="text-base font-bold text-zinc-900">{String(v).padStart(2, "0")}</div>
                  <div className="text-[10px] font-medium text-zinc-400">{label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white py-2.5 text-center text-xs font-bold text-zinc-900">
              Alur: Karyawan <ArrowRight className="mx-1 inline h-3 w-3" /> GM <ArrowRight className="mx-1 inline h-3 w-3" /> HR
            </div>
          </div>
        </div>
      </div>

      {leaveSel && <LeaveModal key={leaveSel.id} sel={leaveSel} onClose={() => setLeaveSel(null)} onDone={reload} />}
      {attSel && <AttModal key={attSel.id} sel={attSel} onClose={() => setAttSel(null)} onDone={reload} />}
    </div>
  );
}
