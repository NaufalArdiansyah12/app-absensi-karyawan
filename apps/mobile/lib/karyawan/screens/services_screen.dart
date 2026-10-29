import 'package:flutter/material.dart';
import '../../../models/leave_model.dart';
import '../../../models/payslip_model.dart';
import '../../../models/user_model.dart';
import '../../../services/api_service.dart';
import '../../../theme/app_theme.dart';
import '../widgets/leave/leave_history_card.dart';
import '../widgets/leave/leave_quota_badge.dart';
import '../widgets/payslip/payslip_card.dart';

class ServicesScreen extends StatefulWidget {
  final UserModel currentUser;

  const ServicesScreen({super.key, required this.currentUser});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  int _activeSegment = 0; // 0: Cuti, 1: Slip Gaji, 2: Info Lembur

  // Leave form state
  String _selectedType = 'CUTI_TAHUNAN';
  final _startDateController = TextEditingController(text: '2026-11-10');
  final _endDateController = TextEditingController(text: '2026-11-12');
  final _durationController = TextEditingController(text: '3');
  final _reasonController = TextEditingController();

  int _leaveQuota = 0;
  List<LeaveModel> _myLeaves = [];
  bool _isLoadingLeaves = false;
  bool _isSubmittingLeave = false;
  String? _leaveMessage;
  bool _isLeaveError = false;

  // Payslip state
  List<PayslipModel> _slips = [];
  bool _isLoadingSlips = false;

  @override
  void initState() {
    super.initState();
    _leaveQuota = widget.currentUser.leaveQuota;
    _loadLeaves();
    _loadSlips();
  }

  Future<void> _loadLeaves() async {
    setState(() => _isLoadingLeaves = true);
    try {
      final res = await ApiService.getMyLeaves();
      setState(() {
        _myLeaves = res['leaves'] as List<LeaveModel>;
        _leaveQuota = res['leaveQuota'] as int;
      });
    } catch (_) {}
    setState(() => _isLoadingLeaves = false);
  }

  Future<void> _loadSlips() async {
    setState(() => _isLoadingSlips = true);
    try {
      final data = await ApiService.getMyPayslips();
      setState(() => _slips = data);
    } catch (_) {}
    setState(() => _isLoadingSlips = false);
  }

  Future<void> _handleApplyLeave() async {
    if (_reasonController.text.trim().isEmpty) {
      setState(() {
        _isLeaveError = true;
        _leaveMessage = 'Alasan permohonan cuti wajib diisi';
      });
      return;
    }

    setState(() {
      _isSubmittingLeave = true;
      _leaveMessage = null;
    });

    try {
      await ApiService.applyLeave(
        type: _selectedType,
        startDate: _startDateController.text.trim(),
        endDate: _endDateController.text.trim(),
        durationDays: int.tryParse(_durationController.text.trim()) ?? 1,
        reason: _reasonController.text.trim(),
      );

      setState(() {
        _isLeaveError = false;
        _leaveMessage = 'Permohonan berhasil dikirim (Menunggu Approval GM)';
        _reasonController.clear();
      });

      await _loadLeaves();
    } catch (e) {
      setState(() {
        _isLeaveError = true;
        _leaveMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() => _isSubmittingLeave = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Layanan Mandiri',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Segment Bar
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppTheme.surfaceAlt,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                children: [
                  _buildSegmentButton(0, 'Cuti & Izin'),
                  _buildSegmentButton(1, 'Slip Gaji'),
                  _buildSegmentButton(2, 'Info Lembur'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Segment Content
            if (_activeSegment == 0) _buildLeaveTab(),
            if (_activeSegment == 1) _buildPayslipTab(),
            if (_activeSegment == 2) _buildOvertimeInfoTab(),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSegmentButton(int index, String label) {
    final isActive = _activeSegment == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _activeSegment = index),
        borderRadius: BorderRadius.circular(10),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    )
                  ]
                : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? AppTheme.primary : AppTheme.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLeaveTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        LeaveQuotaBadge(leaveQuota: _leaveQuota),
        const SizedBox(height: 16),

        // Form Cuti
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Formulir Pengajuan Baru',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _selectedType,
                decoration: InputDecoration(
                  labelText: 'Jenis Permohonan',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'CUTI_TAHUNAN',
                    child: Text('Cuti Tahunan (Potong Kuota)'),
                  ),
                  DropdownMenuItem(
                    value: 'IZIN_SAKIT',
                    child: Text('Izin Sakit'),
                  ),
                  DropdownMenuItem(
                    value: 'LAINNYA',
                    child: Text('Izin Khusus / Darurat'),
                  ),
                ],
                onChanged: (v) => setState(() => _selectedType = v!),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _startDateController,
                      decoration: InputDecoration(
                        labelText: 'Mulai (YYYY-MM-DD)',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 10,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _endDateController,
                      decoration: InputDecoration(
                        labelText: 'Selesai (YYYY-MM-DD)',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 10,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _durationController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Total Durasi (Hari)',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _reasonController,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Alasan Permohonan',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              if (_leaveMessage != null)
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: _isLeaveError
                        ? const Color(0xFFFFF1F2)
                        : const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _leaveMessage!,
                    style: TextStyle(
                      fontSize: 11,
                      color: _isLeaveError
                          ? const Color(0xFFBE123C)
                          : const Color(0xFF065F46),
                    ),
                  ),
                ),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  onPressed: _isSubmittingLeave ? null : _handleApplyLeave,
                  child: _isSubmittingLeave
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Kirim Pengajuan Cuti (Menunggu GM)',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
        const Text(
          'Riwayat Permohonan & Status Approval',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 10),
        if (_isLoadingLeaves)
          const Center(child: CircularProgressIndicator(color: AppTheme.primary))
        else if (_myLeaves.isEmpty)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Belum ada permohonan diajukan.',
              style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _myLeaves.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) =>
                LeaveHistoryCard(item: _myLeaves[index]),
          ),
      ],
    );
  }

  Widget _buildPayslipTab() {
    if (_isLoadingSlips) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: CircularProgressIndicator(color: AppTheme.primary),
        ),
      );
    }
    if (_slips.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border),
        ),
        child: const Center(
          child: Text(
            'Belum ada slip gaji yang diterbitkan Finance.',
            style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _slips.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) => PayslipCard(slip: _slips[index]),
    );
  }

  Widget _buildOvertimeInfoTab() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, size: 18, color: AppTheme.info),
              SizedBox(width: 8),
              Text(
                'Ketentuan Lembur PP 35/2021',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Text(
            '1. Perhitungan Upah Per Jam:\n'
            '   Upah per jam dihitung dengan rumus:\n'
            '   1/173 x Gaji Pokok.\n\n'
            '2. Tarif Upah Lembur:\n'
            '   - Hari kerja: 1.5x upah per jam untuk jam pertama, dan 2x upah per jam untuk jam berikutnya.\n'
            '   - Hari libur: 2x upah per jam untuk 7-8 jam pertama.\n\n'
            '3. Pencatatan Otomatis:\n'
            '   Sistem secara otomatis menghitung menit lembur dari selisih waktu Check-out dengan akhir jam shift kerja.',
            style: TextStyle(
              fontSize: 11,
              height: 1.6,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
