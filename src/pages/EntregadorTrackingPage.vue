<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">Rastreamento de Entrega (ID: {{ entregadorId }})</div>

    <l-map :zoom="zoom" :center="center" style="height: 500px">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <l-marker v-if="driverPosition" :lat-lng="driverPosition" :icon="driverIcon" />
      <l-circle v-if="driverPosition" :lat-lng="driverPosition" :radius="30" />
    </l-map>

    <!-- Debug - Remove depois que funcionar -->
    <div class="q-mt-md q-pa-md bg-grey-2 rounded-borders">
      <div class="text-caption">
        <div>
          ✅ WS Location: {{ webSocketEntrega.location.value ? 'Recebido' : 'Aguardando...' }}
        </div>
        <div v-if="webSocketEntrega.location.value">
          📍 Lat: {{ webSocketEntrega.location.value.latitude }}, Lng:
          {{ webSocketEntrega.location.value.longitude }}
        </div>
        <div>
          🎯 Driver Position:
          {{
            driverPosition
              ? driverPosition[0].toFixed(6) + ', ' + driverPosition[1].toFixed(6)
              : 'null'
          }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { LMap, LTileLayer, LMarker, LCircle } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import { webSocketEntrega } from 'src/services/WebSocketEntrega';

const route = useRoute();
const entregadorId = ref(Number(route.params.id));

const center = ref<[number, number]>([-22.826, -43.053]);
const zoom = ref(17);
const driverPosition = ref<[number, number] | null>(null); // ⚠️ Começa como null, não com valor fixo

const driverIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61168.png',
  iconSize: [32, 32],
});

// ✅ CORREÇÃO PRINCIPAL: Observar o .value do ref
watch(
  () => webSocketEntrega.location.value, // <--- IMPORTANTE: .value
  (novaLocalizacao) => {
    console.log('🔍 Watch detectou mudança:', novaLocalizacao);

    if (!novaLocalizacao) {
      console.log('⚠️ Nenhuma localização ainda');
      return;
    }

    console.log(
      `📊 Comparando: recebido=${novaLocalizacao.entregadorId}, esperado=${entregadorId.value}`,
    );

    if (novaLocalizacao.entregadorId === entregadorId.value) {
      console.log('✅ Match! Atualizando mapa');
      const novaPos: [number, number] = [novaLocalizacao.latitude, novaLocalizacao.longitude];
      driverPosition.value = novaPos;
      center.value = novaPos; // Centraliza diretamente
    } else {
      console.log('❌ IDs não batem, ignorando');
    }
  },
  { deep: true }, // Opcional: observa mudanças profundas
);

// Monitora mudança no ID da rota
watch(
  () => route.params.id,
  (novoId) => {
    const id = Number(novoId);
    console.log(`🔄 Entregador mudou para: ${id}`);
    entregadorId.value = id;
    driverPosition.value = null; // Reseta posição
    webSocketEntrega.subscribe(id); // Inscreve no novo entregador
  },
);

onMounted(() => {
  console.log('🚀 Componente montado');
  console.log(`📡 Inscrevendo no entregador: ${entregadorId.value}`);

  webSocketEntrega.connect();
  webSocketEntrega.subscribe(entregadorId.value);
});
</script>

<style scoped></style>
