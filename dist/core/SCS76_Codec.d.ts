export declare class SCS76Codec {
    static readonly VERSION_76 = 118;
    static readonly VERSION_77 = 119;
    static readonly CURRENT_VERSION = 119;
    static readonly HEADER_SIZE_V76 = 8;
    static readonly HEADER_SIZE_V77 = 10;
    static readonly SCALE = 100;
    static isNewer(seq: number, lastSeq: number): boolean;
    static seqDiff(a: number, b: number): number;
    static encode(x: number, y: number, lastX: number, lastY: number, lastVx: number, lastVy: number, snapshotId: number, ackInputSeq: number, timestamp: number, forceKeyframe?: boolean, deltaTimeMs?: number): Uint8Array;
    static decode(buffer: Uint8Array, lastPos: {
        x: number;
        y: number;
    }, lastVel: {
        x: number;
        y: number;
    }, deltaTimeMs?: number): {
        x: number;
        y: number;
        snapshotId: number;
        ackInputSeq: number;
        ts: number;
        vel: {
            x: number;
            y: number;
        };
    } | null;
}
