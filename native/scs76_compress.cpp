#include <cstdint>
#include <cstring>
#include <cmath>

#define SCS_API __attribute__((visibility("default")))
#define VERSION 0x76
#define SCALE 100.0f

inline void write_uint32(uint8_t* p, uint32_t v) {
    p[0] = v & 0xFF;
    p[1] = (v >> 8) & 0xFF;
    p[2] = (v >> 16) & 0xFF;
    p[3] = (v >> 24) & 0xFF;
}

extern "C" {
    SCS_API int scs76_encode(
        float x, float y,
        float lastX, float lastY,
        float lastVx, float lastVy,
        uint16_t seq, uint32_t ts,
        uint8_t forceKeyframe,
        float deltaTimeMs,
        uint8_t* output, uint32_t max_out
    ) {
        int isKeyframe = forceKeyframe || (seq % 30 == 0);
        float dx = x - lastX;
        float dy = y - lastY;
        int predicted = 0;

        float safeDelta = (deltaTimeMs > 0.001f) ? deltaTimeMs : 16.66f;
        float factor = fmaxf(0.5f, fminf(2.0f, safeDelta / 16.66f));

        float predX = lastX + lastVx * factor;
        float predY = lastY + lastVy * factor;
        float predDx = x - predX;
        float predDy = y - predY;

        if (fabsf(predDx) + fabsf(predDy) < fabsf(dx) + fabsf(dy)) {
            dx = predDx;
            dy = predDy;
            predicted = 1;
        }

        int mode = 0;
        float adx = fabsf(dx);
        float ady = fabsf(dy);
        float velMag = sqrtf(lastVx * lastVx + lastVy * lastVy);
        float zeroThreshold = velMag < 0.1f ? 0.02f : 0.005f;

        if (isKeyframe) mode = 0;
        else if (adx < zeroThreshold && ady < zeroThreshold) mode = 3;
        else if (adx < 1.27f && ady < 1.27f) mode = 2;
        else if (adx < 327.67f && ady < 327.67f) mode = 1;
        else mode = 0;

        uint8_t flags = mode & 0x03;
        if (predicted) flags |= 0x04;
        if (isKeyframe) flags |= 0x08;

        uint8_t header[8];
        header[0] = VERSION;
        header[1] = flags;
        header[2] = seq & 0xFF;
        header[3] = (seq >> 8) & 0xFF;
        header[4] = ts & 0xFF;
        header[5] = (ts >> 8) & 0xFF;
        header[6] = (ts >> 16) & 0xFF;
        header[7] = (ts >> 24) & 0xFF;

        uint32_t payloadSize = 0;
        uint8_t payload[8] = {0};

        switch (mode) {
            case 0: {
                payloadSize = 8;
                uint32_t xi, yi;
                memcpy(&xi, &x, 4);
                memcpy(&yi, &y, 4);
                write_uint32(payload, xi);
                write_uint32(payload + 4, yi);
                break;
            }
            case 1: {
                payloadSize = 4;
                float qx = roundf(dx * SCALE);
                float qy = roundf(dy * SCALE);
                qx = fmaxf(-32768.0f, fminf(32767.0f, qx));
                qy = fmaxf(-32768.0f, fminf(32767.0f, qy));
                int16_t idx = (int16_t)qx;
                int16_t idy = (int16_t)qy;
                memcpy(payload, &idx, 2);
                memcpy(payload + 2, &idy, 2);
                break;
            }
            case 2: {
                payloadSize = 2;
                float qx = roundf(dx * SCALE);
                float qy = roundf(dy * SCALE);
                qx = fmaxf(-128.0f, fminf(127.0f, qx));
                qy = fmaxf(-128.0f, fminf(127.0f, qy));
                int8_t dbx = (int8_t)qx;
                int8_t dby = (int8_t)qy;
                payload[0] = static_cast<uint8_t>(dbx);
                payload[1] = static_cast<uint8_t>(dby);
                break;
            }
            case 3:
                payloadSize = 0;
                break;
        }

        if (max_out < 8 + payloadSize) return -1;
        memcpy(output, header, 8);
        if (payloadSize > 0) memcpy(output + 8, payload, payloadSize);
        return 8 + payloadSize;
    }
}
