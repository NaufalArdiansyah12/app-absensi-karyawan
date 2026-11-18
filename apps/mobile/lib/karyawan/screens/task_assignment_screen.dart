import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';
import '../../models/task_model.dart';
import '../../services/api_service.dart';

class TaskAssignmentScreen extends StatefulWidget {
  final VoidCallback? onBackToHome;

  const TaskAssignmentScreen({super.key, this.onBackToHome});

  @override
  State<TaskAssignmentScreen> createState() => _TaskAssignmentScreenState();
}

class _TaskAssignmentScreenState extends State<TaskAssignmentScreen> {
  List<TaskModel> _tasks = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _activeFilterIndex = 0; // 0: Semua, 1: Belum Mulai, 2: Dikerjakan, 3: Review GM, 4: Selesai

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final tasks = await ApiService.getMyTasks();
      if (mounted) {
        setState(() {
          _tasks = tasks;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  List<TaskModel> get _filteredTasks {
    switch (_activeFilterIndex) {
      case 1:
        return _tasks.where((t) => t.status == 'PENDING').toList();
      case 2:
        return _tasks.where((t) => t.status == 'IN_PROGRESS').toList();
      case 3:
        return _tasks.where((t) => t.status == 'COMPLETED').toList();
      case 4:
        return _tasks.where((t) => t.status == 'CLOSED').toList();
      default:
        return _tasks;
    }
  }

  bool _isOverdue(String dueDate, String status) {
    if (status == 'CLOSED') return false;
    try {
      final due = DateTime.parse(dueDate);
      final today = DateTime.now();
      final todayDate = DateTime(today.year, today.month, today.day);
      return due.isBefore(todayDate);
    } catch (_) {
      return false;
    }
  }

  Future<void> _handleStartTask(TaskModel task) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Mulai Kerjakan Tugas?',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Status tugas "${task.title}" akan diubah menjadi "Sedang Dikerjakan".',
          style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal', style: TextStyle(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Mulai Kerjakan'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await ApiService.updateTaskStatus(
        taskId: task.id,
        status: 'IN_PROGRESS',
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tugas mulai dikerjakan. Selamat bekerja!'),
            backgroundColor: AppTheme.primary,
          ),
        );
        _loadTasks();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  void _showReportBottomSheet(TaskModel task) {
    final reportController = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.secondarySubtle,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.assignment_turned_in_rounded,
                            color: AppTheme.secondary,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Laporan Hasil Penugasan',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              Text(
                                task.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Rincian Laporan Hasil Kerja *',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: reportController,
                      maxLines: 4,
                      autofocus: true,
                      style: const TextStyle(fontSize: 13),
                      decoration: InputDecoration(
                        hintText:
                            'Jelaskan pekerjaan yang telah diselesaikan, tautan link dokumen/foto, atau catatan penting untuk GM...',
                        hintStyle: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade400,
                        ),
                        filled: true,
                        fillColor: AppTheme.surfaceAlt,
                        contentPadding: const EdgeInsets.all(12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: Colors.grey.shade200),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: Colors.grey.shade200),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppTheme.primary, width: 1.5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              side: BorderSide(color: Colors.grey.shade300),
                            ),
                            onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
                            child: const Text(
                              'Batal',
                              style: TextStyle(
                                color: AppTheme.textSecondary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              elevation: 0,
                            ),
                            onPressed: isSubmitting
                                ? null
                                : () async {
                                    final text = reportController.text.trim();
                                    if (text.isEmpty) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Harap isi laporan hasil pengerjaan terlebih dahulu'),
                                          backgroundColor: AppTheme.error,
                                        ),
                                      );
                                      return;
                                    }

                                    final scaffoldMessenger = ScaffoldMessenger.of(context);
                                    final navigator = Navigator.of(ctx);

                                    setModalState(() => isSubmitting = true);
                                    try {
                                      await ApiService.updateTaskStatus(
                                        taskId: task.id,
                                        status: 'COMPLETED',
                                        completionNotes: text,
                                      );
                                      if (mounted) {
                                        navigator.pop();
                                        scaffoldMessenger.showSnackBar(
                                          const SnackBar(
                                            content: Text('Laporan berhasil dikirim ke GM untuk direview!'),
                                            backgroundColor: AppTheme.secondary,
                                          ),
                                        );
                                        _loadTasks();
                                      }
                                    } catch (e) {
                                      setModalState(() => isSubmitting = false);
                                      if (mounted) {
                                        scaffoldMessenger.showSnackBar(
                                          SnackBar(
                                            content: Text(e.toString().replaceAll('Exception: ', '')),
                                            backgroundColor: AppTheme.error,
                                          ),
                                        );
                                      }
                                    }
                                  },
                            icon: isSubmitting
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.send_rounded, size: 16),
                            label: Text(
                              isSubmitting ? 'Mengirim...' : 'Kirim ke GM',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primary,
      appBar: AppBar(
        title: const Text(
          'Penugasan & Tanggung Jawab',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
        leading: widget.onBackToHome != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded, size: 20),
                onPressed: widget.onBackToHome,
              )
            : null,
      ),
      body: AppTheme.curvedBody(
        RefreshIndicator(
          color: AppTheme.primary,
          onRefresh: _loadTasks,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeaderKpi(),
                const SizedBox(height: 16),
                _buildFilterChips(),
                const SizedBox(height: 16),
                if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: CircularProgressIndicator(color: AppTheme.primary),
                    ),
                  )
                else if (_errorMessage != null)
                  _buildErrorState()
                else if (_filteredTasks.isEmpty)
                  _buildEmptyState()
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _filteredTasks.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (ctx, idx) => _buildTaskCard(_filteredTasks[idx]),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderKpi() {
    final pendingCount = _tasks.where((t) => t.status == 'PENDING').length;
    final inProgressCount = _tasks.where((t) => t.status == 'IN_PROGRESS').length;
    final reviewCount = _tasks.where((t) => t.status == 'COMPLETED').length;
    final closedCount = _tasks.where((t) => t.status == 'CLOSED').length;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildKpiItem(
            'Perlu Dikerjakan',
            '${pendingCount + inProgressCount}',
            AppTheme.info,
            Icons.pending_actions_rounded,
          ),
          Container(width: 1, height: 36, color: Colors.grey.shade200),
          _buildKpiItem(
            'Review GM',
            '$reviewCount',
            AppTheme.accent,
            Icons.hourglass_top_rounded,
          ),
          Container(width: 1, height: 36, color: Colors.grey.shade200),
          _buildKpiItem(
            'Selesai',
            '$closedCount',
            AppTheme.secondary,
            Icons.check_circle_outline_rounded,
          ),
        ],
      ),
    );
  }

  Widget _buildKpiItem(String title, String count, Color color, IconData icon) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(
              count,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          title,
          style: const TextStyle(
            fontSize: 10,
            color: AppTheme.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChips() {
    final filters = ['Semua', 'Belum Mulai', 'Dikerjakan', 'Review GM', 'Selesai'];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(filters.length, (idx) {
          final isSelected = _activeFilterIndex == idx;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              borderRadius: BorderRadius.circular(20),
              onTap: () => setState(() => _activeFilterIndex = idx),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primary : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? AppTheme.primary : AppTheme.border,
                  ),
                ),
                child: Text(
                  filters[idx],
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    color: isSelected ? Colors.white : AppTheme.textSecondary,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildTaskCard(TaskModel task) {
    final overdue = _isOverdue(task.dueDate, task.status);

    Color priorityColor;
    String priorityText;
    switch (task.priority) {
      case 'URGENT':
        priorityColor = AppTheme.error;
        priorityText = 'Urgent';
        break;
      case 'HIGH':
        priorityColor = AppTheme.accent;
        priorityText = 'Tinggi';
        break;
      case 'MEDIUM':
        priorityColor = AppTheme.info;
        priorityText = 'Sedang';
        break;
      default:
        priorityColor = Colors.grey.shade600;
        priorityText = 'Rendah';
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Priority & Due Date
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: priorityColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  priorityText,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: priorityColor,
                  ),
                ),
              ),
              Row(
                children: [
                  Icon(
                    Icons.schedule_rounded,
                    size: 13,
                    color: overdue ? AppTheme.error : AppTheme.textMuted,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    task.dueDate,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: overdue ? FontWeight.bold : FontWeight.w500,
                      color: overdue ? AppTheme.error : AppTheme.textSecondary,
                    ),
                  ),
                  if (overdue) ...[
                    const SizedBox(width: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppTheme.errorSubtle,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Lewat',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.error,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Title
          Text(
            task.title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 6),

          // Description
          Text(
            task.description,
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),

          // Pemberi Tugas
          Row(
            children: [
              const Icon(Icons.person_pin_circle_outlined, size: 14, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Text(
                'Instruksi dari: ${task.assignedByName ?? "General Manager"}',
                style: const TextStyle(
                  fontSize: 10,
                  color: AppTheme.textMuted,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),

          // Warning Box: Catatan Revisi GM jika ada
          if (task.revisionNotes != null && task.revisionNotes!.isNotEmpty && task.status == 'IN_PROGRESS') ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.roseSubtle,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.roseBorder),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.announcement_rounded, size: 16, color: AppTheme.error),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Catatan Revisi dari GM:',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.error,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          task.revisionNotes!,
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.red.shade900,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Display Submitted Completion Notes if in COMPLETED or CLOSED
          if (task.completionNotes != null && task.completionNotes!.isNotEmpty && task.status != 'IN_PROGRESS') ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
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
                      Icon(Icons.check_circle_outline, size: 13, color: AppTheme.textSecondary),
                      SizedBox(width: 4),
                      Text(
                        'Laporan Anda yang Dikirim:',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    task.completionNotes!,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 14),
          const Divider(height: 1, color: AppTheme.border),
          const SizedBox(height: 12),

          // Actions & Status footer
          _buildCardFooter(task),
        ],
      ),
    );
  }

  Widget _buildCardFooter(TaskModel task) {
    switch (task.status) {
      case 'PENDING':
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Belum Mulai',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                elevation: 0,
              ),
              onPressed: () => _handleStartTask(task),
              icon: const Icon(Icons.play_arrow_rounded, size: 16),
              label: const Text(
                'Mulai Kerjakan',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );

      case 'IN_PROGRESS':
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.infoSubtle,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                children: [
                  Icon(Icons.cached_rounded, size: 12, color: AppTheme.info),
                  SizedBox(width: 4),
                  Text(
                    'Sedang Dikerjakan',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.info,
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.secondary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                elevation: 0,
              ),
              onPressed: () => _showReportBottomSheet(task),
              icon: const Icon(Icons.send_rounded, size: 14),
              label: const Text(
                'Lapor Selesai',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );

      case 'COMPLETED':
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: AppTheme.amberSubtle,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.amberBorder),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.hourglass_top_rounded, size: 15, color: AppTheme.accent),
              SizedBox(width: 6),
              Text(
                'Sedang Direview GM',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.accentHover,
                ),
              ),
            ],
          ),
        );

      case 'CLOSED':
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: AppTheme.secondarySubtle,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.verified_rounded, size: 15, color: AppTheme.secondary),
              SizedBox(width: 6),
              Text(
                'Tugas Selesai & Disetujui GM',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.secondary,
                ),
              ),
            ],
          ),
        );

      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 20),
      alignment: Alignment.center,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surfaceAlt,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.task_alt_rounded,
              size: 40,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'Tidak ada penugasan',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Semua tugas yang diberikan oleh GM akan muncul di halaman ini.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Icon(Icons.error_outline_rounded, size: 36, color: AppTheme.error),
          const SizedBox(height: 10),
          Text(
            _errorMessage ?? 'Terjadi kesalahan saat memuat tugas',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, color: AppTheme.error),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: _loadTasks,
            child: const Text('Coba Lagi', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
