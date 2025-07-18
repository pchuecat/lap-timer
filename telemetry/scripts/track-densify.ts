import type { FeatureCollection, Position, Feature } from "geojson"

const EARTH_RADIUS_METERS = 6371e3

function squared(x: number) {
  return x * x
}

function toRad(x: number) {
  return (x * Math.PI) / 180.0
}

function hav(x: number) {
  return squared(Math.sin(x / 2))
}

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 *
 * @param {[number, number]} pointA - The first point [latitude, longitude]
 * @param {[number, number]} pointB - The second point [latitude, longitude]
 * @returns {number} - Distance in meters between the two points
 */
function haversine([lat1, lon1]: Position, [lat2, lon2]: Position): number {
  const aLat = toRad(lat1)
  const bLat = toRad(lat2)
  const aLng = toRad(lon1)
  const bLng = toRad(lon2)

  const ht = hav(bLat - aLat) + Math.cos(aLat) * Math.cos(bLat) * hav(bLng - aLng)
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(ht), Math.sqrt(1 - ht))
}

/**
 * Linearly interpolates a point between two coordinates.
 *
 * @param {Position} a - Start point [lat, lng]
 * @param {Position} b - End point [lat, lng]
 * @param {number} t - Interpolation factor (0 <= t <= 1)
 * @returns {Position} - Interpolated point
 */
function interpolatePoints(a: Position, b: Position, t: number): Position {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ]
}

/**
 * Adds intermediate points between each pair of coordinates in a path
 * so that no two consecutive points are more than `maxDistance` meters apart.
 *
 * Useful for increasing the resolution of a race track so users can
 * select sectors precisely between densely placed points.
 *
 * @param {Position[]} coords - Array of [lat, lng] coordinates forming a path
 * @param {number} [maxDistance=5] - Maximum allowed distance between any two points (in meters)
 * @returns {Position[]} - A new array of coordinates with densified points
 */
function densifyPath(coords: Position[], maxDistance: number = 5): Position[] {
  const result: Position[] = []

  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i]
    const b = coords[i + 1]

    result.push(a)

    const dist = haversine(a, b)
    const numPoints = Math.floor(dist / maxDistance)

    for (let j = 1; j < numPoints; j++) {
      result.push(interpolatePoints(a, b, j / numPoints))
    }
  }

  result.push(coords[coords.length - 1])

  return result
}

/**
 * Main function: reads input GeoJSON file, densifies LineStrings,
 * and saves output to a new file with `-densified.geojson` suffix.
 */
async function main() {
  const inputPath = Bun.argv[2]

  if (!inputPath) {
    console.error("❌ Please provide the input GeoJSON file path.")
    process.exit(1)
  }

  const geoFile = Bun.file(inputPath)
  const geojson = await geoFile.json() as FeatureCollection

  const features: Feature[] = geojson.features.map(feature => {
    if (feature.geometry.type !== "LineString") return feature

    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: densifyPath(feature.geometry.coordinates, 2) // ≤ 2 meters apart,
      }
    }
  })

  const outputPath = inputPath.replace(/\.geojson$/i, "-densified.geojson")

  await Bun.write(outputPath, JSON.stringify({ ...geojson, features }, null, 2))

  return outputPath
}

main()
  .then(path => console.log(`✅ Densified GeoJSON saved to: ${path}`))
  .catch(console.error)