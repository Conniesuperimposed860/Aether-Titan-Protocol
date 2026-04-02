import { performance } from 'perf_hooks';
import { SCS76Codec } from '../core/SCS76_Codec';
function runBenchmark(iterations = 10000) {
    const start = performance.now();
    let lastX = 0, lastY = 0, vx = 1, vy = 1;
    for (let i = 0; i < iterations; i++) {
        const x = lastX + vx;
        const y = lastY + vy;
        const encoded = SCS76Codec.encode(x, y, lastX, lastY, vx, vy, i & 0xffff, i & 0xffff, Date.now());
        const decoded = SCS76Codec.decode(encoded, { x: lastX, y: lastY }, { x: vx, y: vy }, 16.66);
        if (!decoded)
            throw new Error('decode failed');
        lastX = decoded.x;
        lastY = decoded.y;
    }
    const end = performance.now();
    console.log(`Benchmark ${iterations} iterations: ${(end - start).toFixed(2)} ms`);
}
runBenchmark();
