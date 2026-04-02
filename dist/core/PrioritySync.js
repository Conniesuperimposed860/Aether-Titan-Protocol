export class PrioritySync {
    constructor() {
        this.priorities = new Map();
    }
    setPriority(id, priority) {
        this.priorities.set(id, priority);
    }
    getPriority(id) {
        return this.priorities.get(id) ?? 0;
    }
    serialize() {
        const entries = Array.from(this.priorities.entries());
        const buf = new Uint8Array(entries.length * 6);
        const view = new DataView(buf.buffer);
        entries.forEach(([id, p], i) => {
            view.setUint32(i * 6, i, true);
            view.setInt16(i * 6 + 4, Math.round(p * 100), true);
        });
        return buf;
    }
}
