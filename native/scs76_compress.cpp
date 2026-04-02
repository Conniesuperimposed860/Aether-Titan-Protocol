// Placeholder native compression shim for SCS-76 codec.
#include <cstdint>

extern "C" {
    void scs76_compress(const float* /*x*/, const float* /*y*/, uint8_t* /*out*/, int /*count*/) {
        // TODO: implement SIMD compression
    }
}
