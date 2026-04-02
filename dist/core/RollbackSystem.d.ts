export interface GameState {
    x: number;
    y: number;
    vx: number;
    vy: number;
}
export interface Input {
    seq: number;
    dx: number;
    dy: number;
}
export declare class RollbackSystem {
    private states;
    private maxHistory;
    saveState(seq: number, state: GameState): void;
    rollback(toSeq: number): GameState | undefined;
    rollbackAndReplay(toSeq: number, inputs: Input[]): GameState | undefined;
    clearUpTo(seq: number): void;
}
