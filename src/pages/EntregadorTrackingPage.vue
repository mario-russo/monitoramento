<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">Rastreamento de Entrega (ID: {{ entregadorId }})</div>

    <l-map :zoom="zoom" :center="center" style="height: 500px">
      <!-- Mapa base -->
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <!-- Entregador -->
      <l-marker v-if="driverPosition" :lat-lng="driverPosition" :icon="driverIcon" />
      <l-circle v-if="driverPosition" :lat-lng="driverPosition" :radius="30" />
    </l-map>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { LMap, LTileLayer, LMarker, LCircle } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import { webSocketEntrega } from 'src/services/WebSocketEntrega';

// 📍 rota reativa
const route = useRoute();
const entregadorId = ref(Number(route.params.id));

// 🗺️ mapa
const center = ref<[number, number]>([-22.826, -43.053]);
const zoom = ref(17);
const driverPosition = ref<[number, number]>([-22.826, -43.053]);

// 🎯 ícone
const driverIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61168.png',
  iconSize: [32, 32],
});

onMounted(() => {
  webSocketEntrega.connect();
  webSocketEntrega.subscribe(entregadorId.value);
});

watch(
  () => route.params.id,
  (newId) => {
    const id = Number(newId);
    entregadorId.value = id;

    webSocketEntrega.subscribe(id);
    console.log('🔄 Mudou para entregador:', id);
  },
);

watch(webSocketEntrega.location, (loc) => {
  if (!loc) return;

  if (loc.entregadorId === entregadorId.value) {
    driverPosition.value = [loc.latitude, loc.longitude];
  }
});

// 🎯 centraliza mapa
watch(driverPosition, (newPos) => {
  center.value = [(center.value[0] + newPos[0]) / 2, (center.value[1] + newPos[1]) / 2];
});
</script>

<style scoped></style>
