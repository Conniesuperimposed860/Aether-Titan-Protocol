export interface TimedSnapshot {
    x: number;
    y: number;
    timestampMs: number;
}

export class AetherInterpolator {
    private buffer: TimedSnapshot[] = [];
    private interpolationDelayMs = 80;

    setDelay(delayMs: number) { this.interpolationDelayMs = delayMs; }

    push(snapshot: TimedSnapshot): void {
        this.buffer.push(snapshot);
        while (this.buffer.length > 50) this.buffer.shift();
    }

    getInterpolated(nowLocalMs: number): { x: number; y: number } | null {
        if (this.buffer.length < 2) return null;
        const renderTime = nowLocalMs - this.interpolationDelayMs;
        let idx = this.buffer.findIndex(s => s.timestampMs >= renderTime);
        if (idx === -1) idx = this.buffer.length - 2;
        if (idx < 0) idx = 0;
        const s1 = this.buffer[idx];
        const s2 = this.buffer[idx + 1];
        const t = (renderTime - s1.timestampMs) / (s2.timestampMs - s1.timestampMs);
        const clampedT = Math.max(0, Math.min(1, t));
        return {
            x: s1.x + (s2.x - s1.x) * clampedT,
            y: s1.y + (s2.y - s1.y) * clampedT
        };
    }

    clear() { this.buffer = []; }
}
