# Aether-Titan Protocol v9.1.0 – Pro Netcode

**Company:** 3eaCru  
**Author:** Marcelo A. Ferreira Jr  
**Location:** Londrina – PR, Brazil – ZIP 86082-540  
**Email:** 3eatcru@gmail.com  
**Website:** [www.3eatcru.com](https://www.3eatcru.com)

---

## 🚀 What is it?
A full multiplayer netcode stack with prediction, reconciliation, rollback, jitter buffer, binary input (4 bytes), adaptive delta codec SCS-76 v0.77, authoritative server + reconnection, and a playable WebSocket demo.

---

## 📦 Install
```bash
npm install @aether-titan/core
```

### Run demo
```bash
# 1) Build TS to JS for browser importmap
npx tsc core/*.ts transport/*.ts --target esnext --module esnext --moduleResolution node16

# 2) Start server (binary input)
npx ts-node examples/server-real.ts

# 3) Serve static files
npx http-server -p 3000

# 4) Open dashboard
http://localhost:3000/dashboard.html
```

### Auto-Stress Test (10s + report)
- The client auto-runs after 1.5s, moves diagonally, flips direction at 5s, ends at 10s, and downloads a `.txt` report with position/seq samples (~100ms).
- Use latency/jitter/loss sliders in the dashboard to validate prediction, reconciliation, and interpolation.

---

## ✅ Package contents
- `core/`: codec, prediction, reconciliation, rollback, buffers, interpolator, interest, deterministic RNG, smoother.
- `transport/`: WebSocket + connection manager + stub WebRTC.
- `platforms/`: web-worker bridge, Unity bridge stub.
- `native/`: CMake + minimal SCS76 encoder shim.
- `examples/`: `server-real.ts` (binary), `client-demo.html` (auto-stress + report).
- `dashboard.html`: control panel for URL, net simulation, demo launch, and README viewer.

---

## 🇧🇷 Versão em Português (resumo)
- Instalação: `npm install @aether-titan/core`
- Demo: `npx tsc core/*.ts transport/*.ts --target esnext --module esnext --moduleResolution node16 && npx ts-node examples/server-real.ts && npx http-server -p 3000` e abra `http://localhost:3000/dashboard.html`.
- Teste automático: inicia em 1.5s, muda direção aos 5s, termina aos 10s e baixa um relatório `.txt` com posições e seqs a cada ~100ms.
- Binário: servidor e cliente usam `InputCodec` (4 bytes) para inputs.

© 2025 3eaCru – All rights reserved.
