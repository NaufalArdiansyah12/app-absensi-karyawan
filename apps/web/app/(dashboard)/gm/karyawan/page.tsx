"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import Modal from "@/components/Modal";
import {
  AttBadge, Empty, Kpi, LeaveBadge, PageHead, Select, btnDark, card, discipline, input, linkBtn, pill, th, useGMData,
} from "@/components/gm-shared";

const LEAVE_LABEL: Record<string, string> = {
  CUTI_TAHUNAN: "Cuti Tahunan",
  IZIN_SAKIT: "Izin Sakit",
  LAINNYA: "Izin Lainnya",
};

const FILTERS = [
  ["ALL", "Semua"],
  ["HADIR", "Hadir"],
  ["CUTI_TAHUNAN", "Cuti"],
  ["IZIN_SAKIT", "Izin Sakit"],
  ["LAINNYA", "Izin Lainnya"],
  ["BELUM", "Belum Hadir"],
] as const;

function EmployeeCalendar({ userLeaves, userAtts }: { userLeaves: any[]; userAtts: any[] }) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const cells = [
    ...Array(cursor.getDay()).fill(null),
    ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1),
  ];

  const dayStyle = (d: number) => {
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const lv = userLeaves.find((l) => l.status !== "DITOLAK_GM" && l.status !== "DITOLAK_HR" && l.startDate <= iso && iso <= l.endDate);
    if (lv) return lv.type === "CUTI_TAHUNAN" ? "bg-blue-100 text-blue-700 font-bold" : "bg-amber-100 text-amber-700 font-bold";
    const att = userAtts.find((a) => a.date === iso);
    if (att) return att.status === "TEPAT_WAKTU" ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-rose-100 text-rose-700 font-bold";
    return "text-zinc-600";
  };

  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-900">
          Kalender • {cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
        </span>
        <div className="flex gap-1">
          <button aria-label="Bulan sebelumnya" onClick={() => setCursor(new Date(y, m - 1, 1))} className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button aria-label="Bulan berikutnya" onClick={() => setCursor(new Date(y, m + 1, 1))} className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
          <div key={d} className="py-1 text-[10px] font-semibold text-zinc-400">{d}</div>
        ))}
        {cells.map((d, i) => (
          <span key={i} className={`rounded-lg py-1 ${d ? dayStyle(d) : ""}`}>
            {d ? String(d).padStart(2, "0") : ""}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 border-t border-zinc-200/70 pt-2.5 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Hadir Tepat</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Terlambat</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Cuti</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Izin/Sakit</span>
      </div>
    </div>
  );
}

function normalize24(raw: string): string {
  const clean = raw.trim().replace(".", ":");
  const m = clean.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!m) return clean;
  const hh = Math.min(24, Math.max(0, Number(m[1])));
  const mm = Math.min(59, Math.max(0, Number(m[2] ?? 0)));
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function clampPart(val: string, max: number): string {
  if (val.length === 2 && Number(val) > max) return String(max).padStart(2, "0");
  return val;
}

function onlyDigitsTime(raw: string): string {
  const cleaned = raw.replace(/[^\d:]/g, "");
  if (cleaned.includes(":")) {
    const [h = "", m = ""] = cleaned.split(":");
    const hh = clampPart(h.slice(0, 2), 24);
    const mm = clampPart(m.slice(0, 2), 59);
    return `${hh}:${mm}`;
  }
  const digits = cleaned.slice(0, 4);
  const hh = clampPart(digits.slice(0, 2), 24);
  if (digits.length <= 2) return hh;
  const mm = clampPart(digits.slice(2, 4), 59);
  return `${hh}:${mm}`;
}

function Time24Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block font-semibold text-zinc-600">
      <div>{label}</div>
      <div className="mt-1 flex items-center rounded-full border border-black/5 bg-zinc-50 px-4 py-2 text-sm text-zinc-800 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-900">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          required
          pattern="^([01]\d|2[0-4]):[0-5]\d$"
          title="Format HH:MM, contoh 07:00 atau 13:30"
          placeholder="07:00"
          value={value}
          onChange={(e) => onChange(onlyDigitsTime(e.target.value))}
          onBlur={(e) => onChange(normalize24(e.target.value))}
          className="w-full bg-transparent font-bold focus:outline-none"
        />
        <span className="ml-2 text-[11px] font-semibold text-zinc-400">WIB</span>
      </div>
    </label>
  );
}

function ShiftModal({
  user,
  shifts,
  onClose,
  onDone,
}: {
  user: any;
  shifts: any[];
  onClose: () => void;
  onDone: () => void;
}) {
  const initial = shifts.find((s) => s.id === (user.shiftId || "shift_1")) || shifts[0] || {
    id: "shift_1",
    name: "Shift Reguler",
    startTime: "08:00",
    endTime: "17:00",
    breakStartTime: "12:00",
    breakEndTime: "13:00",
    lateToleranceMinutes: 15,
  };
  const [shiftId, setShiftId] = useState<string>(initial.id);
  const [startTime, setStartTime] = useState<string>(initial.startTime);
  const [endTime, setEndTime] = useState<string>(initial.endTime);
  const [breakStart, setBreakStart] = useState<string>(initial.breakStartTime || "12:00");
  const [breakEnd, setBreakEnd] = useState<string>(initial.breakEndTime || "13:00");
  const [tolerance, setTolerance] = useState<number>(initial.lateToleranceMinutes ?? 15);
  const [busy, setBusy] = useState(false);

  const pickShift = (id: string) => {
    setShiftId(id);
    const found = shifts.find((s) => s.id === id);
    if (found) {
      setStartTime(found.startTime);
      setEndTime(found.endTime);
      setBreakStart(found.breakStartTime || "12:00");
      setBreakEnd(found.breakEndTime || "13:00");
      setTolerance(found.lateToleranceMinutes ?? 15);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const normStart = normalize24(startTime);
    const normEnd = normalize24(endTime);
    const normBreakStart = normalize24(breakStart);
    const normBreakEnd = normalize24(breakEnd);
    setStartTime(normStart);
    setEndTime(normEnd);
    setBreakStart(normBreakStart);
    setBreakEnd(normBreakEnd);
    setBusy(true);
    try {
      const res = await fetch("/api/master/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          shiftId,
          startTime: normStart,
          endTime: normEnd,
          breakStartTime: normBreakStart,
          breakEndTime: normBreakEnd,
          lateToleranceMinutes: tolerance,
        }),
      });
      if (!res.ok) {
        const err: any = await res.json();
        throw new Error(err.error || "Gagal menyimpan shift");
      }
      onClose();
      onDone();
    } catch (err: any) {
      alert(err.message || "Kesalahan jaringan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Atur Jadwal Shift & Jam Kerja" onClose={onClose}>
      <form onSubmit={save} className="space-y-4 text-xs">
        <div className="rounded-2xl bg-zinc-50 p-3">
          <div className="text-sm font-bold text-zinc-900">{user.name}</div>
          <div className="text-zinc-500">{user.nik} • {user.division} ({user.jobPosition})</div>
        </div>

        <div className="space-y-1">
          <div className="font-semibold text-zinc-600">Pilih Jenis Shift</div>
          <Select
            ariaLabel="Pilih Jenis Shift"
            value={shiftId}
            onChange={pickShift}
            options={shifts.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.startTime} - ${s.endTime} WIB)`,
            }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Time24Input label="Jam Masuk" value={startTime} onChange={setStartTime} />
          <Time24Input label="Jam Pulang" value={endTime} onChange={setEndTime} />
          <label className="block font-semibold text-zinc-600">
            Toleransi (mnt)
            <input
              type="number"
              min={0}
              max={120}
              required
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className={`${input} mt-1 w-full py-2 text-sm font-bold`}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Time24Input label="Mulai Istirahat" value={breakStart} onChange={setBreakStart} />
          <Time24Input label="Selesai Istirahat" value={breakEnd} onChange={setBreakEnd} />
        </div>

        <div className="rounded-2xl bg-zinc-50 p-3 text-[11px] text-zinc-500">
          Jam kerja <strong className="text-zinc-800">{startTime} - {endTime} WIB</strong> (toleransi {tolerance} mnt), waktu istirahat{" "}
          <strong className="text-zinc-800">{breakStart} - {breakEnd} WIB</strong>.
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-zinc-200 bg-white py-2.5 font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Batal
          </button>
          <button type="submit" disabled={busy} className={`${btnDark} flex-1 justify-center py-2.5`}>
            {busy ? "Menyimpan..." : "Simpan Jadwal Shift"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function EmployeesPage() {
  const { users, leaves, attendances, shifts, reload } = useGMData();
  const isHR = usePathname().startsWith("/hr");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [sel, setSel] = useState<any | null>(null);
  const [shiftUser, setShiftUser] = useState<any | null>(null);
  const [valUser, setValUser] = useState<any | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const getShift = (u: any) =>
    shifts.find((s) => s.id === (u.shiftId || "shift_1")) ||
    shifts[0] || { id: "shift_1", name: "Shift Reguler", startTime: "08:00", endTime: "17:00", lateToleranceMinutes: 15 };

  const stats = discipline(users, attendances);
  const all = stats.map((s) => {
    const leave = leaves.find(
      (l) => l.userId === s.user.id && l.status === "FINAL_DISETUJUI" && l.startDate <= today && today <= l.endDate
    );
    const present = attendances.some((a) => a.userId === s.user.id && a.date === today);
    const key = leave ? leave.type : present ? "HADIR" : "BELUM";
    const [label, cls] = leave
      ? [LEAVE_LABEL[leave.type] || "Izin", "bg-blue-50 text-blue-600"]
      : present
      ? ["Hadir", "bg-emerald-50 text-emerald-600"]
      : ["Belum Hadir", "bg-zinc-100 text-zinc-600"];
    return { ...s, key, label, cls, leave, shift: getShift(s.user) };
  });

  const count = (k: string) => (k === "ALL" ? all.length : all.filter((r) => r.key === k).length);
  const onLeave = all.filter((r) => r.leave).length;
  const term = q.trim().toLowerCase();
  const rows = all.filter(
    (r) =>
      (filter === "ALL" || r.key === filter) &&
      `${r.user.name} ${r.user.nik} ${r.user.division} ${r.shift.name}`.toLowerCase().includes(term)
  );

  const selLeaves = sel ? leaves.filter((l) => l.userId === sel.user.id) : [];
  const selAtts = sel ? attendances.filter((a) => a.userId === sel.user.id).sort((a, b) => b.createdAt - a.createdAt) : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHead
        title={isHR ? "Validasi Data Karyawan" : "Monitoring Karyawan"}
        desc={
          isHR
            ? "Validasi kelengkapan data karyawan, kuota cuti, jadwal shift, dan status kehadiran."
            : "Data, jadwal shift kerja, dan status kehadiran karyawan hari ini."
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Total Karyawan" value={all.length} icon={Users} />
        <Kpi label="Hadir" value={count("HADIR")} icon={UserCheck} />
        <Kpi label="Cuti/Izin" value={onLeave} icon={CalendarCheck} />
        <Kpi label="Belum Hadir" value={count("BELUM")} icon={UserX} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Daftar Karyawan & Shift</h2>
            <p className="text-xs text-zinc-500">{rows.length} karyawan</p>
          </div>
          <input
            type="search"
            aria-label="Cari karyawan"
            placeholder="Cari nama, NIK, shift..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={`${input} w-64`}
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
          {FILTERS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === k
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-black/5 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {label} <span className="ml-1 opacity-60">{count(k)}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className={th}>Karyawan</th>
                <th className={th}>Divisi & Jabatan</th>
                <th className={th}>Shift & Jam Kerja</th>
                <th className={th}>Status Hari Ini</th>
                <th className={th}>Periode Cuti/Izin</th>
                <th className={th}>Sisa Cuti</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
              {rows.length === 0 && <Empty cols={7} text="Karyawan tidak ditemukan." />}
              {rows.map((r) => (
                <tr key={r.user.id} className="transition-colors hover:bg-zinc-50/50">
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                      <span>{r.user.name}</span>
                      {r.user.isVerified !== false && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-label="Tervalidasi" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">{r.user.nik}</div>
                  </td>
                  <td className="py-3.5">
                    {r.user.division}
                    <div className="text-[11px] text-zinc-400">{r.user.jobPosition}</div>
                  </td>
                  <td className="py-3.5">
                    <div className="font-bold text-zinc-900">{r.shift.name}</div>
                    <div className="text-[11px] text-zinc-500">
                      {r.shift.startTime} - {r.shift.endTime} WIB • Istirahat {r.shift.breakStartTime || "12:00"}-{r.shift.breakEndTime || "13:00"}
                    </div>
                  </td>
                  <td className="py-3.5"><span className={`${pill} ${r.cls}`}>{r.label}</span></td>
                  <td className="py-3.5 text-zinc-500">
                    {r.leave ? `${r.leave.startDate} s/d ${r.leave.endDate}` : "—"}
                  </td>
                  <td className="py-3.5">{r.user.leaveQuota} hari</td>
                  <td className="py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {isHR && (
                        <button onClick={() => setValUser(r.user)} className={linkBtn}>
                          <ShieldCheck className="h-3 w-3" /> Validasi
                        </button>
                      )}
                      <button onClick={() => setShiftUser(r.user)} className={linkBtn}>
                        <Clock className="h-3 w-3" /> Shift
                      </button>
                      <button onClick={() => setSel(r)} className={linkBtn}>
                        Detail <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {valUser && (
        <Modal title="Validasi Data Karyawan" onClose={() => setValUser(null)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const res = await fetch("/api/master/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: valUser.id,
                  name: fd.get("name"),
                  email: fd.get("email"),
                  division: fd.get("division"),
                  jobPosition: fd.get("jobPosition"),
                  leaveQuota: Number(fd.get("leaveQuota")),
                  isVerified: fd.get("isVerified") === "on",
                }),
              });
              if (res.ok) {
                setValUser(null);
                reload();
              } else {
                alert("Gagal menyimpan validasi karyawan");
              }
            }}
            className="space-y-3 text-xs"
          >
            <div className="rounded-2xl bg-zinc-50 p-3">
              <div className="text-sm font-bold text-zinc-900">{valUser.name}</div>
              <div className="text-zinc-500">NIK: {valUser.nik} • Peran: {valUser.role}</div>
            </div>
            <label className="block font-semibold text-zinc-600">
              Nama Lengkap
              <input name="name" defaultValue={valUser.name} required className={`${input} mt-1 w-full py-2 text-sm`} />
            </label>
            <label className="block font-semibold text-zinc-600">
              Email
              <input name="email" type="email" defaultValue={valUser.email} required className={`${input} mt-1 w-full py-2 text-sm`} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block font-semibold text-zinc-600">
                Divisi
                <input name="division" defaultValue={valUser.division} required className={`${input} mt-1 w-full py-2 text-sm`} />
              </label>
              <label className="block font-semibold text-zinc-600">
                Jabatan
                <input name="jobPosition" defaultValue={valUser.jobPosition} required className={`${input} mt-1 w-full py-2 text-sm`} />
              </label>
            </div>
            <label className="block font-semibold text-zinc-600">
              Sisa Kuota Cuti (Hari)
              <input name="leaveQuota" type="number" min={0} max={30} defaultValue={valUser.leaveQuota} required className={`${input} mt-1 w-full py-2 text-sm`} />
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-zinc-50 p-3 font-semibold text-zinc-800">
              <input name="isVerified" type="checkbox" defaultChecked={valUser.isVerified !== false} className="h-4 w-4 accent-zinc-900" />
              Data karyawan telah diverifikasi dan valid oleh HR
            </label>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setValUser(null)} className="flex-1 rounded-full border border-zinc-200 bg-white py-2.5 font-semibold text-zinc-700 hover:bg-zinc-50">
                Batal
              </button>
              <button type="submit" className={`${btnDark} flex-1 justify-center py-2.5`}>
                Simpan & Validasi
              </button>
            </div>
          </form>
        </Modal>
      )}

      {shiftUser && (
        <ShiftModal
          user={shiftUser}
          shifts={shifts}
          onClose={() => setShiftUser(null)}
          onDone={reload}
        />
      )}

      {sel && (
        <Modal wide title="Detail Karyawan" onClose={() => setSel(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-zinc-900">{sel.user.name}</div>
                <div className="text-xs text-zinc-500">{sel.user.nik} • {sel.user.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const u = sel.user;
                    setSel(null);
                    setShiftUser(u);
                  }}
                  className={linkBtn}
                >
                  <Clock className="h-3 w-3" /> Atur Shift
                </button>
                <span className={`${pill} ${sel.cls}`}>{sel.label}</span>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-4">
              {[
                ["Divisi", sel.user.division],
                ["Jabatan", sel.user.jobPosition],
                ["Shift Kerja", `${sel.shift.name} (${sel.shift.startTime}-${sel.shift.endTime})`],
                ["Jam Istirahat", `${sel.shift.breakStartTime || "12:00"} - ${sel.shift.breakEndTime || "13:00"} WIB`],
                ["Sisa Cuti", `${sel.user.leaveQuota} hari`],
                ["Total Hadir", `${sel.hadir} hari`],
                ["Tepat Waktu", `${sel.tepat}x (${sel.pct}%)`],
                ["Terlambat", `${sel.telat}x (${sel.menitTelat} mnt)`],
                ["Total Pengajuan", `${selLeaves.length}x`],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-[11px] text-zinc-400">{k}</dt>
                  <dd className="text-xs font-bold text-zinc-900">{v}</dd>
                </div>
              ))}
            </dl>

            <EmployeeCalendar userLeaves={selLeaves} userAtts={selAtts} />

            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-900">Keterangan Cuti & Izin ({selLeaves.length})</div>
              {selLeaves.length === 0 ? (
                <div className="rounded-2xl bg-zinc-50 p-3 text-center text-xs text-zinc-400">Belum ada riwayat cuti atau izin.</div>
              ) : (
                <ul className="space-y-2">
                  {selLeaves.map((l) => (
                    <li key={l.id} className="rounded-2xl bg-zinc-50 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900">
                          {l.startDate} s/d {l.endDate} • {LEAVE_LABEL[l.type] || l.type} ({l.durationDays} hari)
                        </span>
                        <LeaveBadge status={l.status} />
                      </div>
                      <div className="mt-1 text-zinc-600">Alasan: &ldquo;{l.reason}&rdquo;</div>
                      {(l.gmNote || l.hrNote) && (
                        <div className="mt-1 text-[11px] text-zinc-400">
                          {l.gmNote ? `Catatan GM: ${l.gmNote}` : ""} {l.hrNote ? `• Catatan HR: ${l.hrNote}` : ""}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-900">Riwayat Presensi Terbaru ({selAtts.length})</div>
              {selAtts.length === 0 ? (
                <div className="rounded-2xl bg-zinc-50 p-3 text-center text-xs text-zinc-400">Belum ada riwayat presensi.</div>
              ) : (
                <ul className="space-y-1.5">
                  {selAtts.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2 text-xs">
                      <div>
                        <span className="font-bold text-zinc-900">{a.date}</span>
                        <span className="ml-2 text-zinc-500">
                          Masuk {a.checkInTime} • Pulang {a.checkOutTime || "—"} ({a.checkInDistanceMeters}m)
                        </span>
                      </div>
                      <AttBadge status={a.status} late={a.lateMinutes} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button onClick={() => setSel(null)} className={`${btnDark} w-full justify-center py-2.5`}>Tutup</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
