export type TickCallback = (deltaTime: number, tickCount: number) => void;

export class TickSystem {
    private tickRate: number;
    private tickIntervalMs: number;
    private animationId?: number;
    private lastTimestamp = 0;
    private tickCount = 0;
    private callbacks: TickCallback[] = [];
    private running = false;

    constructor(tickRate: number = 60) {
        this.tickRate = tickRate;
        this.tickIntervalMs = 1000 / tickRate;
    }

    start(): void {
        if (this.running) return;
        this.running = true;
        this.lastTimestamp = performance.now();
        this.loop();
    }

    private loop = (): void => {
        if (!this.running) return;
        const now = performance.now();
        let delta = now - this.lastTimestamp;
        if (delta >= this.tickIntervalMs) {
            const ticks = Math.min(3, Math.floor(delta / this.tickIntervalMs));
            for (let i = 0; i < ticks; i++) {
                this.tickCount++;
                for (const cb of this.callbacks) {
                    cb(this.tickIntervalMs, this.tickCount);
                }
            }
            this.lastTimestamp = now - (delta % this.tickIntervalMs);
        }
        this.animationId = requestAnimationFrame(this.loop);
    };

    stop(): void {
        this.running = false;
        if (this.animationId !== undefined) {
            cancelAnimationFrame(this.animationId);
            this.animationId = undefined;
        }
    }

    onTick(callback: TickCallback): void {
        this.callbacks.push(callback);
    }

    getTickRate(): number { return this.tickRate; }
}
