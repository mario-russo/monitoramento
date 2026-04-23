<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">Rastreamento de Entrega</div>

    <l-map :zoom="zoom" :center="center" style="height: 500px">
      <!-- Mapa base -->
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <!-- Entregador -->
      <l-marker :lat-lng="driverPosition" :icon="driverIcon" />

      <!-- Cliente -->
      <l-marker :lat-lng="clientPosition" :icon="clientIcon" />
    </l-map>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';

// 📍 Centro inicial (São Gonçalo)
const center = ref<[number, number]>([-22.826, -43.053]);
const zoom = ref(13);

// 📦 Posição do cliente (fixa)
const clientPosition = ref<[number, number]>([-22.836, -43.063]);

// 🛵 Posição do entregador (dinâmica)
const driverPosition = ref<[number, number]>([-22.826, -43.053]);

// 🎯 Ícone do entregador
const driverIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
  iconSize: [32, 32],
});

// 🏠 Ícone do cliente
const clientIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
});

// 🔄 Simulação de movimento do entregador
onMounted(() => {
  setInterval(() => {
    driverPosition.value = [
      driverPosition.value[0] + (Math.random() - 0.5) * 0.001,
      driverPosition.value[1] + (Math.random() - 0.5) * 0.001,
    ];
  }, 2000);
});

// 🎯 Centraliza o mapa no entregador
watch(driverPosition, (newPos) => {
  center.value = newPos;
});
</script>

<style scoped></style>
