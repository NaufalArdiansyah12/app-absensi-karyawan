import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../models/leave_model.dart';
import '../../../models/user_model.dart';
import '../../../services/api_service.dart';
import '../../../theme/app_theme.dart';
import '../widgets/leave/kai_range_calendar_picker.dart';
import '../widgets/leave/leave_history_card.dart';

class SickLeaveScreen extends StatefulWidget {
  final UserModel currentUser;

  const SickLeaveScreen({super.key, required this.currentUser});

  @override
  State<SickLeaveScreen> createState() => _SickLeaveScreenState();
}

class _SickLeaveScreenState extends State<SickLeaveScreen> {
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now();
  final _startDateController = TextEditingController();
  final _endDateController = TextEditingController();
  final _durationController = TextEditingController(text: '1');
  final _diagnoseController = TextEditingController();

  final ImagePicker _docPicker = ImagePicker();
  Uint8List? _docBytes;
  String? _docBase64;

  List<LeaveModel> _myLeaves = [];
  bool _isLoadingLeaves = false;
  bool _isSubmitting = false;
  String? _message;
  bool _isError = false;

  static const _days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  static const _shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  String _formatIso(DateTime dt) =>
      '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';

  String _formatShortDate(DateTime dt) =>
      '${dt.day} ${_shortMonths[dt.month - 1]} ${dt.year}';

  String _formatDayName(DateTime dt) => _days[dt.weekday - 1];

  @override
  void initState() {
    super.initState();
    _startDateController.text = _formatIso(_startDate);
    _endDateController.text = _formatIso(_endDate);
    _loadLeaves();
  }

  Future<void> _loadLeaves() async {
    setState(() => _isLoadingLeaves = true);
    try {
      final res = await ApiService.getMyLeaves();
      setState(() {
        _myLeaves = res['leaves'] as List<LeaveModel>;
      });
    } catch (_) {}
    setState(() => _isLoadingLeaves = false);
  }

  Future<void> _pickDocument(ImageSource source) async {
    try {
      final photo = await _docPicker.pickImage(
        source: source,
        maxWidth: 1000,
        maxHeight: 1000,
        imageQuality: 80,
      );
      if (photo != null) {
        final bytes = await photo.readAsBytes();
        setState(() {
          _docBytes = bytes;
          _docBase64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        });
      }
    } catch (e) {
      setState(() {
        _isError = true;
        _message = 'Gagal mengambil dokumen: ${e.toString()}';
      });
    }
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
            primary: AppTheme.accent,
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
            primary: AppTheme.accent,
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

  Future<void> _handleApply() async {
    final duration = int.tryParse(_durationController.text.trim()) ?? 1;

    if (_diagnoseController.text.trim().isEmpty) {
      setState(() {
        _isError = true;
        _message = 'Diagnosa atau keluhan sakit wajib diisi';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _message = null;
    });

    try {
      await ApiService.applyLeave(
        type: 'IZIN_SAKIT',
        startDate: _startDateController.text.trim(),
        endDate: _endDateController.text.trim(),
        durationDays: duration,
        reason: _diagnoseController.text.trim(),
        docKey: _docBase64,
      );

      setState(() {
        _isError = false;
        _message = 'Permohonan izin sakit terkirim (Status: Menunggu GM)';
        _diagnoseController.clear();
        _docBytes = null;
        _docBase64 = null;
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
                      Icon(icon, size: 12, color: AppTheme.accent),
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

  Widget _buildAttachmentSection() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surfaceAlt,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.attach_file_rounded, size: 14, color: AppTheme.accent),
              SizedBox(width: 4),
              Text(
                'Lampiran Surat Dokter / Bukti Medis',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (_docBytes != null)
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.memory(
                    _docBytes!,
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Foto Surat Dokter Terlampir',
                        style: TextStyle(
                            fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                      Text(
                        'Siap dikirim bersama formulir',
                        style:
                            TextStyle(fontSize: 10, color: AppTheme.secondary),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => setState(() {
                    _docBytes = null;
                    _docBase64 = null;
                  }),
                  icon: const Icon(Icons.delete_outline_rounded,
                      color: AppTheme.error, size: 20),
                ),
              ],
            )
          else
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                      side: const BorderSide(color: AppTheme.border),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                    onPressed: () => _pickDocument(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt_outlined, size: 16),
                    label: const Text('Foto Kamera',
                        style: TextStyle(fontSize: 11)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                      side: const BorderSide(color: AppTheme.border),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                    onPressed: () => _pickDocument(ImageSource.gallery),
                    icon: const Icon(Icons.photo_library_outlined, size: 16),
                    label: const Text('Dari Galeri',
                        style: TextStyle(fontSize: 11)),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final duration = int.tryParse(_durationController.text.trim()) ?? 1;
    final sickLeaves =
        _myLeaves.where((l) => l.type == 'IZIN_SAKIT').toList();

    return Scaffold(
      backgroundColor: AppTheme.primary,
      appBar: AppBar(
        title: const Text(
          'Permohonan Izin Sakit',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      body: AppTheme.curvedBody(
        SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner Info Khusus Izin Sakit
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.accentSubtle,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.accent.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.medical_services_rounded,
                        color: AppTheme.accent, size: 24),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Ketentuan Izin Sakit',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.accentHover,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Izin sakit tidak memotong kuota cuti tahunan. Harap lampirkan surat keterangan dokter atau resep medis resmi.',
                            style: TextStyle(
                              fontSize: 10,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Kalender Rentang Tanggal Gaya KAI
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

              // Form Rincian Izin Sakit
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
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppTheme.accentSubtle,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.healing_rounded,
                              size: 16, color: AppTheme.accent),
                        ),
                        const SizedBox(width: 8),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Formulir Pengajuan Izin Sakit',
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

                    // Tanggal Mulai dan Sampai Tanggal Berapa
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

                    // Bar Ringkasan Durasi
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
                              size: 15, color: AppTheme.accent),
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
                              color: AppTheme.accent,
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

                    // Lampiran Surat Dokter
                    _buildAttachmentSection(),
                    const SizedBox(height: 14),

                    // Diagnosa / Keluhan Sakit
                    TextField(
                      controller: _diagnoseController,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'Diagnosa / Keterangan Sakit',
                        hintText:
                            'Contoh: Flu berat dan demam tinggi, anjuran istirahat dokter',
                        prefixIcon: const Icon(Icons.medical_information_outlined,
                            size: 18),
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
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 12),
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
                              color:
                                  _isError ? AppTheme.error : AppTheme.secondary,
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
                          backgroundColor: AppTheme.accent,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 0,
                        ),
                        onPressed: _isSubmitting ? null : _handleApply,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'Kirim Permohonan Izin Sakit',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Riwayat Izin Sakit
              const Row(
                children: [
                  Icon(Icons.history_rounded, size: 16, color: AppTheme.accent),
                  SizedBox(width: 6),
                  Text(
                    'Riwayat Izin Sakit Saya',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (_isLoadingLeaves)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                )
              else if (sickLeaves.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: const Center(
                    child: Text(
                      'Belum ada riwayat permohonan izin sakit.',
                      style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    ),
                  ),
                )
              else
                ...sickLeaves.map((l) => LeaveHistoryCard(item: l)),
            ],
          ),
        ),
      ),
    );
  }
}
