<script lang="ts">
  import L from "leaflet";

  import { onMount } from "svelte";

  let { data } = $props();

  function smoothCoords(
    coords: [number, number][],
    windowSize = 5,
  ): [number, number][] {
    const smoothed: [number, number][] = [];

    for (let i = 0; i < coords.length; i++) {
      let latSum = 0;
      let lngSum = 0;
      let count = 0;

      for (
        let j = i - Math.floor(windowSize / 2);
        j <= i + Math.floor(windowSize / 2);
        j++
      ) {
        if (j >= 0 && j < coords.length) {
          latSum += coords[j][0];
          lngSum += coords[j][1];
          count++;
        }
      }

      smoothed.push([latSum / count, lngSum / count]);
    }

    return smoothed;
  }

  onMount(async () => {
    const map = L.map("map", { attributionControl: false });
    const smoothed = smoothCoords(data.coords);

    var polyline = L.polyline(smoothed, {
      color: "blue",
      weight: 10,
    }).addTo(map);

    L.tileLayer("https://tile.osm.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      maxNativeZoom: 19,
    }).addTo(map);

    map.fitBounds(polyline.getBounds());
  });
</script>

<div
  class="absolute bottom-4 left-4 w-48 z-[999] rounded-lg p-2 backdrop-blur-xs bg-zinc-600/70 border border-white/20 text-white"
>
  test
</div>

<div id="map" class="h-full w-full"></div>
