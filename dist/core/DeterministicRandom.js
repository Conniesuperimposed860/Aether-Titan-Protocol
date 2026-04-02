export class DeterministicRandom {
    constructor(seed = Date.now()) {
        this.seed = seed >>> 0;
    }
    next() {
        // xorshift32
        let x = this.seed;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        this.seed = x >>> 0;
        return this.seed / 0xffffffff;
    }
    nextRange(min, max) {
        return min + this.next() * (max - min);
    }
}
