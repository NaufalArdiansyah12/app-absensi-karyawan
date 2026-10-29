/**
 * Hitung jarak antara dua koordinat menggunakan formula Haversine (meter).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c * 100) / 100; // Pembulatan 2 desimal
}

/**
 * Validasi apakah posisi koordinat pengguna berada dalam radius kantor.
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  officeLat: number,
  officeLng: number,
  allowedRadiusMeters: number
): { valid: boolean; distanceMeters: number } {
  const distance = calculateHaversineDistance(userLat, userLng, officeLat, officeLng);
  return {
    valid: distance <= allowedRadiusMeters,
    distanceMeters: distance,
  };
}
