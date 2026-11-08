import 'package:flutter/material.dart';
import '../../models/leave_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../widgets/leave/kai_range_calendar_picker.dart';
import '../widgets/leave/leave_history_card.dart';
import '../widgets/leave/leave_quota_badge.dart';

class LeaveFormScreen extends StatefulWidget {
  final int currentQuota;

  const LeaveFormScreen({super.key, required this.currentQuota});

  @override
  State<LeaveFormScreen> createState() => _LeaveFormScreenState();
}

class _LeaveFormScreenState extends State<LeaveFormScreen> {
  String _selectedType = 'CUTI_TAHUNAN';
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now();
  final _startDateController = TextEditingController();
  final _endDateController = TextEditingController();
  final _durationController = TextEditingController(text: '1');
  final _reasonController = TextEditingController();

  int _leaveQuota = 0;
  List<LeaveModel> _myLeaves = [];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _message;
  bool _isError = false;

  String _formatIso(DateTime dt) =>
      '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';

  @override
  void initState() {
    super.initState();
    _startDateController.text = _formatIso(_startDate);
    _endDateController.text = _formatIso(_endDate);
    _leaveQuota = widget.currentQuota;
    _loadLeaves();
  }

  Future<void> _loadLeaves() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getMyLeaves();
      setState(() {
        _myLeaves = res['leaves'] as List<LeaveModel>;
        _leaveQuota = res['leaveQuota'] as int;
      });
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  Future<void> _handleApply() async {
    final duration = int.tryParse(_durationController.text.trim()) ?? 1;

    if (_selectedType == 'CUTI_TAHUNAN' && duration > _leaveQuota) {
      setState(() {
        _isError = true;
        _message =
            'Saldo cuti tidak mencukupi. Kuota tersisa $_leaveQuota hari, diajukan $duration hari.';
      });
      return;
    }

    if (_reasonController.text.trim().isEmpty) {
      setState(() {
        _isError = true;
        _message = 'Alasan pengajuan cuti/izin wajib diisi';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _message = null;
    });

    try {
      await ApiService.applyLeave(
        type: _selectedType,
        startDate: _startDateController.text.trim(),
        endDate: _endDateController.text.trim(),
        durationDays: duration,
        reason: _reasonController.text.trim(),
      );

      setState(() {
        _isError = false;
        _message = 'Permohonan berhasil dikirim (Status: Menunggu GM)';
        _reasonController.clear();
      });

      await _loadLeaves();
    } catch (e) {
      setState(() {
        _isError = true;
        _message = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  static const _days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  static const _shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  String _formatShortDate(DateTime dt) {
    return '${dt.day} ${_shortMonths[dt.month - 1]} ${dt.year}';
  }

  String _formatDayName(DateTime dt) {
    return _days[dt.weekday - 1];
  }

  Future<void> _selectStartDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime(2025, 1, 1),
      lastDate: DateTime(2027, 12, 31),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppTheme.primary,
            onPrimary: Colors.white,
            onSurface: AppTheme.textPrimary,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _startDate = picked;
        if (_endDate.isBefore(_startDate)) {
          _endDate = _startDate;
        }
        _startDateController.text = _formatIso(_startDate);
        _endDateController.text = _formatIso(_endDate);
        final workdays =
            KaiRangeCalendarPicker.calculateWorkdays(_startDate, _endDate);
        _durationController.text = '$workdays';
        _message = null;
      });
    }
  }

  Future<void> _selectEndDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _endDate.isBefore(_startDate) ? _startDate : _endDate,
      firstDate: _startDate,
      lastDate: DateTime(2027, 12, 31),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppTheme.primary,
            onPrimary: Colors.white,
            onSurface: AppTheme.textPrimary,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _endDate = picked;
        _startDateController.text = _formatIso(_startDate);
        _endDateController.text = _formatIso(_endDate);
        final workdays =
            KaiRangeCalendarPicker.calculateWorkdays(_startDate, _endDate);
        _durationController.text = '$workdays';
        _message = null;
      });
    }
  }

  Widget _buildDateFieldCard({
    required String label,
    required DateTime date,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: AppTheme.surfaceAlt,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(icon, size: 12, color: AppTheme.primary),
                      const SizedBox(width: 4),
                      Text(
                        label,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const Icon(
                    Icons.edit_calendar_rounded,
                    size: 14,
                    color: AppTheme.textMuted,
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                _formatShortDate(date),
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                _formatDayName(date),
                style: const TextStyle(
                  fontSize: 10,
                  color: AppTheme.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeSelectorPill({
    required String value,
    required String label,
    required IconData icon,
  }) {
    final isSelected = _selectedType == value;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedType = value),
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary : AppTheme.surfaceAlt,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppTheme.primary : AppTheme.border,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppTheme.primary.withValues(alpha: 0.2),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 18,
                color: isSelected ? Colors.white : AppTheme.textSecondary,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? Colors.white : AppTheme.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final duration = int.tryParse(_durationController.text.trim()) ?? 1;
    final isQuotaExceeded =
        _selectedType == 'CUTI_TAHUNAN' && duration > _leaveQuota;

    return Scaffold(
      backgroundColor: AppTheme.primary,
      appBar: AppBar(
        title: const Text(
          'Permohonan Cuti & Izin',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      body: AppTheme.curvedBody(
        SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              LeaveQuotaBadge(leaveQuota: _leaveQuota),
              const SizedBox(height: 16),

              // Kalender Rentang Tanggal Gaya KAI Access
              KaiRangeCalendarPicker(
                initialStartDate: _startDate,
                initialEndDate: _endDate,
                existingLeaves: _myLeaves,
                onRangeSelected: (start, end, workdays) {
                  setState(() {
                    _startDate = start;
                    _endDate = end;
                    _startDateController.text = _formatIso(start);
                    _endDateController.text = _formatIso(end);
                    _durationController.text = '$workdays';
                    _message = null;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Formulir
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Form
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppTheme.primarySubtle,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.edit_calendar_rounded,
                              size: 16, color: AppTheme.primary),
                        ),
                        const SizedBox(width: 8),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Formulir Pengajuan Cuti & Izin',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              'Pilih tanggal di kalender atau sesuaikan form di bawah',
                              style: TextStyle(
                                  fontSize: 10, color: AppTheme.textMuted),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Form Tanggal Mulai dan Sampai Tanggal Berapa
                    Row(
                      children: [
                        _buildDateFieldCard(
                          label: 'Tanggal Mulai',
                          date: _startDate,
                          icon: Icons.calendar_today_rounded,
                          onTap: _selectStartDate,
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 6),
                          child: Icon(Icons.arrow_forward_rounded,
                              size: 14, color: AppTheme.textMuted),
                        ),
                        _buildDateFieldCard(
                          label: 'Sampai Tanggal',
                          date: _endDate,
                          icon: Icons.event_available_rounded,
                          onTap: _selectEndDate,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Bar Ringkasan Durasi Kerja
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceAlt,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.timelapse_rounded,
                              size: 15, color: AppTheme.primary),
                          const SizedBox(width: 6),
                          const Text(
                            'Total Durasi: ',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Text(
                            '$duration Hari Kerja',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.primary,
                            ),
                          ),
                          const Spacer(),
                          const Text(
                            '*Hari libur diskip',
                            style: TextStyle(
                              fontSize: 9,
                              color: AppTheme.textMuted,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Pilihan Jenis Permohonan Modern Pills
                    const Text(
                      'Jenis Permohonan',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildTypeSelectorPill(
                          value: 'CUTI_TAHUNAN',
                          label: 'Cuti Tahunan',
                          icon: Icons.beach_access_rounded,
                        ),
                        const SizedBox(width: 8),
                        _buildTypeSelectorPill(
                          value: 'LAINNYA',
                          label: 'Izin Khusus / Darurat',
                          icon: Icons.emergency_rounded,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    if (isQuotaExceeded)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: AppTheme.errorSubtle,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: AppTheme.error.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning_amber_rounded,
                                color: AppTheme.error, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Durasi cuti ($duration hari) melebihi sisa kuota Anda ($_leaveQuota hari). Silakan sesuaikan tanggal.',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.error,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    TextField(
                      controller: _reasonController,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'Alasan Permohonan',
                        hintText:
                            'Contoh: Keperluan keluarga mendesak / Acara penting',
                        hintStyle: const TextStyle(
                            fontSize: 11, color: AppTheme.textMuted),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    if (_message != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: _isError
                              ? AppTheme.errorSubtle
                              : AppTheme.secondarySubtle,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _isError
                                ? AppTheme.error.withValues(alpha: 0.25)
                                : AppTheme.secondary.withValues(alpha: 0.25),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _isError
                                  ? Icons.error_outline_rounded
                                  : Icons.check_circle_outline_rounded,
                              size: 18,
                              color: _isError
                                  ? AppTheme.error
                                  : AppTheme.secondary,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _message!,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: _isError
                                      ? AppTheme.error
                                      : AppTheme.secondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isQuotaExceeded
                              ? AppTheme.textMuted
                              : AppTheme.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 0,
                        ),
                        onPressed: (_isSubmitting || isQuotaExceeded)
                            ? null
                            : _handleApply,
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Kirim Pengajuan (Menunggu GM)',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                    ),
                                  ),
                                  SizedBox(width: 6),
                                  Icon(Icons.send_rounded,
                                      size: 16, color: Colors.white),
                                ],
                              ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              const Row(
                children: [
                  Icon(Icons.history_rounded,
                      size: 18, color: AppTheme.primary),
                  SizedBox(width: 6),
                  Text(
                    'Riwayat Permohonan & Progres Approval 2-Tier',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(color: AppTheme.primary),
                  ),
                )
              else if (_myLeaves.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: const Center(
                    child: Column(
                      children: [
                        Icon(Icons.inbox_rounded,
                            size: 36, color: AppTheme.textMuted),
                        SizedBox(height: 8),
                        Text(
                          'Belum ada riwayat permohonan cuti',
                          style: TextStyle(
                              fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ..._myLeaves.map(
                  (l) => Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: LeaveHistoryCard(item: l),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
