import { Reconciliation } from './Reconciliation';
import { ClientPrediction } from './ClientPrediction';
import { RollbackSystem, Input, GameState } from './RollbackSystem';

export class AetherReconciler {
    private reconciliation = new Reconciliation();
    private prediction = new ClientPrediction();
    private rollback = new RollbackSystem();

    applyLocalInput(seq: number, dx: number, dy: number, state: { x: number; y: number }): { x: number; y: number } {
        const predicted = this.prediction.applyInput(seq, dx, dy, state);
        this.rollback.saveState(seq, { x: predicted.x, y: predicted.y, vx: dx, vy: dy });
        return predicted;
    }

    reconcile(snapshot: { x: number; y: number; ackInputSeq: number }, state: { x: number; y: number }): { x: number; y: number } {
        const predicted = this.prediction.getState(snapshot.ackInputSeq) ?? state;
        const corrected = this.reconciliation.reconcile({ x: snapshot.x, y: snapshot.y }, predicted);
        this.prediction.clearOldUpTo(snapshot.ackInputSeq);
        this.rollback.clearUpTo(snapshot.ackInputSeq);
        return corrected;
    }

    replayFrom(seq: number, inputs: Input[]): GameState | undefined {
        return this.rollback.rollbackAndReplay(seq, inputs);
    }

    setCorrectionFactor(factor: number) {
        this.reconciliation.setCorrectionFactor(factor);
    }

    updateVisual(dt: number) {
        this.reconciliation.updateVisual(dt);
    }
}
