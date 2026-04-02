export declare class DeterministicRandom {
    private seed;
    constructor(seed?: number);
    next(): number;
    nextRange(min: number, max: number): number;
}
