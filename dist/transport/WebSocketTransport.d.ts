export type MessageHandler = (data: ArrayBuffer) => void;
export declare class WebSocketTransport {
    private socket?;
    private url;
    private onMessageHandler?;
    private onOpenHandler?;
    private onCloseHandler?;
    private heartbeatInterval?;
    connect(url: string): Promise<void>;
    private startHeartbeat;
    private stopHeartbeat;
    send(data: ArrayBuffer): void;
    onMessage(handler: MessageHandler): void;
    onOpen(handler: () => void): void;
    onClose(handler: () => void): void;
    disconnect(): void;
}
