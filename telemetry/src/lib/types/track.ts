import type { Coord } from "./geo"
import type { GeoJsonObject } from 'geojson'

type ZoomWeightMap = Record<string, number>

export type Track = {
  id: string
  label: string
  geojson: GeoJsonObject
  center: Coord
  defaultZoom: number
  zoomWeightMap: ZoomWeightMap
}

export type RawTrack = Omit<Track, 'geojson'> & { geojson: string }