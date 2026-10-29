import 'package:flutter/material.dart';
import '../../models/leave_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
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
  final _startDateController = TextEditingController(text: '2026-11-10');
  final _endDateController = TextEditingController(text: '2026-11-12');
  final _durationController = TextEditingController(text: '3');
  final _reasonController = TextEditingController();

  int _leaveQuota = 0;
  List<LeaveModel> _myLeaves = [];
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _message;
  bool _isError = false;

  @override
  void initState() {
    super.initState();
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
        durationDays: int.tryParse(_durationController.text.trim()) ?? 1,
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Permohonan Cuti & Izin',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF1E293B),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            LeaveQuotaBadge(leaveQuota: _leaveQuota),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Formulir Pengajuan Baru',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
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
                  if (_message != null)
                    Container(
                      padding: const EdgeInsets.all(10),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: _isError
                            ? const Color(0xFFFFF1F2)
                            : const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _message!,
                        style: TextStyle(
                          fontSize: 11,
                          color: _isError
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
                      onPressed: _isSubmitting ? null : _handleApply,
                      child: _isSubmitting
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
            const SizedBox(height: 24),
            const Text(
              'Riwayat Permohonan & Status Approval',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 10),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_myLeaves.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'Belum ada permohonan diajukan.',
                  style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
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
        ),
      ),
    );
  }
}
