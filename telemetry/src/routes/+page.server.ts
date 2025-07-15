export const ssr = false

import { parseNmeaSentence } from 'nmea-simple';

import type { PageServerLoad } from './$types';

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

  console.log(coords.length)

  return { coords }
}