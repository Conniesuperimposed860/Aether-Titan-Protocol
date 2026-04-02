export class InputBuffer {
    constructor() {
        this.inputs = new Map();
        this.maxSize = 300;
    }
    add(input) {
        this.inputs.set(input.seq, input);
        if (this.inputs.size > this.maxSize) {
            const oldest = this.inputs.keys().next().value;
            if (oldest !== undefined)
                this.inputs.delete(oldest);
        }
    }
    get(seq) {
        return this.inputs.get(seq);
    }
    getRange(fromSeq, toSeq) {
        const result = [];
        for (let s = fromSeq + 1; s <= toSeq; s++) {
            const inp = this.inputs.get(s);
            if (inp)
                result.push(inp);
        }
        return result;
    }
    clearUpTo(seq) {
        for (const s of this.inputs.keys()) {
            if (s <= seq)
                this.inputs.delete(s);
        }
    }
}
