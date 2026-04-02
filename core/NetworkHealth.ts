export class NetworkHealth {
    private static readonly MAX_JITTER_MS = 100;
    private static readonly MAX_LATENCY_MS = 500;
    private static readonly MAX_LOSS = 20;

    static compute(metrics: { jitter: number; loss: number; latency: number }): number {
        const jitterNorm = Math.min(1, metrics.jitter / this.MAX_JITTER_MS);
        const latencyNorm = Math.min(1, metrics.latency / this.MAX_LATENCY_MS);
        const lossNorm = Math.min(1, metrics.loss / this.MAX_LOSS);
        let health = 100 - (jitterNorm * 50) - (lossNorm * 30) - (latencyNorm * 20);
        return Math.max(0, Math.min(100, Math.floor(health)));
    }

    static getHealthLevel(health: number): 'critical' | 'warning' | 'good' | 'excellent' {
        if (health < 20) return 'critical';
        if (health < 40) return 'warning';
        if (health < 70) return 'good';
        return 'excellent';
    }
}
