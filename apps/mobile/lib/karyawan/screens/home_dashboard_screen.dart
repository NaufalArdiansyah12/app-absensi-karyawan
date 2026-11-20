import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/attendance_model.dart';
import '../../models/leave_model.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../widgets/attendance/attendance_timeline_modal.dart';
import '../widgets/dashboard/action_matrix_grid.dart';
import '../widgets/dashboard/app_top_bar.dart';
import '../widgets/dashboard/attendance_hero_card.dart';
import '../widgets/dashboard/greeting_header.dart';
import '../widgets/dashboard/employee_info_hub_section.dart';
import '../widgets/dashboard/recent_attendance_item.dart';
import 'profile_screen.dart';
import 'schedule_screen.dart';
import 'task_assignment_screen.dart';
import 'services_screen.dart';
import 'sick_leave_screen.dart';

class HomeDashboardScreen extends StatefulWidget {
  final UserModel currentUser;

  const HomeDashboardScreen({super.key, required this.currentUser});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _currentTabIndex = 0;
  final Set<int> _visitedTabs = {0};
  late UserModel _user;
  List<AttendanceModel> _recentAttendances = [];
  List<LeaveModel> _recentLeaves = [];
  String? _todayCheckIn;
  String? _todayCheckOut;
  int _yearlyPresenceDays = 0;
  int _monthlyPresenceDays = 0;
  int _sickLeaveCount = 0;
  int _pendingApprovalCount = 0;
  Timer? _autoRefreshTimer;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    _user = widget.currentUser;
    _requestLocationPermissionInAdvance();
    _refreshData();
    // Background sync 60 detik (cegah freeze saat navigasi)
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 60), (_) {
      if (mounted) {
        _refreshData(showIndicator: false);
      }
    });
  }

  Future<void> _requestLocationPermissionInAdvance() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _refreshData({bool showIndicator = true}) async {
    try {
      final updatedProfile = await ApiService.getProfile();
      final history = await ApiService.getAttendanceHistory();
      final leavesRes = await ApiService.getMyLeaves();

      final leavesList = leavesRes['leaves'] as List<LeaveModel>;
      final updatedQuota = leavesRes['leaveQuota'] as int;

      final now = DateTime.now();
      final todayStr =
          '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      final currentYearPrefix = '${now.year}-';
      final currentMonthPrefix =
          '${now.year}-${now.month.toString().padLeft(2, '0')}';

      // Cari rekam absensi tanggal hari ini secara realtime
      final todayRecord = history.cast<AttendanceModel?>().firstWhere(
            (a) => a?.date == todayStr,
            orElse: () => null,
          );

      // Hitung kehadiran tahun berjalan (reset tiap tahun)
      final yearlyPresence =
          history.where((a) => a.date.startsWith(currentYearPrefix)).length;

      // Hitung kehadiran bulan berjalan secara realtime
      final monthlyPresence =
          history.where((a) => a.date.startsWith(currentMonthPrefix)).length;

      // Hitung izin sakit yang telah disetujui pada tahun berjalan (reset tiap tahun)
      final realSickCount = leavesList
          .where((l) =>
              l.type == 'IZIN_SAKIT' &&
              l.status == 'FINAL_DISETUJUI' &&
              l.startDate.startsWith(currentYearPrefix))
          .length;

      // Hitung permohonan yang masih dalam proses approval
      final pendingCount = leavesList
          .where((l) => l.status == 'MENUNGGU_GM' || l.status == 'MENUNGGU_HR')
          .length;

      if (mounted) {
        setState(() {
          _user = updatedProfile.leaveQuota != updatedQuota
              ? UserModel(
                  id: updatedProfile.id,
                  nik: updatedProfile.nik,
                  name: updatedProfile.name,
                  email: updatedProfile.email,
                  role: updatedProfile.role,
                  division: updatedProfile.division,
                  jobPosition: updatedProfile.jobPosition,
                  leaveQuota: updatedQuota,
                  shiftName: updatedProfile.shiftName,
                  shiftHours: updatedProfile.shiftHours,
                  shiftBreakHours: updatedProfile.shiftBreakHours,
                )
              : updatedProfile;
          _recentAttendances = history;
          _recentLeaves = leavesList;
          _todayCheckIn = todayRecord?.checkInTime;
          _todayCheckOut = todayRecord?.checkOutTime;
          _yearlyPresenceDays = yearlyPresence;
          _monthlyPresenceDays = monthlyPresence;
          _sickLeaveCount = realSickCount;
          _pendingApprovalCount = pendingCount;
        });
      }
    } catch (_) {}
  }

  String _getFormattedDate() {
    final now = DateTime.now();
    const days = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu'
    ];
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ];
    final day = days[now.weekday % 7];
    final month = months[now.month - 1];
    return '$day, ${now.day} $month ${now.year}';
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded,
                color: AppTheme.secondary, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style:
                    const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1E293B),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _openAttendanceModal({required bool isCheckIn}) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AttendanceTimelineModal(
        isCheckIn: isCheckIn,
        currentUser: _user,
        onSuccess: (msg) => _showToast(msg),
      ),
    );

    if (result == true) {
      _refreshData(showIndicator: true);
    }
  }

  void _openAttendanceHistoryModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        builder: (_, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.history_rounded, size: 20, color: AppTheme.primary),
                      SizedBox(width: 8),
                      Text(
                        'Riwayat Presensi Realtime',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primarySubtle,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Total: ${_recentAttendances.length} Log',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(height: 1, color: AppTheme.border),
              const SizedBox(height: 14),
              Expanded(
                child: _recentAttendances.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: const BoxDecoration(
                                color: AppTheme.surfaceAlt,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.history_toggle_off_rounded,
                                size: 40,
                                color: AppTheme.textMuted,
                              ),
                            ),
                            const SizedBox(height: 14),
                            const Text(
                              'Belum Ada Catatan Presensi',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Data kehadiran realtime Anda di Cloudflare D1 masih kosong.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        controller: scrollController,
                        itemCount: _recentAttendances.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (_, idx) =>
                            RecentAttendanceItem(item: _recentAttendances[idx]),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _switchTab(int index) {
    if (_currentTabIndex != index) {
      setState(() {
        _currentTabIndex = index;
        _visitedTabs.add(index);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      extendBody: true, // Memungkinkan efek liquid glass memburamkan konten di baliknya
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _buildDashboardTab(),
          _visitedTabs.contains(1)
              ? TaskAssignmentScreen(onBackToHome: () => _switchTab(0))
              : const SizedBox.shrink(),
          _visitedTabs.contains(2)
              ? ServicesScreen(currentUser: _user)
              : const SizedBox.shrink(),
          _visitedTabs.contains(3)
              ? ProfileScreen(user: _user)
              : const SizedBox.shrink(),
        ],
      ),
      bottomNavigationBar: _buildLiquidGlassBottomDock(),
    );
  }

  Widget _buildDashboardTab() {
    return Scaffold(
      backgroundColor: AppTheme.primary,
      appBar: AppTopBar(
        user: _user,
        onNotificationTap: () =>
            _showToast('Sistem absensi GPS & Face Verification aktif'),
      ),
      body: AppTheme.curvedBody(
        RefreshIndicator(
          onRefresh: () => _refreshData(showIndicator: true),
          color: AppTheme.primary,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GreetingHeader(
                  userName: _user.name,
                  formattedDate: _getFormattedDate(),
                ),
                const SizedBox(height: 12),
                AttendanceHeroCard(
                  presenceDays: _yearlyPresenceDays,
                  sickCount: _sickLeaveCount,
                  leaveQuota: _user.leaveQuota,
                  checkInTime: _todayCheckIn,
                  checkOutTime: _todayCheckOut,
                  onCheckInTap: () => _openAttendanceModal(isCheckIn: true),
                  onCheckOutTap: () => _openAttendanceModal(isCheckIn: false),
                ),
                const SizedBox(height: 16),
                ActionMatrixGrid(
                  approvalBadge: _pendingApprovalCount > 0
                      ? '$_pendingApprovalCount'
                      : null,
                  onLeaveTap: () => _switchTab(2),
                  onBreakTap: () =>
                      _showToast('Waktu istirahat reguler: 12:00 - 13:00 WIB'),
                  onVisitTap: () => _showToast('Kunjungan Luar / Visit Geotag'),
                  onOvertimeTap: () => _switchTab(2),
                  onApprovalTap: () {
                    _switchTab(2);
                    _showToast(
                      _pendingApprovalCount > 0
                          ? '$_pendingApprovalCount permohonan dalam proses review'
                          : 'Belum ada permohonan pending',
                    );
                  },
                  onHistoryLogTap: _openAttendanceHistoryModal,
                  onReportLogTap: () => _showToast(
                      'Kehadiran bulan ini: $_monthlyPresenceDays hari kerja'),
                  onSickLeaveTap: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => SickLeaveScreen(currentUser: _user),
                      ),
                    );
                    _refreshData(showIndicator: false);
                  },
                ),
                const SizedBox(height: 16),
                EmployeeInfoHubSection(
                  monthlyPresenceDays: _monthlyPresenceDays,
                  sickLeaveCount: _sickLeaveCount,
                  leaveQuota: _user.leaveQuota,
                  recentLeaves: _recentLeaves,
                  recentAttendances: _recentAttendances,
                  shiftName: _user.shiftName,
                  shiftHours: _user.shiftHours,
                  shiftBreakHours: _user.shiftBreakHours,
                  onNavigateToSchedule: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ScheduleScreen(
                          currentUser: _user,
                          onBackToHome: () => Navigator.pop(context),
                        ),
                      ),
                    );
                  },
                  onNavigateToLeaves: () => _switchTab(2),
                  onAnnouncementTap: () => _showToast(
                      'Sosialisasi Jam Kerja: Berlaku efektif mulai minggu ini.'),
                  onHistoryLogTap: _openAttendanceHistoryModal,
                ),
                const SizedBox(height: 120), // Spasi agar tidak tertutup dock melayang
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ponytail: drop BackdropFilter blur to avoid offscreen GPU saveLayer cost. Add back if target device GPU >= Snapdragon 8.
  Widget _buildLiquidGlassBottomDock() {
    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(16, 0, 16, 16 + bottomInset * 0.5),
      child: Container(
        height: 64,
        decoration: BoxDecoration(
          color: const Color(0xF2FFFFFF),
          borderRadius: BorderRadius.circular(32),
          border: Border.all(
            color: Colors.white,
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primary.withValues(alpha: 0.12),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
              children: [
                // 1. Beranda
                _buildLiquidNavItem(
                  index: 0,
                  icon: Icons.dashboard_outlined,
                  activeIcon: Icons.dashboard_rounded,
                  label: 'Beranda',
                ),

                // 2. Penugasan
                _buildLiquidNavItem(
                  index: 1,
                  icon: Icons.assignment_outlined,
                  activeIcon: Icons.assignment_rounded,
                  label: 'Penugasan',
                ),

                // 3. Layanan
                _buildLiquidNavItem(
                  index: 2,
                  icon: Icons.workspaces_outline,
                  activeIcon: Icons.workspaces_rounded,
                  label: 'Layanan',
                ),

                // 4. Profil
                _buildLiquidNavItem(
                  index: 3,
                  icon: Icons.person_outline_rounded,
                  activeIcon: Icons.person_rounded,
                  label: 'Profil',
                ),
              ],
            ),
          ),
        );
  }

  Widget _buildLiquidNavItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
  }) {
    final isSelected = _currentTabIndex == index;

    return Expanded(
      child: InkWell(
        onTap: () => _switchTab(index),
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppTheme.primary.withValues(alpha: 0.12)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(14),
                  border: isSelected
                      ? Border.all(
                          color: AppTheme.primary.withValues(alpha: 0.20),
                          width: 1,
                        )
                      : null,
                ),
                child: Icon(
                  isSelected ? activeIcon : icon,
                  size: 20,
                  color: isSelected ? AppTheme.primary : AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? AppTheme.primary : AppTheme.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
