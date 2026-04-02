export declare class InputCodec {
    static encode(inputSeq: number, dx: number, dy: number): Uint8Array;
    static decode(buffer: Uint8Array): {
        inputSeq: number;
        dx: number;
        dy: number;
    } | null;
}
