interface Snapshot {
    x: number;
    y: number;
    serverTs: number;
}

export class AetherSmoother {
    private history: Snapshot[] = [];
    private bufferMs = 80;
    private avgDelta = 33.33;
    private _jitter = 0;
    private lastVelocity = { x: 0, y: 0 };
    private lastServerTs = 0;

    update(x: number, y: number, serverTimestamp: number, _localTime: number): { x: number; y: number } {
        if (this.lastServerTs !== 0) {
            const deltaServer = serverTimestamp - this.lastServerTs;
            this.avgDelta = this.avgDelta * 0.9 + deltaServer * 0.1;
            this._jitter = Math.abs(deltaServer - this.avgDelta);
            const target = this.avgDelta * 2 + this._jitter;
            this.bufferMs = this.bufferMs * 0.95 + target * 0.05;
            this.bufferMs = Math.min(300, Math.max(30, this.bufferMs));
        }
        this.lastServerTs = serverTimestamp;

        this.history.push({ x, y, serverTs: serverTimestamp });
        if (this.history.length > 128) this.history.shift();

        const renderTime = serverTimestamp - this.bufferMs;

        let left = 0, right = this.history.length - 1;
        while (left < right) {
            const mid = (left + right + 1) >> 1;
            if (this.history[mid].serverTs <= renderTime) left = mid;
            else right = mid - 1;
        }

        if (left < this.history.length - 1) {
            const s1 = this.history[left];
            const s2 = this.history[left + 1];
            const t = (renderTime - s1.serverTs) / (s2.serverTs - s1.serverTs);
            const clampedT = Math.max(0, Math.min(1, t));
            const dt = (s2.serverTs - s1.serverTs) / 1000;
            if (dt > 0.001) {
                this.lastVelocity = {
                    x: (s2.x - s1.x) / dt,
                    y: (s2.y - s1.y) / dt
                };
            }
            return {
                x: s1.x + (s2.x - s1.x) * clampedT,
                y: s1.y + (s2.y - s1.y) * clampedT
            };
        }

        const last = this.history[this.history.length - 1];
        const extrapDelta = (renderTime - last.serverTs) / 1000;
        if (extrapDelta > 0) {
            return {
                x: last.x + this.lastVelocity.x * extrapDelta,
                y: last.y + this.lastVelocity.y * extrapDelta
            };
        }
        return { x: last.x, y: last.y };
    }

    getJitter(): number { return Math.round(this._jitter * 100) / 100; }
    getBufferMs(): number { return Math.round(this.bufferMs); }
    getVelocity(): { x: number; y: number } { return { ...this.lastVelocity }; }
}
