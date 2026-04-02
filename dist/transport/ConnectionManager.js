export var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["DISCONNECTED"] = 0] = "DISCONNECTED";
    ConnectionState[ConnectionState["CONNECTING"] = 1] = "CONNECTING";
    ConnectionState[ConnectionState["CONNECTED"] = 2] = "CONNECTED";
    ConnectionState[ConnectionState["RECONNECTING"] = 3] = "RECONNECTING";
    ConnectionState[ConnectionState["FAILED"] = 4] = "FAILED";
})(ConnectionState || (ConnectionState = {}));
export class ConnectionManager {
    constructor(transport) {
        this.state = ConnectionState.DISCONNECTED;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.baseDelay = 1000;
        this.url = "";
        this.transport = transport;
    }
    async connect(url) {
        this.url = url;
        this.state = ConnectionState.CONNECTING;
        try {
            await this.transport.connect(url);
            this.state = ConnectionState.CONNECTED;
            this.reconnectAttempts = 0;
        }
        catch {
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.state = ConnectionState.FAILED;
            return;
        }
        this.state = ConnectionState.RECONNECTING;
        const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(this.url);
        }, delay);
    }
    getState() { return this.state; }
    disconnect() {
        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
        this.transport.disconnect();
        this.state = ConnectionState.DISCONNECTED;
    }
}
