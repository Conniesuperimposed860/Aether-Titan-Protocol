export class Reconciliation {
    private correctionFactor = 0.25;
    private visualError = { x: 0, y: 0 };

    setCorrectionFactor(factor: number) {
        this.correctionFactor = Math.max(0, Math.min(1, factor));
    }

    reconcile(serverState: { x: number; y: number }, predictedState: { x: number; y: number }): { x: number; y: number } {
        const errorX = serverState.x - predictedState.x;
        const errorY = serverState.y - predictedState.y;
        const correctionX = errorX * this.correctionFactor;
        const correctionY = errorY * this.correctionFactor;
        this.visualError.x += correctionX;
        this.visualError.y += correctionY;
        return {
            x: predictedState.x + this.visualError.x,
            y: predictedState.y + this.visualError.y
        };
    }

    updateVisual(deltaTime: number): void {
        const decay = Math.pow(0.95, deltaTime / 16);
        this.visualError.x *= decay;
        this.visualError.y *= decay;
    }

    reset() {
        this.visualError = { x: 0, y: 0 };
    }
}
