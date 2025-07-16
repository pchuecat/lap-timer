import type { GeoJsonObject } from 'geojson'
import type { RawTrack, Track } from "./types"

export class TrackManager {
  private tracks = new Map<string, Track>()

  constructor(tracks: Track[]) {
    for (const track of tracks) {
      this.tracks.set(track.id, track)
    }
  }

  static async init(path: string): Promise<TrackManager> {
    const file = Bun.file(path)
    const rawTracks = await file.json() as RawTrack[]

    const tracks = await Promise.all(
      rawTracks.map(async (raw): Promise<Track> => {
        const geoFile = Bun.file(raw.geojson)
        const geojson = await geoFile.json() as GeoJsonObject

        return { ...raw, geojson }
      })
    )

    return new TrackManager(tracks)
  }

  getTrack(id: string): Track {
    return this.tracks.get(id)!
  }

  getAll(): Track[] {
    return Array.from(this.tracks.values())
  }
}

export function getTrackWeight(track: Track, zoom: number): number {
  return track.zoomWeightMap[zoom.toString()] ?? 2
}