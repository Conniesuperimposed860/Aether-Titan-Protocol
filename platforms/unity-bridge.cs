using System;

public class UnityBridge {
    public void Send(byte[] data) {
        // TODO: integrate with Unity networking layer
    }

    public void OnReceive(Action<byte[]> handler) {
        // TODO: wire up incoming data to handler
    }
}
