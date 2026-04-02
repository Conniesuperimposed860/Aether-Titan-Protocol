export type MessageHandler = (data: ArrayBuffer) => void;

export class WebRTCTransport {
    // Minimal stub for future WebRTC data channel transport
    private onMessageHandler?: MessageHandler;
    private onOpenHandler?: () => void;
    private onCloseHandler?: () => void;
    private connected = false;

    async connect(_offer?: RTCSessionDescriptionInit): Promise<void> {
        // TODO: implement WebRTC handshake
        this.connected = true;
        if (this.onOpenHandler) this.onOpenHandler();
    }

    send(_data: ArrayBuffer): void {
        if (!this.connected) return;
        // TODO: send via data channel
    }

    onMessage(handler: MessageHandler) { this.onMessageHandler = handler; }
    onOpen(handler: () => void) { this.onOpenHandler = handler; }
    onClose(handler: () => void) { this.onCloseHandler = handler; }

    disconnect(): void {
        this.connected = false;
        if (this.onCloseHandler) this.onCloseHandler();
    }
}
