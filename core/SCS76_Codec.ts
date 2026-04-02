export class SCS76Codec {
    static readonly VERSION_76 = 0x76;
    static readonly VERSION_77 = 0x77;
    static readonly CURRENT_VERSION = this.VERSION_77;
    static readonly HEADER_SIZE_V76 = 8;
    static readonly HEADER_SIZE_V77 = 10;
    static readonly SCALE = 100.0;

    static isNewer(seq: number, lastSeq: number): boolean {
        const diff = (seq - lastSeq) & 0xFFFF;
        return diff !== 0 && diff < 0x8000;
    }

    static seqDiff(a: number, b: number): number {
        let diff = (a - b) & 0xFFFF;
        if (diff >= 0x8000) diff -= 0x10000;
        return diff;
    }

    static isOlderOrEqual(seq: number, lastSeq: number): boolean {
        return !this.isNewer(seq, lastSeq);
    }

    static encode(
        x: number, y: number,
        lastX: number, lastY: number,
        lastVx: number, lastVy: number,
        snapshotId: number,
        ackInputSeq: number,
        timestamp: number,
        forceKeyframe: boolean = false,
        deltaTimeMs: number = 16.66
    ): Uint8Array {
        const isKeyframe = forceKeyframe || (snapshotId % 30 === 0);
        let mode = 0;
        let dx = x - lastX;
        let dy = y - lastY;
        let predicted = false;

        const factor = Math.min(2.0, Math.max(0.5, deltaTimeMs / 16.66));
        const predX = lastX + lastVx * factor;
        const predY = lastY + lastVy * factor;
        const predDx = x - predX;
        const predDy = y - predY;

        if (Math.abs(predDx) + Math.abs(predDy) < Math.abs(dx) + Math.abs(dy)) {
            dx = predDx;
            dy = predDy;
            predicted = true;
        }

        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        const velMag = Math.hypot(lastVx, lastVy);
        const zeroThreshold = velMag < 0.1 ? 0.02 : 0.005;

        if (isKeyframe) mode = 0;
        else if (adx < zeroThreshold && ady < zeroThreshold) mode = 3;
        else if (adx < 1.27 && ady < 1.27) mode = 2;
        else if (adx < 327.67 && ady < 327.67) mode = 1;
        else mode = 0;

        let flags = mode & 0x03;
        if (predicted) flags |= 0x04;
        if (isKeyframe) flags |= 0x08;

        const header = new Uint8Array(this.HEADER_SIZE_V77);
        header[0] = this.CURRENT_VERSION;
        header[1] = flags;
        header[2] = snapshotId & 0xFF;
        header[3] = (snapshotId >> 8) & 0xFF;
        header[4] = ackInputSeq & 0xFF;
        header[5] = (ackInputSeq >> 8) & 0xFF;
        header[6] = timestamp & 0xFF;
        header[7] = (timestamp >> 8) & 0xFF;
        header[8] = (timestamp >> 16) & 0xFF;
        header[9] = (timestamp >> 24) & 0xFF;

        let payload: Uint8Array;
        switch (mode) {
            case 0:
                payload = new Uint8Array(8);
                new DataView(payload.buffer).setFloat32(0, x, true);
                new DataView(payload.buffer).setFloat32(4, y, true);
                break;
            case 1:
                payload = new Uint8Array(4);
                let vdx = Math.max(-32768, Math.min(32767, Math.round(dx * this.SCALE)));
                let vdy = Math.max(-32768, Math.min(32767, Math.round(dy * this.SCALE)));
                new DataView(payload.buffer).setInt16(0, vdx, true);
                new DataView(payload.buffer).setInt16(2, vdy, true);
                break;
            case 2:
                payload = new Uint8Array(2);
                let vdx8 = Math.max(-128, Math.min(127, Math.round(dx * this.SCALE)));
                let vdy8 = Math.max(-128, Math.min(127, Math.round(dy * this.SCALE)));
                payload[0] = vdx8 & 0xFF;
                payload[1] = vdy8 & 0xFF;
                break;
            default:
                payload = new Uint8Array(0);
        }

        const result = new Uint8Array(this.HEADER_SIZE_V77 + payload.length);
        result.set(header);
        result.set(payload, this.HEADER_SIZE_V77);
        return result;
    }

    static decode(
        buffer: Uint8Array,
        lastPos: { x: number; y: number },
        lastVel: { x: number; y: number },
        deltaTimeMs: number = 16.66
    ): { x: number; y: number; snapshotId: number; ackInputSeq: number; ts: number; vel: { x: number; y: number } } | null {
        if (buffer.length < 8) return null;
        const version = buffer[0];
        if (version !== this.VERSION_76 && version !== this.VERSION_77) return null;
        const headerSize = version === this.VERSION_76 ? this.HEADER_SIZE_V76 : this.HEADER_SIZE_V77;
        if (buffer.length < headerSize) return null;

        const flags = buffer[1];
        const mode = flags & 0x03;
        const predicted = !!(flags & 0x04);
        const snapshotId = (buffer[3] << 8) | buffer[2];
        let ackInputSeq = snapshotId;
        let ts = 0;

        if (version === this.VERSION_76) {
            ts = (buffer[4] | (buffer[5] << 8) | (buffer[6] << 16) | (buffer[7] << 24)) >>> 0;
        } else {
            ackInputSeq = (buffer[5] << 8) | buffer[4];
            ts = (buffer[6] | (buffer[7] << 8) | (buffer[8] << 16) | (buffer[9] << 24)) >>> 0;
        }

        let payloadSize = 0;
        switch (mode) {
            case 0: payloadSize = 8; break;
            case 1: payloadSize = 4; break;
            case 2: payloadSize = 2; break;
            case 3: payloadSize = 0; break;
            default: return null;
        }
        if (buffer.length < headerSize + payloadSize) return null;

        let x = lastPos.x, y = lastPos.y;
        const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        if (predicted) {
            const factor = Math.min(2.0, Math.max(0.5, deltaTimeMs / 16.66));
            x += lastVel.x * factor;
            y += lastVel.y * factor;
        }

        switch (mode) {
            case 0:
                x = dv.getFloat32(headerSize, true);
                y = dv.getFloat32(headerSize + 4, true);
                break;
            case 1:
                x += dv.getInt16(headerSize, true) / this.SCALE;
                y += dv.getInt16(headerSize + 2, true) / this.SCALE;
                break;
            case 2:
                x += dv.getInt8(headerSize) / this.SCALE;
                y += dv.getInt8(headerSize + 1) / this.SCALE;
                break;
        }

        const dxVel = x - lastPos.x;
        const dyVel = y - lastPos.y;
        const vel = { x: dxVel * 0.7 + lastVel.x * 0.3, y: dyVel * 0.7 + lastVel.y * 0.3 };
        return { x, y, snapshotId, ackInputSeq, ts, vel };
    }
}
