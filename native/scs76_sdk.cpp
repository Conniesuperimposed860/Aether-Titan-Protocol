#define SCS76_SDK_EXPORT
#include "scs76_sdk.h"

#include <cmath>
#include <cstring>

static inline float clampf(float v, float lo, float hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}

bool scs76_is_newer(uint16_t seq, uint16_t last_seq) {
    uint16_t diff = static_cast<uint16_t>(seq - last_seq);
    return diff != 0 && diff < 0x8000;
}

int16_t scs76_seq_diff(uint16_t a, uint16_t b) {
    int16_t diff = static_cast<int16_t>(a - b);
    if (diff >= 0x8000) diff -= 0x10000;
    return diff;
}

size_t scs76_encode(
    float x, float y,
    float last_x, float last_y,
    float last_vx, float last_vy,
    uint16_t snapshot_id,
    uint16_t ack_input_seq,
    uint32_t timestamp_ms,
    bool force_keyframe,
    float delta_time_ms,
    uint8_t* out,
    size_t out_capacity)
{
    if (!out || out_capacity < SCS76_HEADER_SIZE_V77) return 0;

    const bool is_keyframe = force_keyframe || (snapshot_id % 30 == 0);
    int mode = 0;
    float dx = x - last_x;
    float dy = y - last_y;
    bool predicted = false;

    const float factor = clampf(delta_time_ms / 16.66f, 0.5f, 2.0f);
    const float pred_x = last_x + last_vx * factor;
    const float pred_y = last_y + last_vy * factor;
    const float pred_dx = x - pred_x;
    const float pred_dy = y - pred_y;

    if (std::fabs(pred_dx) + std::fabs(pred_dy) < std::fabs(dx) + std::fabs(dy)) {
        dx = pred_dx;
        dy = pred_dy;
        predicted = true;
    }

    const float adx = std::fabs(dx);
    const float ady = std::fabs(dy);
    const float vel_mag = std::hypot(last_vx, last_vy);
    const float zero_threshold = vel_mag < 0.1f ? 0.02f : 0.005f;

    if (is_keyframe) mode = 0;
    else if (adx < zero_threshold && ady < zero_threshold) mode = 3;
    else if (adx < 1.27f && ady < 1.27f) mode = 2;
    else if (adx < 327.67f && ady < 327.67f) mode = 1;
    else mode = 0;

    uint8_t flags = static_cast<uint8_t>(mode & 0x03);
    if (predicted) flags |= 0x04;
    if (is_keyframe) flags |= 0x08;

    size_t payload_size = 0;
    switch (mode) {
        case 0: payload_size = 8; break;
        case 1: payload_size = 4; break;
        case 2: payload_size = 2; break;
        case 3: payload_size = 0; break;
    }

    const size_t total_size = SCS76_HEADER_SIZE_V77 + payload_size;
    if (out_capacity < total_size) return 0;

    // Header
    out[0] = SCS76_CURRENT_VERSION;
    out[1] = flags;
    out[2] = static_cast<uint8_t>(snapshot_id & 0xFF);
    out[3] = static_cast<uint8_t>((snapshot_id >> 8) & 0xFF);
    out[4] = static_cast<uint8_t>(ack_input_seq & 0xFF);
    out[5] = static_cast<uint8_t>((ack_input_seq >> 8) & 0xFF);
    out[6] = static_cast<uint8_t>(timestamp_ms & 0xFF);
    out[7] = static_cast<uint8_t>((timestamp_ms >> 8) & 0xFF);
    out[8] = static_cast<uint8_t>((timestamp_ms >> 16) & 0xFF);
    out[9] = static_cast<uint8_t>((timestamp_ms >> 24) & 0xFF);

    // Payload
    uint8_t* payload = out + SCS76_HEADER_SIZE_V77;
    switch (mode) {
        case 0: {
            if (payload_size >= 8) {
                std::memcpy(payload, &x, 4);
                std::memcpy(payload + 4, &y, 4);
            }
            break;
        }
        case 1: {
            int16_t vdx = static_cast<int16_t>(std::round(clampf(dx * SCS76_SCALE, -32768.0f, 32767.0f)));
            int16_t vdy = static_cast<int16_t>(std::round(clampf(dy * SCS76_SCALE, -32768.0f, 32767.0f)));
            std::memcpy(payload, &vdx, 2);
            std::memcpy(payload + 2, &vdy, 2);
            break;
        }
        case 2: {
            int8_t vdx8 = static_cast<int8_t>(std::round(clampf(dx * SCS76_SCALE, -128.0f, 127.0f)));
            int8_t vdy8 = static_cast<int8_t>(std::round(clampf(dy * SCS76_SCALE, -128.0f, 127.0f)));
            std::memcpy(payload, &vdx8, 1);
            std::memcpy(payload + 1, &vdy8, 1);
            break;
        }
        case 3:
        default:
            break;
    }

    return total_size;
}

bool scs76_decode(
    const uint8_t* data,
    size_t len,
    float last_x,
    float last_y,
    float last_vx,
    float last_vy,
    float delta_time_ms,
    scs76_decode_result* out)
{
    if (!data || !out || len < 8) return false;
    const uint8_t version = data[0];
    if (version != SCS76_VERSION_76 && version != SCS76_VERSION_77) return false;

    const size_t header_size = (version == SCS76_VERSION_76) ? SCS76_HEADER_SIZE_V76 : SCS76_HEADER_SIZE_V77;
    if (len < header_size) return false;

    const uint8_t flags = data[1];
    const uint8_t mode = flags & 0x03;
    const bool predicted = (flags & 0x04) != 0;

    const uint16_t snapshot_id = static_cast<uint16_t>(data[2] | (data[3] << 8));
    uint16_t ack_input_seq = snapshot_id;
    uint32_t ts = 0;

    if (version == SCS76_VERSION_76) {
        ts = static_cast<uint32_t>(data[4] | (data[5] << 8) | (data[6] << 16) | (data[7] << 24));
    } else {
        ack_input_seq = static_cast<uint16_t>(data[4] | (data[5] << 8));
        ts = static_cast<uint32_t>(data[6] | (data[7] << 8) | (data[8] << 16) | (data[9] << 24));
    }

    size_t payload_size = 0;
    switch (mode) {
        case 0: payload_size = 8; break;
        case 1: payload_size = 4; break;
        case 2: payload_size = 2; break;
        case 3: payload_size = 0; break;
        default: return false;
    }
    if (len < header_size + payload_size) return false;

    float x = last_x;
    float y = last_y;
    if (predicted) {
        const float factor = clampf(delta_time_ms / 16.66f, 0.5f, 2.0f);
        x += last_vx * factor;
        y += last_vy * factor;
    }

    const uint8_t* payload = data + header_size;
    switch (mode) {
        case 0: {
            std::memcpy(&x, payload, 4);
            std::memcpy(&y, payload + 4, 4);
            break;
        }
        case 1: {
            int16_t vdx, vdy;
            std::memcpy(&vdx, payload, 2);
            std::memcpy(&vdy, payload + 2, 2);
            x += static_cast<float>(vdx) / SCS76_SCALE;
            y += static_cast<float>(vdy) / SCS76_SCALE;
            break;
        }
        case 2: {
            int8_t vdx = *reinterpret_cast<const int8_t*>(payload);
            int8_t vdy = *reinterpret_cast<const int8_t*>(payload + 1);
            x += static_cast<float>(vdx) / SCS76_SCALE;
            y += static_cast<float>(vdy) / SCS76_SCALE;
            break;
        }
        case 3:
        default:
            break;
    }

    const float dx_vel = x - last_x;
    const float dy_vel = y - last_y;
    out->vel_x = dx_vel * 0.7f + last_vx * 0.3f;
    out->vel_y = dy_vel * 0.7f + last_vy * 0.3f;
    out->x = x;
    out->y = y;
    out->snapshot_id = snapshot_id;
    out->ack_input_seq = ack_input_seq;
    out->timestamp_ms = ts;
    out->predicted_applied = predicted;
    return true;
}

