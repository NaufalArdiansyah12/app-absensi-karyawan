import 'package:flutter/material.dart';

class GpsSimulatorToggle extends StatelessWidget {
  final double lat;
  final double lng;
  final bool isInsideRadius;
  final ValueChanged<bool> onToggle;

  const GpsSimulatorToggle({
    super.key,
    required this.lat,
    required this.lng,
    required this.isInsideRadius,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Deteksi Koordinat GPS',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isInsideRadius
                      ? const Color(0xFF065F46)
                      : const Color(0xFF9F1239),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isInsideRadius
                      ? 'Dalam Radius (Valid)'
                      : 'Luar Radius (Tertolak)',
                  style: TextStyle(
                    color: isInsideRadius
                        ? const Color(0xFF6EE7B7)
                        : const Color(0xFFFDA4AF),
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Lat: ${lat.toStringAsFixed(6)} | Lng: ${lng.toStringAsFixed(6)}',
            style: const TextStyle(
              fontFamily: 'monospace',
              color: Color(0xFF94A3B8),
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFF334155)),
          const SizedBox(height: 6),
          const Text(
            'Simulasi Uji Lokasi Radius:',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 10),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isInsideRadius
                        ? const Color(0xFF16A34A)
                        : const Color(0xFF334155),
                    padding: const EdgeInsets.symmetric(vertical: 6),
                  ),
                  onPressed: () => onToggle(true),
                  child: const Text(
                    'Kantor (~5m)',
                    style: TextStyle(fontSize: 10, color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: !isInsideRadius
                        ? const Color(0xFFE11D48)
                        : const Color(0xFF334155),
                    padding: const EdgeInsets.symmetric(vertical: 6),
                  ),
                  onPressed: () => onToggle(false),
                  child: const Text(
                    'Luar (~3.5km)',
                    style: TextStyle(fontSize: 10, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
