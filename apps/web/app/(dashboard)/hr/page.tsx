"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Camera,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export default function HRDashboardPage() {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [lRes, aRes] = await Promise.all([
        fetch("/api/leaves/pending"),
        fetch("/api/attendance/history"),
      ]);

      const [lData, aData]: any[] = await Promise.all([lRes.json(), aRes.json()]);

      if (lData.pendingLeaves) setPendingLeaves(lData.pendingLeaves);
      if (aData.attendances) setAttendances(aData.attendances);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHRAction = async (id: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/leaves/${id}/approve-hr`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          note: noteMap[id] || (action === "APPROVE" ? "Disetujui Final oleh HR" : "Ditolak HR"),
        }),
      });

      const data: any = await res.json();
      if (res.ok) {
        alert(
          action === "APPROVE"
            ? `Cuti disetujui (Final)! Sisa kuota cuti karyawan: ${data.updatedUserQuota} hari.`
            : "Permohonan ditolak oleh HR."
        );
        await loadData();
      } else {
        alert(data.error || "Gagal memproses approval HR");
      }
    } catch (e: any) {
      alert(e.message || "Kesalahan jaringan");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard Human Resources (HR)</h1>
        <p className="text-xs text-slate-500">
          Validasi bukti fisik swafoto & radius GPS absensi, serta persetujuan akhir (Final Tier) cuti karyawan.
        </p>
      </div>

      {/* Antrean Approval Cuti Tahap Akhir (HR) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Antrean Permohonan Cuti Tahap Akhir (Menunggu HR)
            </h2>
            <p className="text-[11px] text-slate-500">
              Permohonan ini telah disetujui GM. Persetujuan HR akan secara otomatis memotong baki kuota cuti di database D1.
            </p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            {pendingLeaves.length} Menunggu Final
          </span>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            Tidak ada permohonan yang menunggu verifikasi HR saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{leave.userName}</div>
                    <div className="text-[11px] text-slate-500">
                      Divisi {leave.userDivision} • {leave.type.replace("_", " ")}
                    </div>
                  </div>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    Menunggu HR (Final)
                  </span>
                </div>

                <div className="rounded bg-white p-3 text-xs text-slate-700 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Periode Cuti:</span>
                    <strong className="text-slate-800">
                      {leave.startDate} s/d {leave.endDate} ({leave.durationDays} Hari)
                    </strong>
                  </div>
                  <div className="text-slate-600">Alasan: "{leave.reason}"</div>
                  {leave.gmNote && (
                    <div className="rounded bg-amber-50 p-2 text-[11px] text-amber-900 border border-amber-200">
                      Catatan GM: "{leave.gmNote}"
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Catatan HR (opsional)..."
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
                    onClick={() => handleHRAction(leave.id, "REJECT")}
                    className="flex-1 rounded-lg border border-rose-300 bg-white py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    Tolak oleh HR
                  </button>
                  <button
                    disabled={processingId === leave.id}
                    onClick={() => handleHRAction(leave.id, "APPROVE")}
                    className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Disetujui HR (Final & Potong Kuota)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verifikasi Bukti Fisik Absensi (Foto Swafoto & Radius GPS) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Validasi Bukti Absensi (Swafoto R2 & Radius GPS)
            </h2>
            <p className="text-[11px] text-slate-500">
              Pemeriksaan swafoto wajah dan koordinat latitude/longitude karyawan saat check-in.
            </p>
          </div>
          <span className="text-xs text-slate-500">{attendances.length} Catatan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Swafoto (R2)</th>
                <th className="py-2.5 px-3">Nama Karyawan</th>
                <th className="py-2.5 px-3">Tanggal & Jam</th>
                <th className="py-2.5 px-3">Koordinat GPS Geotag</th>
                <th className="py-2.5 px-3">Jarak Validasi</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendances.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3">
                    <button
                      onClick={() =>
                        setSelectedPhoto(
                          a.checkInPhotoKey ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
                        )
                      }
                      className="group relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={a.checkInPhotoKey}
                        alt="Bukti Swafoto"
                        className="h-full w-full object-cover group-hover:opacity-80"
                        onError={(e) => {
                          // Fallback jika placeholder URL
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";
                        }}
                      />
                    </button>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">{a.userName}</td>
                  <td className="py-2 px-3">
                    <div>{a.date}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Masuk: {a.checkInTime} {a.checkOutTime ? `| Pulang: ${a.checkOutTime}` : ""}
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      <span>{a.checkInLat.toFixed(5)}, {a.checkInLng.toFixed(5)}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono">
                    <span className="font-semibold text-emerald-700">
                      {a.checkInDistanceMeters} m
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                        a.status === "TEPAT_WAKTU"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Swafoto */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-sm overflow-hidden rounded-2xl bg-white p-4 shadow-2xl">
            <h3 className="mb-2 text-sm font-bold text-slate-800">Bukti Fisik Swafoto Presensi</h3>
            <img
              src={selectedPhoto}
              alt="Swafoto Zoom"
              className="max-h-96 w-full rounded-xl object-cover"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
