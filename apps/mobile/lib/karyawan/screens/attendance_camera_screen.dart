import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../widgets/attendance/camera_preview_box.dart';
import '../widgets/attendance/gps_simulator_toggle.dart';

class AttendanceCameraScreen extends StatefulWidget {
  const AttendanceCameraScreen({super.key});

  @override
  State<AttendanceCameraScreen> createState() => _AttendanceCameraScreenState();
}

class _AttendanceCameraScreenState extends State<AttendanceCameraScreen> {
  double _lat = -6.175392;
  double _lng = 106.827153;
  bool _isInsideRadius = true;
  bool _isLoading = false;
  String? _statusMessage;
  bool _isError = false;

  final String _mockPhoto =
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

  void _toggleGpsLocation(bool inside) {
    setState(() {
      _isInsideRadius = inside;
      if (inside) {
        _lat = -6.175392;
        _lng = 106.827153;
      } else {
        _lat = -6.205000;
        _lng = 106.850000;
      }
    });
  }

  Future<void> _submitAttendance(bool isCheckIn) async {
    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    try {
      if (isCheckIn) {
        final att = await ApiService.checkIn(_lat, _lng, _mockPhoto);
        setState(() {
          _isError = false;
          _statusMessage =
              'Check-in Berhasil! Status: ${att.status} (Jarak: ${att.checkInDistanceMeters.toStringAsFixed(1)}m)';
        });
      } else {
        final att = await ApiService.checkOut(_lat, _lng, _mockPhoto);
        setState(() {
          _isError = false;
          _statusMessage =
              'Check-out Berhasil! Jam: ${att.checkOutTime} (Lembur: ${att.overtimeMinutes} mnt)';
        });
      }
    } catch (e) {
      setState(() {
        _isError = true;
        _statusMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text(
          'Presensi Swafoto & GPS',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              CameraPreviewBox(
                photoUrl: _mockPhoto,
                isInsideRadius: _isInsideRadius,
              ),
              const SizedBox(height: 16),
              GpsSimulatorToggle(
                lat: _lat,
                lng: _lng,
                isInsideRadius: _isInsideRadius,
                onToggle: _toggleGpsLocation,
              ),
              const SizedBox(height: 16),
              if (_statusMessage != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: _isError
                        ? const Color(0xFFFFF1F2)
                        : const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: _isError
                          ? const Color(0xFFFECDD3)
                          : const Color(0xFFA7F3D0),
                    ),
                  ),
                  child: Text(
                    _statusMessage!,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: _isError
                          ? const Color(0xFFBE123C)
                          : const Color(0xFF065F46),
                    ),
                  ),
                ),
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed:
                            _isLoading ? null : () => _submitAttendance(true),
                        child: const Text(
                          'Absen Masuk (Check-In)',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0284C7),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed:
                            _isLoading ? null : () => _submitAttendance(false),
                        child: const Text(
                          'Absen Pulang (Check-Out)',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
