import { hashPassword } from "./auth-jwt.ts";

export interface UserItem {
  id: string;
  nik: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "SUPER_USER" | "GM" | "HR" | "FINANCE" | "EMPLOYEE";
  division: string;
  jobPosition: string;
  shiftId?: string;
  baseSalary: number;
  allowance?: number;
  bonus?: number;
  leaveQuota: number;
  isVerified?: boolean;
  hrEvalDiscipline?: string;
  hrEvalPerformance?: string;
  hrEvalScore?: number;
  createdAt: number;
}

export interface OfficeLocationItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

export interface ShiftItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  lateToleranceMinutes: number;
}

export interface AttendanceItem {
  id: string;
  userId: string;
  userName?: string;
  shiftId?: string;
  shiftName?: string;
  date: string;
  checkInTime: string;
  checkInLat: number;
  checkInLng: number;
  checkInDistanceMeters: number;
  checkInPhotoKey: string;
  checkOutTime?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  checkOutPhotoKey?: string;
  status: "TEPAT_WAKTU" | "TERLAMBAT" | "CUTI" | "IZIN_SAKIT" | "IZIN" | "ALFA" | "BELUM_ABSEN";
  lateMinutes: number;
  overtimeMinutes: number;
  createdAt: number;
}

export interface LeaveRequestItem {
  id: string;
  userId: string;
  userName?: string;
  userDivision?: string;
  type: "CUTI_TAHUNAN" | "IZIN_SAKIT" | "LAINNYA";
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  docKey?: string;
  status: "MENUNGGU_GM" | "DITOLAK_GM" | "MENUNGGU_HR" | "DITOLAK_HR" | "FINAL_DISETUJUI";
  gmNote?: string;
  gmApprovedAt?: number;
  hrNote?: string;
  hrApprovedAt?: number;
  createdAt: number;
}

export interface PayrollItem {
  id: string;
  userId: string;
  userName?: string;
  userNik?: string;
  userDivision?: string;
  month: number;
  year: number;
  baseSalary: number;
  allowance: number;
  bonus?: number;
  lateDeduction: number;
  absentDeduction: number;
  overtimePay: number;
  bpjsDeduction?: number;
  taxDeduction?: number;
  taxAndBpjs: number;
  netSalary: number;
  status: "DRAFT" | "PUBLISHED";
  generatedAt: number;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  action: string;
  details: string;
  createdAt: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedByName?: string;
  assignedTo: string;
  assignedToName?: string;
  assignedToDivision?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  dueDate: string; // YYYY-MM-DD
  completionNotes?: string;
  revisionNotes?: string;
  createdAt: number;
  updatedAt: number;
}

// Global in-memory singleton untuk runtime development
class HRISDataStore {
  users: UserItem[] = [];
  offices: OfficeLocationItem[] = [];
  shifts: ShiftItem[] = [];
  attendances: AttendanceItem[] = [];
  leaves: LeaveRequestItem[] = [];
  payrolls: PayrollItem[] = [];
  auditLogs: AuditLogItem[] = [];
  tasks: TaskItem[] = [];
  private initialized = false;
  private d1Synced = false;
  private activeQuotaYear = new Date().getFullYear();

  // ponytail: in-memory annual quota reset; move to D1 cron/scheduled worker when multi-instance
  private resetAnnualQuotaIfNeeded() {
    const yearNow = new Date().getFullYear();
    if (this.activeQuotaYear !== yearNow) {
      this.activeQuotaYear = yearNow;
      for (const u of this.users) {
        u.leaveQuota = u.nik === "EMP002" ? 10 : 12;
      }
    }
  }

  // ponytail: in-memory shift-time check on read/approve; move to cron worker when multi-instance
  syncApprovedLeaveAttendances() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const leave of this.leaves) {
      if (leave.status !== "FINAL_DISETUJUI") continue;
      const emp = this.users.find((u) => u.id === leave.userId);
      if (!emp) continue;

      const shift =
        this.shifts.find((s) => s.id === (emp.shiftId || "shift_1")) ||
        this.shifts[0] || { id: "shift_1", name: "Shift Reguler", startTime: "08:00", endTime: "17:00" };
      const [sh, sm] = shift.startTime.split(":").map(Number);
      const shiftStartMinutes = (sh || 8) * 60 + (sm || 0);

      const attStatus: AttendanceItem["status"] =
        leave.type === "CUTI_TAHUNAN" ? "CUTI" : leave.type === "IZIN_SAKIT" ? "IZIN_SAKIT" : "IZIN";

      const cur = new Date(`${leave.startDate}T00:00:00`);
      const end = new Date(`${leave.endDate}T00:00:00`);

      while (cur <= end) {
        const dStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
        // Hanya catat otomatis jika tanggal sudah lewat, atau hari ini dan sudah masuk jam shift karyawan
        if (dStr < todayStr || (dStr === todayStr && nowMinutes >= shiftStartMinutes)) {
          if (!this.attendances.some((a) => a.userId === emp.id && a.date === dStr)) {
            this.attendances.unshift({
              id: `att_leave_${leave.id}_${dStr}`,
              userId: emp.id,
              userName: emp.name,
              shiftId: shift.id,
              shiftName: `${shift.name} (${shift.startTime}-${shift.endTime})`,
              date: dStr,
              checkInTime: "-",
              checkInLat: 0,
              checkInLng: 0,
              checkInDistanceMeters: 0,
              checkInPhotoKey: "",
              checkOutTime: "-",
              status: attStatus,
              lateMinutes: 0,
              overtimeMinutes: 0,
              createdAt: new Date(`${dStr}T${shift.startTime}:00`).getTime() || Date.now(),
            });
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
  }

  async syncFromD1() {
    try {
      const { executeD1Query } = await import("./d1-client");
      const d1Shifts = await executeD1Query(`SELECT * FROM shift_kerja ORDER BY id ASC`);
      if (d1Shifts && d1Shifts.length > 0) {
        for (const s of d1Shifts) {
          const sid = `shift_${s.id}`;
          const start = String(s.jam_masuk || "08:00").slice(0, 5);
          const end = String(s.jam_pulang || "17:00").slice(0, 5);
          const bStart = String(s.jam_istirahat_mulai || "12:00").slice(0, 5);
          const bEnd = String(s.jam_istirahat_selesai || "13:00").slice(0, 5);
          const existing = this.shifts.find((x) => x.id === sid);
          if (existing) {
            existing.name = s.nama_shift;
            existing.startTime = start;
            existing.endTime = end;
            existing.breakStartTime = bStart;
            existing.breakEndTime = bEnd;
          } else {
            this.shifts.push({
              id: sid,
              name: s.nama_shift,
              startTime: start,
              endTime: end,
              breakStartTime: bStart,
              breakEndTime: bEnd,
              lateToleranceMinutes: 15,
            });
          }
        }
      }

      const d1Karyawan = await executeD1Query(`SELECT nip, id_shift FROM karyawan`);
      if (d1Karyawan && d1Karyawan.length > 0) {
        for (const k of d1Karyawan) {
          const u = this.users.find((x) => x.nik === k.nip);
          if (u && k.id_shift) u.shiftId = `shift_${k.id_shift}`;
        }
      }

      const d1Presensi = await executeD1Query(`
        SELECT p.*, k.nama_lengkap as karyawan_nama, k.nip as karyawan_nip
        FROM presensi p
        JOIN karyawan k ON p.id_karyawan = k.id
        ORDER BY p.tanggal DESC, p.waktu_masuk DESC
      `);
      if (d1Presensi && d1Presensi.length > 0) {
        this.d1Synced = true;
        for (const row of d1Presensi) {
          const userObj =
            this.users.find((u) => u.nik === row.karyawan_nip) ||
            this.users.find((u) => u.nik === "EMP001")!;
          if (
            !this.attendances.some(
              (a) => a.date === row.tanggal && a.userId === userObj.id
            )
          ) {
            this.attendances.push({
              id: `att_${row.id}`,
              userId: userObj.id,
              userName: row.karyawan_nama,
              date: row.tanggal,
              checkInTime: row.waktu_masuk || "-",
              checkInLat: row.lintang_masuk ?? -6.175392,
              checkInLng: row.bujur_masuk ?? 106.827153,
              checkInDistanceMeters: 0,
              checkInPhotoKey: "",
              checkOutTime: row.waktu_pulang || "-",
              checkOutLat: row.lintang_pulang || undefined,
              checkOutLng: row.bujur_pulang || undefined,
              status:
                row.status_kehadiran === "TERLAMBAT"
                  ? "TERLAMBAT"
                  : row.status_kehadiran === "CUTI"
                  ? "CUTI"
                  : row.status_kehadiran === "IZIN_SAKIT"
                  ? "IZIN_SAKIT"
                  : row.status_kehadiran === "IZIN"
                  ? "IZIN"
                  : row.status_kehadiran === "ALFA"
                  ? "ALFA"
                  : "TEPAT_WAKTU",
              lateMinutes: row.status_kehadiran === "TERLAMBAT" ? 30 : 0,
              overtimeMinutes: 0,
              createdAt: Date.now(),
            });
          }
        }
      }

      const d1Leaves = await executeD1Query(`
        SELECT c.*, k.nama_lengkap as karyawan_nama, k.nip as karyawan_nip, d.nama_divisi
        FROM pengajuan_cuti_izin c
        JOIN karyawan k ON c.id_karyawan = k.id
        LEFT JOIN divisi d ON k.id_divisi = d.id
        ORDER BY c.dibuat_pada DESC
      `);
      if (d1Leaves && d1Leaves.length > 0) {
        this.d1Synced = true;
        this.leaves = [];
        for (const row of d1Leaves) {
          const userObj =
            this.users.find((u) => u.nik === row.karyawan_nip) ||
            this.users.find((u) => u.nik === "EMP001")!;
          let status = "MENUNGGU_GM";
          if (row.status_persetujuan === "Menunggu Approval HR")
            status = "MENUNGGU_HR";
          else if (row.status_persetujuan === "Disetujui")
            status = "FINAL_DISETUJUI";
          else if (row.status_persetujuan === "Ditolak GM")
            status = "DITOLAK_GM";
          else if (row.status_persetujuan === "Ditolak HR")
            status = "DITOLAK_HR";

          const durationDays = Math.max(
            1,
            Math.round(
              (new Date(row.tanggal_selesai).getTime() -
                new Date(row.tanggal_mulai).getTime()) /
                86400000
            ) + 1
          );

          this.leaves.push({
            id: `leave_${row.id}`,
            userId: userObj.id,
            userName: row.karyawan_nama,
            userDivision: row.nama_divisi || "OPERASIONAL",
            type: row.jenis_pengajuan as any,
            startDate: row.tanggal_mulai,
            endDate: row.tanggal_selesai,
            durationDays,
            reason: row.alasan,
            status: status as any,
            gmNote: row.catatan_penolakan || undefined,
            createdAt: Date.now(),
          });

          if (
            status === "FINAL_DISETUJUI" &&
            row.jenis_pengajuan === "CUTI_TAHUNAN" &&
            String(row.tanggal_mulai).startsWith(`${this.activeQuotaYear}-`)
          ) {
            userObj.leaveQuota = Math.max(0, userObj.leaveQuota - durationDays);
          }
        }
      }

      // Sync tasks dari tabel penugasan D1
      try {
        const d1Tasks = await executeD1Query(`
          SELECT p.*, k.nama_lengkap as karyawan_nama, k.nip as karyawan_nip, d.nama_divisi
          FROM penugasan p
          LEFT JOIN karyawan k ON p.ditugaskan_ke = k.id
          LEFT JOIN divisi d ON k.id_divisi = d.id
          ORDER BY p.id DESC
        `);
        if (d1Tasks && d1Tasks.length > 0) {
          for (const row of d1Tasks) {
            const taskId = `task_d1_${row.id}`;
            const targetUser = this.users.find((u) => u.nik === row.karyawan_nip);
            const existing = this.tasks.find((t) => t.id === taskId || t.title === row.judul);
            if (existing) {
              existing.status = row.status || existing.status;
              existing.completionNotes = row.catatan_penyelesaian || existing.completionNotes;
              existing.revisionNotes = row.catatan_revisi || existing.revisionNotes;
            } else {
              this.tasks.unshift({
                id: taskId,
                title: row.judul,
                description: row.deskripsi,
                assignedBy: "usr_gm",
                assignedByName: "Budi Santoso (GM)",
                assignedTo: targetUser ? targetUser.id : "usr_emp_1",
                assignedToName: row.karyawan_nama || (targetUser ? targetUser.name : "Karyawan"),
                assignedToDivision: row.nama_divisi || (targetUser ? targetUser.division : "OPERASIONAL"),
                priority: row.prioritas || "MEDIUM",
                status: row.status || "PENDING",
                dueDate: row.tenggat_waktu,
                completionNotes: row.catatan_penyelesaian,
                revisionNotes: row.catatan_revisi,
                createdAt: row.dibuat_pada ? new Date(row.dibuat_pada).getTime() : Date.now(),
                updatedAt: row.diperbarui_pada ? new Date(row.diperbarui_pada).getTime() : Date.now(),
              });
            }
          }
        }
      } catch (_) {}
    } catch (_) {}
  }

  async init() {
    if (this.initialized) {
      this.resetAnnualQuotaIfNeeded();
      if (!this.d1Synced || this.attendances.length === 0) {
        await this.syncFromD1();
      }
      this.syncApprovedLeaveAttendances();
      return;
    }

    const defaultPassAdmin = await hashPassword("admin123");
    const defaultPassEmp = await hashPassword("karyawan123");

    this.users = [
      {
        id: "usr_su_1",
        nik: "SU001",
        name: "Admin Super User",
        email: "superuser@nutrilife.com",
        passwordHash: defaultPassAdmin,
        role: "SUPER_USER",
        division: "IT",
        jobPosition: "System Administrator",
        baseSalary: 12000000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_gm_1",
        nik: "GM001",
        name: "Budi Santoso (GM)",
        email: "gm@nutrilife.com",
        passwordHash: defaultPassAdmin,
        role: "GM",
        division: "OPERASIONAL",
        jobPosition: "General Manager",
        baseSalary: 15000000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_hr_1",
        nik: "HR001",
        name: "Siti Rahma (HR)",
        email: "hr@nutrilife.com",
        passwordHash: defaultPassAdmin,
        role: "HR",
        division: "HR",
        jobPosition: "HR Specialist",
        baseSalary: 8000000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_fin_1",
        nik: "FN001",
        name: "Dewi Lestari (Finance)",
        email: "finance@nutrilife.com",
        passwordHash: defaultPassAdmin,
        role: "FINANCE",
        division: "FINANCE",
        jobPosition: "Finance Officer",
        baseSalary: 8500000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_emp_1",
        nik: "EMP001",
        name: "Ahmad Fauzi",
        email: "karyawan@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "OPERASIONAL",
        jobPosition: "Staff Operasional",
        shiftId: "shift_1",
        baseSalary: 6000000,
        allowance: 500000,
        leaveQuota: 12,
        isVerified: true,
        hrEvalDiscipline: "Kehadiran disiplin dan konsisten.",
        hrEvalScore: 92,
        hrEvalPerformance: "Target operasional harian tercapai dengan sangat baik.",
        createdAt: Date.now() - 30 * 86400000,
      },
      {
        id: "usr_emp_2",
        nik: "EMP002",
        name: "Rian Pratama",
        email: "rian@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "LOGISTIK",
        jobPosition: "Staff Gudang",
        shiftId: "shift_1",
        baseSalary: 5500000,
        allowance: 400000,
        leaveQuota: 10,
        isVerified: true,
        hrEvalDiscipline: "Perlu memperhatikan ketepatan waktu check-in.",
        hrEvalScore: 78,
        hrEvalPerformance: "Pengelolaan inventaris gudang rapi dan akurat.",
        createdAt: Date.now() - 28 * 86400000,
      },
      {
        id: "usr_emp_3",
        nik: "EMP003",
        name: "Bima Sakti",
        email: "bima.sakti@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "PRODUKSI",
        jobPosition: "Teknisi Mesin",
        shiftId: "shift_2",
        baseSalary: 6200000,
        allowance: 600000,
        bonus: 250000,
        leaveQuota: 12,
        isVerified: true,
        hrEvalDiscipline: "Sangat teliti dalam rotasi shift pagi.",
        hrEvalScore: 90,
        hrEvalPerformance: "Maintenance mesin produksi berkala selalu tepat jadwal.",
        createdAt: Date.now() - 25 * 86400000,
      },
      {
        id: "usr_emp_4",
        nik: "EMP004",
        name: "Dinda Permata",
        email: "dinda.permata@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "OPERASIONAL",
        jobPosition: "Quality Control",
        shiftId: "shift_1",
        baseSalary: 5800000,
        allowance: 500000,
        leaveQuota: 11,
        isVerified: true,
        hrEvalDiscipline: "Tingkat ketepatan waktu sangat tinggi.",
        hrEvalScore: 95,
        hrEvalPerformance: "Standar inspeksi kualitas produk dijalankan disiplin.",
        createdAt: Date.now() - 22 * 86400000,
      },
      {
        id: "usr_emp_5",
        nik: "EMP005",
        name: "Eko Wahyudi",
        email: "eko.wahyudi@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "LOGISTIK",
        jobPosition: "Kurir Ekspedisi",
        shiftId: "shift_3",
        baseSalary: 5200000,
        allowance: 700000,
        leaveQuota: 9,
        isVerified: false,
        hrEvalDiscipline: "Teguran lisan: beberapa kali terlambat check-in shift siang.",
        hrEvalScore: 68,
        hrEvalPerformance: "Distribusi barang selesai namun perlu efisiensi rute pengantaran.",
        createdAt: Date.now() - 20 * 86400000,
      },
      {
        id: "usr_emp_6",
        nik: "EMP006",
        name: "Fitri Handayani",
        email: "fitri.handayani@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "IT",
        jobPosition: "Frontend Engineer",
        shiftId: "shift_1",
        baseSalary: 8500000,
        allowance: 1000000,
        bonus: 500000,
        leaveQuota: 12,
        isVerified: true,
        hrEvalDiscipline: "Kehadiran prima dan selalu tepat waktu.",
        hrEvalScore: 96,
        hrEvalPerformance: "Pengembangan web dashboard absensi HR dan mobile sangat cepat.",
        createdAt: Date.now() - 18 * 86400000,
      },
      {
        id: "usr_emp_7",
        nik: "EMP007",
        name: "Gilang Ramadhan",
        email: "gilang.ramadhan@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "PRODUKSI",
        jobPosition: "Staff Gudang Senior",
        shiftId: "shift_2",
        baseSalary: 6000000,
        allowance: 500000,
        leaveQuota: 8,
        isVerified: true,
        hrEvalDiscipline: "Disiplin kerja baik.",
        hrEvalScore: 84,
        hrEvalPerformance: "Koordinasi logistik bahan baku produksi efektif.",
        createdAt: Date.now() - 15 * 86400000,
      },
      {
        id: "usr_emp_8",
        nik: "EMP008",
        name: "Hani Anggraini",
        email: "hani.anggraini@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "MARKETING",
        jobPosition: "Social Media Specialist",
        shiftId: "shift_1",
        baseSalary: 5900000,
        allowance: 450000,
        leaveQuota: 12,
        isVerified: false,
        createdAt: Date.now() - 12 * 86400000,
      },
      {
        id: "usr_emp_9",
        nik: "EMP009",
        name: "Indra Kusuma",
        email: "indra.kusuma@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "PRODUKSI",
        jobPosition: "Operator Mesin",
        shiftId: "shift_3",
        baseSalary: 5400000,
        allowance: 500000,
        leaveQuota: 7,
        isVerified: false,
        hrEvalDiscipline: "Perlu pembinaan terkait ketertiban jam istirahat.",
        hrEvalScore: 72,
        hrEvalPerformance: "Target kuantitas output produksi stabil.",
        createdAt: Date.now() - 10 * 86400000,
      },
      {
        id: "usr_emp_10",
        nik: "EMP010",
        name: "Jessica Tan",
        email: "jessica.tan@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "MARKETING",
        jobPosition: "Content Creator",
        shiftId: "shift_1",
        baseSalary: 6500000,
        allowance: 600000,
        bonus: 300000,
        leaveQuota: 14,
        isVerified: true,
        hrEvalDiscipline: "Disiplin waktu dan kepatuhan jadwal kerja sangat baik.",
        hrEvalScore: 94,
        hrEvalPerformance: "Engagement campaign promosi Nutrilife meningkat pesat.",
        createdAt: Date.now() - 8 * 86400000,
      },
    ];

    this.offices = [
      {
        id: "loc_1",
        name: "Kantor Pusat Nutrilife (Jakarta)",
        latitude: -6.175392,
        longitude: 106.827153,
        radiusMeters: 150,
        isActive: true,
      },
    ];

    this.shifts = [
      {
        id: "shift_1",
        name: "Shift Reguler",
        startTime: "08:00",
        endTime: "17:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        lateToleranceMinutes: 15,
      },
      {
        id: "shift_2",
        name: "Shift Pagi",
        startTime: "07:00",
        endTime: "13:00",
        breakStartTime: "10:00",
        breakEndTime: "10:30",
        lateToleranceMinutes: 15,
      },
      {
        id: "shift_3",
        name: "Shift Siang",
        startTime: "13:00",
        endTime: "21:00",
        breakStartTime: "16:30",
        breakEndTime: "17:30",
        lateToleranceMinutes: 15,
      },
    ];

    for (const u of this.users) {
      if (!u.shiftId) u.shiftId = "shift_1";
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const d0 = toIso(now);
    const d1 = toIso(new Date(now.getTime() - 86400000));
    const d2 = toIso(new Date(now.getTime() - 2 * 86400000));
    const d3 = toIso(new Date(now.getTime() - 3 * 86400000));
    const d4 = toIso(new Date(now.getTime() - 4 * 86400000));

    this.attendances = [
      // Hari ini (d0)
      {
        id: "att_d0_1",
        userId: "usr_emp_1",
        userName: "Ahmad Fauzi",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d0,
        checkInTime: "07:52:10",
        checkInLat: -6.175390,
        checkInLng: 106.827150,
        checkInDistanceMeters: 5,
        checkInPhotoKey: "",
        checkOutTime: "-",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 4 * 3600000,
      },
      {
        id: "att_d0_2",
        userId: "usr_emp_2",
        userName: "Rian Pratama",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d0,
        checkInTime: "08:25:40",
        checkInLat: -6.175400,
        checkInLng: 106.827160,
        checkInDistanceMeters: 12,
        checkInPhotoKey: "",
        checkOutTime: "-",
        status: "TERLAMBAT",
        lateMinutes: 25,
        overtimeMinutes: 0,
        createdAt: Date.now() - 3 * 3600000,
      },
      {
        id: "att_d0_3",
        userId: "usr_emp_3",
        userName: "Bima Sakti",
        shiftId: "shift_2",
        shiftName: "Shift Pagi (07:00-13:00)",
        date: d0,
        checkInTime: "06:54:15",
        checkInLat: -6.175380,
        checkInLng: 106.827140,
        checkInDistanceMeters: 8,
        checkInPhotoKey: "",
        checkOutTime: "13:05:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 5,
        createdAt: Date.now() - 5 * 3600000,
      },
      {
        id: "att_d0_4",
        userId: "usr_emp_4",
        userName: "Dinda Permata",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d0,
        checkInTime: "07:48:30",
        checkInLat: -6.175395,
        checkInLng: 106.827155,
        checkInDistanceMeters: 6,
        checkInPhotoKey: "",
        checkOutTime: "-",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 4 * 3600000,
      },
      {
        id: "att_d0_5",
        userId: "usr_emp_5",
        userName: "Eko Wahyudi",
        shiftId: "shift_3",
        shiftName: "Shift Siang (13:00-21:00)",
        date: d0,
        checkInTime: "13:32:00",
        checkInLat: -6.175410,
        checkInLng: 106.827170,
        checkInDistanceMeters: 18,
        checkInPhotoKey: "",
        checkOutTime: "-",
        status: "TERLAMBAT",
        lateMinutes: 32,
        overtimeMinutes: 0,
        createdAt: Date.now() - 2 * 3600000,
      },
      {
        id: "att_d0_6",
        userId: "usr_emp_6",
        userName: "Fitri Handayani",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d0,
        checkInTime: "07:45:10",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 0,
        checkInPhotoKey: "",
        checkOutTime: "-",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 4 * 3600000,
      },
      {
        id: "att_d0_10",
        userId: "usr_emp_10",
        userName: "Jessica Tan",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d0,
        checkInTime: "07:56:45",
        checkInLat: -6.175388,
        checkInLng: 106.827148,
        checkInDistanceMeters: 4,
        checkInPhotoKey: "",
        checkOutTime: "-",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 4 * 3600000,
      },

      // Kemarin (d1)
      {
        id: "att_d1_1",
        userId: "usr_emp_1",
        userName: "Ahmad Fauzi",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d1,
        checkInTime: "07:55:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 0,
        checkInPhotoKey: "",
        checkOutTime: "17:15:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 15,
        createdAt: Date.now() - 28 * 3600000,
      },
      {
        id: "att_d1_2",
        userId: "usr_emp_2",
        userName: "Rian Pratama",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d1,
        checkInTime: "08:18:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 5,
        checkInPhotoKey: "",
        checkOutTime: "17:00:00",
        status: "TERLAMBAT",
        lateMinutes: 18,
        overtimeMinutes: 0,
        createdAt: Date.now() - 28 * 3600000,
      },
      {
        id: "att_d1_3",
        userId: "usr_emp_3",
        userName: "Bima Sakti",
        shiftId: "shift_2",
        shiftName: "Shift Pagi (07:00-13:00)",
        date: d1,
        checkInTime: "06:50:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 3,
        checkInPhotoKey: "",
        checkOutTime: "13:00:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 29 * 3600000,
      },
      {
        id: "att_d1_4",
        userId: "usr_emp_4",
        userName: "Dinda Permata",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d1,
        checkInTime: "07:50:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 2,
        checkInPhotoKey: "",
        checkOutTime: "17:05:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 5,
        createdAt: Date.now() - 28 * 3600000,
      },
      {
        id: "att_d1_5",
        userId: "usr_emp_5",
        userName: "Eko Wahyudi",
        shiftId: "shift_3",
        shiftName: "Shift Siang (13:00-21:00)",
        date: d1,
        checkInTime: "13:40:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 10,
        checkInPhotoKey: "",
        checkOutTime: "21:00:00",
        status: "TERLAMBAT",
        lateMinutes: 40,
        overtimeMinutes: 0,
        createdAt: Date.now() - 26 * 3600000,
      },
      {
        id: "att_d1_6",
        userId: "usr_emp_6",
        userName: "Fitri Handayani",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d1,
        checkInTime: "07:40:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 0,
        checkInPhotoKey: "",
        checkOutTime: "18:00:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 60,
        createdAt: Date.now() - 28 * 3600000,
      },
      {
        id: "att_d1_7",
        userId: "usr_emp_7",
        userName: "Gilang Ramadhan",
        shiftId: "shift_2",
        shiftName: "Shift Pagi (07:00-13:00)",
        date: d1,
        checkInTime: "06:58:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 7,
        checkInPhotoKey: "",
        checkOutTime: "13:10:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 10,
        createdAt: Date.now() - 29 * 3600000,
      },
      {
        id: "att_d1_8",
        userId: "usr_emp_8",
        userName: "Hani Anggraini",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d1,
        checkInTime: "07:58:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 4,
        checkInPhotoKey: "",
        checkOutTime: "17:00:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 28 * 3600000,
      },
      {
        id: "att_d1_9",
        userId: "usr_emp_9",
        userName: "Indra Kusuma",
        shiftId: "shift_3",
        shiftName: "Shift Siang (13:00-21:00)",
        date: d1,
        checkInTime: "13:20:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 8,
        checkInPhotoKey: "",
        checkOutTime: "21:05:00",
        status: "TERLAMBAT",
        lateMinutes: 20,
        overtimeMinutes: 5,
        createdAt: Date.now() - 26 * 3600000,
      },
      {
        id: "att_d1_10",
        userId: "usr_emp_10",
        userName: "Jessica Tan",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d1,
        checkInTime: "07:50:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 2,
        checkInPhotoKey: "",
        checkOutTime: "17:20:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 20,
        createdAt: Date.now() - 28 * 3600000,
      },

      // 2 Hari lalu (d2)
      {
        id: "att_d2_1",
        userId: "usr_emp_1",
        userName: "Ahmad Fauzi",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d2,
        checkInTime: "07:50:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 0,
        checkInPhotoKey: "",
        checkOutTime: "17:00:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 52 * 3600000,
      },
      {
        id: "att_d2_5",
        userId: "usr_emp_5",
        userName: "Eko Wahyudi",
        shiftId: "shift_3",
        shiftName: "Shift Siang (13:00-21:00)",
        date: d2,
        checkInTime: "13:28:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 6,
        checkInPhotoKey: "",
        checkOutTime: "21:00:00",
        status: "TERLAMBAT",
        lateMinutes: 28,
        overtimeMinutes: 0,
        createdAt: Date.now() - 50 * 3600000,
      },
      {
        id: "att_d2_6",
        userId: "usr_emp_6",
        userName: "Fitri Handayani",
        shiftId: "shift_1",
        shiftName: "Shift Reguler (08:00-17:00)",
        date: d2,
        checkInTime: "07:42:00",
        checkInLat: -6.175392,
        checkInLng: 106.827153,
        checkInDistanceMeters: 0,
        checkInPhotoKey: "",
        checkOutTime: "17:00:00",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 52 * 3600000,
      },
      {
        id: "att_d2_9",
        userId: "usr_emp_9",
        userName: "Indra Kusuma",
        shiftId: "shift_3",
        shiftName: "Shift Siang (13:00-21:00)",
        date: d2,
        checkInTime: "-",
        checkInLat: 0,
        checkInLng: 0,
        checkInDistanceMeters: 0,
        checkInPhotoKey: "",
        checkOutTime: "-",
        status: "ALFA",
        lateMinutes: 0,
        overtimeMinutes: 0,
        createdAt: Date.now() - 50 * 3600000,
      },
    ];

    this.leaves = [
      {
        id: "leave_demo_1",
        userId: "usr_emp_1",
        userName: "Ahmad Fauzi",
        userDivision: "OPERASIONAL",
        type: "CUTI_TAHUNAN",
        startDate: d3,
        endDate: d4,
        durationDays: 2,
        reason: "Urusan keluarga di luar kota",
        status: "MENUNGGU_GM",
        createdAt: Date.now() - 3600000,
      },
      {
        id: "leave_demo_2",
        userId: "usr_emp_2",
        userName: "Rian Pratama",
        userDivision: "LOGISTIK",
        type: "CUTI_TAHUNAN",
        startDate: d0,
        endDate: d0,
        durationDays: 1,
        reason: "Keperluan mendesak perpanjangan dokumen",
        status: "MENUNGGU_HR",
        gmNote: "Disetujui GM tahap 1, silakan proses verifikasi HR",
        gmApprovedAt: Date.now() - 7200000,
        createdAt: Date.now() - 14400000,
      },
      {
        id: "leave_demo_3",
        userId: "usr_emp_8",
        userName: "Hani Anggraini",
        userDivision: "MARKETING",
        type: "IZIN_SAKIT",
        startDate: d0,
        endDate: d0,
        durationDays: 1,
        reason: "Demam dan flu berat, surat dokter terlampir",
        status: "MENUNGGU_HR",
        gmNote: "Disetujui GM. Semoga lekas pulih",
        gmApprovedAt: Date.now() - 3600000,
        createdAt: Date.now() - 7200000,
      },
      {
        id: "leave_demo_4",
        userId: "usr_emp_7",
        userName: "Gilang Ramadhan",
        userDivision: "PRODUKSI",
        type: "CUTI_TAHUNAN",
        startDate: d0,
        endDate: d1,
        durationDays: 2,
        reason: "Cuti tahunan menikah",
        status: "FINAL_DISETUJUI",
        gmNote: "Disetujui GM",
        gmApprovedAt: Date.now() - 86400000,
        hrNote: "Disetujui HR. Selamat atas pernikahannya.",
        hrApprovedAt: Date.now() - 43200000,
        createdAt: Date.now() - 172800000,
      },
      {
        id: "leave_demo_5",
        userId: "usr_emp_5",
        userName: "Eko Wahyudi",
        userDivision: "LOGISTIK",
        type: "LAINNYA",
        startDate: d2,
        endDate: d2,
        durationDays: 1,
        reason: "Acara reuni sekolah",
        status: "DITOLAK_HR",
        gmNote: "Teruskan ke HR",
        gmApprovedAt: Date.now() - 86400000,
        hrNote: "Ditolak HR: Jadwal pengiriman sedang puncak beban kerja logistik.",
        hrApprovedAt: Date.now() - 43200000,
        createdAt: Date.now() - 172800000,
      },
    ];

    this.auditLogs = [
      {
        id: "log_init",
        action: "SYSTEM_INITIALIZE",
        details: "HRIS Nutrilife Database initialized",
        createdAt: Date.now(),
      },
    ];

    this.tasks = [
      {
        id: "task_demo_1",
        title: "Audit Fisik Stok Bahan Baku Gudang A",
        description: "Lakukan pencocokan antara kartu stok fisik dengan rekap sistem Nutrilife sebelum akhir pekan.",
        assignedBy: "usr_gm",
        assignedByName: "Budi Santoso (GM)",
        assignedTo: "usr_emp_7",
        assignedToName: "Gilang Ramadhan",
        assignedToDivision: "PRODUKSI",
        priority: "HIGH",
        status: "PENDING",
        dueDate: d1,
        createdAt: Date.now() - 3600000 * 6,
        updatedAt: Date.now() - 3600000 * 6,
      },
      {
        id: "task_demo_2",
        title: "Integrasi Flow Webhook Pembayaran",
        description: "Pastikan validasi signature HMAC SHA-256 dari payment gateway berjalan tanpa lag pada beban tinggi.",
        assignedBy: "usr_gm",
        assignedByName: "Budi Santoso (GM)",
        assignedTo: "usr_emp_6",
        assignedToName: "Fitri Handayani",
        assignedToDivision: "IT",
        priority: "URGENT",
        status: "IN_PROGRESS",
        dueDate: d0,
        createdAt: Date.now() - 3600000 * 12,
        updatedAt: Date.now() - 3600000 * 2,
      },
      {
        id: "task_demo_3",
        title: "Laporan Quality Control Batch 42",
        description: "Periksa hasil lab kadar air dan mikrobiologi untuk batch produksi minuman herbal 42.",
        assignedBy: "usr_gm",
        assignedByName: "Budi Santoso (GM)",
        assignedTo: "usr_emp_4",
        assignedToName: "Dinda Permata",
        assignedToDivision: "OPERASIONAL",
        priority: "HIGH",
        status: "COMPLETED",
        dueDate: d0,
        completionNotes: "Uji lab selesai. Semua sampel lolos standar BPOM. Dokumen hasil analisa terlampir di folder QC share drive.",
        createdAt: Date.now() - 3600000 * 24,
        updatedAt: Date.now() - 3600000 * 1,
      },
      {
        id: "task_demo_4",
        title: "Rilis Aset Banner Promo Nutrilife",
        description: "Siapkan feed Instagram dan banner web ukuran 1920x1080 untuk diskon pertengahan bulan.",
        assignedBy: "usr_gm",
        assignedByName: "Budi Santoso (GM)",
        assignedTo: "usr_emp_10",
        assignedToName: "Jessica Tan",
        assignedToDivision: "MARKETING",
        priority: "MEDIUM",
        status: "CLOSED",
        dueDate: d1,
        completionNotes: "Banner sudah dipublish dan feed dijadwalkan.",
        createdAt: Date.now() - 3600000 * 48,
        updatedAt: Date.now() - 3600000 * 14,
      },
    ];

    await this.syncFromD1();
    this.syncApprovedLeaveAttendances();

    this.initialized = true;
  }
}

// Global instance to survive HMR in dev
const globalForStore = globalThis as unknown as { hrisStore?: HRISDataStore };
if (globalForStore.hrisStore && typeof globalForStore.hrisStore.syncFromD1 !== "function") {
  globalForStore.hrisStore = undefined;
}
export const dataStore = globalForStore.hrisStore ?? new HRISDataStore();
if (process.env.NODE_ENV !== "production") globalForStore.hrisStore = dataStore;
