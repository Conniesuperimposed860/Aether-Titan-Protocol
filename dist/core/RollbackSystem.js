export class RollbackSystem {
    constructor() {
        this.states = new Map();
        this.maxHistory = 120;
    }
    saveState(seq, state) {
        this.states.set(seq, { ...state });
        if (this.states.size > this.maxHistory) {
            const oldest = this.states.keys().next().value;
            if (oldest !== undefined)
                this.states.delete(oldest);
        }
    }
    rollback(toSeq) {
        const state = this.states.get(toSeq);
        return state ? { ...state } : undefined;
    }
    rollbackAndReplay(toSeq, inputs) {
        const state = this.rollback(toSeq);
        if (!state)
            return undefined;
        let current = state;
        for (const inp of inputs) {
            if (inp.seq > toSeq) {
                current.x += inp.dx;
                current.y += inp.dy;
            }
        }
        return current;
    }
    clearUpTo(seq) {
        for (const s of this.states.keys()) {
            if (s <= seq)
                this.states.delete(s);
        }
    }
}
