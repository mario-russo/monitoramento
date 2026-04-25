<template>
  <q-page padding>
    <div style="position: relative">
      <l-map :zoom="zoom" :center="center" style="height: 500px">
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <l-marker v-if="driverPosition" :lat-lng="driverPosition" :icon="driverIcon" />
        <l-circle v-if="driverPosition" :lat-lng="driverPosition" :radius="30" />
      </l-map>

      <!-- 🔥 overlay loading -->
      <div
        v-if="!driverPosition && !gpsError"
        class="absolute-full flex flex-center bg-white"
        style="opacity: 0.8; pointer-events: none"
      >
        <div class="column items-center">
          <q-spinner size="50px" color="primary" />
          <div class="q-mt-md">Buscando localização...</div>
        </div>
      </div>

      <!-- ❌ erro -->
      <div v-if="gpsError" class="absolute-full flex flex-center bg-white" style="opacity: 0.9">
        <div class="text-center">
          <div class="text-negative text-h6">Erro ao obter GPS</div>
          <div class="text-caption">Verifique permissões de localização</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { LMap, LTileLayer, LMarker, LCircle } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import { webSocketEntrega } from 'src/services/WebSocketEntrega';

// 🗺️ mapa
const center = ref<[number, number]>([-22.826, -43.053]);
const zoom = ref(17);

// 📍 posição
const driverPosition = ref<[number, number] | null>(null);
const gpsError = ref(false);

// 🎯 ícone
const driverIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61168.png',
  iconSize: [32, 32],
});

const ENTREGADOR_ID = 1;

let watchId: number;
let lastPosition: [number, number] | null = null;
function getDistance(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);

  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const aVal = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));

  return R * c;
}

onMounted(() => {
  webSocketEntrega.connect();

  if (!navigator.geolocation) {
    gpsError.value = true;
    return;
  }
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      gpsError.value = false;

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const current: [number, number] = [lat, lng];

      driverPosition.value = current;

      // 🔥 primeira vez
      if (!lastPosition) {
        lastPosition = current;

        webSocketEntrega.sendLocation({
          entregadorId: ENTREGADOR_ID,
          latitude: lat,
          longitude: lng,
        });

        return;
      }

      // 🔥 calcula distância
      const distance = getDistance(lastPosition, current);

      // só envia se mover > 10 metros
      if (distance > 10) {
        lastPosition = current;

        webSocketEntrega.sendLocation({
          entregadorId: ENTREGADOR_ID,
          latitude: lat,
          longitude: lng,
        });

        console.log('📤 Enviado (movimento real)');
      }
    },
    (err) => {
      console.error(err);
      gpsError.value = true;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    },
  );
});

// 🧹 cleanup (IMPORTANTÍSSIMO)
onUnmounted(() => {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
});

// 🎯 centralização mais suave
watch(driverPosition, (newPos) => {
  if (!newPos) return;

  center.value = newPos; // direto (mais natural)
});
</script>
