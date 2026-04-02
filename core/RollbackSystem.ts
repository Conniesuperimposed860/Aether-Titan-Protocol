export interface GameState {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export interface Input {
    seq: number;
    dx: number;
    dy: number;
}

export class RollbackSystem {
    private states = new Map<number, GameState>();
    private maxHistory = 120;

    saveState(seq: number, state: GameState): void {
        this.states.set(seq, { ...state });
        if (this.states.size > this.maxHistory) {
            const oldest = this.states.keys().next().value;
            if (oldest !== undefined) this.states.delete(oldest);
        }
    }

    rollback(toSeq: number): GameState | undefined {
        const state = this.states.get(toSeq);
        return state ? { ...state } : undefined;
    }

    rollbackAndReplay(toSeq: number, inputs: Input[]): GameState | undefined {
        const state = this.rollback(toSeq);
        if (!state) return undefined;
        let current = state;
        for (const inp of inputs) {
            if (inp.seq > toSeq) {
                current.x += inp.dx;
                current.y += inp.dy;
            }
        }
        return current;
    }

    clearUpTo(seq: number): void {
        for (const s of this.states.keys()) {
            if (s <= seq) this.states.delete(s);
        }
    }
}
