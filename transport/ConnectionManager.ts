import { WebSocketTransport } from './WebSocketTransport';

export enum ConnectionState {
    DISCONNECTED, CONNECTING, CONNECTED, RECONNECTING, FAILED
}

export class ConnectionManager {
    private state = ConnectionState.DISCONNECTED;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private baseDelay = 1000;
    private reconnectTimer?: NodeJS.Timeout;
    private transport: WebSocketTransport;
    private url = "";

    constructor(transport: WebSocketTransport) {
        this.transport = transport;
    }

    async connect(url: string): Promise<void> {
        this.url = url;
        this.state = ConnectionState.CONNECTING;
        try {
            await this.transport.connect(url);
            this.state = ConnectionState.CONNECTED;
            this.reconnectAttempts = 0;
        } catch {
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.state = ConnectionState.FAILED;
            return;
        }
        this.state = ConnectionState.RECONNECTING;
        const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(this.url);
        }, delay);
    }

    getState(): ConnectionState { return this.state; }

    disconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.transport.disconnect();
        this.state = ConnectionState.DISCONNECTED;
    }
}
