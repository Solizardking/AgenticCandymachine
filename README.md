<!-- ═══════════════════════════════════════════════════════════════════════
    Agentic Candy Machine SDK
    Full-stack recursive NFT passport factory — TEE-attested, x402-payment-gated, Metaplex-registered agents on Solana.
    ═══════════════════════════════════════════════════════════════════════ -->
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Solizardking/AgenticCandymachine/main/assets/logo-dark.svg" />
    <!-- SVG inline logo with glow animation -->
    <svg width="320" height="90" viewBox="0 0 320 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="candyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#14F195;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#19FB9B;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#FF6B6B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9945FF;stop-opacity:1" />
          <animate attributeName="x1" values="0%;100%;0%" dur="4s" repeatCount="indefinite" />
          <animate attributeName="y1" values="0%;100%;0%" dur="4s" repeatCount="indefinite" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="pixelGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0" result="tint" />
          <feMerge><feMergeNode in="tint" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- Pulsing circle -->
      <circle cx="45" cy="45" r="30" fill="none" stroke="url(#candyGrad)" stroke-width="2" filter="url(#glow)" opacity="0.6">
        <animate attributeName="r" values="28;33;28" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>

      <!-- Inner hex -->
      <polygon points="45,20 65,32 65,58 45,70 25,58 25,32" fill="none" stroke="#14F195" stroke-width="1.5" filter="url(#pixelGlow)">
        <animateTransform attributeName="transform" type="rotate" from="0 45 45" to="360 45 45" dur="12s" repeatCount="indefinite" />
      </polygon>

      <!-- Title -->
      <text x="90" y="42" font-family="monospace" font-size="14" font-weight="bold" fill="url(#candyGrad)" filter="url(#glow)">
        AGENTIC CANDY
      </text>
      <text x="90" y="62" font-family="monospace" font-size="14" font-weight="bold" fill="url(#candyGrad)" filter="url(#glow)">
        MACHINE
      </text>
      <text x="90" y="80" font-family="monospace" font-size="8" fill="#888">
        Solana · Metaplex · x402
      </text>
    </svg>
  </picture>
</p>

<p align="center">
  <strong>Full-stack SDK for TEE-attested recursive NFT passports on Solana</strong><br />
  <sub>DNA → Art → Token → Candy Machine → Recursive Metadata → Mint</sub>
</p>

<p align="center">
  <!-- Shields -->
  <a href="https://www.npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk">
    <img src="https://img.shields.io/npm/v/@openclawdsol/agentic-candy-machine-sdk?color=%2314F195&style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk">
    <img src="https://img.shields.io/npm/dm/@openclawdsol/agentic-candy-machine-sdk?color=%239945FF&style=for-the-badge" alt="downloads" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen?style=for-the-badge" alt="MIT License" />
  </a>
  <a href="https://x402.wtf">
    <img src="https://img.shields.io/badge/x402-Payment%20Gated-FF6B6B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSI0IiBmaWxsPSIjRkY2QjZCIi8+PHRleHQgeD0iMyIgeT0iMTIiIGZvbnQtc2l6ZT0iOSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiPjQwMjwvdGV4dD48L3N2Zz4=" alt="x402" />
  </a>
</p>

---

## Agentic Candy Machine SDK — Production-Ready & Published v1.1.0

### What Was Done

**1. Secrets Audit** — Zero exposed keys across all 13 modules. No `private_key`, `secret_key`, `mnemonic`, or `api_key` patterns found in any source file.

**2. `.env.example` Created** — Comprehensive environment variable template with all supported config keys (`SOLANA_RPC_URL`, `SOLANA_PRIVATE_KEY`, `X402_API_KEY`, `METAPLEX_API_URL`, etc.), all optional where appropriate.

**3. `.gitignore` Verified** — Already thorough (380 lines). Covers `.env`, keypairs, wallets, service accounts, Solana keypair files, API key JSONs, TEE attestations, strategy configs, databases, logs, and build artifacts.

**4. x402.wtf Integration** — `src/modules/x402/index.ts` (330 lines): Full `X402Client` class with `register()`, `verify()`, `buildPaymentChallenge()`, `build402Response()` for Express/Next.js middleware. Singleton `x402` instance. Bulk registration helper `registerAgentsOnX402()`. Supports USDC, SOL, BONK, JUP payment tokens.

**5. Metaplex Agent Registry Integration** — `src/modules/metaplex-agent/index.ts` (341 lines): `MetaplexAgentApiClient` wrapping the Metaplex API, `AgentDocumentBuilder` + `buildEip8004Document()` for EIP-8004 registration documents with x402 linking.

**6. Clawd RWA** — `src/modules/clawd-rwa/index.ts` (463 lines): The world's first tokenized AI model as an MPL Core asset. Binds ClawdModel NFT → AgentIdentityV2 PDA → CLAWD Token (Genesis bonding curve) → Asset Signer PDA → x402 inference endpoints.

**7. Main Index** — `src/index.ts` exports all 13 modules including `x402`, `metaplex-agent`, and `clawd-rwa` with both value exports and type exports.

**8. Build** — Clean compilation: ESM + CJS + TypeScript declarations, zero errors. 83 files in dist across all three output formats.

**9. Animated SVG README** — Complete pipeline visualization with animated gradient logo (pulsing circle, rotating hex), 6-step pipeline animation with flowing dash lines (DNA → Art → Token → Candy Machine → Recursive → Mint → Verify), x402 payment flow diagram, Clawd Model Stack architecture, and comprehensive module table.

**10. Published** — `@openclawdsol/agentic-candy-machine-sdk@1.1.0` is live on npm with all new modules (`/x402`, `/metaplex-agent`, `/clawd-rwa`).

---

## Pipeline Animation

<p align="center">
  <!-- Animated pipeline diagram — SVG inline -->
  <svg width="800" height="280" viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#14F195" />
        <stop offset="50%" style="stop-color:#9945FF" />
        <stop offset="100%" style="stop-color:#FF6B6B" />
      </linearGradient>
    </defs>

    <style>
      @keyframes dash { to { stroke-dashoffset: -80; } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      .flow { stroke: url(#pipeGrad); stroke-width: 3; fill: none; stroke-dasharray: 10 6; animation: dash 1s linear infinite; }
      .node-text { font-family: monospace; font-size: 11px; fill: #ccc; text-anchor: middle; }
      .step { animation: fadeIn 0.6s ease-out forwards; }
    </style>

    <!-- Pipeline flow lines -->
    <path d="M 90,110 L 175,110" class="flow" />
    <path d="M 225,110 L 310,110" class="flow" style="animation-delay: 0.2s;" />
    <path d="M 360,110 L 445,110" class="flow" style="animation-delay: 0.4s;" />
    <path d="M 495,110 L 580,110" class="flow" style="animation-delay: 0.6s;" />
    <path d="M 630,110 L 715,110" class="flow" style="animation-delay: 0.8s;" />

    <!-- Step 1: DNA -->
    <g class="step">
      <rect x="20" y="80" width="70" height="60" rx="8" fill="#1a1a2e" stroke="#9945FF" stroke-width="2" />
      <text x="55" y="104" font-family="monospace" font-size="14" fill="#9945FF" text-anchor="middle">🧬</text>
      <text x="55" y="130" class="node-text" fill="#9945FF">DNA</text>
      <text x="100" y="75" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">Traits · Tier · Capabilities</text>
    </g>

    <!-- Step 2: Art -->
    <g class="step" style="animation-delay: 0.1s;">
      <rect x="175" y="80" width="70" height="60" rx="8" fill="#1a1a2e" stroke="#14F195" stroke-width="2" />
      <text x="210" y="104" font-family="monospace" font-size="14" fill="#14F195" text-anchor="middle">🎨</text>
      <text x="210" y="130" class="node-text" fill="#14F195">Art</text>
      <text x="250" y="75" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">Prompt → Image → Metadata</text>
    </g>

    <!-- Step 3: Token + Step 4: Candy Machine (grouped in vertical stack for token + CM) -->
    <g class="step" style="animation-delay: 0.2s;">
      <rect x="310" y="60" width="70" height="50" rx="8" fill="#1a1a2e" stroke="#19FB9B" stroke-width="2" />
      <text x="345" y="80" font-family="monospace" font-size="11" fill="#19FB9B" text-anchor="middle">🪙</text>
      <text x="345" y="100" class="node-text" fill="#19FB9B">Token</text>

      <rect x="310" y="130" width="70" height="50" rx="8" fill="#1a1a2e" stroke="#FF6B6B" stroke-width="2" />
      <text x="345" y="150" font-family="monospace" font-size="11" fill="#FF6B6B" text-anchor="middle">🍬</text>
      <text x="345" y="170" class="node-text" fill="#FF6B6B">Candy Mach</text>
    </g>

    <!-- Step 4: Recursive -->
    <g class="step" style="animation-delay: 0.3s;">
      <rect x="445" y="80" width="70" height="60" rx="8" fill="#1a1a2e" stroke="#FFD700" stroke-width="2" />
      <text x="480" y="104" font-family="monospace" font-size="14" fill="#FFD700" text-anchor="middle">🔄</text>
      <text x="480" y="130" class="node-text" fill="#FFD700">Recursive</text>
      <text x="520" y="75" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">Hash ← Parent ← Merkle</text>
    </g>

    <!-- Step 5: Mint -->
    <g class="step" style="animation-delay: 0.4s;">
      <rect x="580" y="80" width="70" height="60" rx="8" fill="#1a1a2e" stroke="#FF6B6B" stroke-width="2" />
      <text x="615" y="104" font-family="monospace" font-size="14" fill="#FF6B6B" text-anchor="middle">🏷️</text>
      <text x="615" y="130" class="node-text" fill="#FF6B6B">Mint</text>
      <text x="655" y="75" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">Passport NFT</text>
    </g>

    <!-- Step 6: Verify -->
    <g class="step" style="animation-delay: 0.5s;">
      <rect x="715" y="80" width="65" height="60" rx="8" fill="#1a1a2e" stroke="#14F195" stroke-width="2" />
      <text x="748" y="104" font-family="monospace" font-size="14" fill="#14F195" text-anchor="middle">✓</text>
      <text x="748" y="130" class="node-text" fill="#14F195">Verify</text>
      <text x="763" y="75" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">On-chain</text>
    </g>

    <!-- Bottom annotation -->
    <text x="400" y="200" font-family="monospace" font-size="10" fill="#555" text-anchor="middle">
      ⬆ Each step feeds the next — recursive hashes chain together via Merkle proofs
    </text>

    <!-- Registers below pipeline -->
    <text x="400" y="235" font-family="monospace" font-size="11" fill="#888" text-anchor="middle">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
      Agent → <tspan fill="#9945FF">Metaplex Registry</tspan> → <tspan fill="#FF6B6B">x402.wtf</tspan> → On-chain PDA
    </text>

    <!-- x402 bridge graphic -->
    <line x1="400" y1="248" x2="400" y2="260" stroke="#FF6B6B" stroke-width="1" opacity="0.5" />
    <text x="400" y="272" font-family="monospace" font-size="8" fill="#FF6B6B" text-anchor="middle" opacity="0.6">
      HTTP 402 Payments · Agent Tokens · Genesis Bonding Curves
    </text>
  </svg>
</p>

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     AGENTIC CANDY MACHINE                        │
│                                                                  │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌───────────────┐   │
│  │   DNA   │───│   Art   │───│  Token  │───│ Candy Machine │   │
│  │ Builder │   │Pipeline │   │ Builder │   │   Builder     │   │
│  │         │   │         │   │         │   │               │   │
│  │ Traits  │   │ Prompts │   │ Mint    │   │ Guards        │   │
│  │ Tier    │   │ Styles  │   │ Metadata│   │ Config Lines  │   │
│  │ Caps    │   │ Images  │   │ Exts    │   │ Hidden        │   │
│  └────┬────┘   └────┬────┘   └────┬────┘   └───────┬───────┘   │
│       │              │              │                │           │
│       └──────────────┴──────────────┴────────────────┘           │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │   Recursive     │                           │
│                    │ Metadata Builder│                           │
│                    │                 │                           │
│                    │ Hash ← Parent   │                           │
│                    │ Merkle Paths    │                           │
│                    │ Composition     │                           │
│                    └────────┬────────┘                           │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │    Passport     │                           │
│                    │    Factory      │                           │
│                    │                 │                           │
│                    │ Bundle → Mint   │                           │
│                    │ Verify on-chain │                           │
│                    └────────┬────────┘                           │
│                             │                                    │
│               ┌─────────────┼─────────────┐                     │
│               │             │             │                     │
│        ┌──────▼──────┐ ┌───▼────┐ ┌──────▼──────┐              │
│        │ Metaplex    │ │  TEE   │ │   x402.wtf  │              │
│        │ Registry    │ │Attest  │ │  Payments   │              │
│        │ AgentIdentity│ │        │ │  HTTP 402   │              │
│        └─────────────┘ └────────┘ └─────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

## Modules

| Module | Export | What It Does |
|--------|--------|---------------|
| **DNA** | `DNABuilder`, `DNAEncoder`, `diffDNA` | Build agent trait vectors, encode on-chain DNA, compute rarity scores |
| **Art** | `ArtPipeline`, `PROMPT_TEMPLATES` | Generate AI art from DNA traits with style templating |
| **Token** | `TokenBuilder`, `TokenDeployer` | Create SPL tokens with metadata extensions (Token-2022) |
| **Candy Machine** | `CandyMachineBuilder`, `GuardBuilder` | Configure and deploy Metaplex Core candy machines with guard sets |
| **Recursive** | `RecursiveMetadataBuilder`, `MerkleTree` | Build recursive NFT metadata chains, compute self-hash, verify Merkle proofs |
| **Passport** | `PassportFactory` | Assemble full NFT passport bundles and deploy end-to-end |
| **Attestation** | `AttestationService`, `TEETerminal` | Record TEE attestations, verify proofs, build Merkle trees of attestations |
| **Gacha** | `GachaPoolBuilder`, `ProvablyFairRoller` | Provably-fair rarity rolling with commitment schemes |
| **Agent Template** | `AgentTemplateBuilder`, `NEON_PROTOCOL_AGENTS` | Pre-built agent templates mapped to token tiers, NFT metadata, and registry links |
| **x402** | `X402Client`, `build402Response` | Payment-gated agent endpoints on x402.wtf (HTTP 402) |
| **Metaplex Agent** | `MetaplexAgentApiClient`, `buildEip8004Document` | Register agents on Metaplex, build EIP-8004 documents |
| **Clawd RWA** | `ClaWdRwaBuilder`, `createModelRwa` | Tokenized AI model as MPL Core asset — NFT = model, bound to agent + token |

## Quick Start

```bash
npm install @openclawdsol/agentic-candy-machine-sdk
```

```ts
import { AgenticCandyMachineSDK } from "@openclawdsol/agentic-candy-machine-sdk";

const sdk = new AgenticCandyMachineSDK({
  cluster: "devnet",
  rpcUrl: process.env.SOLANA_RPC_URL,
});

// 1. Build the DNA
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

// 3. Create a token
const token = await sdk.token
  .setName("CLW")
  .setSymbol("CLW")
  .setDecimals(6)
  .setImage(art.uri)
  .deploy();

// 4. Build a Candy Machine
const cm = await sdk.candyMachine
  .setPrice(0.5)                 // SOL
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

// 6. On-chain attestation
const attestation = await sdk.attestation.record({
  assetId: dna.id,
  teeEvidence: "-----BEGIN TEE-----...",
});

// 7. Register on x402.wtf
import { x402 } from "@openclawdsol/agentic-candy-machine-sdk";

const agentTemplate = { handle: "clawd-alpha", name: "Clawd Alpha", /* ... */ };
const reg = await x402.register(agentTemplate, paymentAddress);
console.log("x402 agent URL:", reg.registryUrl);

// 8. Register on Metaplex Agent Registry
import { buildEip8004Document } from "@openclawdsol/agentic-candy-machine-sdk";

const eipDoc = buildEip8004Document(agentTemplate, {
  agentEndpoint: "https://myagent.ai",
  x402Url: `https://x402.wtf/agents/clawd-alpha`,
});
console.log("EIP-8004 doc:", eipDoc);
```

## x402.wtf Integration

The SDK includes a first-class **x402 Payment Protocol** client. Every agent registered through the SDK can monetize its capabilities via HTTP 402 micropayments.

```ts
import { X402Client, build402Response } from "@openclawdsol/agentic-candy-machine-sdk";

const x402Client = new X402Client({ apiKey: process.env.X402_API_KEY });

// Register agent endpoints with pay-per-use pricing
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

// In your Express / Next.js route handler — return HTTP 402 for unpaid requests
app.post("/agents/my-agent/query", (req, res) => {
  if (!req.headers["x-payment-receipt"]) {
    const { status, headers, body } = build402Response("my-agent", endpoints[0], req.url);
    return res.status(status).set(headers).json(body);
  }
  // Process the paid request...
});
```

### Payment Flow

```
┌─────────┐      ┌──────────────┐      ┌───────────┐
│  Client  │──────│  x402.wtf    │──────│  Solana   │
│          │      │  Gateway     │      │  USDC tx  │
└────┬─────┘      └──────┬───────┘      └─────┬─────┘
     │ GET /api/agents    │                     │
     │───────────────────▶│                     │
     │                    │                     │
     │ 402 Payment Req'd  │                     │
     │◀───────────────────│                     │
     │                    │                     │
     │ USDC Payment ───────────────────────────▶│
     │                    │                     │
     │ X-Payment-Receipt  │                     │
     │───────────────────▶│                     │
     │                    │ Verify on-chain     │
     │                    │────────────────────▶│
     │                    │                     │
     │ 200 OK + Response  │                     │
     │◀───────────────────│                     │
```

## Tokenized AI Model — Clawd RWA

The SDK ships the **world's first tokenized AI model as an MPL Core asset**:

```ts
import { createModelRwa, CLAWD_MODEL_STACK } from "@openclawdsol/agentic-candy-machine-sdk";

const rwa = createModelRwa({
  name: "Clawd Alpha",
  symbol: "CLAWD",
  description: "Autonomous trading agent powered by Claude Sonnet 4",
  model: {
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    paramCount: "unknown",
    contextWindow: 200000,
    modalities: ["text", "code", "image"],
    capabilities: ["defi-trading", "market-analysis", "yield-optimization"],
    accessMethod: "x402",
  },
  tokenName: "Clawd Token",
  tokenSymbol: "CLAWD",
  creatorFeePercent: 2.5,
  agentHandle: "clawd-alpha",
  agentBio: "Autonomous DeFi trading specialist",
  paymentAddress: "ClawdEs...PDAPubkey",
  // Optional: bind other SPL tokens to the model
  boundTokens: [
    { mint: "EPjFW...USDC", name: "USDC", symbol: "USDC", amount: 50_000, pctOfSupply: 5 },
  ],
});

// rwa now contains:
//   rwa.modelNFT      → Metaplex Core asset metadata (the model IS the NFT)
//   rwa.agentBinding   → AgentIdentityV2 PDA + Asset Signer
//   rwa.tokenBinding   → CLAWD bonding curve + setAgentTokenV1
//   rwa.x402Endpoints  → Payment-gated inference URLs
//   rwa.eip8004Doc     → EIP-8004 registration document
```

### Clawd Model Stack

```
          ┌─────────────────────────┐
          │   ClawdModel NFT        │  ← MPL Core asset (the AI model)
          │   (Metaplex Core)       │
          └───────────┬─────────────┘
                      │
          ┌───────────▼─────────────┐
          │   AgentIdentityV2 PDA   │  ← On-chain agent identity
          │   (mpl-agent-identity)  │
          └───────────┬─────────────┘
                      │
          ┌───────────▼─────────────┐
          │   CLAWD Token           │  ← Genesis bonding curve
          │   setAgentTokenV1       │     bound permanently to agent
          └───────────┬─────────────┘
                      │
          ┌───────────▼─────────────┐
          │   Asset Signer PDA      │  ← Treasury (no private key)
          │   ["mpl-core-execute"]  │     controlled by Execute hook
          └───────────┬─────────────┘
                      │
          ┌───────────▼─────────────┐
          │   x402.wtf Endpoints    │  ← HTTP 402 pay-per-inference
          │   /infer  /chat  /trade │
          └─────────────────────────┘
```

## Attestation & TEE

All passports support **TEE (Trusted Execution Environment) attestation** for verifiable off-chain computation. The SDK records attestation signatures on-chain and builds Merkle trees for batch verification.

```ts
import { AttestationService } from "@openclawdsol/agentic-candy-machine-sdk";

const attestation = await sdk.attestation.record({
  assetId: dna.id,
  teeEvidence: teeProof.signature,
  merkleRoot: tree.getRoot(),
  proofPath: tree.getProof(dna.id),
});
```

## Recursive NFT Composition

Passports compose hierarchically — child NFTs embed parent hashes and Merkle paths for on-chain verifiability.

```
Root Passport
  ├── Tier: Legendary
  ├── DNA Hash: 0xabc...
  ├── Trait Vector: [0x1f, 0x3a, ...]
  ├── Merkle Root: 0xdef...
  │
  ├──▶ Agent NFT (child)
  │     ├── Parent Hash: 0xabc...
  │     ├── Merkle Path: [0x...]
  │     └── Agent Data...
  │
  └──▶ Token NFT (child)
        ├── Parent Hash: 0xabc...
        ├── Merkle Path: [0x...]
        └── Token Data...
```

## Package Exports

```json
{
  ".": "./dist/esm/index.js",
  "./dna": "./dist/esm/modules/dna/index.js",
  "./art": "./dist/esm/modules/art/index.js",
  "./token": "./dist/esm/modules/token/index.js",
  "./candy-machine": "./dist/esm/modules/candy-machine/index.js",
  "./recursive": "./dist/esm/modules/recursive/index.js",
  "./passport": "./dist/esm/modules/passport/index.js",
  "./attestation": "./dist/esm/modules/attestation/index.js",
  "./x402": "./dist/esm/modules/x402/index.js",
  "./metaplex-agent": "./dist/esm/modules/metaplex-agent/index.js",
  "./clawd-rwa": "./dist/esm/modules/clawd-rwa/index.js"
}
```

Tree-shake what you need:

```ts
import { DNABuilder } from "@openclawdsol/agentic-candy-machine-sdk/dna";
import { X402Client } from "@openclawdsol/agentic-candy-machine-sdk/x402";
import { createModelRwa } from "@openclawdsol/agentic-candy-machine-sdk/clawd-rwa";
```

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `SOLANA_RPC_URL` | Yes | Solana RPC endpoint |
| `SOLANA_PRIVATE_KEY` | Optional | Base58 private key for CI/CD |
| `SOLANA_KEYPAIR_PATH` | Optional | Path to keypair JSON file |
| `X402_API_KEY` | Optional | x402.wtf API key for agent registration |
| `X402_BASE_URL` | Optional | Custom x402 registry base URL |
| `METAPLEX_API_URL` | Optional | Metaplex API base URL |

## Development

```bash
git clone https://github.com/Solizardking/AgenticCandymachine.git
cd AgenticCandymachine
npm install
npm run build       # ESM + CJS + types
npm run dev         # Watch mode
npm run test        # Vitest
```

## Links

- **NPM**: [@openclawdsol/agentic-candy-machine-sdk](https://www.npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk)
- **GitHub**: [Solizardking/AgenticCandymachine](https://github.com/Solizardking/AgenticCandymachine)
- **x402.wtf**: [https://x402.wtf](https://x402.wtf) — HTTP 402 payment-gated agent registry
- **Metaplex Agents**: [developers.metaplex.com/agents](https://developers.metaplex.com/agents)
- **EIP-8004**: Agent Registration Schema

## License

MIT © OpenClawd Solutions