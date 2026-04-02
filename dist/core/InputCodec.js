export class InputCodec {
    static encode(inputSeq, dx, dy) {
        const scale = 10;
        let dxScaled = Math.max(-128, Math.min(127, Math.round(dx * scale)));
        let dyScaled = Math.max(-128, Math.min(127, Math.round(dy * scale)));
        const buf = new Uint8Array(4);
        buf[0] = inputSeq & 0xFF;
        buf[1] = (inputSeq >> 8) & 0xFF;
        buf[2] = dxScaled & 0xFF;
        buf[3] = dyScaled & 0xFF;
        return buf;
    }
    static decode(buffer) {
        if (buffer.length < 4)
            return null;
        const inputSeq = (buffer[1] << 8) | buffer[0];
        let dx = buffer[2];
        let dy = buffer[3];
        if (dx >= 128)
            dx -= 256;
        if (dy >= 128)
            dy -= 256;
        const scale = 10;
        return { inputSeq, dx: dx / scale, dy: dy / scale };
    }
}
