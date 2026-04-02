export class WebRTCTransport {
    constructor() {
        this.connected = false;
    }
    async connect(_offer) {
        // TODO: implement WebRTC handshake
        this.connected = true;
        if (this.onOpenHandler)
            this.onOpenHandler();
    }
    send(_data) {
        if (!this.connected)
            return;
        // TODO: send via data channel
    }
    onMessage(handler) { this.onMessageHandler = handler; }
    onOpen(handler) { this.onOpenHandler = handler; }
    onClose(handler) { this.onCloseHandler = handler; }
    disconnect() {
        this.connected = false;
        if (this.onCloseHandler)
            this.onCloseHandler();
    }
}
