<script lang="ts">
	import { onMount } from 'svelte'
	import { findClosestIndex } from '$lib/utils'

	import Leaflet from 'leaflet'

	let { data } = $props()

	let markers = $state<Array<Leaflet.CircleMarker>>([])
	let clickPoints = $state<Array<[number, number]>>([])

	function clearMarkers() {
		for (const m of markers) m.remove()
		markers.length = 0
	}

	onMount(async () => {
		const map = Leaflet.map('map', { attributionControl: false })

		var polyline = Leaflet.polyline(data.coords, { color: 'blue', weight: 10 }).addTo(map)

		Leaflet.tileLayer('https://tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 20, maxNativeZoom: 19 }).addTo(map)

		map.fitBounds(polyline.getBounds())

		map.on('click', (e) => {
			const point: [number, number] = [e.latlng.lat, e.latlng.lng]
			const index = findClosestIndex(point, data.coords)

			if (index === -1) {
				clearMarkers()
				clickPoints = []
				return
			}

			clickPoints.push(point)

			// Draw marker and keep track of it
			const marker = Leaflet.circleMarker(point, {
				radius: 4,
				color: 'white',
				fillColor: 'red',
				fillOpacity: 1
			}).addTo(map)
			markers.push(marker)

			if (clickPoints.length === 2) {
				const [p1, p2] = clickPoints
				const i1 = findClosestIndex(p1, data.coords)
				const i2 = findClosestIndex(p2, data.coords)

				if (i1 !== -1 && i2 !== -1 && Math.abs(i1 - i2) > 1) {
					const sectorStart = Math.min(i1, i2)
					const sectorEnd = Math.max(i1, i2)
					const sectorCoords = data.coords.slice(sectorStart, sectorEnd + 1)

					Leaflet.polyline(sectorCoords, {
						color: 'lime',
						weight: 10
					}).addTo(map)
				}

				clearMarkers()
				clickPoints = []
			}
		})
	})
</script>

<div id="map" class="h-full w-full"></div>
<div class="absolute top-4 right-4 z-[999] w-48 rounded-lg bg-zinc-600/70 p-2 text-white backdrop-blur-xs">test</div>
