export class WebSocketTransport {
    constructor() {
        this.url = "";
    }
    async connect(url) {
        this.url = url;
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(url);
            this.socket.binaryType = 'arraybuffer';
            this.socket.onopen = () => {
                this.startHeartbeat();
                if (this.onOpenHandler)
                    this.onOpenHandler();
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
                if (this.onCloseHandler)
                    this.onCloseHandler();
            };
        });
    }
    startHeartbeat(intervalMs = 5000) {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(new Uint8Array([0x01]));
            }
        }, intervalMs);
    }
    stopHeartbeat() {
        if (this.heartbeatInterval)
            clearInterval(this.heartbeatInterval);
    }
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        }
    }
    onMessage(handler) { this.onMessageHandler = handler; }
    onOpen(handler) { this.onOpenHandler = handler; }
    onClose(handler) { this.onCloseHandler = handler; }
    disconnect() {
        this.stopHeartbeat();
        this.socket?.close();
    }
}
