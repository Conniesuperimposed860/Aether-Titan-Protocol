// SCS-76 Codec v0.77 - C SDK
// Minimal C API for encoding/decoding 2D snapshots with delta compression.
#pragma once

#include <cstddef>
#include <cstdint>

#ifdef _WIN32
#  ifdef SCS76_SDK_EXPORT
#    define SCS76_API __declspec(dllexport)
#  else
#    define SCS76_API __declspec(dllimport)
#  endif
#else
#  define SCS76_API __attribute__((visibility("default")))
#endif

extern "C" {

// Constants
static const uint8_t SCS76_VERSION_76 = 0x76;
static const uint8_t SCS76_VERSION_77 = 0x77;
static const uint8_t SCS76_CURRENT_VERSION = SCS76_VERSION_77;
static const uint8_t SCS76_HEADER_SIZE_V76 = 8;
static const uint8_t SCS76_HEADER_SIZE_V77 = 10;
static const float   SCS76_SCALE = 100.0f;

// Sequence helpers
SCS76_API bool scs76_is_newer(uint16_t seq, uint16_t last_seq);
SCS76_API int16_t scs76_seq_diff(uint16_t a, uint16_t b);

// Encode result: returns number of bytes written to out buffer (0 on failure)
// out_capacity must be at least 18 bytes for worst-case (10 header + 8 payload).
SCS76_API size_t scs76_encode(
    float x, float y,
    float last_x, float last_y,
    float last_vx, float last_vy,
    uint16_t snapshot_id,
    uint16_t ack_input_seq,
    uint32_t timestamp_ms,
    bool force_keyframe,
    float delta_time_ms,
    uint8_t* out,
    size_t out_capacity);

// Decode result structure
typedef struct scs76_decode_result {
    float x;
    float y;
    uint16_t snapshot_id;
    uint16_t ack_input_seq;
    uint32_t timestamp_ms;
    float vel_x;
    float vel_y;
    bool predicted_applied;
} scs76_decode_result;

// Decode buffer. Returns true on success.
SCS76_API bool scs76_decode(
    const uint8_t* data,
    size_t len,
    float last_x,
    float last_y,
    float last_vx,
    float last_vy,
    float delta_time_ms,
    scs76_decode_result* out);

} // extern "C"

