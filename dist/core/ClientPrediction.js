export class ClientPrediction {
    constructor() {
        this.history = new Map();
        this.maxHistory = 120;
    }
    applyInput(seq, dx, dy, state) {
        state.x += dx;
        state.y += dy;
        const snapshot = { x: state.x, y: state.y };
        this.history.set(seq, snapshot);
        if (this.history.size > this.maxHistory) {
            const oldest = this.history.keys().next().value;
            if (oldest !== undefined)
                this.history.delete(oldest);
        }
        return snapshot;
    }
    getState(seq) {
        return this.history.get(seq);
    }
    clearOldUpTo(seq) {
        for (const s of this.history.keys()) {
            if (s <= seq)
                this.history.delete(s);
        }
    }
}
