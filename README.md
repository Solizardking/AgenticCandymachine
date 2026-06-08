<!-- ═══════════════════════════════════════════════════════════════════════════
    Agentic Candy Machine SDK
    Full-stack recursive NFT passport factory — TEE-attested, x402-payment-gated,
    Metaplex-registered agents on Solana.
    ═══════════════════════════════════════════════════════════════════════════ -->
<div align="center">

<!-- ═══ GLOWING HERO LOGO ═══ -->
<p align="center">
  <svg width="720" height="180" viewBox="0 0 720 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Candy gradient — shifting rainbow -->
      <linearGradient id="candyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1">
          <animate attributeName="stop-color" values="#9945FF;#14F195;#19FB9B;#FF6B6B;#9945FF" dur="6s" repeatCount="indefinite" />
        </stop>
        <stop offset="33%" style="stop-color:#14F195;stop-opacity:1">
          <animate attributeName="stop-color" values="#14F195;#19FB9B;#FF6B6B;#9945FF;#14F195" dur="6s" repeatCount="indefinite" />
        </stop>
        <stop offset="66%" style="stop-color:#FF6B6B;stop-opacity:1">
          <animate attributeName="stop-color" values="#FF6B6B;#9945FF;#14F195;#19FB9B;#FF6B6B" dur="6s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" style="stop-color:#9945FF;stop-opacity:1">
          <animate attributeName="stop-color" values="#9945FF;#14F195;#19FB9B;#FF6B6B;#9945FF" dur="6s" repeatCount="indefinite" />
        </stop>
      </linearGradient>

      <!-- Scanline gradient for retro terminal feel -->
      <linearGradient id="scanline" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#14F195;stop-opacity:0.05" />
        <stop offset="50%" style="stop-color:#14F195;stop-opacity:0.15" />
        <stop offset="100%" style="stop-color:#14F195;stop-opacity:0.05" />
        <animate attributeName="y1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y2" values="100%;200%;100%" dur="3s" repeatCount="indefinite" />
      </linearGradient>

      <!-- Outer glow -->
      <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#9945FF;stop-opacity:0.3" />
        <stop offset="60%" style="stop-color:#14F195;stop-opacity:0.05" />
        <stop offset="100%" style="stop-color:#000;stop-opacity:0" />
      </radialGradient>

      <!-- Glow filter -->
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur1" />
        <feGaussianBlur stdDeviation="8" result="blur2" />
        <feGaussianBlur stdDeviation="15" result="blur3" />
        <feMerge>
          <feMergeNode in="blur3" />
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Subtle inner glow -->
      <filter id="innerGlow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Background glow aura -->
    <ellipse cx="360" cy="90" rx="300" ry="80" fill="url(#outerGlow)">
      <animate attributeName="rx" values="280;320;280" dur="4s" repeatCount="indefinite" />
      <animate attributeName="ry" values="75;85;75" dur="4s" repeatCount="indefinite" />
    </ellipse>

    <!-- Floating particle 1 -->
    <circle cx="100" cy="30" r="2" fill="#9945FF" opacity="0">
      <animate attributeName="opacity" values="0;0.8;0" dur="3s" begin="0s" repeatCount="indefinite" />
      <animate attributeName="cy" values="30;15;30" dur="3s" begin="0s" repeatCount="indefinite" />
    </circle>

    <!-- Floating particle 2 -->
    <circle cx="280" cy="140" r="1.5" fill="#14F195" opacity="0">
      <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
      <animate attributeName="cy" values="140;125;140" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
    </circle>

    <!-- Floating particle 3 -->
    <circle cx="500" cy="25" r="2.5" fill="#FF6B6B" opacity="0">
      <animate attributeName="opacity" values="0;0.9;0" dur="3.5s" begin="1s" repeatCount="indefinite" />
      <animate attributeName="cy" values="25;10;25" dur="3.5s" begin="1s" repeatCount="indefinite" />
    </circle>

    <!-- Floating particle 4 -->
    <circle cx="620" cy="150" r="1.8" fill="#19FB9B" opacity="0">
      <animate attributeName="opacity" values="0;0.6;0" dur="2.8s" begin="1.5s" repeatCount="indefinite" />
      <animate attributeName="cy" values="150;135;150" dur="2.8s" begin="1.5s" repeatCount="indefinite" />
    </circle>

    <!-- Floating particle 5 -->
    <circle cx="400" cy="160" r="1.2" fill="#9945FF" opacity="0">
      <animate attributeName="opacity" values="0;0.5;0" dur="2s" begin="0.8s" repeatCount="indefinite" />
      <animate attributeName="cy" values="160;148;160" dur="2s" begin="0.8s" repeatCount="indefinite" />
    </circle>

    <!-- Floating particle 6 — orbiting -->
    <circle r="2" fill="#14F195" opacity="0">
      <animateMotion dur="8s" repeatCount="indefinite" path="M360,90 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
      <animate attributeName="opacity" values="0;0.4;0;0.4;0" dur="8s" repeatCount="indefinite" />
    </circle>

    <!-- Pulsing outer ring -->
    <circle cx="360" cy="90" r="85" fill="none" stroke="url(#candyGrad)" stroke-width="1.5" opacity="0.3">
      <animate attributeName="r" values="80;90;80" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.15;0.3" dur="3s" repeatCount="indefinite" />
    </circle>

    <!-- Spinning hex ring -->
    <g filter="url(#glow)">
      <polygon points="360,15 435,52 435,128 360,165 285,128 285,52" fill="none" stroke="#14F195" stroke-width="1.5" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 360 90" to="360 360 90" dur="15s" repeatCount="indefinite" />
      </polygon>
    </g>

    <!-- Inner rotating DNA hex -->
    <g filter="url(#innerGlow)">
      <polygon points="360,40 403,64 403,116 360,140 317,116 317,64" fill="none" stroke="#9945FF" stroke-width="1.2" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="360 360 90" to="0 360 90" dur="10s" repeatCount="indefinite" />
      </polygon>
    </g>

    <!-- Candy icon in center -->
    <g filter="url(#glow)">
      <text x="360" y="82" font-family="monospace" font-size="28" fill="#14F195" text-anchor="middle" dominant-baseline="middle">🍬</text>
    </g>

    <!-- Title: AGENTIC (with wave animation) -->
    <text x="200" y="50" font-family="monospace" font-size="22" font-weight="900" fill="url(#candyGrad)" filter="url(#glow)" text-anchor="middle" letter-spacing="3">
      <tspan>
        AGENTIC
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
      </tspan>
    </text>

    <!-- Title: CANDY MACHINE (with staggered wave) -->
    <text x="200" y="82" font-family="monospace" font-size="22" font-weight="900" fill="url(#candyGrad)" filter="url(#glow)" text-anchor="middle" letter-spacing="3">
      <tspan>
        CANDY MACHINE
        <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
      </tspan>
    </text>

    <!-- Subtitle tagline -->
    <text x="200" y="110" font-family="monospace" font-size="11" fill="#888" text-anchor="middle">
      <tspan>Solana · Metaplex · x402 · TEE · RWA</tspan>
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="4s" repeatCount="indefinite" />
    </text>

    <!-- Tagline -->
    <text x="360" y="90" font-family="monospace" font-size="12" font-weight="bold" fill="url(#candyGrad)" text-anchor="middle" opacity="0" dominant-baseline="middle">
      DNA → Art → Token → CM → Recursive → Mint
      <animate attributeName="opacity" values="0;0.7;0;0.7;0" dur="5s" repeatCount="indefinite" />
    </text>

    <!-- Right side status dots -->
    <circle cx="540" cy="45" r="3" fill="#14F195">
      <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <text x="550" y="50" font-family="monospace" font-size="9" fill="#14F195">LIVE</text>

    <circle cx="540" cy="62" r="3" fill="#19FB9B">
      <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
    </circle>
    <text x="550" y="67" font-family="monospace" font-size="9" fill="#19FB9B">v1.1.1</text>

    <circle cx="540" cy="79" r="3" fill="#9945FF">
      <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
    </circle>
    <text x="550" y="84" font-family="monospace" font-size="9" fill="#9945FF">MIT</text>
  </svg>
</p>

<!-- ═══ SHIELDS (with hover-scale effect via CSS) ═══ -->
<p align="center">
  <a href="https://www.npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk">
    <img src="https://img.shields.io/npm/v/@openclawdsol/agentic-candy-machine-sdk?color=%2314F195&style=for-the-badge&labelColor=111" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk">
    <img src="https://img.shields.io/npm/dm/@openclawdsol/agentic-candy-machine-sdk?color=%239945FF&style=for-the-badge&labelColor=111" alt="downloads" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen?style=for-the-badge&labelColor=111" alt="MIT License" />
  </a>
  <a href="https://x402.wtf">
    <img src="https://img.shields.io/badge/x402-Payment%20Gated-FF6B6B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSI0IiBmaWxsPSIjRkY2QjZCIi8+PHRleHQgeD0iMyIgeT0iMTIiIGZvbnQtc2l6ZT0iOSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiPjQwMjwvdGV4dD48L3N2Zz4=&labelColor=111" alt="x402" />
  </a>
</p>

</div>

---

## 🧬 Pipeline — 8-Step NFT Factory

<p align="center">
  <svg width="880" height="340" viewBox="0 0 880 340" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#14F195" />
        <stop offset="25%" style="stop-color:#19FB9B" />
        <stop offset="50%" style="stop-color:#9945FF" />
        <stop offset="75%" style="stop-color:#FF6B6B" />
        <stop offset="100%" style="stop-color:#14F195" />
        <animate attributeName="x1" values="0%;100%;0%" dur="8s" repeatCount="indefinite" />
      </linearGradient>
      <filter id="glowLight">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    <style>
      @keyframes flow { to { stroke-dashoffset: -120; } }
      .flow { stroke: url(#pipeGrad); stroke-width: 3; fill: none; stroke-dasharray: 16 8; animation: flow 1.2s linear infinite; }
      @keyframes popIn { 
        0% { opacity: 0; transform: scale(0.8) translateY(15px); } 
        100% { opacity: 1; transform: scale(1) translateY(0); } 
      }
    </style>

    <!-- Background grid lines -->
    <line x1="0" y1="190" x2="880" y2="190" stroke="#333" stroke-width="0.5" opacity="0.3" />
    <line x1="0" y1="290" x2="880" y2="290" stroke="#333" stroke-width="0.5" opacity="0.3" />

    <!-- Flow connectors — top row -->
    <path d="M 85,100 L 155,100" class="flow" />
    <path d="M 225,100 L 295,100" class="flow" style="animation-delay: 0.15s;" />
    <path d="M 365,100 L 435,100" class="flow" style="animation-delay: 0.3s;" />
    <path d="M 505,100 L 575,100" class="flow" style="animation-delay: 0.45s;" />
    <path d="M 645,100 L 715,100" class="flow" style="animation-delay: 0.6s;" />
    <path d="M 785,100 L 855,100" class="flow" style="animation-delay: 0.75s;" />

    <!-- Vertical flows between stages -->
    <path d="M 190,140 L 190,200" class="flow" style="stroke-dasharray: 6 6; animation-delay: 0.1s;" />
    <path d="M 330,140 L 330,200" class="flow" style="stroke-dasharray: 6 6; animation-delay: 0.25s;" />
    <path d="M 470,140 L 470,200" class="flow" style="stroke-dasharray: 6 6; animation-delay: 0.4s;" />
    <path d="M 610,140 L 610,200" class="flow" style="stroke-dasharray: 6 6; animation-delay: 0.55s;" />

    <!-- Stage 1 — DNA -->
    <g style="animation: popIn 0.5s ease-out forwards;">
      <rect x="15" y="75" width="80" height="60" rx="10" fill="#0d0d1a" stroke="#9945FF" stroke-width="2" filter="url(#glowLight)" />
      <text x="55" y="100" font-family="monospace" font-size="18" fill="#9945FF" text-anchor="middle">🧬</text>
      <text x="55" y="125" font-family="monospace" font-size="11" fill="#9945FF" text-anchor="middle" font-weight="bold">DNA</text>
    </g>

    <!-- Stage 2 — Art -->
    <g style="animation: popIn 0.5s ease-out 0.1s forwards;">
      <rect x="155" y="75" width="80" height="60" rx="10" fill="#0d0d1a" stroke="#14F195" stroke-width="2" filter="url(#glowLight)" />
      <text x="195" y="100" font-family="monospace" font-size="18" fill="#14F195" text-anchor="middle">🎨</text>
      <text x="195" y="125" font-family="monospace" font-size="11" fill="#14F195" text-anchor="middle" font-weight="bold">Art</text>
    </g>

    <!-- Stage 3 — Token -->
    <g style="animation: popIn 0.5s ease-out 0.2s forwards;">
      <rect x="295" y="75" width="80" height="60" rx="10" fill="#0d0d1a" stroke="#19FB9B" stroke-width="2" filter="url(#glowLight)" />
      <text x="335" y="100" font-family="monospace" font-size="18" fill="#19FB9B" text-anchor="middle">🪙</text>
      <text x="335" y="125" font-family="monospace" font-size="11" fill="#19FB9B" text-anchor="middle" font-weight="bold">Token</text>
    </g>

    <!-- Stage 4 — Gacha -->
    <g style="animation: popIn 0.5s ease-out 0.3s forwards;">
      <rect x="435" y="75" width="80" height="60" rx="10" fill="#0d0d1a" stroke="#FFD700" stroke-width="2" filter="url(#glowLight)" />
      <text x="475" y="100" font-family="monospace" font-size="18" fill="#FFD700" text-anchor="middle">🎰</text>
      <text x="475" y="125" font-family="monospace" font-size="11" fill="#FFD700" text-anchor="middle" font-weight="bold">Gacha</text>
    </g>

    <!-- Stage 5 — Candy Machine -->
    <g style="animation: popIn 0.5s ease-out 0.4s forwards;">
      <rect x="575" y="75" width="80" height="60" rx="10" fill="#0d0d1a" stroke="#FF6B6B" stroke-width="2" filter="url(#glowLight)" />
      <text x="615" y="100" font-family="monospace" font-size="18" fill="#FF6B6B" text-anchor="middle">🍬</text>
      <text x="615" y="125" font-family="monospace" font-size="10" fill="#FF6B6B" text-anchor="middle" font-weight="bold">CM</text>
    </g>

    <!-- Stage 6 — Recursive -->
    <g style="animation: popIn 0.5s ease-out 0.5s forwards;">
      <rect x="715" y="75" width="80" height="60" rx="10" fill="#0d0d1a" stroke="#9945FF" stroke-width="2" filter="url(#glowLight)" />
      <text x="755" y="100" font-family="monospace" font-size="18" fill="#9945FF" text-anchor="middle">🔄</text>
      <text x="755" y="125" font-family="monospace" font-size="10" fill="#9945FF" text-anchor="middle" font-weight="bold">Recur</text>
    </g>

    <!-- Stage 7 — Passport (below, full width) -->
    <g style="animation: popIn 0.5s ease-out 0.6s forwards;">
      <rect x="240" y="195" width="120" height="50" rx="10" fill="#0d0d1a" stroke="#14F195" stroke-width="2" filter="url(#glowLight)" />
      <text x="300" y="215" font-family="monospace" font-size="15" fill="#14F195" text-anchor="middle">🛂</text>
      <text x="300" y="237" font-family="monospace" font-size="10" fill="#14F195" text-anchor="middle" font-weight="bold">Passport</text>
    </g>

    <path d="M 460,220 L 530,220" class="flow" style="animation-delay: 0.7s;" />

    <!-- Stage 8 — Mint -->
    <g style="animation: popIn 0.5s ease-out 0.7s forwards;">
      <rect x="530" y="195" width="120" height="50" rx="10" fill="#0d0d1a" stroke="#FF6B6B" stroke-width="2" filter="url(#glowLight)" />
      <text x="590" y="215" font-family="monospace" font-size="15" fill="#FF6B6B" text-anchor="middle">🏷️</text>
      <text x="590" y="237" font-family="monospace" font-size="10" fill="#FF6B6B" text-anchor="middle" font-weight="bold">Mint</text>
    </g>

    <!-- x402 + Attestation (finishing touches) -->
    <g style="animation: popIn 0.5s ease-out 0.8s forwards;">
      <rect x="240" y="270" width="150" height="40" rx="8" fill="#0d0d1a" stroke="#FF6B6B" stroke-width="1.5" />
      <text x="315" y="294" font-family="monospace" font-size="11" fill="#FF6B6B" text-anchor="middle">x402 Payment Gate</text>
    </g>

    <g style="animation: popIn 0.5s ease-out 0.9s forwards;">
      <rect x="500" y="270" width="150" height="40" rx="8" fill="#0d0d1a" stroke="#9945FF" stroke-width="1.5" />
      <text x="575" y="294" font-family="monospace" font-size="11" fill="#9945FF" text-anchor="middle">TEE Attestation</text>
    </g>

    <!-- Pulsing bottom annotation -->
    <text x="440" y="330" font-family="monospace" font-size="11" fill="#666" text-anchor="middle">
      <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
      ▼ Each step is TEE-attested on-chain — full cryptographic provenance
    </text>
  </svg>
</p>

---

## 📦 Install

```bash
npm install @openclawdsol/agentic-candy-machine-sdk
```

<p align="center">
  <img src="https://img.shields.io/badge/Solana-14F195?style=flat-square&logo=solana&logoColor=black&labelColor=0d0d1a" />
  <img src="https://img.shields.io/badge/Metaplex-9945FF?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIzIiBmaWxsPSIjOTk0NUZGIi8+PHRleHQgeD0iNCIgeT0iMTIiIGZvbnQtc2l6ZT0iOSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtd2VpZ2h0PSJib2xkIj5NPC90ZXh0Pjwvc3ZnPg==&labelColor=0d0d1a" />
  <img src="https://img.shields.io/badge/x402-FF6B6B?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIzIiBmaWxsPSIjRkY2QjZCIi8+PHRleHQgeD0iNCIgeT0iMTIiIGZvbnQtc2l6ZT0iOSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiPjQwMjwvdGV4dD48L3N2Zz4=&labelColor=0d0d1a" />
  <img src="https://img.shields.io/badge/TEE-14F195?style=flat-square&labelColor=0d0d1a" />
  <img src="https://img.shields.io/badge/RWA-19FB9B?style=flat-square&labelColor=0d0d1a" />
</p>

---

## ⚡ Quick Start

```ts
import { AgenticCandyMachineSDK } from "@openclawdsol/agentic-candy-machine-sdk";

const sdk = new AgenticCandyMachineSDK({
  cluster: "devnet",
  rpcUrl: process.env.SOLANA_RPC_URL,
});

// 1. Build DNA — the agent's genomic blueprint
const dna = sdk.dna
  .setName("Clawd Alpha")
  .setTier("elite")
  .addCapability("trading")
  .addCapability("defi")
  .setRarityFactor(95)
  .build();

// 2. Generate art from DNA traits
const art = await sdk.art.generate({
  dna,
  style: "cyberpunk-grid",
  width: 1024,
  height: 1024,
});

// 3. Deploy a token
const token = await sdk.token
  .setName("CLW")
  .setSymbol("CLW")
  .setDecimals(6)
  .setImage(art.uri)
  .deploy();

// 4. Spin up a Candy Machine
const cm = await sdk.candyMachine
  .setPrice(0.5)
  .setItemsAvailable(1000)
  .addGuard("solPayment")
  .addGuard("startDate")
  .setCreators([{ address: treasury, share: 100 }])
  .deploy();

// 5. Add items with recursive metadata
await sdk.recursive
  .setCandyMachine(cm.address)
  .addItem({ dna, art, token })
  .mine({ type: "sequential" });

// 6. TEE attestation — prove everything on-chain
const attestation = await sdk.attestation.record({
  assetId: dna.id,
  teeEvidence: "-----BEGIN TEE CERTIFICATE-----...",
});

// 7. Register on x402.wtf — monetize your agent
import { x402 } from "@openclawdsol/agentic-candy-machine-sdk";
const reg = await x402.register(agentTemplate, paymentAddress);

// 8. Register on Metaplex Agent Registry
import { buildEip8004Document } from "@openclawdsol/agentic-candy-machine-sdk";
const doc = buildEip8004Document(agentTemplate, {
  agentEndpoint: "https://myagent.ai",
  x402Url: `https://x402.wtf/agents/${agentTemplate.handle}`,
});
```

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     AGENTIC CANDY MACHINE                                │
│                                                                          │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌───────────┐ │
│  │   DNA   │───│   Art   │───│  Token  │───│  Gacha  │───│    CM     │ │
│  │ Builder │   │Pipeline │   │ Builder │   │  Roller │   │  Builder  │ │
│  │         │   │         │   │         │   │         │   │           │ │
│  │ Traits  │   │ Prompts │   │ Mint    │   │ Rarity  │   │ Guards    │ │
│  │ Tier    │   │ Styles  │   │ Metadata│   │CommitAct│   │ Config    │ │
│  │ Caps    │   │ Images  │   │ SPL-22  │   │ ProvFair│   │ Lines     │ │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └─────┬─────┘ │
│       │              │              │              │              │       │
│       └──────────────┴──────────────┴──────────────┴──────────────┘       │
│                                    │                                      │
│                          ┌─────────▼─────────┐                            │
│                          │    Recursive       │                            │
│                          │  Metadata Builder  │                            │
│                          │                    │                            │
│                          │  Hash ← Parent     │                            │
│                          │  Merkle Paths      │                            │
│                          │  Composition Tree  │                            │
│                          └─────────┬─────────┘                            │
│                                    │                                      │
│                          ┌─────────▼─────────┐                            │
│                          │    Passport        │                            │
│                          │    Factory         │                            │
│                          │                    │                            │
│                          │  Bundle → Mint     │                            │
│                          │  Verify on-chain   │                            │
│                          └─────────┬─────────┘                            │
│                                    │                                      │
│                 ┌──────────────────┼──────────────────┐                   │
│                 │                  │                   │                   │
│        ┌────────▼────────┐ ┌───────▼──────┐ ┌─────────▼─────────┐        │
│        │  Metaplex       │ │    TEE       │ │   x402.wtf        │        │
│        │  Registry       │ │  Attestation │ │   Payments        │        │
│        │  AgentIdentity  │ │  Enclave     │ │   HTTP 402        │        │
│        └─────────────────┘ └──────────────┘ └───────────────────┘        │
│                                                                            │
│        ┌──────────────────────────────────────────────────────┐          │
│        │         Clawd RWA — Tokenized AI Model               │          │
│        │  NFT ≡ Model ‖ AgentIdentity PDA ‖ CLAWD Token       │          │
│        │  Bonding Curve ‖ Asset Signer ‖ x402 Inference       │          │
│        └──────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Module Reference

| 🧩 Module | 🚀 Export | 📝 Description |
|:----------:|-----------|----------------|
| 🧬 **DNA** | `DNABuilder` · `DNAEncoder` · `diffDNA` | Build agent trait vectors, encode on-chain DNA, compute rarity scores & tier-based capabilities |
| 🎨 **Art** | `ArtPipeline` · `PROMPT_TEMPLATES` | AI-powered art generation from DNA traits — style templates, multi-provider |
| 🪙 **Token** | `TokenBuilder` · `TokenDeployer` | Deploy SPL Token-2022 assets with metadata extensions & on-chain records |
| 🍬 **Candy Machine** | `CandyMachineBuilder` · `GuardBuilder` | Configure + deploy Metaplex Core CMs — guard sets, config lines, hidden settings |
| 🎰 **Gacha** | `GachaPoolBuilder` · `ProvablyFairRoller` | Provably-fair rarity rolling with cryptographic commitment schemes |
| 🔄 **Recursive** | `RecursiveMetadataBuilder` · `MerkleTree` | Recursive NFT metadata chains — self-hashing, Merkle proofs, composition layers |
| 🛂 **Passport** | `PassportFactory` | Assemble full NFT passport bundles, cost estimation, end-to-end deploy |
| 🔒 **Attestation** | `AttestationService` · `TEETerminal` | TEE attestation recording — on-chain verification, Merkle trees of proofs |
| 🤖 **Agent Template** | `AgentTemplateBuilder` · `NEON_PROTOCOL_AGENTS` | Pre-built agent templates mapped to tiers, NFT metadata, registry links |
| 💳 **x402** | `X402Client` · `build402Response` | Payment-gated agent endpoints — HTTP 402 micropayments on x402.wtf |
| 📋 **Metaplex Agent** | `MetaplexAgentApiClient` · `buildEip8004Document` | Register agents on Metaplex, EIP-8004 standard documents |
| 💎 **Clawd RWA** | `ClaWdRwaBuilder` · `createModelRwa` | Tokenized AI model as MPL Core asset — NFT = model, bound agent + token |

---

## 💳 x402 Payment Protocol

Every agent registered through the SDK monetizes via **HTTP 402 micropayments**.

```ts
import { X402Client, build402Response } from "@openclawdsol/agentic-candy-machine-sdk";

const x402Client = new X402Client({ apiKey: process.env.X402_API_KEY });

// Register pay-per-use agent endpoints
const endpoints = [
  {
    path: "/agents/my-agent/query",
    method: "POST",
    description: "Blockchain intelligence query",
    price: { token: "USDC", amount: 100_000, recipient: myWallet, network: "solana-mainnet" },
    rateLimit: { requests: 10, windowSeconds: 60 },
  },
];

const registration = await x402Client.register(agentTemplate, myWallet, endpoints);
console.log(`Agent live at ${registration.registryUrl}`);

// Express / Next.js handler — gate with HTTP 402
app.post("/agents/my-agent/query", (req, res) => {
  if (!req.headers["x-payment-receipt"]) {
    const { status, headers, body } = build402Response("my-agent", endpoints[0], req.url);
    return res.status(status).set(headers).json(body);
  }
  // Paid — process request
});
```

<p align="center">
  <svg width="600" height="200" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="x402Flow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#FF6B6B" />
        <stop offset="50%" style="stop-color:#9945FF" />
        <stop offset="100%" style="stop-color:#14F195" />
      </linearGradient>
    </defs>
    <style>
      @keyframes dash402 { to { stroke-dashoffset: -60; } }
      @keyframes pulse402 { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      .f402 { stroke: url(#x402Flow); stroke-width: 2.5; fill: none; stroke-dasharray: 10 6; animation: dash402 1s linear infinite; }
    </style>

    <!-- Client -->
    <rect x="25" y="70" width="90" height="50" rx="8" fill="#1a1a2e" stroke="#14F195" stroke-width="1.5" />
    <text x="70" y="100" font-family="monospace" font-size="12" fill="#14F195" text-anchor="middle" font-weight="bold">Client</text>

    <!-- x402 Gateway -->
    <rect x="255" y="25" width="90" height="50" rx="8" fill="#1a1a2e" stroke="#FF6B6B" stroke-width="1.5" />
    <text x="300" y="55" font-family="monospace" font-size="12" fill="#FF6B6B" text-anchor="middle" font-weight="bold">x402.wtf</text>

    <!-- Solana -->
    <rect x="485" y="70" width="90" height="50" rx="8" fill="#1a1a2e" stroke="#9945FF" stroke-width="1.5" />
    <text x="530" y="100" font-family="monospace" font-size="12" fill="#9945FF" text-anchor="middle" font-weight="bold">Solana</text>

    <!-- Flow lines -->
    <path d="M 115,85 L 255,50" class="f402" />
    <text x="170" y="55" font-family="monospace" font-size="8" fill="#888" text-anchor="middle">① GET /api/agents</text>

    <path d="M 255,70 L 115,105" class="f402" style="animation-delay:0.3s" />
    <text x="170" y="120" font-family="monospace" font-size="8" fill="#FF6B6B" text-anchor="middle">② 402 Payment Required</text>

    <path d="M 115,105 L 485,85" class="f402" style="animation-delay:0.5s" />
    <text x="300" y="135" font-family="monospace" font-size="8" fill="#9945FF" text-anchor="middle">③ USDC Payment Tx</text>

    <path d="M 485,105 L 300,70" class="f402" style="animation-delay:0.7s" />
    <text x="400" y="65" font-family="monospace" font-size="8" fill="#14F195" text-anchor="middle">④ On-chain Verify</text>

    <path d="M 300,70 L 115,85" class="f402" style="animation-delay:0.9s" />
    <text x="200" y="45" font-family="monospace" font-size="8" fill="#14F195" text-anchor="middle">⑤ 200 OK + Response</text>

    <!-- Legend -->
    <text x="300" y="185" font-family="monospace" font-size="10" fill="#555" text-anchor="middle">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      USDC · SOL · BONK · JUP — HTTP 402 micropayments on Solana
    </text>
  </svg>
</p>

---

## 💎 Tokenized AI Model — Clawd RWA

The world's first **tokenized AI model as an MPL Core asset**:

```ts
import { createModelRwa, CLAWD_MODEL_STACK } from "@openclawdsol/agentic-candy-machine-sdk";

const rwa = createModelRwa({
  name: "Clawd Alpha",
  symbol: "CLAWD",
  description: "Autonomous trading agent — Claude Sonnet 4",
  model: {
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    contextWindow: 200_000,
    modalities: ["text", "code", "image"],
    capabilities: ["defi-trading", "market-analysis", "yield-optimization"],
    accessMethod: "x402",
  },
  tokenName: "Clawd Token",
  tokenSymbol: "CLAWD",
  creatorFeePercent: 2.5,
  agentHandle: "clawd-alpha",
  paymentAddress: "ClawdEs...PDAPubkey",
  boundTokens: [
    { mint: "EPjFW...USDC", name: "USDC", symbol: "USDC", amount: 50_000, pctOfSupply: 5 },
  ],
});

// rwa.modelNFT         → Metaplex Core asset (model IS the NFT)
// rwa.agentBinding     → AgentIdentityV2 PDA + Asset Signer
// rwa.tokenBinding     → CLAWD bonding curve + setAgentTokenV1
// rwa.x402Endpoints    → Payment-gated inference URLs
// rwa.eip8004Doc       → EIP-8004 registration document
```

### Clawd Model Stack

<p align="center">
  <svg width="500" height="420" viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rwaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#14F195" />
        <stop offset="50%" style="stop-color:#9945FF" />
        <stop offset="100%" style="stop-color:#FF6B6B" />
      </linearGradient>
    </defs>
    <style>
      @keyframes rwaDash { to { stroke-dashoffset: -40; } }
      .rwa { stroke: url(#rwaGrad); stroke-width: 2; fill: none; stroke-dasharray: 8 5; animation: rwaDash 1s linear infinite; }
    </style>

    <!-- ClawdModel NFT -->
    <rect x="175" y="15" width="150" height="50" rx="8" fill="#0d0d1a" stroke="#14F195" stroke-width="1.5" />
    <text x="250" y="45" font-family="monospace" font-size="11" fill="#14F195" text-anchor="middle" font-weight="bold">ClawdModel NFT</text>
    <text x="250" y="58" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">MPL Core (model = asset)</text>

    <!-- Arrow -->
    <line x1="250" y1="65" x2="250" y2="100" class="rwa" />

    <!-- AgentIdentityV2 -->
    <rect x="175" y="100" width="150" height="50" rx="8" fill="#0d0d1a" stroke="#9945FF" stroke-width="1.5" />
    <text x="250" y="130" font-family="monospace" font-size="10" fill="#9945FF" text-anchor="middle" font-weight="bold">AgentIdentityV2</text>
    <text x="250" y="143" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">On-chain identity PDA</text>

    <line x1="250" y1="150" x2="250" y2="185" class="rwa" style="animation-delay:0.2s" />

    <!-- CLAWD Token -->
    <rect x="175" y="185" width="150" height="50" rx="8" fill="#0d0d1a" stroke="#19FB9B" stroke-width="1.5" />
    <text x="250" y="215" font-family="monospace" font-size="10" fill="#19FB9B" text-anchor="middle" font-weight="bold">CLAWD Token</text>
    <text x="250" y="228" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">Genesis bonding curve</text>

    <line x1="250" y1="235" x2="250" y2="270" class="rwa" style="animation-delay:0.4s" />

    <!-- Asset Signer PDA -->
    <rect x="175" y="270" width="150" height="50" rx="8" fill="#0d0d1a" stroke="#FFD700" stroke-width="1.5" />
    <text x="250" y="300" font-family="monospace" font-size="10" fill="#FFD700" text-anchor="middle" font-weight="bold">Asset Signer PDA</text>
    <text x="250" y="313" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">No private key · Hook exec</text>

    <line x1="250" y1="320" x2="250" y2="355" class="rwa" style="animation-delay:0.6s" />

    <!-- x402 Endpoints -->
    <rect x="175" y="355" width="150" height="50" rx="8" fill="#0d0d1a" stroke="#FF6B6B" stroke-width="1.5" />
    <text x="250" y="385" font-family="monospace" font-size="10" fill="#FF6B6B" text-anchor="middle" font-weight="bold">x402 Endpoints</text>
    <text x="250" y="398" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">/infer · /chat · /trade</text>
  </svg>
</p>

---

## 🔒 TEE Attestation

All passports feature **Trusted Execution Environment attestation** for verifiable off-chain computation.

```ts
import { AttestationService } from "@openclawdsol/agentic-candy-machine-sdk";

const attestation = await sdk.attestation.record({
  assetId: dna.id,
  teeEvidence: teeProof.signature,
  merkleRoot: tree.getRoot(),
  proofPath: tree.getProof(dna.id),
});
```

---

## 🌳 Recursive NFT Composition

Child NFTs embed **parent hashes + Merkle paths** for full on-chain verifiability:

```
Root Passport (🧬 Legendary)
  ├── DNA Hash:    0xabc123...
  ├── Trait Vector: [0x1f, 0x3a, 0xb7, ...]
  ├── Merkle Root:  0xdef456...
  │
  ├──▶ Agent NFT (child)
  │     ├── Parent Hash: 0xabc123...
  │     ├── Merkle Path:  ["0xL", "0xR", ...]
  │     └── Capabilities: [trading, defi, yield]
  │
  ├──▶ Token NFT (child)
  │     ├── Parent Hash: 0xabc123...
  │     ├── Merkle Path:  ["0xR", "0xL", ...]
  │     └── SPL-22 Metadata
  │
  └──▶ Sub-Agent (child)
        ├── Parent Hash: 0xabc123...
        ├── Merkle Path:  ["0xL", "0xR", ...]
        └── Inherited capabilities
```

---

## 📦 Package Exports

Tree-shake only what you need:

```ts
// Full SDK
import { AgenticCandyMachineSDK } from "@openclawdsol/agentic-candy-machine-sdk";

// Individual modules — zero overhead
import { DNABuilder, DNAEncoder, diffDNA } from "@openclawdsol/agentic-candy-machine-sdk/dna";
import { ArtPipeline, PROMPT_TEMPLATES } from "@openclawdsol/agentic-candy-machine-sdk/art";
import { TokenBuilder, TokenDeployer } from "@openclawdsol/agentic-candy-machine-sdk/token";
import { CandyMachineBuilder, GuardBuilder } from "@openclawdsol/agentic-candy-machine-sdk/candy-machine";
import { RecursiveMetadataBuilder, MerkleTree } from "@openclawdsol/agentic-candy-machine-sdk/recursive";
import { PassportFactory } from "@openclawdsol/agentic-candy-machine-sdk/passport";
import { AttestationService, TEETerminal } from "@openclawdsol/agentic-candy-machine-sdk/attestation";
import { X402Client, build402Response, x402 } from "@openclawdsol/agentic-candy-machine-sdk/x402";
import { MetaplexAgentApiClient, buildEip8004Document } from "@openclawdsol/agentic-candy-machine-sdk/metaplex-agent";
import { createModelRwa, CLAWD_MODEL_STACK } from "@openclawdsol/agentic-candy-machine-sdk/clawd-rwa";
```

---

## 🔧 Environment

| Variable | Required | Description |
|----------|:--------:|-------------|
| `SOLANA_RPC_URL` | ✅ | Solana RPC endpoint (devnet, mainnet, or custom) |
| `SOLANA_PRIVATE_KEY` | — | Base58 private key for non-interactive/CI use |
| `SOLANA_KEYPAIR_PATH` | — | Path to Solana keypair JSON file |
| `X402_API_KEY` | — | x402.wtf API key for agent registry |
| `X402_BASE_URL` | — | Custom x402 registry base URL |
| `METAPLEX_API_URL` | — | Metaplex API endpoint |

---

## 🛠 Development

```bash
git clone https://github.com/Solizardking/AgenticCandymachine.git
cd AgenticCandymachine
npm install
npm run build      # ESM + CJS + TypeScript declarations
npm run dev        # Watch mode with tsx
npm run test       # Vitest test suite
npm run lint       # ESLint
npm run clean      # Remove dist/
```

---

## 🌐 Links

| Link | Description |
|------|-------------|
| [NPM Package](https://www.npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk) | `@openclawdsol/agentic-candy-machine-sdk` |
| [GitHub Repo](https://github.com/Solizardking/AgenticCandymachine) | Source & issues |
| [x402.wtf](https://x402.wtf) | HTTP 402 payment-gated agent registry |
| [Metaplex Agents](https://developers.metaplex.com/agents) | Agent Registry docs |
| [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004) | Agent Registration Schema spec |

---

## 📄 License

<p align="center">
  <strong>MIT</strong> © OpenClawd Solutions
</p>