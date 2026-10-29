"use client";

import { useEffect, useState } from "react";
import { Users, MapPin, Clock, ShieldAlert, Plus, Check } from "lucide-react";

export default function SuperUserPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form New User
  const [showUserModal, setShowUserModal] = useState(false);
  const [newNik, setNewNik] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("EMPLOYEE");
  const [newDivision, setNewDivision] = useState("OPERASIONAL");
  const [newPosition, setNewPosition] = useState("Staff");
  const [newSalary, setNewSalary] = useState("5000000");

  // Form New Office
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [officeName, setOfficeName] = useState("");
  const [officeLat, setOfficeLat] = useState("-6.175392");
  const [officeLng, setOfficeLng] = useState("106.827153");
  const [officeRadius, setOfficeRadius] = useState("150");

  const loadData = async () => {
    try {
      const [uRes, oRes, sRes, aRes] = await Promise.all([
        fetch("/api/master/users"),
        fetch("/api/master/offices"),
        fetch("/api/master/shifts"),
        fetch("/api/master/audit-logs"),
      ]);

      const [uData, oData, sData, aData]: any[] = await Promise.all([
        uRes.json(),
        oRes.json(),
        sRes.json(),
        aRes.json(),
      ]);

      if (uData.users) setUsers(uData.users);
      if (oData.offices) setOffices(oData.offices);
      if (sData.shifts) setShifts(sData.shifts);
      if (aData.auditLogs) setAuditLogs(aData.auditLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/master/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nik: newNik,
        name: newName,
        email: newEmail,
        password: "user123",
        role: newRole,
        division: newDivision,
        jobPosition: newPosition,
        baseSalary: Number(newSalary),
        leaveQuota: 12,
      }),
    });

    if (res.ok) {
      setShowUserModal(false);
      setNewNik("");
      setNewName("");
      setNewEmail("");
      loadData();
    }
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/master/offices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: officeName,
        latitude: Number(officeLat),
        longitude: Number(officeLng),
        radiusMeters: Number(officeRadius),
      }),
    });

    if (res.ok) {
      setShowOfficeModal(false);
      setOfficeName("");
      loadData();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Konfigurasi Master Data & Audit Log</h1>
        <p className="text-xs text-slate-500">
          Modul Super User untuk kelola data master karyawan, batas radius GPS kantor, shift kerja, dan log teknis.
        </p>
      </div>

      {/* Grid Lokasi Kantor & Master Shift */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Office Locations */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Titik Kantor & Batas Geofencing</h2>
            </div>
            <button
              onClick={() => setShowOfficeModal(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <Plus className="h-3 w-3" /> Tambah Lokasi
            </button>
          </div>

          <div className="space-y-3">
            {offices.map((loc) => (
              <div key={loc.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">{loc.name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Radius {loc.radiusMeters} Meter
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Lat: {loc.latitude} | Lng: {loc.longitude}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Kerja */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Jam Kerja & Toleransi Keterlambatan</h2>
            </div>
          </div>

          <div className="space-y-3">
            {shifts.map((s) => (
              <div key={s.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">{s.name}</span>
                  <span className="text-xs font-medium text-slate-600">
                    {s.startTime} - {s.endTime} WIB
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Toleransi Keterlambatan: <strong>{s.lateToleranceMinutes} Menit</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Master Pengguna */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">Master Karyawan & Akun Pengguna</h2>
          </div>
          <button
            onClick={() => setShowUserModal(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3 w-3" /> Tambah Karyawan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="py-2.5 px-3">NIK</th>
                <th className="py-2.5 px-3">Nama Lengkap</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Peran (Role)</th>
                <th className="py-2.5 px-3">Divisi & Posisi</th>
                <th className="py-2.5 px-3">Gaji Pokok</th>
                <th className="py-2.5 px-3">Sisa Cuti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-semibold">{u.nik}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{u.name}</td>
                  <td className="py-2 px-3 text-slate-500">{u.email}</td>
                  <td className="py-2 px-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-[10px] text-slate-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {u.division} - {u.jobPosition}
                  </td>
                  <td className="py-2 px-3 font-mono">
                    Rp {Number(u.baseSalary).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3 font-semibold text-emerald-600">
                    {u.leaveQuota} Hari
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Teknis */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-4">
          <ShieldAlert className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800">Audit Log Transaksi Sistem (Cloudflare D1)</h2>
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 font-mono text-[11px]">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2 flex items-center justify-between text-slate-600">
              <div>
                <span className="font-bold text-emerald-700">[{log.action}]</span> {log.details}
              </div>
              <div className="text-[10px] text-slate-400">
                {new Date(log.createdAt).toLocaleTimeString("id-ID")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add User */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-800">Tambah Karyawan Baru</h3>
            <form onSubmit={handleCreateUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">NIK</label>
                <input
                  type="text"
                  required
                  value={newNik}
                  onChange={(e) => setNewNik(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2"
                  placeholder="Contoh: EMP003"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Nama</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600">Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600">Peran (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="GM">GM</option>
                    <option value="HR">HR</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="SUPER_USER">SUPER_USER</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Divisi</label>
                  <input
                    type="text"
                    required
                    value={newDivision}
                    onChange={(e) => setNewDivision(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600">Jabatan</label>
                  <input
                    type="text"
                    required
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Gaji Pokok</label>
                  <input
                    type="number"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="rounded px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Office */}
      {showOfficeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-800">Tambah Titik Kantor GPS</h3>
            <form onSubmit={handleCreateOffice} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Nama Kantor</label>
                <input
                  type="text"
                  required
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2"
                  placeholder="Nutrilife Warehouse / Branch"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600">Latitude</label>
                  <input
                    type="text"
                    required
                    value={officeLat}
                    onChange={(e) => setOfficeLat(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Longitude</label>
                  <input
                    type="text"
                    required
                    value={officeLng}
                    onChange={(e) => setOfficeLng(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-600">Radius Toleransi (Meter)</label>
                <input
                  type="number"
                  required
                  value={officeRadius}
                  onChange={(e) => setOfficeRadius(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfficeModal(false)}
                  className="rounded px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
                >
                  Simpan Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
