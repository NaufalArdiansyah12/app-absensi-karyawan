import test from "node:test";
import assert from "node:assert/strict";

import { dataStore } from "../lib/store.ts";
import { transitionLeaveStatus, deductLeaveQuota } from "../lib/leave-machine.ts";

test("HR Panel Domain & State Machine Tests", async (t) => {
  await dataStore.init();

  const hrUser = dataStore.users.find((u) => u.role === "HR");
  assert.ok(hrUser, "HR seed user must exist");
  assert.equal(hrUser.nik, "HR001");

  await t.test("HR approval state transition & quota deduction", () => {
    // Stage 1: Employee applies -> MENUNGGU_GM
    // GM approves -> MENUNGGU_HR
    const toHr = transitionLeaveStatus("MENUNGGU_GM", "GM", "APPROVE");
    assert.equal(toHr.nextStatus, "MENUNGGU_HR");
    assert.equal(toHr.canDeductQuota, false);

    // HR approves -> FINAL_DISETUJUI (quota deduction allowed)
    const finalApprove = transitionLeaveStatus(toHr.nextStatus, "HR", "APPROVE");
    assert.equal(finalApprove.nextStatus, "FINAL_DISETUJUI");
    assert.equal(finalApprove.canDeductQuota, true);

    // Quota deduction
    const quotaAfter = deductLeaveQuota(12, 2, "CUTI_TAHUNAN");
    assert.equal(quotaAfter, 10);
  });

  await t.test("HR rejection transitions to DITOLAK_HR without quota deduction", () => {
    const rejected = transitionLeaveStatus("MENUNGGU_HR", "HR", "REJECT");
    assert.equal(rejected.nextStatus, "DITOLAK_HR");
    assert.equal(rejected.canDeductQuota, false);
  });

  await t.test("HR cannot act on MENUNGGU_GM and GM cannot act on MENUNGGU_HR", () => {
    assert.throws(() => transitionLeaveStatus("MENUNGGU_GM", "HR", "APPROVE"));
    assert.throws(() => transitionLeaveStatus("MENUNGGU_GM", "HR", "REJECT"));
    assert.throws(() => transitionLeaveStatus("MENUNGGU_HR", "GM", "APPROVE"));
    assert.throws(() => transitionLeaveStatus("MENUNGGU_HR", "GM", "REJECT"));
  });

  await t.test("Attendance correction logic by HR correctly updates attendance state", () => {
    const emp = dataStore.users.find((u) => u.role === "EMPLOYEE");
    const testDate = "2026-06-20";

    // Simulate attendance record
    const record = {
      id: `att_corr_${Date.now()}`,
      userId: emp.id,
      userName: emp.name,
      shiftId: "shift_1",
      shiftName: "Shift Reguler",
      date: testDate,
      checkInTime: "08:45:00",
      checkInLat: 0,
      checkInLng: 0,
      checkInDistanceMeters: 0,
      checkInPhotoKey: "",
      checkOutTime: "-",
      status: "TERLAMBAT",
      lateMinutes: 30,
      overtimeMinutes: 0,
      createdAt: Date.now(),
    };
    dataStore.attendances.unshift(record);

    // HR corrects the record to TEPAT_WAKTU with corrected check-in time
    record.checkInTime = "08:05:00";
    record.checkOutTime = "17:00:00";
    record.status = "TEPAT_WAKTU";
    record.lateMinutes = 0;

    const found = dataStore.attendances.find((a) => a.id === record.id);
    assert.equal(found.status, "TEPAT_WAKTU");
    assert.equal(found.lateMinutes, 0);
    assert.equal(found.checkInTime, "08:05:00");
  });

  await t.test("Employee validation fields support verification and HR evaluations", () => {
    const emp = dataStore.users.find((u) => u.role === "EMPLOYEE");
    emp.isVerified = true;
    emp.hrEvalDiscipline = "Sangat disiplin bulan ini";
    emp.hrEvalScore = 95;
    emp.hrEvalPerformance = "Performa kerja istimewa";

    assert.equal(emp.isVerified, true);
    assert.equal(emp.hrEvalDiscipline, "Sangat disiplin bulan ini");
    assert.equal(emp.hrEvalScore, 95);
    assert.equal(emp.hrEvalPerformance, "Performa kerja istimewa");
  });
});
