"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Clock, Calendar, ShieldCheck } from "lucide-react";

export default function GMDashboardPage() {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      const [leaveRes, attRes] = await Promise.all([
        fetch("/api/leaves/pending"),
        fetch("/api/attendance/history"),
      ]);

      const [leaveData, attData]: any[] = await Promise.all([leaveRes.json(), attRes.json()]);

      if (leaveData.pendingLeaves) setPendingLeaves(leaveData.pendingLeaves);
      if (attData.attendances) setAttendances(attData.attendances);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/leaves/${id}/approve-gm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          note: noteMap[id] || (action === "APPROVE" ? "Disetujui GM" : "Ditolak GM"),
        }),
      });

      if (res.ok) {
        await loadData();
      } else {
        const err: any = await res.json();
        alert(err.error || "Gagal memproses approval GM");
      }
    } catch (err: any) {
      alert(err.message || "Kesalahan jaringan");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard General Manager (GM)</h1>
        <p className="text-xs text-slate-500">
          Pemantauan kedisiplinan operasional divisi & persetujuan izin/cuti Tahap 1.
        </p>
      </div>

      {/* Alur Approval Infographic */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-950">
        <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> Alur Approval Persetujuan Cuti / Libur:
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="rounded bg-white px-2 py-1 shadow-xs border border-emerald-200">
            [Pekerja Mengemukakan]
          </span>
          <span>→</span>
          <span className="rounded bg-amber-100 font-bold px-2 py-1 text-amber-800 border border-amber-300">
            [Status: Menunggu GM] (Anda)
          </span>
          <span>→</span>
          <span className="rounded bg-white px-2 py-1 shadow-xs border border-emerald-200">
            [Status: Menunggu HR]
          </span>
          <span>→</span>
          <span className="rounded bg-emerald-100 font-bold px-2 py-1 text-emerald-800 border border-emerald-300">
            [Disetujui HR (Final)]
          </span>
        </div>
      </div>

      {/* Antrean Approval Cuti Tahap 1 (GM) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Antrean Permohonan Cuti / Izin (Menunggu GM)
            </h2>
            <p className="text-[11px] text-slate-500">
              Persetujuan Tahap 1 sebelum diteruskan ke HR untuk validasi final & pemotongan kuota.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            {pendingLeaves.length} Permohonan
          </span>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            Tidak ada permohonan yang menunggu persetujuan GM saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{leave.userName}</div>
                    <div className="text-[11px] text-slate-500">
                      Divisi {leave.userDivision} • {leave.type.replace("_", " ")}
                    </div>
                  </div>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Menunggu GM
                  </span>
                </div>

                <div className="rounded bg-white p-2.5 text-xs text-slate-700 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {leave.startDate} s/d {leave.endDate} (<strong>{leave.durationDays} Hari</strong>)
                    </span>
                  </div>
                  <div className="text-slate-600 italic">"{leave.reason}"</div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Catatan GM (opsional)..."
                    value={noteMap[leave.id] || ""}
                    onChange={(e) =>
                      setNoteMap({ ...noteMap, [leave.id]: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    disabled={processingId === leave.id}
                    onClick={() => handleAction(leave.id, "REJECT")}
                    className="flex-1 rounded-lg border border-rose-300 bg-white py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    Tolak oleh GM
                  </button>
                  <button
                    disabled={processingId === leave.id}
                    onClick={() => handleAction(leave.id, "APPROVE")}
                    className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Disetujui oleh GM
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monitoring Kehadiran Divisi */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-sm font-bold text-slate-800">
            Pantauan Kehadiran Hari Ini (Real-Time GPS Check-in)
          </h2>
          <span className="text-xs text-slate-500">{attendances.length} Terdata</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Karyawan</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Jam Masuk</th>
                <th className="py-2.5 px-3">Jam Pulang</th>
                <th className="py-2.5 px-3">Jarak ke Kantor</th>
                <th className="py-2.5 px-3">Status Kedisiplinan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendances.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-900">{a.userName}</td>
                  <td className="py-2 px-3 text-slate-500">{a.date}</td>
                  <td className="py-2 px-3 font-mono">{a.checkInTime}</td>
                  <td className="py-2 px-3 font-mono">{a.checkOutTime || "—"}</td>
                  <td className="py-2 px-3 font-mono">{a.checkInDistanceMeters} m</td>
                  <td className="py-2 px-3">
                    <span
                      className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                        a.status === "TEPAT_WAKTU"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {a.status}
                      {a.lateMinutes > 0 ? ` (+${a.lateMinutes} mnt)` : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
