import { Input, GameState } from './RollbackSystem';
export declare class AetherReconciler {
    private reconciliation;
    private prediction;
    private rollback;
    applyLocalInput(seq: number, dx: number, dy: number, state: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    reconcile(snapshot: {
        x: number;
        y: number;
        ackInputSeq: number;
    }, state: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    replayFrom(seq: number, inputs: Input[]): GameState | undefined;
    setCorrectionFactor(factor: number): void;
    updateVisual(dt: number): void;
}
