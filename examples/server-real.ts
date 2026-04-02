import { WebSocketServer } from 'ws';
import { SCS76Codec } from '../core/SCS76_Codec';
import { InputCodec } from '../core/InputCodec';

interface Player {
    id: number;
    ws: any;
    x: number; y: number;
    vx: number; vy: number;
    lastInputSeq: number;
}

const players = new Map<number, Player>();
const wss = new WebSocketServer({ port: 8080 });

console.log("🚀 Servidor Aether-Titan v9.1.0 ONLINE em ws://localhost:8080");

wss.on('connection', (ws) => {
    const id = Math.floor(Math.random() * 1000);
    players.set(id, { id, ws, x: 400, y: 300, vx: 0, vy: 0, lastInputSeq: 0 });

    ws.on('message', (data: Buffer) => {
        const player = players.get(id);
        if (!player) return;

        const input = InputCodec.decode(new Uint8Array(data));
        if (input) {
            player.x += input.dx;
            player.y += input.dy;
            player.lastInputSeq = input.inputSeq;
        }
    });

    ws.on('close', () => players.delete(id));
});

// Broadcast de Snapshots (20 FPS)
setInterval(() => {
    const ts = Date.now();
    players.forEach(player => {
        const packet = SCS76Codec.encode(
            player.x, player.y, 
            player.x, player.y, 
            0, 0, 
            ts & 0xFFFF, player.lastInputSeq, ts
        );
        player.ws.send(packet);
    });
}, 50);
