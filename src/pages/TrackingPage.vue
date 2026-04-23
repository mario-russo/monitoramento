<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">Rastreamento de Entrega</div>

    <l-map :zoom="zoom" :center="center" style="height: 500px">
      <!-- Mapa base -->
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <!-- Entregador -->
      <l-marker :lat-lng="driverPosition" :icon="driverIcon" />
      <l-circle :lat-lng="driverPosition" :radius="30" />

      <!-- Cliente -->
      <!-- <l-marker :lat-lng="clientPosition" :icon="clientIcon" /> -->
    </l-map>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { LMap, LTileLayer, LMarker, LCircle } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';

// 📍 Centro inicial
const center = ref<[number, number]>([-22.826, -43.053]);
const zoom = ref(17);

// 📦 Cliente (fixo)
// const clientPosition = ref<[number, number]>([-22.836, -43.063]);

// 🛵 Entregador
const driverPosition = ref<[number, number]>([-22.826, -43.053]);

// 🛵 você (entregador)
const driverIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61168.png', // ícone diferente
  iconSize: [32, 32],
});

// // 🏠 cliente
// const clientIcon = L.icon({
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
//   iconSize: [32, 32],
// });

// 📡 GPS REAL
onMounted(() => {
  if (!navigator.geolocation) {
    console.error('Geolocalização não suportada');
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      driverPosition.value = [lat, lng];
    },
    (err) => {
      console.error(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    },
  );
});

// 🎯 Centraliza mapa no entregador
watch(driverPosition, (newPos) => {
  center.value = [(center.value[0] + newPos[0]) / 2, (center.value[1] + newPos[1]) / 2];
});
</script>

<style scoped></style>
