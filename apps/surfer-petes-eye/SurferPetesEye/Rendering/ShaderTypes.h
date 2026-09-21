// Shared between the Metal shaders and Swift (through BridgingHeader.h).
// Keep this file plain C: no Swift, no Metal-only types.
#ifndef ShaderTypes_h
#define ShaderTypes_h

#include <simd/simd.h>

// Upper bound on tagged regions the shader will light up in one frame.
#define PETE_MAX_HOTSPOTS 8

// How the raw camera buffer maps to the screen. Mirrors FrameOrientation.
#define PETE_FRAME_UPRIGHT 0
#define PETE_FRAME_BACK_PORTRAIT 1
#define PETE_FRAME_FRONT_PORTRAIT 2

// A region Pete has named. Rects are view-normalized, origin top-left.
typedef struct {
    simd_float4 rect;   // x, y, width, height in 0..1 view space
    simd_float4 tint;   // rgb tint, a = strength 0..1
} PeteHotspot;

typedef struct {
    simd_float2 resolution;   // drawable size in pixels
    simd_float2 textureSize;  // raw camera texture size in pixels (may be landscape)
    float time;               // seconds since the renderer woke up
    float intensity;          // 0 = plain camera, 1 = full Pete
    float motion;             // 0..1 device motion energy; the world sloshes when you move
    float kaleido;            // 0..1 kaleidoscope fold (Wipeout mood)
    float drift;              // multiplier on the flow warp
    int hotspotCount;         // valid entries in the hotspot buffer
    int frameOrientation;     // PETE_FRAME_* above
    simd_float2 frameSize;    // camera frame size as shown, upright, in pixels
    simd_float4 sun;          // xy = sun position in view space, z = warmth, w = glow
    simd_float4 paletteA;     // mood colors, rgb + unused
    simd_float4 paletteB;
    simd_float4 paletteC;
    simd_float4 paletteD;
} PeteUniforms;

#endif
