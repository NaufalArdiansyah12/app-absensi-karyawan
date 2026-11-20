<?php

namespace Tests\Unit;

use App\Services\GeofenceService;
use App\Services\LeaveMachineService;
use App\Services\PayrollService;
use Exception;
use PHPUnit\Framework\TestCase;

class DomainTest extends TestCase
{
    public function test_haversine_formula_validates_office_radius_correctly(): void
    {
        $officeLat = -6.175392;
        $officeLng = 106.827153;

        $inside = GeofenceService::isWithinRadius($officeLat, $officeLng, $officeLat, $officeLng, 100);
        $this->assertTrue($inside['valid']);
        $this->assertEquals(0, $inside['distanceMeters']);

        $outsideLat = $officeLat + 0.005;
        $outside = GeofenceService::isWithinRadius($outsideLat, $officeLng, $officeLat, $officeLng, 100);
        $this->assertFalse($outside['valid']);
        $this->assertTrue($outside['distanceMeters'] > 100);
    }

    public function test_2_tier_leave_approval_state_machine_transitions_correctly(): void
    {
        $step1Reject = LeaveMachineService::transitionLeaveStatus('MENUNGGU_GM', 'GM', 'REJECT');
        $this->assertEquals('DITOLAK_GM', $step1Reject['nextStatus']);
        $this->assertFalse($step1Reject['canDeductQuota']);

        $step1Approve = LeaveMachineService::transitionLeaveStatus('MENUNGGU_GM', 'GM', 'APPROVE');
        $this->assertEquals('MENUNGGU_HR', $step1Approve['nextStatus']);
        $this->assertFalse($step1Approve['canDeductQuota']);

        $step2Reject = LeaveMachineService::transitionLeaveStatus($step1Approve['nextStatus'], 'HR', 'REJECT');
        $this->assertEquals('DITOLAK_HR', $step2Reject['nextStatus']);
        $this->assertFalse($step2Reject['canDeductQuota']);

        $step2Approve = LeaveMachineService::transitionLeaveStatus($step1Approve['nextStatus'], 'HR', 'APPROVE');
        $this->assertEquals('FINAL_DISETUJUI', $step2Approve['nextStatus']);
        $this->assertTrue($step2Approve['canDeductQuota']);

        $this->expectException(Exception::class);
        LeaveMachineService::transitionLeaveStatus('MENUNGGU_HR', 'GM', 'APPROVE');
    }

    public function test_leave_quota_deduction_validates_balance_correctly(): void
    {
        $remaining = LeaveMachineService::deductLeaveQuota(12, 3, 'CUTI_TAHUNAN');
        $this->assertEquals(9, $remaining);

        $sickLeaveQuota = LeaveMachineService::deductLeaveQuota(12, 2, 'IZIN_SAKIT');
        $this->assertEquals(12, $sickLeaveQuota);
    }

    public function test_payroll_calculates_accurate_net_salary_with_deductions_and_overtime(): void
    {
        $result = PayrollService::calculatePayroll([
            'baseSalary' => 6000000,
            'allowance' => 1000000,
            'totalLateMinutes' => 30,
            'totalAbsentDays' => 1,
            'totalOvertimeMinutes' => 120,
            'workingDaysInMonth' => 22,
        ]);

        $this->assertEquals(6000000, $result['baseSalary']);
        $this->assertEquals(1000000, $result['allowance']);
        $this->assertEquals(30000, $result['lateDeduction']);
        $this->assertEquals(272727, $result['absentDeduction']);
        $this->assertEquals(104046, $result['overtimePay']);
        $this->assertEquals(240000, $result['taxAndBpjs']);
        $this->assertEquals(6561319, $result['netSalary']);
    }
}
