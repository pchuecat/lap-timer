export const ssr = false

import { parseNmeaSentence } from 'nmea-simple'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const file = Bun.file('../nmea/circuito-internacional-zuera-10hz-2m.nmea')
  const lines = (await file.text()).split(/\r?\n/)

  const coords: [number, number][] = []

  for (const line of lines) {
    try {
      const packet = parseNmeaSentence(line)
      if (packet.sentenceId === 'RMC' && packet.status === 'valid') {
        coords.push([packet.latitude, packet.longitude])
      }
    } catch { }
  }

  return { coords: smoothCoords(coords) }
}

function smoothCoords(coords: [number, number][], windowSize = 5): [number, number][] {
  const smoothed: [number, number][] = []

  for (let i = 0; i < coords.length; i++) {
    let latSum = 0
    let lngSum = 0
    let count = 0

    for (let j = i - Math.floor(windowSize / 2); j <= i + Math.floor(windowSize / 2); j++) {
      if (j >= 0 && j < coords.length) {
        latSum += coords[j][0]
        lngSum += coords[j][1]
        count++
      }
    }

    smoothed.push([latSum / count, lngSum / count])
  }

  return smoothed
}
