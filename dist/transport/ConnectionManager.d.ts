import { WebSocketTransport } from './WebSocketTransport';
export declare enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTING = 1,
    CONNECTED = 2,
    RECONNECTING = 3,
    FAILED = 4
}
export declare class ConnectionManager {
    private state;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private baseDelay;
    private reconnectTimer?;
    private transport;
    private url;
    constructor(transport: WebSocketTransport);
    connect(url: string): Promise<void>;
    private scheduleReconnect;
    getState(): ConnectionState;
    disconnect(): void;
}
