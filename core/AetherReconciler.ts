interface PendingInput {
    seq: number;
    dx: number;
    dy: number;
}

export class AetherReconciler {
    private pendingInputs: PendingInput[] = [];

    predict(inputSeq: number, dx: number, dy: number, currentPos: { x: number; y: number }): { x: number; y: number } {
        this.pendingInputs.push({ seq: inputSeq, dx, dy });
        return { x: currentPos.x + dx, y: currentPos.y + dy };
    }

    reconcile(serverPos: { x: number; y: number }, serverSeq: number): { x: number; y: number } {
        this.pendingInputs = this.pendingInputs.filter(p => p.seq > serverSeq);
        let reconciled = { ...serverPos };
        for (const inp of this.pendingInputs) {
            reconciled.x += inp.dx;
            reconciled.y += inp.dy;
        }
        return reconciled;
    }
}
