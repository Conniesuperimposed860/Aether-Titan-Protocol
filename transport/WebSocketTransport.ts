export type MessageHandler = (data: ArrayBuffer) => void;

export class WebSocketTransport {
    private socket?: WebSocket;
    private url = "";
    private onMessageHandler?: MessageHandler;
    private onOpenHandler?: () => void;
    private onCloseHandler?: () => void;
    private heartbeatInterval?: NodeJS.Timeout;

    async connect(url: string): Promise<void> {
        this.url = url;
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(url);
            this.socket.binaryType = 'arraybuffer';
            this.socket.onopen = () => {
                this.startHeartbeat();
                if (this.onOpenHandler) this.onOpenHandler();
                resolve();
            };
            this.socket.onerror = (err) => reject(err);
            this.socket.onmessage = (event) => {
                if (this.onMessageHandler && event.data instanceof ArrayBuffer) {
                    this.onMessageHandler(event.data);
                }
            };
            this.socket.onclose = () => {
                this.stopHeartbeat();
                if (this.onCloseHandler) this.onCloseHandler();
            };
        });
    }

    private startHeartbeat(intervalMs = 5000) {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(new Uint8Array([0x01]));
            }
        }, intervalMs);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    }

    send(data: ArrayBuffer): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        }
    }

    onMessage(handler: MessageHandler) { this.onMessageHandler = handler; }
    onOpen(handler: () => void) { this.onOpenHandler = handler; }
    onClose(handler: () => void) { this.onCloseHandler = handler; }

    disconnect(): void {
        this.stopHeartbeat();
        this.socket?.close();
    }
}
