import test from "node:test";
import assert from "node:assert/strict";

import { calculateHaversineDistance, isWithinRadius } from "../lib/geofence.ts";
import { transitionLeaveStatus, deductLeaveQuota } from "../lib/leave-machine.ts";
import { calculatePayroll } from "../lib/payroll.ts";

test("Haversine formula validates office radius correctly", () => {
  // Kantor Nutrilife (contoh Jakarta: Monas -6.175392, 106.827153)
  const officeLat = -6.175392;
  const officeLng = 106.827153;

  // Jarak ~0 meter (posisi persis di kantor)
  const inside = isWithinRadius(officeLat, officeLng, officeLat, officeLng, 100);
  assert.equal(inside.valid, true);
  assert.equal(inside.distanceMeters, 0);

  // Posisi berjarak ~500 meter (di luar radius 100 meter)
  // 0.0045 derajat lintang ~= 500 meter
  const outsideLat = officeLat + 0.005;
  const outside = isWithinRadius(outsideLat, officeLng, officeLat, officeLng, 100);
  assert.equal(outside.valid, false);
  assert.ok(outside.distanceMeters > 100);
});

test("2-Tier Leave approval state machine transitions correctly", () => {
  // Alur 1: Pekerja apply -> MENUNGGU_GM -> GM tolak -> Selesai
  const step1Reject = transitionLeaveStatus("MENUNGGU_GM", "GM", "REJECT");
  assert.equal(step1Reject.nextStatus, "DITOLAK_GM");
  assert.equal(step1Reject.canDeductQuota, false);

  // Alur 2: Pekerja apply -> MENUNGGU_GM -> GM setuju -> MENUNGGU_HR
  const step1Approve = transitionLeaveStatus("MENUNGGU_GM", "GM", "APPROVE");
  assert.equal(step1Approve.nextStatus, "MENUNGGU_HR");
  assert.equal(step1Approve.canDeductQuota, false);

  // Tahap 2: HR tolak -> DITOLAK_HR (Selesai)
  const step2Reject = transitionLeaveStatus(step1Approve.nextStatus, "HR", "REJECT");
  assert.equal(step2Reject.nextStatus, "DITOLAK_HR");
  assert.equal(step2Reject.canDeductQuota, false);

  // Tahap 2: HR setuju -> FINAL_DISETUJUI (Sistem kemas kini baki kuota)
  const step2Approve = transitionLeaveStatus(step1Approve.nextStatus, "HR", "APPROVE");
  assert.equal(step2Approve.nextStatus, "FINAL_DISETUJUI");
  assert.equal(step2Approve.canDeductQuota, true);

  // Pastikan GM tidak bisa proses status MENUNGGU_HR
  assert.throws(() => {
    transitionLeaveStatus("MENUNGGU_HR", "GM", "APPROVE");
  });

  // Pastikan HR tidak bisa proses status MENUNGGU_GM
  assert.throws(() => {
    transitionLeaveStatus("MENUNGGU_GM", "HR", "APPROVE");
  });
});

test("Leave quota deduction validates balance correctly", () => {
  // Kuota 12 hari, ambil 3 hari cuti tahunan -> sisa 9 hari
  const remaining = deductLeaveQuota(12, 3, "CUTI_TAHUNAN");
  assert.equal(remaining, 9);

  // Kuota 2 hari, minta 5 hari -> harus gagal lempar error
  assert.throws(() => {
    deductLeaveQuota(2, 5, "CUTI_TAHUNAN");
  }, /Saldo cuti tidak mencukupi/);

  // Cuti sakit tidak potong kuota tahunan
  const sickLeaveQuota = deductLeaveQuota(12, 2, "IZIN_SAKIT");
  assert.equal(sickLeaveQuota, 12);
});

test("Payroll calculates accurate net salary with deductions and overtime", () => {
  const result = calculatePayroll({
    baseSalary: 6000000,
    allowance: 1000000,
    totalLateMinutes: 30, // Potongan 30 * 1000 = Rp 30.000
    totalAbsentDays: 1,    // Potongan 1 hari = 6.000.000 / 22 = Rp 272.727
    totalOvertimeMinutes: 120, // 2 jam * 1.5 * (6.000.000 / 173) = 2 * 1.5 * 34.682 = Rp 104.046
    workingDaysInMonth: 22,
  });

  assert.equal(result.baseSalary, 6000000);
  assert.equal(result.allowance, 1000000);
  assert.equal(result.lateDeduction, 30000);
  assert.equal(result.absentDeduction, 272727);
  assert.equal(result.overtimePay, 104046);
  assert.equal(result.taxAndBpjs, 240000); // 4% of 6.000.000
  // Net = (6.000.000 + 1.000.000 + 104.046) - (30.000 + 272.727 + 240.000) = 7.104.046 - 542.727 = 6.561.319
  assert.equal(result.netSalary, 6561319);
});
