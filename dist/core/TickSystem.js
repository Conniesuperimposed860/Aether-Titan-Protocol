export class TickSystem {
    constructor(tickRate = 60) {
        this.lastTimestamp = 0;
        this.tickCount = 0;
        this.callbacks = [];
        this.running = false;
        this.loop = () => {
            if (!this.running)
                return;
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
        this.tickRate = tickRate;
        this.tickIntervalMs = 1000 / tickRate;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.lastTimestamp = performance.now();
        this.loop();
    }
    stop() {
        this.running = false;
        if (this.animationId !== undefined) {
            cancelAnimationFrame(this.animationId);
            this.animationId = undefined;
        }
    }
    onTick(callback) {
        this.callbacks.push(callback);
    }
    getTickRate() { return this.tickRate; }
}
