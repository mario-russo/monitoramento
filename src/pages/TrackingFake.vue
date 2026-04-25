<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">Entregador #1</div>

    <!-- <l-map :zoom="15" :center="center" style="height: 500px">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <l-marker :lat-lng="position" :icon="driverIcon" />
    </l-map> -->
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
// import L from 'leaflet';
import { webSocketEntrega } from 'src/services/WebSocketEntrega';

const center = ref<[number, number]>([-22.826, -43.053]);
const position = ref<[number, number]>([-22.826, -43.053]);

// const driverIcon = L.icon({
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61168.png',
//   iconSize: [32, 32],
// });

let intervalId: ReturnType<typeof setInterval> | null = null;

function gerarPosicaoAleatoria() {
  const lat = -22.826 + (Math.random() - 0.5) * 0.01;
  const lng = -43.053 + (Math.random() - 0.5) * 0.01;
  return [lat, lng] as [number, number];
}

function atualizarPosicao() {
  const novaPosicao = gerarPosicaoAleatoria();
  position.value = novaPosicao;
  center.value = novaPosicao;

  // Envia para o backend
  webSocketEntrega.sendLocation({
    entregadorId: 1,
    latitude: novaPosicao[0],
    longitude: novaPosicao[1],
  });

  console.log(`📤 Enviado: ${novaPosicao[0]}, ${novaPosicao[1]}`);
}

onMounted(() => {
  webSocketEntrega.connect();
  atualizarPosicao(); // primeira posição
  intervalId = setInterval(atualizarPosicao, 500); // 5 minutos = 300000ms
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>
