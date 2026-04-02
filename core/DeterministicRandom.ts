export class DeterministicRandom {
    private seed: number;

    constructor(seed: number = Date.now()) {
        this.seed = seed >>> 0;
    }

    next(): number {
        // xorshift32
        let x = this.seed;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        this.seed = x >>> 0;
        return this.seed / 0xffffffff;
    }

    nextRange(min: number, max: number): number {
        return min + this.next() * (max - min);
    }
}
