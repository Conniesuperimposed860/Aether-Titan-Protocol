import { WebSocketServer } from 'ws';
import { SCS76Codec } from '../core/SCS76_Codec';
import { InputCodec } from '../core/InputCodec';
class RealGameServer {
    constructor(port = 8080) {
        this.players = new Map();
        this.nextPlayerId = 1;
        this.simulationHz = 60;
        this.inputMaxDelta = 10;
        const wss = new WebSocketServer({ port });
        console.log(`Server running on ws://localhost:${port}`);
        wss.on('connection', (ws) => {
            const id = this.nextPlayerId++;
            this.players.set(id, { id, ws, x: 0, y: 0, vx: 0, vy: 0, lastInputSeq: 0 });
            ws.on('message', (data) => this.handleInput(id, data));
            ws.on('close', () => this.players.delete(id));
        });
        this.snapshotInterval = setInterval(() => this.broadcastSnapshots(), 1000 / 20);
    }
    handleInput(playerId, raw) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        const decoded = InputCodec.decode(new Uint8Array(raw));
        if (!decoded)
            return;
        const { inputSeq, dx, dy } = decoded;
        if (Math.abs(dx) > this.inputMaxDelta || Math.abs(dy) > this.inputMaxDelta) {
            console.warn(`Cheat? player ${playerId} dx=${dx} dy=${dy}`);
            return;
        }
        player.vx = dx * 5;
        player.vy = dy * 5;
        player.x += player.vx / this.simulationHz;
        player.y += player.vy / this.simulationHz;
        player.lastInputSeq = inputSeq;
    }
    broadcastSnapshots() {
        for (const player of this.players.values()) {
            const snapshotId = Date.now() & 0xFFFF;
            const ackInputSeq = player.lastInputSeq;
            const timestamp = Date.now();
            const snapshot = SCS76Codec.encode(player.x, player.y, player.x - player.vx / this.simulationHz, player.y - player.vy / this.simulationHz, player.vx, player.vy, snapshotId, ackInputSeq, timestamp);
            player.ws.send(snapshot);
        }
    }
}
new RealGameServer(8080);
