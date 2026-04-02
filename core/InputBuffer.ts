export interface Input {
    seq: number;
    dx: number;
    dy: number;
    timestamp: number;
}

export class InputBuffer {
    private inputs = new Map<number, Input>();
    private maxSize = 300;

    add(input: Input): void {
        this.inputs.set(input.seq, input);
        if (this.inputs.size > this.maxSize) {
            const oldest = this.inputs.keys().next().value;
            if (oldest !== undefined) this.inputs.delete(oldest);
        }
    }

    get(seq: number): Input | undefined {
        return this.inputs.get(seq);
    }

    getRange(fromSeq: number, toSeq: number): Input[] {
        const result: Input[] = [];
        for (let s = fromSeq + 1; s <= toSeq; s++) {
            const inp = this.inputs.get(s);
            if (inp) result.push(inp);
        }
        return result;
    }

    clearUpTo(seq: number): void {
        for (const s of this.inputs.keys()) {
            if (s <= seq) this.inputs.delete(s);
        }
    }
}
