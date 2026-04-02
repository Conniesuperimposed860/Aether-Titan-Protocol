import { AetherManager, AetherResponse } from "../core/AetherManager";

const manager = new AetherManager();
const response: AetherResponse = {
    pos: { x: 0, y: 0 },
    metrics: { jitter: 0, buffer: 0, pendingPackets: 0, healthScore: 0 }
};

self.onmessage = (e: MessageEvent) => {
    const { entityId, buffer, localTime } = e.data;
    const ok = manager.processIntoV76(entityId, new Uint8Array(buffer), localTime, response);
    if (ok) {
        const result = new Float32Array([response.pos.x, response.pos.y]);
        self.postMessage({ entityId, pos: result, metrics: response.metrics }, [result.buffer]);
    }
};
