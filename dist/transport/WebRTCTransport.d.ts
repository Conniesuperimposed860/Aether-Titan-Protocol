export type MessageHandler = (data: ArrayBuffer) => void;
export declare class WebRTCTransport {
    private onMessageHandler?;
    private onOpenHandler?;
    private onCloseHandler?;
    private connected;
    connect(_offer?: RTCSessionDescriptionInit): Promise<void>;
    send(_data: ArrayBuffer): void;
    onMessage(handler: MessageHandler): void;
    onOpen(handler: () => void): void;
    onClose(handler: () => void): void;
    disconnect(): void;
}
