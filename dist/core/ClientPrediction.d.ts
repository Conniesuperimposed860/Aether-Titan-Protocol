export declare class ClientPrediction {
    private history;
    private maxHistory;
    applyInput(seq: number, dx: number, dy: number, state: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    getState(seq: number): {
        x: number;
        y: number;
    } | undefined;
    clearOldUpTo(seq: number): void;
}
