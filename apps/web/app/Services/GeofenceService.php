<?php

namespace App\Services;

class GeofenceService
{
    /**
     * Hitung jarak antara dua koordinat menggunakan formula Haversine (meter).
     */
    public static function calculateHaversineDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadiusMeters = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadiusMeters * $c, 2);
    }

    /**
     * Validasi apakah posisi koordinat pengguna berada dalam radius kantor.
     */
    public static function isWithinRadius(
        float $userLat,
        float $userLng,
        float $officeLat,
        float $officeLng,
        int $allowedRadiusMeters
    ): array {
        $distance = self::calculateHaversineDistance($userLat, $userLng, $officeLat, $officeLng);

        return [
            'valid' => $distance <= $allowedRadiusMeters,
            'distanceMeters' => $distance,
        ];
    }
}
