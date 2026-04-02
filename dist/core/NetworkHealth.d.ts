export declare class NetworkHealth {
    private static readonly MAX_JITTER_MS;
    private static readonly MAX_LATENCY_MS;
    private static readonly MAX_LOSS;
    static compute(metrics: {
        jitter: number;
        loss: number;
        latency: number;
    }): number;
    static getHealthLevel(health: number): 'critical' | 'warning' | 'good' | 'excellent';
}
