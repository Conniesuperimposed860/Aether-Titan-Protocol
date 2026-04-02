using System;
using System.Runtime.InteropServices;
using UnityEngine;

public static class AetherTitanNative
{
    [DllImport("aether_titan")] public static extern int scs76_encode(
        float x, float y, float lastX, float lastY, float lastVx, float lastVy,
        ushort seq, uint ts, byte forceKeyframe, float deltaTimeMs, byte[] output, uint maxOut);

    [DllImport("aether_titan")] public static extern int scs76_decode(
        byte[] input, uint size, ref float lastX, ref float lastY, ref float lastVx, ref float lastVy,
        out ushort seq, out uint ts, float deltaTimeMs);
}
