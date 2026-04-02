export declare class Reconciliation {
    private correctionFactor;
    private visualError;
    setCorrectionFactor(factor: number): void;
    reconcile(serverState: {
        x: number;
        y: number;
    }, predictedState: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    updateVisual(deltaTime: number): void;
    reset(): void;
}
