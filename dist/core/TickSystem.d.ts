export type TickCallback = (deltaTime: number, tickCount: number) => void;
export declare class TickSystem {
    private tickRate;
    private tickIntervalMs;
    private animationId?;
    private lastTimestamp;
    private tickCount;
    private callbacks;
    private running;
    constructor(tickRate?: number);
    start(): void;
    private loop;
    stop(): void;
    onTick(callback: TickCallback): void;
    getTickRate(): number;
}
