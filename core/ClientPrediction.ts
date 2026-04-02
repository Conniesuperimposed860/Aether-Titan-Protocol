export class ClientPrediction {
    private history = new Map<number, { x: number; y: number }>();
    private maxHistory = 120;

    applyInput(seq: number, dx: number, dy: number, state: { x: number; y: number }): { x: number; y: number } {
        state.x += dx;
        state.y += dy;
        const snapshot = { x: state.x, y: state.y };
        this.history.set(seq, snapshot);
        if (this.history.size > this.maxHistory) {
            const oldest = this.history.keys().next().value;
            if (oldest !== undefined) this.history.delete(oldest);
        }
        return snapshot;
    }

    getState(seq: number): { x: number; y: number } | undefined {
        return this.history.get(seq);
    }

    clearOldUpTo(seq: number): void {
        for (const s of this.history.keys()) {
            if (s <= seq) this.history.delete(s);
        }
    }
}
