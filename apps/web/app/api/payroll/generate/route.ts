import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { calculatePayroll } from "@/lib/payroll";

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["FINANCE", "SUPER_USER"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json().catch(() => ({}));
    const month = Number(body.month) || new Date().getMonth() + 1;
    const year = Number(body.year) || new Date().getFullYear();

    // Ambil semua karyawan
    const employees = dataStore.users.filter((u) => u.role === "EMPLOYEE");
    const generatedList = [];

    for (const emp of employees) {
      // Hitung kehadiran karyawan di bulan bersangkutan
      const empAttendances = dataStore.attendances.filter((a) => {
        if (a.userId !== emp.id) return false;
        const [aYear, aMonth] = a.date.split("-").map(Number);
        return aYear === year && aMonth === month;
      });

      const totalLateMinutes = empAttendances.reduce((acc, curr) => acc + (curr.lateMinutes || 0), 0);
      const totalOvertimeMinutes = empAttendances.reduce((acc, curr) => acc + (curr.overtimeMinutes || 0), 0);
      
      // Asumsi 22 hari kerja per bulan. Jika absensi < 22 dan tidak ada cuti tervalidasi, hitung sisa sebagai alfa
      const presentDays = empAttendances.length;
      const approvedLeaves = dataStore.leaves
        .filter((l) => l.userId === emp.id && l.status === "FINAL_DISETUJUI")
        .reduce((sum, l) => sum + l.durationDays, 0);

      const workingDays = 22;
      const totalAbsentDays = Math.max(0, workingDays - (presentDays + approvedLeaves));

      const calc = calculatePayroll({
        baseSalary: emp.baseSalary,
        allowance: 750000, // Tunjangan operasional tetap
        totalLateMinutes,
        totalAbsentDays,
        totalOvertimeMinutes,
        workingDaysInMonth: workingDays,
      });

      // Cek apakah sudah pernah digenerate
      let existingPayroll = dataStore.payrolls.find(
        (p) => p.userId === emp.id && p.month === month && p.year === year
      );

      if (existingPayroll) {
        Object.assign(existingPayroll, {
          baseSalary: calc.baseSalary,
          allowance: calc.allowance,
          lateDeduction: calc.lateDeduction,
          absentDeduction: calc.absentDeduction,
          overtimePay: calc.overtimePay,
          taxAndBpjs: calc.taxAndBpjs,
          netSalary: calc.netSalary,
          generatedAt: Date.now(),
        });
        generatedList.push(existingPayroll);
      } else {
        const newPayroll = {
          id: `pay_${emp.id}_${year}_${month}`,
          userId: emp.id,
          userName: emp.name,
          userNik: emp.nik,
          userDivision: emp.division,
          month,
          year,
          ...calc,
          status: "PUBLISHED" as const, // auto-publish for ease of use
          generatedAt: Date.now(),
        };
        dataStore.payrolls.unshift(newPayroll);
        generatedList.push(newPayroll);
      }
    }

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "PAYROLL_GENERATE",
      details: `${user!.name} menerbitkan kalkulasi payroll periode ${month}/${year} (${generatedList.length} karyawan)`,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      message: `Payroll periode ${month}/${year} berhasil dihitung dan diterbitkan`,
      payrolls: generatedList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengkalkulasi payroll" },
      { status: 500 }
    );
  }
}
