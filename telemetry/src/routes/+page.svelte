<script lang="ts">
	import { onMount } from 'svelte'
	import { findClosestIndex } from '$lib/utils'
	import { getTrackWeight } from '$lib/track-manager'

	import Leaflet from 'leaflet'

	import type { Coord } from '$lib/types'

	let { data } = $props()

	let markers = $state<Array<Leaflet.CircleMarker>>([])
	let clickPoints = $state<Array<Coord>>([])

	function clearMarkers() {
		for (const m of markers) m.remove()
		markers.length = 0
	}

	let map = $state<Leaflet.Map>(null!)

	onMount(async () => {
		map = Leaflet.map('map', { attributionControl: false }).setView(data.track.center, data.track.defaultZoom)

		Leaflet.tileLayer('https://tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 20, maxNativeZoom: 19 }).addTo(map)

		const geojsonLayer = Leaflet.geoJSON(data.track.geojson, {
			style: (feature) => {
				switch (feature!.properties.name) {
					case 'one':
						return {
							color: '#ff0000',
							lineCap: 'round',
							lineJoin: 'round',
							weight: getTrackWeight(data.track, map.getZoom())
						}
					case 'two':
						return {
							color: '#0000ff',
							lineCap: 'round',
							lineJoin: 'round',
							weight: getTrackWeight(data.track, map.getZoom())
						}
					default:
						return {
							color: 'blue',
							lineCap: 'round',
							lineJoin: 'round',
							weight: getTrackWeight(data.track, map.getZoom())
						}
				}
			}
		}).addTo(map)

		map.fitBounds(geojsonLayer.getBounds())

		map.on('zoomend', () => geojsonLayer.setStyle({ weight: getTrackWeight(data.track, map.getZoom()) }))

		// var polyline = Leaflet.polyline(data.coords, { color: 'blue', weight: 10 }).addTo(map)
		// map.fitBounds(polyline.getBounds())

		// map.on('click', (e) => {
		// 	const point = [e.latlng.lat, e.latlng.lng] as Coord
		// 	const index = findClosestIndex(point, data.coords)

		// 	if (index === -1) {
		// 		clearMarkers()
		// 		clickPoints = []
		// 		return
		// 	}

		// 	clickPoints.push(point)

		// 	markers.push(
		// 		Leaflet.circleMarker(point, {
		// 			radius: 4,
		// 			color: 'white',
		// 			fillColor: 'red',
		// 			fillOpacity: 1
		// 		}).addTo(map)
		// 	)

		// 	if (clickPoints.length === 2) {
		// 		const [p1, p2] = clickPoints
		// 		const i1 = findClosestIndex(p1, data.coords)
		// 		const i2 = findClosestIndex(p2, data.coords)

		// 		const total = data.coords.length

		// 		if (i1 !== -1 && i2 !== -1 && Math.abs(i1 - i2) > 1) {
		// 			let sectorCoords: Coord[]

		// 			const forwardDistance = (i2 - i1 + total) % total
		// 			const backwardDistance = (i1 - i2 + total) % total

		// 			if (forwardDistance < backwardDistance) {
		// 				if (i1 < i2) {
		// 					sectorCoords = data.coords.slice(i1, i2 + 1)
		// 				} else {
		// 					sectorCoords = [...data.coords.slice(i1), ...data.coords.slice(0, i2 + 1)]
		// 				}
		// 			} else {
		// 				if (i2 < i1) {
		// 					sectorCoords = data.coords.slice(i2, i1 + 1)
		// 				} else {
		// 					sectorCoords = [...data.coords.slice(i2), ...data.coords.slice(0, i1 + 1)]
		// 				}
		// 			}

		// 			Leaflet.polyline(sectorCoords, {
		// 				color: 'lime',
		// 				weight: 10
		// 			}).addTo(map)
		// 		}

		// 		clearMarkers()
		// 		clickPoints = []
		// }
		// })
	})
</script>

<div id="map" class="h-full w-full"></div>
<div class="absolute top-4 right-4 z-[999] w-48 rounded-lg bg-zinc-600/70 p-2 text-white backdrop-blur-xs">
	<button onclick={() => alert(map?.getZoom())}>Get Current Zoom</button>
</div>
