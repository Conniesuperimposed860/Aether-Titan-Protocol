import { Reconciliation } from './Reconciliation';
import { ClientPrediction } from './ClientPrediction';
import { RollbackSystem } from './RollbackSystem';
export class AetherReconciler {
    constructor() {
        this.reconciliation = new Reconciliation();
        this.prediction = new ClientPrediction();
        this.rollback = new RollbackSystem();
    }
    applyLocalInput(seq, dx, dy, state) {
        const predicted = this.prediction.applyInput(seq, dx, dy, state);
        this.rollback.saveState(seq, { x: predicted.x, y: predicted.y, vx: dx, vy: dy });
        return predicted;
    }
    reconcile(snapshot, state) {
        const predicted = this.prediction.getState(snapshot.ackInputSeq) ?? state;
        const corrected = this.reconciliation.reconcile({ x: snapshot.x, y: snapshot.y }, predicted);
        this.prediction.clearOldUpTo(snapshot.ackInputSeq);
        this.rollback.clearUpTo(snapshot.ackInputSeq);
        return corrected;
    }
    replayFrom(seq, inputs) {
        return this.rollback.rollbackAndReplay(seq, inputs);
    }
    setCorrectionFactor(factor) {
        this.reconciliation.setCorrectionFactor(factor);
    }
    updateVisual(dt) {
        this.reconciliation.updateVisual(dt);
    }
}
