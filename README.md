<p align="center">
<img src="https://raw.githubusercontent.com/Solizardking/AgenticCandymachine/main/assets/banner.svg" alt="Agentic Candy Machine" />
</p>

<p align="center">
  <a href="https://npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk"><img src="https://img.shields.io/npm/v/@openclawdsol/agentic-candy-machine-sdk?color=%23FF00FF&style=for-the-badge&label=npm" /></a>
  <img src="https://img.shields.io/badge/LICENSE-MIT-%23FFD700?style=for-the-badge" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-5.7+-%2314F195?style=for-the-badge" />
  <img src="https://img.shields.io/badge/SOLANA-MAINNET-%239945FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/METAPLEX-AGENTS-%23FF6B35?style=for-the-badge" />
  <img src="https://img.shields.io/badge/x402.wtf-REGISTERED-%2300FFFF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/CLAWD-RWA-%23FF00FF?style=for-the-badge" />
</p>

<p align="center">
  <i>TEE-attested recursive NFT passports · Provably fair gacha · x402 payment gating</i><br/>
  <i>The world's first tokenized AI model RWA on Solana — <strong>Clawd</strong></i>
</p>

---

<p align="center">

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ░▒▓█  A G E N T I C   C A N D Y   M A C H I N E  █▓▒░   v1.1.0      ║
║      N E O N   P R O T O C O L  ·  C L A W D   R W A                  ║
╚══════════════════════════════════════════════════════════════════════════╝

   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   ░                                                                    ░
   ░   🧬 DNA  ──▶  🎨 ART  ──▶  🪙 TOKEN  ──▶  🎰 GACHA              ░
   ░               ──▶  🍬 CANDY  ──▶  ♾️  RECURSIVE  ──▶  🛂 PASS     ░
   ░               ──▶  🤖 METAPLEX AGENT  ──▶  💳 x402                ░
   ░               ──▶  🌐 CLAWD RWA  ──▶  💰 $CLAWD TOKEN             ░
   ░                                                                    ░
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

</p>

---

## TABLE OF CONTENTS

- [WHAT'S NEW IN 1.1.0](#whats-new-in-110)
- [CLAWD RWA — Tokenized AI Model](#clawd-rwa--tokenized-ai-model)
- [INSTALL](#install)
- [QUICK START](#quick-start)
- [GACHA SYSTEM](#gacha-system)
- [AGENT TEMPLATES](#agent-templates)
- [x402 PAYMENT PROTOCOL](#x402-payment-protocol)
- [METAPLEX AGENT REGISTRY](#metaplex-agent-registry)
- [PIPELINE](#pipeline)
- [ON-CHAIN VERIFICATION](#on-chain-verification)
- [ARCHITECTURE](#architecture)
- [CONTRIBUTE](#contribute)

---

## WHAT'S NEW IN 1.1.0

```
┌─────────────────────────────────────────────────────────────────────┐
│                    v 1 . 1 . 0   C H A N G E L O G                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✦  x402 Payment Protocol Integration                               │
│     HTTP 402 payment-gated agent endpoints on Solana               │
│     X402Client · build402Response · registerAgentsOnX402           │
│                                                                     │
│  ✦  Metaplex Agent Registry (EIP-8004)                              │
│     mintAndSubmitAgent · registerIdentityV1 · AgentDocumentBuilder  │
│     AgentIdentityV2 PDA · lifecycle hooks (Transfer/Update/Execute) │
│                                                                     │
│  ✦  Clawd RWA — World's First Tokenized AI Model                    │
│     MPL Core NFT = AI model   →   $CLAWD bonding curve token        │
│     setAgentTokenV1 permanent binding · Asset Signer PDA treasury   │
│     x402 inference gating · EIP-8004 agent document                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CLAWD RWA — Tokenized AI Model

> **The world's first Real-World Asset tokenization of an AI model on Solana.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  C L A W D   R W A   S T A C K                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────────┐    setAgentTokenV1    ┌──────────────────────┐  │
│   │  ClawdModel NFT  │ ◀─────────────────── │   $CLAWD Token       │  │
│   │  MPL Core Asset  │    (permanent, ∞)     │   Genesis Bonding    │  │
│   │  AgentIdentityV2 │                       │   Curve → Raydium    │  │
│   └────────┬─────────┘                       └──────────────────────┘  │
│            │                                                            │
│            ▼  ["mpl-core-execute", asset]                               │
│   ┌──────────────────┐    x402 (HTTP 402)    ┌──────────────────────┐  │
│   │  Asset Signer    │ ◀─────────────────── │  Inference Callers   │  │
│   │  PDA Treasury    │   0.10 USDC/call      │  pay per inference   │  │
│   │  No Private Key  │                       │  x402.wtf/agents/    │  │
│   └──────────────────┘                       └──────────────────────┘  │
│                                                                         │
│   HOLD $CLAWD → fee revenue share from every inference call             │
│   HOLD NFT    → agent governance + treasury control                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

```typescript
import {
  ClaWdRwaBuilder, CLAWD_MODEL_STACK,
  X402Client,
} from "@openclawdsol/agentic-candy-machine-sdk";

// Use the canonical Clawd stack (Claude Sonnet 4.6 on Solana)
const bundle = CLAWD_MODEL_STACK.build("YOUR_WALLET_ADDRESS");

// Or define your own tokenized AI model
const myModelBundle = new ClaWdRwaBuilder()
  .name("MyModel")
  .model({
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    contextWindow: 200_000,
    modalities: ["text", "code", "image"],
    accessMethod: "x402",
    inferenceEndpoint: "https://x402.wtf/agents/mymodel/infer",
  })
  .token("MyModel Token", "MYMDL", 2.5)
  .agent("mymodel", "Autonomous AI inference agent on Solana")
  .inferencePrice("USDC", 100_000)  // 0.10 USDC per inference
  .build("YOUR_WALLET_ADDRESS");

// Launch with CLI
console.log(bundle.cliCommands.join("\n"));

// Or use the full SDK snippet
console.log(bundle.sdkSnippet);
```

### Clawd + $CLAWD + SPL Token Binding

```typescript
import {
  ClaWdRwaBuilder,
  X402Client, registerAgentsOnX402,
  AgentDocumentBuilder,
} from "@openclawdsol/agentic-candy-machine-sdk";

const bundle = new ClaWdRwaBuilder()
  .name("Clawd")
  .model({ provider: "anthropic", modelId: "claude-sonnet-4-6", accessMethod: "x402" })
  .token("Clawd Token", "CLAWD", 2.5)
  .agent("clawd", "Claude Sonnet on Solana — pay per inference via x402")
  .inferencePrice("USDC", 100_000)

  // Bind additional SPL tokens (e.g. access tiers)
  .bindSplToken({
    mint: "CLAWD_MINT_ADDRESS",
    symbol: "CLAWD",
    role: "fee-sharing",
    requiredHolding: 1000,
  })
  .bindSplToken({
    mint: "USDC_MINT",
    symbol: "USDC",
    role: "utility",  // payment token for inference
  })
  .build("YOUR_WALLET_ADDRESS");

// EIP-8004 agent document (upload to Arweave)
console.log(JSON.stringify(bundle.agentDocument, null, 2));

// NFT metadata (upload to Arweave, use URI when minting)
console.log(JSON.stringify(bundle.nftMetadata, null, 2));

// Mint + launch via CLI (one command each)
bundle.cliCommands.forEach(cmd => console.log(cmd));
```

---

## INSTALL

```bash
npm install @openclawdsol/agentic-candy-machine-sdk
```

Peer dependency:
```bash
npm install @solana/web3.js
```

For full Metaplex agent minting (on-chain):
```bash
npm install @metaplex-foundation/mpl-agent-registry \
            @metaplex-foundation/umi \
            @metaplex-foundation/umi-bundle-defaults
```

---

## QUICK START

```typescript
import {
  AgenticCandyMachineSDK,
  GachaPoolBuilder, GachaEngine,
  NEON_PROTOCOL_AGENTS,
  X402Client,
  ClaWdRwaBuilder,
} from "@openclawdsol/agentic-candy-machine-sdk";
import { Keypair } from "@solana/web3.js";

// ── 1. Initialize SDK ──────────────────────────────────────────────────
const sdk = new AgenticCandyMachineSDK({
  cluster: "devnet",
  authority: Keypair.generate(),
  redpillApiKey: process.env.REDPILL_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
});

// ── 2. Provably fair gacha roll ────────────────────────────────────────
const pool = new GachaPoolBuilder()
  .name("Neon Protocol // Genesis Drop")
  .publicEntropy("SOLANA_GENESIS_2026")
  .build();

NEON_PROTOCOL_AGENTS.forEach(agent =>
  pool.items.push({
    id: agent.id, type: "agent_template",
    dna: agent.dna as any, rarity: agent.rarity,
    metadata: agent.metadata,
  })
);

const engine  = new GachaEngine(sdk.attestation);
const roll    = await engine.executeRoll(pool, "user-seed", "BLOCKHASH", "SOVEREIGN");
console.log(`Summoned: ${roll.poolItem.dna?.name} | ${roll.rarity}`);

// ── 3. Full 7-phase pipeline ───────────────────────────────────────────
const result = await sdk.pipeline({
  dna: roll.poolItem.dna!,
  art: { style: "cyberpunk", provider: "google" },
  token: { name: `${roll.poolItem.dna!.name} Token`, symbol: "AGNT", decimals: 9, initialSupply: 1_000_000n },
  options: { dryRun: true },
});

// ── 4. Register on x402.wtf ────────────────────────────────────────────
const x402    = new X402Client();
const regUrl  = x402.agentUrl(roll.poolItem.dna!.handle!);
console.log(`x402 registry: ${regUrl}`);
```

---

## GACHA SYSTEM

```
    ┌──────────────────────────────────────────────────────┐
    │           P R O V A B L Y   F A I R   G A C H A      │
    ├──────────────────────────────────────────────────────┤
    │                                                      │
    │  ① SERVER commits  → sha256(commitment)              │
    │  ② CLIENT provides → combined entropy                │
    │  ③ ROLL executed   → weighted random selection       │
    │  ④ ATTESTED        → TEE Merkle proof on-chain       │
    │  ⑤ SEED revealed   → anyone can verify               │
    │  ⑥ VERIFY          → GachaEngine.verifyRoll()        │
    │                                                      │
    │  TRUST NO ONE. VERIFY EVERYTHING.                    │
    └──────────────────────────────────────────────────────┘
```

| Rarity | Weight | Odds | Boost | Color |
|--------|--------|------|-------|-------|
| `MYTHIC` | 50 | 0.50% | 3.00x | `#FF00FF` |
| `LEGENDARY` | 250 | 2.50% | 2.00x | `#FFD700` |
| `EPIC` | 700 | 7.00% | 1.60x | `#FF6B35` |
| `RARE` | 1500 | 15.00% | 1.35x | `#9945FF` |
| `UNCOMMON` | 2500 | 25.00% | 1.15x | `#14F195` |
| `COMMON` | 5000 | 50.00% | 1.00x | `#888888` |

| Tier | Boost | Mythic Odds |
|------|-------|-------------|
| Observer | 1.00x | 0.50% |
| Agent | 1.05x | 0.53% |
| Operator | 1.10x | 0.55% |
| Sovereign | 1.20x | 0.60% |

```typescript
const result = GachaEngine.verifyRoll(
  poolHash, serverSeed, clientSeed, nonce, blockhash,
  expectedHash, expectedRarity, poolItems,
);
console.log(result.valid);    // true → fair
console.log(result.details);  // full breakdown
```

---

## AGENT TEMPLATES

```
    ┌──────────────────────────────────────────────────────────────┐
    │           N E O N   P R O T O C O L   C A T A L O G          │
    ├──────────────────────────────────────────────────────────────┤
    │                                                              │
    │  OBSERVER   ░▒▓ GhostWalker · ByteWatcher                   │
    │  AGENT      ░▒▓ ByteStriker · SynthWeaver                   │
    │  OPERATOR   ░▒▓ NeonOracle  · PulseRunner · CipherMancer    │
    │  SOVEREIGN  ░▒▓ ChromeSamurai · NetherDragon · TheArchitect │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
```

```typescript
import {
  AgentTemplateBuilder, NEON_PROTOCOL_AGENTS,
  templateToNFTMetadata, generateRegistryLinks,
} from "@openclawdsol/agentic-candy-machine-sdk";

const agent = new AgentTemplateBuilder()
  .name("VoidWalker").handle("voidwalker")
  .bio("Navigates the dark pools of Solana DeFi")
  .tier("SOVEREIGN").rarity("LEGENDARY")
  .faction("Void Syndicate").neonColor("#FF00FF").glitchEffect(true)
  .addCapability("trade", { dex: "jupiter", mode: "dark_pool" })
  .build();

const metadata = templateToNFTMetadata(
  agent,
  "https://arweave.net/art.png",
  "https://attest.agentic-candy.xyz/proof/voidwalker",
  "https://x402.wtf/agents/voidwalker",
);

const links = generateRegistryLinks(agent);
// → metaplex, google, x402.wtf/agents/voidwalker, solscan
```

---

## x402 PAYMENT PROTOCOL

```
    ┌──────────────────────────────────────────────────────────────┐
    │            H T T P   4 0 2   P A Y M E N T                    │
    ├──────────────────────────────────────────────────────────────┤
    │                                                              │
    │  Client ──▶ POST /agents/clawd/infer                         │
    │  Server ◀── 402 Payment Required                             │
    │             { x402 challenge, payTo, amount: 0.10 USDC }     │
    │  Client ──▶ pays on-chain → provides payment proof           │
    │  Server ◀── 200 OK { inference result }                      │
    │                                                              │
    │  Registry: x402.wtf/agents/{handle}                          │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
```

```typescript
import {
  X402Client, build402Response,
  registerAgentsOnX402,
} from "@openclawdsol/agentic-candy-machine-sdk";

const client = new X402Client({ apiKey: process.env.X402_API_KEY });

// Register agents on x402.wtf
const registrations = await registerAgentsOnX402(
  NEON_PROTOCOL_AGENTS,
  "YOUR_SOLANA_WALLET",
  { network: "solana-mainnet" },
);

// Build an HTTP 402 challenge for your API route
const endpoint = {
  path: "/agents/clawd/infer",
  method: "POST" as const,
  description: "Clawd inference call",
  price: { token: "USDC" as const, amount: 100_000, recipient: "...", network: "solana-mainnet" as const },
};

const response = build402Response("clawd", endpoint, "https://x402.wtf/agents/clawd/infer");
// response.status === 402
// response.body === x402 payment challenge (JSON)

// Verify registration
const verified = await client.verify("clawd");
console.log(verified.valid, verified.registryUrl);
```

---

## METAPLEX AGENT REGISTRY

```
    ┌──────────────────────────────────────────────────────────────┐
    │        M E T A P L E X   A G E N T   R E G I S T R Y         │
    ├──────────────────────────────────────────────────────────────┤
    │                                                              │
    │  mintAndSubmitAgent()  →  MPL Core NFT + AgentIdentityV2    │
    │  registerIdentityV1()  →  bind identity to existing asset   │
    │  setAgentTokenV1()     →  permanent agent↔token binding     │
    │  createAndRegisterLaunch() → bonding curve + token binding  │
    │                                                              │
    │  EIP-8004 off-chain document:                                │
    │  { type, name, services, registrations, supportedTrust }    │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
```

```typescript
import {
  AgentDocumentBuilder, buildEip8004Document,
  MetaplexAgentApiClient,
  NEON_PROTOCOL_AGENTS,
} from "@openclawdsol/agentic-candy-machine-sdk";

// Build an EIP-8004 registration document
const doc = buildEip8004Document(NEON_PROTOCOL_AGENTS[0], {
  agentEndpoint: "https://x402.wtf/agents/ghostwalker",
  x402Url: "https://x402.wtf/agents/ghostwalker",
  imageUri: "https://arweave.net/ghostwalker.png",
});

// Upload doc to Arweave, then mint:
// import { mintAndSubmitAgent } from '@metaplex-foundation/mpl-agent-registry'
// const { assetAddress } = await mintAndSubmitAgent(umi, {}, {
//   wallet: umi.identity.publicKey,
//   uri: "<ARWEAVE_NFT_METADATA_URI>",
//   agentMetadata: { type: "agent", name: doc.name, ... },
// });
```

---

## PIPELINE

```typescript
const result = await sdk.pipeline({
  // Phase 1: DNA  — Agent identity genesis
  dna: { name: "Agent", handle: "agent", ... },
  // Phase 2: Art  — Cyberpunk portrait generation
  art: { style: "cyberpunk", provider: "google" },
  // Phase 3: Token — SPL Token-2022 creation
  token: { name: "Token", symbol: "AGNT", decimals: 9, initialSupply: 1_000_000n },
  // Phase 5: Candy Machine — Metaplex deployment
  candyMachine: { itemsAvailable: 1000 },
  // Phase 6: Recursive — Composability tree
  recursion: { maxDepth: 5 },
  // Phase 7: Attestation — auto-attested each phase
});

sdk.on("pipeline:phase",       ({ data }) => console.log(`⚡ ${data.phase}`));
sdk.on("gacha:rolled",         ({ data }) => console.log(`🎰 ${data.rarity}`));
sdk.on("attestation:created",  ({ data }) => console.log(`🔐 ${data.id}`));
sdk.on("candy-machine:minted", () => console.log(`🍬 Minted`));
```

---

## ON-CHAIN VERIFICATION

```
    ┌────────────────────────────────────────────────────────────────┐
    │              V E R I F I C A T I O N   C H A I N               │
    ├────────────────────────────────────────────────────────────────┤
    │                                                                │
    │  ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐  │
    │  │   METAPLEX   │──▶│    GOOGLE    │──▶│     x402.wtf      │  │
    │  │   VERIFIED   │   │   ATTESTED   │   │    REGISTERED     │  │
    │  │  Core Asset  │   │ TEE Merkle   │   │   Agent Registry  │  │
    │  └──────────────┘   └──────────────┘   └───────────────────┘  │
    │         │                  │                    │              │
    │         ▼                  ▼                    ▼              │
    │    Solana NFT         TEE Attestation     x402 Pay-Gate        │
    │  Programmable NF      SHA-256 Proof       x402.wtf/agents      │
    │                                                                │
    │  CLAWD RWA additionally:                                       │
    │  • AgentIdentityV2 PDA  (seeds: ["agent_identity", asset])    │
    │  • setAgentTokenV1      (permanent $CLAWD binding)             │
    │  • Asset Signer PDA     (seeds: ["mpl-core-execute", asset])  │
    │  • Genesis bonding curve → Raydium CPMM graduation            │
    └────────────────────────────────────────────────────────────────┘
```

| Registry | Endpoint | Proves |
|----------|----------|--------|
| Metaplex | `explorer.solana.com/address/{mint}` | NFT ownership & AgentIdentityV2 |
| Google | `console.cloud.google.com/vertex-ai` | TEE model attestation |
| x402.wtf | `x402.wtf/agents/{handle}` | Payment-gated agent registry |
| Solscan | `solscan.io/token/{mint}` | Token + bonding curve |
| Gacha | `attest.agentic-candy.xyz/verify/{id}` | Provably fair roll proof |

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AgenticCandyMachineSDK  v1.1.0                       │
├──────┬───────┬────────┬────────┬─────────┬───────────┬─────────────────┤
│ 🧬   │ 🎨   │ 🪙     │ 🎰     │ 🍬      │ ♾️        │ 🛂             │
│ DNA  │ Art  │ Token  │ Gacha  │ Candy   │ Recursive │ Passport        │
├──────┴───────┴────────┴────────┴─────────┴───────────┴─────────────────┤
│  🤖  Metaplex Agent Registry  (EIP-8004 · mintAndSubmitAgent)           │
├─────────────────────────────────────────────────────────────────────────┤
│  💳  x402 Payment Protocol  (HTTP 402 · x402.wtf · USDC/SOL)           │
├─────────────────────────────────────────────────────────────────────────┤
│  🌐  Clawd RWA  (Tokenized AI Model · $CLAWD · setAgentTokenV1)        │
├─────────────────────────────────────────────────────────────────────────┤
│  🛡️  Attestation Service  (TEE · Merkle Proofs · Ed25519)               │
├─────────────────────────────────────────────────────────────────────────┤
│  Metaplex Core ✅ · Google 🔐 · x402.wtf 💳 · Raydium CPMM 📈         │
├─────────────────────────────────────────────────────────────────────────┤
│  Solana · Token-2022 · RedPill TEE · Google Vertex AI · Genesis        │
└─────────────────────────────────────────────────────────────────────────┘
```

```
src/
├── index.ts                       # Main exports
├── core/client.ts                 # AgenticCandyMachineSDK
├── modules/
│   ├── dna/                       # 🧬 AgentDNA + DNAEncoder
│   ├── art/                       # 🎨 ArtPipeline
│   ├── token/                     # 🪙 TokenBuilder + TokenDeployer
│   ├── gacha/                     # 🎰 ProvablyFairRoller + GachaEngine
│   ├── agent-template/            # 🤖 AgentTemplateBuilder + NEON_PROTOCOL_AGENTS
│   ├── candy-machine/             # 🍬 CandyMachineClient
│   ├── recursive/                 # ♾️  RecursiveMetadataBuilder
│   ├── passport/                  # 🛂 PassportFactory
│   ├── attestation/               # 🛡️  AttestationService + TEETerminal
│   ├── x402/           ← NEW      # 💳 X402Client · HTTP 402 gating
│   ├── metaplex-agent/ ← NEW      # 🤖 EIP-8004 · AgentDocumentBuilder
│   └── clawd-rwa/      ← NEW      # 🌐 Tokenized AI Model · $CLAWD
├── types/index.ts
└── utils/index.ts
```

---

## CONTRIBUTE

```
    ╔═══════════════════════════════════════════════════════════╗
    ║       J O I N   T H E   N E O N   P R O T O C O L        ║
    ╚═══════════════════════════════════════════════════════════╝
```

```bash
git clone https://github.com/Solizardking/AgenticCandymachine.git
cd AgenticCandymachine && npm install && npm run build && npm test
```

| Registry | Link |
|----------|------|
| **GitHub** | [Solizardking/AgenticCandymachine](https://github.com/Solizardking/AgenticCandymachine) |
| **npm** | [@openclawdsol/agentic-candy-machine-sdk](https://npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk) |
| **x402.wtf** | [x402.wtf/agents](https://x402.wtf/agents) |
| **Metaplex Agents** | [developers.metaplex.com/agents](https://developers.metaplex.com/agents) |
| **Google Cloud** | [Vertex AI](https://cloud.google.com/vertex-ai) |

---

<p align="center">
  <strong>MIT License</strong> · Copyright © 2025–2026 <strong>8bit Labs</strong><br/>
  <i>Trust nothing. Verify everything. Summon your agent. Tokenize the model.</i>
</p>
