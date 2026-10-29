import 'package:flutter/material.dart';
import '../../models/attendance_model.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../widgets/dashboard/action_matrix_grid.dart';
import '../widgets/dashboard/app_top_bar.dart';
import '../widgets/dashboard/attendance_hero_card.dart';
import '../widgets/dashboard/greeting_header.dart';
import '../widgets/dashboard/history_preview_section.dart';
import 'attendance_camera_screen.dart';
import 'profile_screen.dart';
import 'schedule_screen.dart';
import 'services_screen.dart';

class HomeDashboardScreen extends StatefulWidget {
  final UserModel currentUser;

  const HomeDashboardScreen({super.key, required this.currentUser});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _currentTabIndex = 0;
  late UserModel _user;
  List<AttendanceModel> _recentAttendances = [];
  bool _isLoading = true;
  String? _todayCheckIn;
  String? _todayCheckOut;

  @override
  void initState() {
    super.initState();
    _user = widget.currentUser;
    _refreshData();
  }

  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    try {
      final updatedProfile = await ApiService.getProfile();
      final history = await ApiService.getAttendanceHistory();

      String? todayIn;
      String? todayOut;
      if (history.isNotEmpty) {
        todayIn = history.first.checkInTime;
        todayOut = history.first.checkOutTime;
      }

      setState(() {
        _user = updatedProfile;
        _recentAttendances = history;
        _todayCheckIn = todayIn;
        _todayCheckOut = todayOut;
      });
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: AppTheme.secondary, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
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

  Future<void> _openCamera() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AttendanceCameraScreen()),
    );
    _refreshData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          // Index 0: Dashboard
          _buildDashboardTab(),
          // Index 1: Jadwal
          ScheduleScreen(onBackToHome: () => setState(() => _currentTabIndex = 0)),
          // Index 2: Placeholder for center camera button (handled by onTap)
          const SizedBox.shrink(),
          // Index 3: Layanan (Services)
          ServicesScreen(currentUser: _user),
          // Index 4: Profile
          ProfileScreen(user: _user),
        ],
      ),
      bottomNavigationBar: _buildProminentBottomDock(),
    );
  }

  Widget _buildDashboardTab() {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppTopBar(
        user: _user,
        onNotificationTap: () => _showToast('1 Pengumuman Baru: Sosialisasi Shift Kerja 2026'),
      ),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        color: AppTheme.primary,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GreetingHeader(
                userName: _user.name,
                formattedDate: '29 Oktober 2026',
              ),
              const SizedBox(height: 12),
              AttendanceHeroCard(
                presenceDays: _recentAttendances.length,
                sickCount: 1,
                leaveQuota: _user.leaveQuota,
                checkInTime: _todayCheckIn,
                checkOutTime: _todayCheckOut,
                onCheckInTap: _openCamera,
                onCheckOutTap: _openCamera,
              ),
              const SizedBox(height: 16),
              ActionMatrixGrid(
                onLeaveTap: () => setState(() => _currentTabIndex = 3),
                onBreakTap: () => _showToast('Waktu istirahat shift: 12:00 - 13:00 WIB'),
                onVisitTap: () => _showToast('Fitur Kunjungan Luar / Visit Geotag'),
                onOvertimeTap: () {
                  setState(() => _currentTabIndex = 3);
                },
                onApprovalTap: () => _showToast('2 Pengajuan Menunggu Review GM & HR'),
                onHistoryLogTap: () => _showToast('Riwayat Absensi: ${_recentAttendances.length} catatan'),
                onReportLogTap: () => _showToast('Rekap Laporan Kehadiran Bulanan Siap'),
                onOthersTap: () => setState(() => _currentTabIndex = 4),
              ),
              const SizedBox(height: 16),
              HistoryPreviewSection(
                attendances: _recentAttendances,
                isLoading: _isLoading,
                onSyncAll: () async {
                  _showToast('Menghubungkan data absensi...');
                  await _refreshData();
                  _showToast('Semua data absensi telah tersinkronisasi');
                },
                onSeeMore: () => _showToast('Menampilkan seluruh arsip riwayat bulan ini'),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // 5-Tab Navigation Dock with Prominent Elevated Center Button
  Widget _buildProminentBottomDock() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: AppTheme.border, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -3),
          )
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 62,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // 1. Dashboard
              _buildNavItem(
                index: 0,
                icon: Icons.dashboard_outlined,
                activeIcon: Icons.dashboard_rounded,
                label: 'Dashboard',
              ),

              // 2. Jadwal
              _buildNavItem(
                index: 1,
                icon: Icons.calendar_today_outlined,
                activeIcon: Icons.calendar_month_rounded,
                label: 'Jadwal',
              ),

              // 3. ABSENSI (PROMINENT CENTER BUTTON)
              _buildProminentCenterButton(),

              // 4. Layanan
              _buildNavItem(
                index: 3,
                icon: Icons.workspaces_outline,
                activeIcon: Icons.workspaces_rounded,
                label: 'Layanan',
              ),

              // 5. Profil
              _buildNavItem(
                index: 4,
                icon: Icons.person_outline_rounded,
                activeIcon: Icons.person_rounded,
                label: 'Profil',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
  }) {
    final isSelected = _currentTabIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _currentTabIndex = index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              size: 22,
              color: isSelected ? AppTheme.primary : AppTheme.textMuted,
            ),
            const SizedBox(height: 3),
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
    );
  }

  // Circular Elevated Center Button
  Widget _buildProminentCenterButton() {
    return Expanded(
      child: Transform.translate(
        offset: const Offset(0, -12),
        child: InkWell(
          onTap: _openCamera,
          borderRadius: BorderRadius.circular(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primary, AppTheme.secondary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3.5),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary.withValues(alpha: 0.35),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: const Icon(
                  Icons.camera_alt_rounded,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'Absensi',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
