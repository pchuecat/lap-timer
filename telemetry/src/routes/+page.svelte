<script lang="ts">
	import L from 'leaflet'

	import { onMount } from 'svelte'

	let { data } = $props()

	onMount(async () => {
		const map = L.map('map', { attributionControl: false })

		var polyline = L.polyline(data.coords, { color: 'blue', weight: 10 }).addTo(map)

		L.tileLayer('https://tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 20, maxNativeZoom: 19 }).addTo(map)

		map.fitBounds(polyline.getBounds())
	})
</script>

<div class="absolute bottom-4 left-4 z-[999] w-48 rounded-lg bg-zinc-600/70 p-2 text-white backdrop-blur-xs">test</div>

<div id="map" class="h-full w-full"></div>
