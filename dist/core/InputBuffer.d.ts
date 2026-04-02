export interface Input {
    seq: number;
    dx: number;
    dy: number;
    timestamp: number;
}
export declare class InputBuffer {
    private inputs;
    private maxSize;
    add(input: Input): void;
    get(seq: number): Input | undefined;
    getRange(fromSeq: number, toSeq: number): Input[];
    clearUpTo(seq: number): void;
}
