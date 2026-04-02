export declare class AetherSmoother {
    private history;
    private bufferMs;
    private avgDelta;
    private _jitter;
    private lastVelocity;
    private lastServerTs;
    update(x: number, y: number, serverTimestamp: number, _localTime: number): {
        x: number;
        y: number;
    };
    getJitter(): number;
    getBufferMs(): number;
    getVelocity(): {
        x: number;
        y: number;
    };
}
