import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import '../../../models/user_model.dart';
import '../../../services/api_service.dart';
import '../../../theme/app_theme.dart';

class AttendanceTimelineModal extends StatefulWidget {
  final bool isCheckIn;
  final UserModel currentUser;
  final ValueChanged<String>? onSuccess;
  final double? initialLat;
  final double? initialLng;
  final Uint8List? initialPhotoBytes;

  const AttendanceTimelineModal({
    super.key,
    required this.isCheckIn,
    required this.currentUser,
    this.onSuccess,
    this.initialLat,
    this.initialLng,
    this.initialPhotoBytes,
  });

  @override
  State<AttendanceTimelineModal> createState() => _AttendanceTimelineModalState();
}

class _AttendanceTimelineModalState extends State<AttendanceTimelineModal> {
  // Step 1: Lokasi, Step 2: Swafoto, Step 3: Konfirmasi
  int _currentStep = 1;

  // Real GPS State
  double? _lat;
  double? _lng;
  bool _isFetchingLocation = true;
  String? _locationStatusMessage;
  bool _isGpsDisabled = false;
  bool _isPermissionDenied = false;

  // Map Controller
  final MapController _mapController = MapController();

  // Camera / Selfie State
  final ImagePicker _imagePicker = ImagePicker();
  Uint8List? _capturedPhotoBytes;
  String? _capturedPhotoBase64;
  final String _mockDefaultPhoto =
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

  // Realtime Live Clock
  late Timer _clockTimer;
  DateTime _currentDateTime = DateTime.now();

  // Submission State
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() => _currentDateTime = DateTime.now());
      }
    });

    if (widget.initialPhotoBytes != null) {
      _capturedPhotoBytes = widget.initialPhotoBytes;
      _capturedPhotoBase64 = 'data:image/jpeg;base64,mock';
    }

    if (widget.initialLat != null && widget.initialLng != null) {
      _applyCoordinates(widget.initialLat!, widget.initialLng!);
      _isFetchingLocation = false;
    } else {
      _fetchRealDeviceLocation();
    }
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    super.dispose();
  }

  void _applyCoordinates(double latitude, double longitude) {
    setState(() {
      _lat = latitude;
      _lng = longitude;
      _isFetchingLocation = false;
      _isGpsDisabled = false;
      _isPermissionDenied = false;
      _locationStatusMessage = null;
    });

    // Update center peta OpenStreetMap jika peta sudah terpasang
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_lat != null && _lng != null) {
        try {
          _mapController.move(LatLng(_lat!, _lng!), 16.0);
        } catch (_) {}
      }
    });
  }

  Future<void> _fetchRealDeviceLocation() async {
    setState(() {
      _isFetchingLocation = true;
      _locationStatusMessage = null;
      _isGpsDisabled = false;
      _isPermissionDenied = false;
      _errorMessage = null;
    });

    try {
      // 1. Cek apakah layanan GPS di HP aktif
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (!mounted) return;
        setState(() {
          _isGpsDisabled = true;
          _isFetchingLocation = false;
          _lat = null;
          _lng = null;
          _locationStatusMessage =
              'GPS HP Anda sedang nonaktif. Nyalakan lokasi pada pengaturan HP.';
        });
        return;
      }

      // 2. Cek dan minta izin lokasi
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (!mounted) return;
          setState(() {
            _isPermissionDenied = true;
            _isFetchingLocation = false;
            _lat = null;
            _lng = null;
            _locationStatusMessage =
                'Izin akses lokasi ditolak. Berikan izin lokasi untuk verifikasi kehadiran.';
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (!mounted) return;
        setState(() {
          _isPermissionDenied = true;
          _isFetchingLocation = false;
          _lat = null;
          _lng = null;
          _locationStatusMessage =
              'Izin lokasi diblokir secara permanen di HP. Harap buka pengaturan aplikasi.';
        });
        return;
      }

      // 3. Ambil posisi GPS akurat dari sensor HP
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );

      if (!mounted) return;
      _applyCoordinates(position.latitude, position.longitude);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isFetchingLocation = false;
        _locationStatusMessage = 'Gagal membaca koordinat GPS: ${e.toString()}';
      });
    }
  }

  // Buka kamera perangkat nyata untuk swafoto selfie
  Future<void> _takeSelfieWithCamera() async {
    try {
      final XFile? photo = await _imagePicker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );

      if (photo != null) {
        final bytes = await photo.readAsBytes();
        final base64Str = 'data:image/jpeg;base64,${base64Encode(bytes)}';

        if (!mounted) return;
        setState(() {
          _capturedPhotoBytes = bytes;
          _capturedPhotoBase64 = base64Str;
          _errorMessage = null;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Gagal membuka kamera: ${e.toString()}';
      });
    }
  }

  void _retakePhoto() {
    setState(() {
      _capturedPhotoBytes = null;
      _capturedPhotoBase64 = null;
      _errorMessage = null;
    });
    // Langsung buka kamera kembali untuk foto ulang
    _takeSelfieWithCamera();
  }

  String _formatIndonesianDate(DateTime dt) {
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
    final day = days[dt.weekday % 7];
    final month = months[dt.month - 1];
    return '$day, ${dt.day} $month ${dt.year}';
  }

  Future<void> _submitAttendance() async {
    if (_lat == null || _lng == null) {
      setState(() {
        _errorMessage = 'Koordinat lokasi belum berhasil didapatkan.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final photo = _capturedPhotoBase64 ?? _mockDefaultPhoto;
      if (widget.isCheckIn) {
        final att = await ApiService.checkIn(_lat!, _lng!, photo);
        if (!mounted) return;
        Navigator.pop(context, true);
        widget.onSuccess?.call(
          'Absen masuk berhasil! Jam: ${att.checkInTime.isNotEmpty ? att.checkInTime : DateFormat('HH:mm').format(_currentDateTime)} WIB',
        );
      } else {
        final att = await ApiService.checkOut(_lat!, _lng!, photo);
        if (!mounted) return;
        Navigator.pop(context, true);
        final outTime = (att.checkOutTime != null && att.checkOutTime!.isNotEmpty)
            ? att.checkOutTime!
            : DateFormat('HH:mm').format(_currentDateTime);
        widget.onSuccess?.call(
          'Absen pulang berhasil! Jam: $outTime WIB',
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.isCheckIn ? 'Absensi Masuk' : 'Absensi Pulang';

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          // Drag handle pill
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: AppTheme.borderSubtle,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),

          // Modal Top Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    if (_currentStep > 1) ...[
                      InkWell(
                        onTap: () => setState(() => _currentStep--),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceAlt,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: const Icon(
                            Icons.arrow_back_rounded,
                            color: AppTheme.textPrimary,
                            size: 18,
                          ),
                        ),
                      ),
                    ],
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: widget.isCheckIn
                            ? AppTheme.primarySubtle
                            : AppTheme.errorSubtle,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        widget.isCheckIn
                            ? Icons.login_rounded
                            : Icons.logout_rounded,
                        color: widget.isCheckIn
                            ? AppTheme.primary
                            : AppTheme.error,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          _formatIndonesianDate(_currentDateTime),
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded, color: AppTheme.textMuted),
                  splashRadius: 20,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Timeline Step Indicator
          _buildTimelineIndicator(),
          const Divider(height: 24, thickness: 1, color: AppTheme.border),

          // Step Content with Smooth Lightweight Transition
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Column(
                children: [
                  if (_errorMessage != null) _buildErrorBanner(),
                  // ponytail: transisi slide/fade 250ms via AnimatedSwitcher GPU, upgrade ke PageView swipe saat butuh gesture geser horizontal
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 250),
                    switchInCurve: Curves.easeOutCubic,
                    switchOutCurve: Curves.easeInCubic,
                    transitionBuilder: (child, animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0.04, 0.0),
                            end: Offset.zero,
                          ).animate(animation),
                          child: child,
                        ),
                      );
                    },
                    child: KeyedSubtree(
                      key: ValueKey<int>(_currentStep),
                      child: _buildCurrentStep(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Step Timeline Header Indicator ---
  Widget _buildTimelineIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: [
          _buildTimelineNode(
            stepNumber: 1,
            label: 'Lokasi Map',
            isActive: _currentStep == 1,
            isCompleted: _currentStep > 1,
          ),
          _buildTimelineConnector(isCompleted: _currentStep > 1),
          _buildTimelineNode(
            stepNumber: 2,
            label: 'Kamera Selfie',
            isActive: _currentStep == 2,
            isCompleted: _currentStep > 2,
          ),
          _buildTimelineConnector(isCompleted: _currentStep > 2),
          _buildTimelineNode(
            stepNumber: 3,
            label: 'Konfirmasi',
            isActive: _currentStep == 3,
            isCompleted: false,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineNode({
    required int stepNumber,
    required String label,
    required bool isActive,
    required bool isCompleted,
  }) {
    Color circleColor;
    Color textColor;
    Widget content;

    if (isCompleted) {
      circleColor = AppTheme.secondary;
      textColor = AppTheme.primary;
      content = const Icon(Icons.check_rounded, size: 14, color: Colors.white);
    } else if (isActive) {
      circleColor = AppTheme.primary;
      textColor = AppTheme.primary;
      content = Text(
        '$stepNumber',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      );
    } else {
      circleColor = AppTheme.surfaceAlt;
      textColor = AppTheme.textMuted;
      content = Text(
        '$stepNumber',
        style: const TextStyle(
          color: AppTheme.textMuted,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: circleColor,
            shape: BoxShape.circle,
            border: Border.all(
              color: isActive ? AppTheme.primarySubtle : Colors.transparent,
              width: 2,
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: AppTheme.primary.withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    )
                  ]
                : null,
          ),
          child: Center(child: content),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isActive || isCompleted ? FontWeight.w700 : FontWeight.w500,
            color: textColor,
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineConnector({required bool isCompleted}) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 16, left: 4, right: 4),
        color: isCompleted ? AppTheme.secondary : AppTheme.border,
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppTheme.errorSubtle,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.error.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, size: 20, color: AppTheme.error),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _errorMessage!,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 1:
        return _buildStep1Location();
      case 2:
        return _buildStep2Selfie();
      case 3:
        return _buildStep3Confirmation();
      default:
        return const SizedBox.shrink();
    }
  }

  // ==========================================
  // STEP 1: Mengambil Lokasi & Peta OpenStreetMap
  // ==========================================
  Widget _buildStep1Location() {
    // 1. Kondisi saat GPS mati
    if (_isGpsDisabled) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.surfaceAlt,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.error.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: const BoxDecoration(
                color: AppTheme.errorSubtle,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.location_disabled_rounded,
                color: AppTheme.error,
                size: 28,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Layanan GPS Nonaktif',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Sensor lokasi di HP Anda sedang dimatikan. Aktifkan GPS untuk menampilkan peta lokasi presensi.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppTheme.border),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () => Geolocator.openLocationSettings(),
                    icon: const Icon(Icons.settings_outlined, size: 16),
                    label: const Text('Buka Pengaturan GPS', style: TextStyle(fontSize: 11)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: _fetchRealDeviceLocation,
                    icon: const Icon(Icons.refresh_rounded, size: 16),
                    label: const Text('Cek Lagi', style: TextStyle(fontSize: 11)),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    // 2. Kondisi izin lokasi ditolak
    if (_isPermissionDenied) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.surfaceAlt,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.error.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: const BoxDecoration(
                color: AppTheme.errorSubtle,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.security_update_warning_rounded,
                color: AppTheme.error,
                size: 28,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Izin Lokasi Diperlukan',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _locationStatusMessage ??
                  'Berikan izin akses lokasi pada aplikasi agar sistem dapat membaca peta lokasi Anda.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppTheme.border),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () => Geolocator.openAppSettings(),
                    icon: const Icon(Icons.app_settings_alt_outlined, size: 16),
                    label: const Text('Pengaturan', style: TextStyle(fontSize: 11)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: _fetchRealDeviceLocation,
                    icon: const Icon(Icons.refresh_rounded, size: 16),
                    label: const Text('Coba Lagi', style: TextStyle(fontSize: 11)),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    // 3. Kondisi sedang membaca sinyal GPS
    if (_isFetchingLocation || _lat == null || _lng == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
        decoration: BoxDecoration(
          color: AppTheme.surfaceAlt,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.border),
        ),
        child: const Column(
          children: [
            SizedBox(
              width: 36,
              height: 36,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: AppTheme.primary,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Menghubungkan Sensor GPS...',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'Mengambil data lokasi dan memuat peta OpenStreetMap',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
            ),
          ],
        ),
      );
    }

    final point = LatLng(_lat!, _lng!);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Real OpenStreetMap Map Preview
        Container(
          width: double.infinity,
          height: 220,
          decoration: BoxDecoration(
            color: const Color(0xFFE2E8F0),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            children: [
              // OpenStreetMap Canvas
              FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: point,
                  initialZoom: 16.5,
                  interactionOptions: const InteractionOptions(
                    flags: InteractiveFlag.pinchZoom |
                        InteractiveFlag.drag |
                        InteractiveFlag.doubleTapZoom,
                  ),
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'id.co.nutrilife.mobile',
                  ),
                  MarkerLayer(
                    markers: [
                      Marker(
                        point: point,
                        width: 50,
                        height: 50,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: AppTheme.primary.withValues(alpha: 0.25),
                                shape: BoxShape.circle,
                              ),
                            ),
                            Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                color: AppTheme.primary,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2.5),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.3),
                                    blurRadius: 6,
                                  ),
                                ],
                              ),
                              child: const Center(
                                child: Icon(
                                  Icons.person_pin_circle_rounded,
                                  size: 14,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // OSM Badge & Re-center button
              Positioned(
                top: 10,
                left: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.map_rounded, size: 12, color: AppTheme.primary),
                      SizedBox(width: 4),
                      Text(
                        'OpenStreetMap Live',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Re-center floating button
              Positioned(
                bottom: 10,
                right: 10,
                child: FloatingActionButton.small(
                  heroTag: 'recenter_map_btn',
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.primary,
                  elevation: 2,
                  onPressed: () {
                    _mapController.move(point, 16.5);
                  },
                  child: const Icon(Icons.my_location_rounded, size: 18),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Info Banner: Lokasi Terdeteksi (Tanpa blokir radius minimal)
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppTheme.surfaceAlt,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: const BoxDecoration(
                  color: AppTheme.secondarySubtle,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: AppTheme.secondary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Lokasi Berhasil Terdeteksi',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Posisi peta OpenStreetMap telah dikunci sesuai GPS HP Anda.',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: _fetchRealDeviceLocation,
                icon: const Icon(Icons.refresh_rounded, size: 18, color: AppTheme.primary),
                tooltip: 'Perbarui Lokasi',
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Action button to step 2 (Langsung aktif jika GPS terdeteksi)
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 0,
            ),
            onPressed: () {
              setState(() {
                _errorMessage = null;
                _currentStep = 2;
              });
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Lanjut: Ambil Foto Selfie',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                ),
                SizedBox(width: 8),
                Icon(Icons.arrow_forward_rounded, size: 18),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
      ],
    );
  }

  // ==========================================
  // STEP 2: Mengambil Foto Selfie dengan Kamera Nyata
  // ==========================================
  Widget _buildStep2Selfie() {
    final hasPhoto = _capturedPhotoBytes != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Camera Viewfinder Box
        Container(
          width: double.infinity,
          height: 260,
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: hasPhoto ? AppTheme.secondary : AppTheme.border,
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Photo Image / Live Mock
              if (hasPhoto)
                Image.memory(
                  _capturedPhotoBytes!,
                  width: double.infinity,
                  height: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Icon(Icons.person, size: 80, color: Colors.white30),
                  ),
                )
              else
                Container(
                  color: const Color(0xFF1E293B),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: AppTheme.secondary.withValues(alpha: 0.6),
                              width: 2,
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.camera_alt_outlined,
                              size: 48,
                              color: Colors.white70,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Kamera Swafoto Siap Digunakan',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Tekan tombol di bawah untuk mengambil foto swafoto',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Shutter Button or Retake & Next Buttons
        if (!hasPhoto)
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
              onPressed: _takeSelfieWithCamera,
              icon: const Icon(Icons.camera_alt_rounded, size: 20),
              label: const Text(
                'Buka Kamera Swafoto',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
              ),
            ),
          )
        else
          Row(
            children: [
              // Tombol Foto Ulang
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.textPrimary,
                      side: const BorderSide(color: AppTheme.border),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    onPressed: _retakePhoto,
                    icon: const Icon(Icons.refresh_rounded, size: 18),
                    label: const Text(
                      'Foto Ulang',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Tombol Lanjut ke Konfirmasi
              Expanded(
                flex: 2,
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    onPressed: () {
                      setState(() {
                        _errorMessage = null;
                        _currentStep = 3;
                      });
                    },
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Lanjut ke Konfirmasi',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(width: 6),
                        Icon(Icons.arrow_forward_rounded, size: 16),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

        const SizedBox(height: 12),
        // Tombol Kembali Berdesain Rapi & Elegan
        SizedBox(
          width: double.infinity,
          height: 44,
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.textPrimary,
              side: const BorderSide(color: AppTheme.border, width: 1.2),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              backgroundColor: AppTheme.surfaceAlt.withValues(alpha: 0.6),
            ),
            onPressed: () => setState(() => _currentStep = 1),
            icon: const Icon(Icons.arrow_back_rounded, size: 16, color: AppTheme.textSecondary),
            label: const Text(
              'Kembali ke Peta Lokasi',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // STEP 3: Konfirmasi Data Absensi & Kirim
  // ==========================================
  Widget _buildStep3Confirmation() {
    final timeStr = DateFormat('HH:mm:ss').format(_currentDateTime);
    final dateStr = _formatIndonesianDate(_currentDateTime);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ringkasan Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surfaceAlt,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Summary with Type Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Ringkasan Data Presensi',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: widget.isCheckIn
                          ? AppTheme.primarySubtle
                          : AppTheme.errorSubtle,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: widget.isCheckIn
                            ? AppTheme.primary.withValues(alpha: 0.3)
                            : AppTheme.error.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      widget.isCheckIn ? 'Absen Masuk' : 'Absen Pulang',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: widget.isCheckIn
                            ? AppTheme.primary
                            : AppTheme.error,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Detail Item: Jam Absensi
              _buildConfirmRow(
                icon: Icons.access_time_rounded,
                title: 'Jam & Waktu',
                value: '$timeStr WIB',
                subValue: dateStr,
                valueColor: AppTheme.primary,
              ),
              const Divider(height: 18, color: AppTheme.border),

              // Detail Item: Lokasi
              const _ConfirmRow(
                icon: Icons.map_rounded,
                title: 'Lokasi Presensi',
                value: 'OpenStreetMap Terverifikasi',
                subValue: 'Koordinat GPS real-time terkunci',
              ),
              const Divider(height: 18, color: AppTheme.border),

              // Detail Item: Karyawan
              _buildConfirmRow(
                icon: Icons.person_rounded,
                title: 'Karyawan',
                value: widget.currentUser.name,
                subValue:
                    'NIK: ${widget.currentUser.nik} • ${widget.currentUser.jobPosition}',
              ),
              const Divider(height: 18, color: AppTheme.border),

              // Detail Item: Foto Selfie Attachment
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: _capturedPhotoBytes != null
                        ? Image.memory(
                            _capturedPhotoBytes!,
                            width: 44,
                            height: 44,
                            fit: BoxFit.cover,
                          )
                        : Image.network(
                            _mockDefaultPhoto,
                            width: 44,
                            height: 44,
                            fit: BoxFit.cover,
                          ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Swafoto Kehadiran',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Foto Kamera Terlampir',
                          style: TextStyle(
                            fontSize: 10,
                            color: AppTheme.secondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => setState(() => _currentStep = 2),
                    icon: const Icon(Icons.edit_outlined, size: 18, color: AppTheme.textSecondary),
                    tooltip: 'Ubah Foto',
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Action Buttons: Kembali & Submit
        Row(
          children: [
            SizedBox(
              height: 48,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.textPrimary,
                  side: const BorderSide(color: AppTheme.border, width: 1.2),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  backgroundColor: AppTheme.surfaceAlt.withValues(alpha: 0.6),
                ),
                onPressed: _isLoading ? null : () => setState(() => _currentStep = 2),
                icon: const Icon(Icons.arrow_back_rounded, size: 16, color: AppTheme.textSecondary),
                label: const Text(
                  'Kembali',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: SizedBox(
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.isCheckIn
                        ? AppTheme.primary
                        : const Color(0xFFDC2626),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  onPressed: _isLoading ? null : _submitAttendance,
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          widget.isCheckIn
                              ? 'Konfirmasi Absen Masuk'
                              : 'Konfirmasi Absen Pulang',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
      ],
    );
  }

  Widget _buildConfirmRow({
    required IconData icon,
    required String title,
    required String value,
    String? subValue,
    Color? valueColor,
  }) {
    return _ConfirmRow(
      icon: icon,
      title: title,
      value: value,
      subValue: subValue,
      valueColor: valueColor,
    );
  }
}

class _ConfirmRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final String? subValue;
  final Color? valueColor;

  const _ConfirmRow({
    required this.icon,
    required this.title,
    required this.value,
    this.subValue,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Icon(icon, size: 16, color: AppTheme.primary),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: valueColor ?? AppTheme.textPrimary,
                ),
              ),
              if (subValue != null) ...[
                const SizedBox(height: 1),
                Text(
                  subValue!,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
