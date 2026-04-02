import { parentPort } from 'worker_threads';
// Basic web-worker bridge placeholder
parentPort?.on('message', (data) => {
    // echo for now; replace with game simulation logic
    parentPort?.postMessage(data);
});
