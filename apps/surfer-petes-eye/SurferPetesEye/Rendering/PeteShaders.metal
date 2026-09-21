// Surfer Pete's eye, as two fragment passes.
//
// Pass 1 (peteFieldFragment) runs at postcard resolution and computes all
// the noise that makes the world move: the flow field, the ripple phase and
// the band phase. Pass 2 (peteFragment) runs at screen resolution, samples
// that field once, and does the rest with texture reads and cheap math.
// Splitting it this way is what keeps the phone cool: fractal noise is the
// expensive part and it is far too smooth to need computing per pixel.
//
// `intensity` fades the whole thing back to a plain camera.

#include <metal_stdlib>
#include "ShaderTypes.h"
using namespace metal;

struct PeteVertexOut {
    float4 position [[position]];
    float2 uv;
};

// One oversized triangle covers the drawable. No vertex buffer needed.
vertex PeteVertexOut peteVertex(uint vid [[vertex_id]]) {
    const float2 corners[3] = { float2(-1.0, -1.0), float2(3.0, -1.0), float2(-1.0, 3.0) };
    float2 c = corners[vid];
    PeteVertexOut out;
    out.position = float4(c, 0.0, 1.0);
    out.uv = float2(c.x * 0.5 + 0.5, 0.5 - c.y * 0.5); // origin top-left, like the camera texture
    return out;
}

// ---------------------------------------------------------------------------
// Noise
// ---------------------------------------------------------------------------

static float hash21(float2 p) {
    p = fract(p * float2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

static float vnoise(float2 p) {
    float2 i = floor(p);
    float2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + float2(1.0, 0.0));
    float c = hash21(i + float2(0.0, 1.0));
    float d = hash21(i + float2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian motion. Four octaves is enough for water at postcard size.
static float fbm(float2 p) {
    float v = 0.0;
    float amp = 0.5;
    const float2x2 rot = float2x2(float2(0.8, 0.6), float2(-0.6, 0.8));
    for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p = rot * p * 2.0 + 17.3;
        amp *= 0.5;
    }
    return v;
}

// ---------------------------------------------------------------------------
// Color and coordinate helpers
// ---------------------------------------------------------------------------

static float3 rgb2hsv(float3 c) {
    float4 K = float4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    float4 p = mix(float4(c.bg, K.wz), float4(c.gb, K.xy), step(c.b, c.g));
    float4 q = mix(float4(p.xyw, c.r), float4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return float3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

static float3 hsv2rgb(float3 c) {
    float4 K = float4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    float3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

static float luma(float3 c) {
    return dot(c, float3(0.299, 0.587, 0.114));
}

// Map a view uv (0..1 over the drawable) to an upright frame uv so the frame
// covers the view, cropping the long side. FrameGeometry.swift does the same
// math in reverse for the overlay.
static float2 aspectFillUV(float2 viewUV, float2 res, float2 frame) {
    float viewAspect = res.x / res.y;
    float frameAspect = frame.x / frame.y;
    float2 scale = (frameAspect > viewAspect)
        ? float2(viewAspect / frameAspect, 1.0)
        : float2(1.0, frameAspect / viewAspect);
    return (viewUV - 0.5) * scale + 0.5;
}

// View uv to raw camera texture uv. The buffer is never rotated on the CPU;
// this is where the quarter turn (and the selfie mirror) happens.
static float2 cameraUV(float2 viewUV, constant PeteUniforms &u) {
    float2 f = aspectFillUV(viewUV, u.resolution, u.frameSize);
    switch (u.frameOrientation) {
        case PETE_FRAME_BACK_PORTRAIT: return float2(f.y, 1.0 - f.x);
        case PETE_FRAME_FRONT_PORTRAIT: return float2(f.y, f.x);
        default: return f;
    }
}

static float sobelEdge(texture2d<float, access::sample> cam, sampler s, float2 tuv, float2 texel) {
    float tl = luma(cam.sample(s, tuv + float2(-texel.x, -texel.y)).rgb);
    float tc = luma(cam.sample(s, tuv + float2(0.0, -texel.y)).rgb);
    float tr = luma(cam.sample(s, tuv + float2(texel.x, -texel.y)).rgb);
    float ml = luma(cam.sample(s, tuv + float2(-texel.x, 0.0)).rgb);
    float mr = luma(cam.sample(s, tuv + float2(texel.x, 0.0)).rgb);
    float bl = luma(cam.sample(s, tuv + float2(-texel.x, texel.y)).rgb);
    float bc = luma(cam.sample(s, tuv + float2(0.0, texel.y)).rgb);
    float br = luma(cam.sample(s, tuv + float2(texel.x, texel.y)).rgb);
    float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
    float gy = (bl + 2.0 * bc + br) - (tl + 2.0 * tc + tr);
    return length(float2(gx, gy));
}

// ---------------------------------------------------------------------------
// Pass 1: the field. Everything that flows is decided here, at low res.
// ---------------------------------------------------------------------------

fragment float4 peteFieldFragment(PeteVertexOut in [[stage_in]],
                                  constant PeteUniforms &u [[buffer(0)]])
{
    const float t = u.time;
    const float aspect = u.resolution.x / u.resolution.y;
    float2 p = in.uv * float2(aspect, 1.0);

    // Domain-warped flow, -1..1 on each axis.
    float2 np = p * 3.0;
    float2 flow = float2(fbm(np + float2(t * 0.17, -t * 0.11)),
                         fbm(np + float2(7.1, 3.7) + float2(-t * 0.13, t * 0.15)));
    flow = (flow - 0.5) * 2.0;

    // Phases for the ripple wobble and the wave bands, 0..1.
    float ripple = fbm(p * 5.0 + t * 0.2);
    float bands = fbm(p * 4.0 + t * 0.25);

    return float4(flow, ripple, bands);
}

// ---------------------------------------------------------------------------
// Pass 2: the eye.
// ---------------------------------------------------------------------------

fragment float4 peteFragment(PeteVertexOut in [[stage_in]],
                             texture2d<float, access::sample> cam [[texture(0)]],
                             texture2d<float, access::sample> field [[texture(1)]],
                             constant PeteUniforms &u [[buffer(0)]],
                             constant PeteHotspot *hotspots [[buffer(1)]])
{
    constexpr sampler smp(address::clamp_to_edge, filter::linear, coord::normalized);

    const float t = u.time;
    const float k = clamp(u.intensity, 0.0, 1.0);
    const float aspect = u.resolution.x / u.resolution.y;
    const float2 asp = float2(aspect, 1.0); // multiply by this for isotropic distances

    float2 uv = in.uv;

    // 0. Wipeout: fold the view into a kaleidoscope before anything else.
    if (u.kaleido > 0.001) {
        float2 c = (uv - 0.5) * asp;
        float r = length(c);
        float a = atan2(c.y, c.x) + t * 0.1;
        float seg = M_PI_F / 3.0;
        a = abs(fmod(a, seg * 2.0) - seg);
        float2 folded = float2(cos(a), sin(a)) * r / asp + 0.5;
        uv = mix(uv, folded, u.kaleido);
    }

    // 1. The world flows. One read of the field replaces all the noise.
    float4 f = field.sample(smp, uv);
    float2 flow = f.xy;
    float swirlAmount = (0.035 + 0.06 * u.motion) * k * u.drift;
    float2 wuv = uv + flow * swirlAmount / asp;

    // 2. Sets rolling in: a horizontal wobble marching down the frame.
    float ripple = sin(uv.y * 28.0 + f.z * 9.0 - t * 1.6);
    wuv.x += ripple * 0.006 * k;

    // 3. Sample with a little chromatic split along the flow.
    float2 ca = flow * 0.004 * k / asp;
    float2 tuv = cameraUV(wuv, u);
    float3 col;
    col.r = cam.sample(smp, cameraUV(wuv + ca, u)).r;
    col.g = cam.sample(smp, tuv).g;
    col.b = cam.sample(smp, cameraUV(wuv - ca, u)).b;
    float3 orig = cam.sample(smp, cameraUV(in.uv, u)).rgb;

    // 4. Vibrancy. Saturation way up, hue drifting slowly with the flow, shadows lifted.
    float3 hsv = rgb2hsv(col);
    float hueDrift = flow.x * 0.18 * k;
    hsv.x = fract(hsv.x + hueDrift);
    hsv.y = clamp(hsv.y * (1.0 + 1.4 * k) + 0.08 * k, 0.0, 1.0);
    hsv.z = pow(hsv.z, 1.0 / (1.0 + 0.35 * k));
    col = hsv2rgb(hsv);

    // 5. Wave bands. Luminance becomes rolling bands of mood color.
    float lum = luma(col);
    float bands = 0.5 + 0.5 * sin(lum * 14.0 + f.w * 7.0 - t * 1.2);
    float3 bandColor = mix(u.paletteA.rgb, u.paletteB.rgb, bands);
    col = mix(col, col * (0.75 + 0.5 * bands) + bandColor * 0.12, 0.6 * k);

    // 6. Neon edges. Sobel on the raw frame, colored by the mood and pulsing.
    float2 texel = 2.0 / max(u.textureSize, float2(1.0));
    float edge = smoothstep(0.15, 0.6, sobelEdge(cam, smp, tuv, texel));
    float3 edgeColor = mix(u.paletteC.rgb, u.paletteD.rgb, 0.5 + 0.5 * sin(t * 2.0 + uv.y * 10.0));
    col += edgeColor * edge * 1.2 * k;

    // 7. The sun. Pete always sees it, even indoors, even at night.
    float2 d = (uv - u.sun.xy) * asp;
    float dist = length(d);
    float glow = exp(-dist * dist * 3.0) * u.sun.z;
    float ang = atan2(d.y, d.x);
    float rays = 0.55 + 0.45 * sin(ang * 9.0 + t * 0.7) * sin(ang * 4.0 - t * 0.4);
    float sunlight = glow * (0.6 + 0.4 * rays) * u.sun.w;
    col += float3(1.0, 0.82, 0.38) * sunlight * k;
    col = mix(col, col * float3(1.08, 1.0, 0.85) + float3(0.06, 0.03, 0.0), 0.5 * k * u.sun.z);

    // 8. Hotspots. Things Pete named get a pulse and a sparkle.
    int count = min(u.hotspotCount, PETE_MAX_HOTSPOTS);
    for (int i = 0; i < count; i++) {
        PeteHotspot h = hotspots[i];
        float2 r0 = h.rect.xy;
        float2 r1 = r0 + h.rect.zw;
        float2 inside = smoothstep(r0 - 0.03, r0 + 0.02, uv) * (1.0 - smoothstep(r1 - 0.02, r1 + 0.03, uv));
        float m = inside.x * inside.y;
        if (m > 0.001) {
            float2 cell = floor(uv * u.resolution / 6.0);
            float sp = hash21(cell + floor(t * 9.0) * 0.37);
            float sparkle = smoothstep(0.985, 1.0, sp);
            float pulse = 0.5 + 0.5 * sin(t * 4.0 + h.rect.x * 20.0);
            col = mix(col, col * (1.0 + 0.25 * pulse) + h.tint.rgb * 0.18 * pulse, m * h.tint.a);
            col += sparkle * m * h.tint.a * 1.5;
        }
    }

    // 9. Warm vignette and a little grain. Pete's eyes are ninety years old.
    float vig = smoothstep(0.45, 1.05, length((uv - 0.5) * asp));
    col = mix(col, col * float3(0.9, 0.55, 0.3), vig * 0.7 * k);
    float grain = (hash21(uv * u.resolution + float2(t * 61.0, t * 37.0)) - 0.5) * 0.06 * k;
    col += grain;

    // 10. At intensity zero it is just a camera again.
    col = mix(orig, col, smoothstep(0.0, 0.25, k));
    return float4(clamp(col, 0.0, 1.0), 1.0);
}
