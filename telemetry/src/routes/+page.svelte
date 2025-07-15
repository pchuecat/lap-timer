<script lang="ts">
  import L from "leaflet";

  import { onMount } from "svelte";

  let { data } = $props();

  onMount(async () => {
    const map = L.map("map", { attributionControl: false });

    var polyline = L.polyline(data.coords, {
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
  class="absolute bottom-4 left-4 w-48 z-[999] rounded-lg p-2 backdrop-blur-xs bg-zinc-600/70 text-white"
>
  test
</div>

<div id="map" class="h-full w-full"></div>
