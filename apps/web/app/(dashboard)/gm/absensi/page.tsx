"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, LogOut, Users } from "lucide-react";
import { AttModal } from "@/components/gm-modals";
import {
  AttBadge, DatePicker, Empty, Kpi, PageHead, Select, card, input, linkBtn, th, useGMData,
} from "@/components/gm-shared";

const todayStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

export default function AttendancePage() {
  const { users, attendances, shifts, reload } = useGMData();
  const [date, setDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<any | null>(null);

  const today = todayStr();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Gabungkan absensi tercatat + deteksi karyawan belum absen / alfa jika filter 1 tanggal aktif
  const baseRows = [...attendances];
  if (date && date <= today) {
    for (const emp of users.filter((u) => u.role === "EMPLOYEE")) {
      if (!baseRows.some((a) => a.userId === emp.id && a.date === date)) {
        const shift =
          shifts.find((s) => s.id === (emp.shiftId || "shift_1")) ||
          shifts[0] || { id: "shift_1", name: "Shift Reguler", startTime: "08:00", endTime: "17:00" };
        const [eh, em] = (shift.endTime || "17:00").split(":").map(Number);
        const isPastEnd = date < today || nowMinutes > (eh || 17) * 60 + (em || 0);
        baseRows.push({
          id: `missing_${emp.id}_${date}`,
          userId: emp.id,
          userName: emp.name,
          shiftId: shift.id,
          shiftName: `${shift.name} (${shift.startTime}-${shift.endTime})`,
          date,
          checkInTime: "-",
          checkOutTime: "-",
          checkInDistanceMeters: 0,
          status: isPastEnd ? "ALFA" : "BELUM_ABSEN",
          lateMinutes: 0,
          overtimeMinutes: 0,
          createdAt: 0,
        });
      }
    }
  }

  const dateRows = baseRows.filter(
    (a) => (!date || a.date === date) && (a.userName || "").toLowerCase().includes(q.trim().toLowerCase())
  );

  const rows = dateRows
    .filter((a) => {
      if (statusFilter === "ALL") return true;
      if (statusFilter === "CUTI_IZIN") return a.status === "CUTI" || a.status === "IZIN_SAKIT" || a.status === "IZIN";
      if (statusFilter === "BELUM_PULANG")
        return (a.status === "TEPAT_WAKTU" || a.status === "TERLAMBAT") && (!a.checkOutTime || a.checkOutTime === "-");
      if (statusFilter === "BELUM_ABSEN") return a.status === "BELUM_ABSEN" || a.status === "ALFA";
      return a.status === statusFilter;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const tepat = dateRows.filter((a) => a.status === "TEPAT_WAKTU").length;
  const telat = dateRows.filter((a) => a.status === "TERLAMBAT").length;
  const belumPulang = dateRows.filter(
    (a) => (a.status === "TEPAT_WAKTU" || a.status === "TERLAMBAT") && (!a.checkOutTime || a.checkOutTime === "-")
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHead title="Monitoring & Kelola Absensi" desc="Catatan check-in/out GPS, izin/cuti, dan koreksi kehadiran karyawan." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Total Baris" value={dateRows.length} icon={Users} />
        <Kpi label="Tepat Waktu" value={tepat} icon={CheckCircle2} />
        <Kpi label="Terlambat" value={telat} icon={AlertTriangle} />
        <Kpi label="Belum Check-out" value={belumPulang} icon={LogOut} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Catatan Kehadiran</h2>
            <p className="text-xs text-zinc-500">{rows.length} catatan ditampilkan</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              ariaLabel="Filter status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "ALL", label: "Semua Status" },
                { value: "TEPAT_WAKTU", label: "Tepat Waktu" },
                { value: "TERLAMBAT", label: "Terlambat" },
                { value: "CUTI_IZIN", label: "Cuti / Izin" },
                { value: "BELUM_PULANG", label: "Belum Check-out" },
                { value: "BELUM_ABSEN", label: "Belum Absen / Alfa" },
              ]}
            />
            <DatePicker value={date} onChange={setDate} />
            <input
              type="search"
              aria-label="Cari karyawan"
              placeholder="Cari nama..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${input} w-44`}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className={th}>Karyawan</th>
                <th className={th}>Tanggal</th>
                <th className={th}>Masuk</th>
                <th className={th}>Pulang</th>
                <th className={th}>Jarak</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
              {rows.length === 0 && <Empty cols={7} text="Belum ada data kehadiran." />}
              {rows.map((a) => {
                const noDist =
                  a.status === "CUTI" ||
                  a.status === "IZIN_SAKIT" ||
                  a.status === "IZIN" ||
                  a.status === "BELUM_ABSEN" ||
                  a.status === "ALFA";
                return (
                  <tr key={a.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5 font-bold text-zinc-900">{a.userName}</td>
                    <td className="py-3.5 text-zinc-500">{a.date}</td>
                    <td className="py-3.5">{a.checkInTime || "-"}</td>
                    <td className="py-3.5">{a.checkOutTime || "-"}</td>
                    <td className="py-3.5 text-zinc-500">{noDist ? "-" : `${a.checkInDistanceMeters} m`}</td>
                    <td className="py-3.5"><AttBadge status={a.status} late={a.lateMinutes} /></td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => setSel(a)} className={linkBtn}>Kelola <ChevronRight className="h-3 w-3" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sel && <AttModal key={sel.id} sel={sel} onClose={() => setSel(null)} onDone={reload} />}
    </div>
  );
}
