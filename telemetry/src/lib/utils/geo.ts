import type { Coord } from "$lib/types"

const EARTH_RADIUS_METERS = 6378137

function squared(x: number) {
  return x * x
}

function toRad(x: number) {
  return (x * Math.PI) / 180.0
}

function hav(x: number) {
  return squared(Math.sin(x / 2))
}

function haversine(
  [lat1, lon1]: Coord,
  [lat2, lon2]: Coord
): number {
  const aLat = toRad(lat1)
  const bLat = toRad(lat2)
  const aLng = toRad(lon1)
  const bLng = toRad(lon2)

  const ht = hav(bLat - aLat) + Math.cos(aLat) * Math.cos(bLat) * hav(bLng - aLng)

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(ht), Math.sqrt(1 - ht))
}

export function findClosestIndex(
  point: Coord,
  coords: Coord[],
  maxDistance = 8 // default search radius in meters
): number {
  let closestIndex = -1
  let closestDist = Infinity

  for (let i = 0; i < coords.length; i++) {
    const dist = haversine(point, coords[i])
    if (dist < closestDist && dist <= maxDistance) {
      closestDist = dist
      closestIndex = i
    }
  }

  return closestIndex
}
