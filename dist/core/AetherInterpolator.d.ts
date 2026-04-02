export interface TimedSnapshot {
    x: number;
    y: number;
    timestampMs: number;
}
export declare class AetherInterpolator {
    private buffer;
    private interpolationDelayMs;
    setDelay(delayMs: number): void;
    push(snapshot: TimedSnapshot): void;
    getInterpolated(nowLocalMs: number): {
        x: number;
        y: number;
    } | null;
    clear(): void;
}
