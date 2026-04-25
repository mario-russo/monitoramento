import { ref } from 'vue';

export interface Localizacao {
  entregadorId: number;
  latitude: number;
  longitude: number;
}

class WebSocketEntrega {
  private socket: WebSocket | null = null;
  private isConnecting = false;
  private messageQueue: string[] = [];
  private url: string = import.meta.env.VITE_WS_URL
    ? `${import.meta.env.VITE_WS_URL}/ws/localizacao`
    : 'ws://localhost:8080/ws/localizacao';

  public location = ref<Localizacao | null>(null);

  connect() {
    if (this.socket || this.isConnecting) return;

    this.isConnecting = true;

    const WS_URL = this.url;

    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log('🟢 WS conectado');
      this.isConnecting = false;

      // envia fila
      this.messageQueue.forEach((msg) => {
        this.socket?.send(msg);
      });
      this.messageQueue = [];
    };

    this.socket.onmessage = (event) => {
      try {
        const data: Localizacao = JSON.parse(event.data);
        this.location.value = data;
      } catch (e) {
        console.error('Erro ao parsear:', e);
      }
    };

    this.socket.onerror = (err) => {
      console.error('Erro WS:', err);
    };

    this.socket.onclose = () => {
      console.log('🔴 WS desconectado');
      this.socket = null;
      this.isConnecting = false;

      setTimeout(() => this.connect(), 2000);
    };
  }

  subscribe(entregadorId: number) {
    const message = JSON.stringify({
      tipo: 'subscribe',
      entregadorId,
    });

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  // 🔥 NOVO MÉTODO (ESSENCIAL)
  sendLocation(data: Localizacao) {
    const message = JSON.stringify(data);

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }
}

export const webSocketEntrega = new WebSocketEntrega();
