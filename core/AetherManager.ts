import { SCS76Codec } from "./SCS76_Codec";
import { AetherSmoother } from "./AetherCore";

interface EntityState {
    smoother: AetherSmoother;
    lastSeq: number;
    lastUpdate: number;
    pendingPackets: Map<number, { data: Uint8Array; serverTs: number; receivedAt: number }>;
    lastPos: { x: number; y: number };
    lastVel: { x: number; y: number };
}

export interface AetherResponse {
    pos: { x: number; y: number };
    metrics: {
        jitter: number;
        buffer: number;
        pendingPackets: number;
        healthScore: number;
    };
}

export class AetherManager {
    private entities = new Map<number, EntityState>();
    private healthCoeff = { jitter: 0.5, loss: 15 };
    private maxPending = 15;
    private timeoutMultiplier = 2.5;
    private cleanupInterval?: NodeJS.Timeout;

    constructor(cleanupTimeoutMs = 10000) {
        if (typeof setInterval !== 'undefined') {
            this.cleanupInterval = setInterval(() => this.cleanup(), cleanupTimeoutMs);
        }
    }

    destroy() {
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    }

    setHealthCoefficients(jitterWeight: number, lossWeight: number) {
        this.healthCoeff = { jitter: jitterWeight, loss: lossWeight };
    }

    setReorderParams(maxPending: number, timeoutMultiplier: number) {
        this.maxPending = maxPending;
        this.timeoutMultiplier = timeoutMultiplier;
    }

    processIntoV76(
        entityId: number,
        buffer: Uint8Array,
        localTimeMs: number,
        out: AetherResponse
    ): boolean {
        let ent = this.entities.get(entityId);
        if (!ent) {
            ent = this.createNewEntity();
            this.entities.set(entityId, ent);
        }

        const deltaTimeMs = Math.max(1, localTimeMs - ent.lastUpdate);
        ent.lastUpdate = localTimeMs;

        const decoded = SCS76Codec.decode(buffer, ent.lastPos, ent.lastVel, deltaTimeMs);
        if (!decoded) return false;

        const seq = decoded.snapshotId;

        if (seq === ent.lastSeq || SCS76Codec.isOlderOrEqual(seq, ent.lastSeq)) {
            return false;
        }

        const isInOrder = seq === ((ent.lastSeq + 1) & 0xFFFF);
        let needDrain = false;

        if (isInOrder) {
            ent.lastSeq = seq;
            ent.lastPos = { x: decoded.x, y: decoded.y };
            ent.lastVel = decoded.vel;
            const pos = ent.smoother.update(decoded.x, decoded.y, decoded.ts, localTimeMs);
            out.pos.x = pos.x;
            out.pos.y = pos.y;
            needDrain = ent.pendingPackets.size > 0;
        } 
        else if (SCS76Codec.isNewer(seq, ent.lastSeq)) {
            ent.pendingPackets.set(seq, {
                data: buffer.slice(),
                serverTs: decoded.ts,
                receivedAt: Date.now()
            });
            needDrain = true;
        } 
        else {
            return false;
        }

        if (needDrain) {
            this.drainPending(ent, localTimeMs, out);
        }

        out.pos.x = ent.lastPos.x;
        out.pos.y = ent.lastPos.y;
        this.updateMetrics(ent, out);
        return true;
    }

    private createNewEntity(): EntityState {
        return {
            smoother: new AetherSmoother(),
            lastSeq: -1,
            lastUpdate: Date.now(),
            pendingPackets: new Map(),
            lastPos: { x: 0, y: 0 },
            lastVel: { x: 0, y: 0 }
        };
    }

    private drainPending(ent: EntityState, localTimeMs: number, out: AetherResponse): void {
        let nextExpected = (ent.lastSeq + 1) & 0xFFFF;
        const now = Date.now();
        const timeoutMs = ent.smoother.getBufferMs() * this.timeoutMultiplier;
        let iterations = 0;
        const MAX_ITERATIONS = 128;

        while (ent.pendingPackets.has(nextExpected) && iterations++ < MAX_ITERATIONS) {
            const pkt = ent.pendingPackets.get(nextExpected)!;

            if (now - pkt.receivedAt > timeoutMs * 1.8) {
                ent.pendingPackets.delete(nextExpected);
                nextExpected = (nextExpected + 1) & 0xFFFF;
                continue;
            }

            ent.pendingPackets.delete(nextExpected);

            const temp = SCS76Codec.decode(
                pkt.data,
                ent.lastPos,
                ent.lastVel,
                Math.max(1, localTimeMs - pkt.receivedAt)
            );

            if (temp) {
                ent.lastSeq = temp.snapshotId;
                ent.lastPos = { x: temp.x, y: temp.y };
                ent.lastVel = temp.vel;
                const pos = ent.smoother.update(temp.x, temp.y, temp.ts, localTimeMs);
                out.pos.x = pos.x;
                out.pos.y = pos.y;
            }

            nextExpected = (ent.lastSeq + 1) & 0xFFFF;
        }

        if (ent.pendingPackets.size > this.maxPending) {
            const keys = Array.from(ent.pendingPackets.keys()).sort((a, b) => a - b);
            const oldestSeq = keys[0];
            ent.lastSeq = (oldestSeq - 1) & 0xFFFF;

            const toDelete: number[] = [];
            for (const seq of ent.pendingPackets.keys()) {
                const pkt = ent.pendingPackets.get(seq)!;
                if (now - pkt.receivedAt > timeoutMs * 2) {
                    toDelete.push(seq);
                }
            }
            for (const seq of toDelete) {
                ent.pendingPackets.delete(seq);
            }
        }
    }

    private updateMetrics(ent: EntityState, out: AetherResponse): void {
        const jitter = ent.smoother.getJitter();
        const lossCount = ent.pendingPackets.size;
        let health = 100 - (jitter * this.healthCoeff.jitter) - (lossCount * this.healthCoeff.loss);
        health = Math.max(0, Math.min(100, health));

        out.metrics.jitter = jitter;
        out.metrics.buffer = ent.smoother.getBufferMs();
        out.metrics.pendingPackets = lossCount;
        out.metrics.healthScore = Math.floor(health);
    }

    private cleanup() {
        const now = Date.now();
        for (const [id, ent] of this.entities) {
            if (now - ent.lastUpdate > 15000) this.entities.delete(id);
        }
    }
}
