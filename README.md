╔══════════════════════════════════════════════════════════════╗
║    ░▒▓█ A G E N T I C   C A N D Y   M A C H I N E █▓▒░      ║
║        P R O V A B L Y   F A I R   G A C H A                ║
╚══════════════════════════════════════════════════════════════╝
```

<p align="center">
  <img src="https://img.shields.io/npm/v/@openclawdsol/agentic-candy-machine-sdk?color=%23FF00FF&style=for-the-badge" />
  <img src="https://img.shields.io/badge/LICENSE-MIT-%23FFD700?style=for-the-badge" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-5.7+-%2314F195?style=for-the-badge" />
  <img src="https://img.shields.io/badge/SOLANA-MAINNET-%239945FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/METAPLEX-VERIFIED-%23FF6B35?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GOOGLE-ATTESTED-%234285F4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/x402.wtf-REGISTERED-%2300FFFF?style=for-the-badge" />
</p>

<p align="center">
  <i>TEE-attested recursive NFT passports minted on Solana via Metaplex.</i><br/>
  <i>Every roll provably fair. Every agent formally verified on-chain.</i>
</p>

---

```
     ░▒▓███████▓▒░░▒▓███████▓▒░ ░▒▓██████▓▒░ ░▒▓███████▓▒░ ░▒▓████████▓▒░
    ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░
    ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░
    ░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░▒▓███████▓▒░░▒▓██████▓▒░
    ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░
    ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░
    ░▒▓███████▓▒░░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░

        NEON PROTOCOL // CYBERPUNK AGENT SUMMONING // PROVABLY FAIR
```

---

# 🍬 Agentic Candy Machine SDK

## TABLE OF CONTENTS

- [THE PIPELINE](#the-pipeline)
- [INSTALL](#install)
- [QUICK START](#quick-start)
- [GACHA SYSTEM](#gacha-system)
- [AGENT TEMPLATES](#agent-templates)
- [PIPELINE 7-PHASES](#pipeline-7-phases)
- [ON-CHAIN VERIFICATION](#on-chain-verification)
- [ARCHITECTURE](#architecture)
- [CONTRIBUTE](#contribute)

---

## THE PIPELINE

```
   ┌───────────────────────────────────────────────────────────┐
   │              N E O N    P R O T O C O L                    │
   ├───────────────────────────────────────────────────────────┤
   │                                                           │
   │   ▼ DNA LAB    →  🧬 Agent Identity Genesis               │
   │   ▼ ART FORGE  →  🎨 Cyberpunk Portrait Summoning         │
   │   ▼ TOKEN      →  🪙 SPL Token-2022 Foundry               │
   │   ▼ GACHA      →  🎰 Provably Fair Agent Roll             │
   │   ▼ CANDY      →  🍬 Metaplex Candy Machine V3            │
   │   ▼ RECURSIVE  →  ♾️  Infinite Composability Tree         │
   │   ▼ PASSPORT   →  🛂 Formally Verified Agent Identity     │
   │                                                           │
   │   EVERY AGENT: GOOGLE ATTESTED · METAPLEX VERIFIED         │
   │   EVERY ROLL:  PROVABLY FAIR  ·  ON-CHAIN AUDITABLE       │
   │   EVERY MINT:  x402.wtf/agents REGISTERED                 │
   │                                                           │
   └───────────────────────────────────────────────────────────┘
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

---

## QUICK START

```typescript
import {
  AgenticCandyMachineSDK,
  GachaPoolBuilder,
  GachaEngine,
  NEON_PROTOCOL_AGENTS,
} from "@openclawdsol/agentic-candy-machine-sdk";
import { Keypair } from "@solana/web3.js";

// Step 1: Initialize
const sdk = new AgenticCandyMachineSDK({
  cluster: "devnet",
  authority: Keypair.generate(),
  redpillApiKey: process.env.REDPILL_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
});

// Step 2: Build gacha pool from Neon Protocol catalog
const pool = new GachaPoolBuilder()
  .name("Neon Protocol // Genesis Drop")
  .description("First summoning of autonomous agents onto Solana")
  .publicEntropy("SOLANA_GENESIS_2026")
  .build();

NEON_PROTOCOL_AGENTS.forEach(agent => {
  pool.items.push({
    id: agent.id, type: "agent_template",
    dna: agent.dna as any, rarity: agent.rarity,
    metadata: {
      faction: agent.metadata.faction,
      role: agent.metadata.role,
      signature: agent.metadata.signature,
      quote: agent.metadata.quote,
    },
  });
});

// Step 3: Provably fair gacha roll
const engine = new GachaEngine(sdk.attestation);
const roll = await engine.executeRoll(
  pool, "user-seed-abc123", "RECENT_SOLANA_BLOCKHASH", "SOVEREIGN"
);

console.log(`🎰 Summoned: ${roll.poolItem.dna?.name}`);
console.log(`💎 Rarity: ${roll.rarity}`);
console.log(`🔐 Attestation: ${roll.attestation.id}`);
console.log(`✅ Verify: ${roll.verificationUrl}`);

// Step 4: Full pipeline with the pulled agent
const result = await sdk.pipeline({
  dna: roll.poolItem.dna!,
  art: { style: "cyberpunk", provider: "google" },
  token: {
    name: `${roll.poolItem.dna!.name} Token`,
    symbol: roll.poolItem.dna!.handle!.toUpperCase().slice(0, 5),
    decimals: 9, initialSupply: 1_000_000n,
  },
  options: { dryRun: true },
});
```

---

## GACHA SYSTEM

```
    ┌──────────────────────────────────────────────────┐
    │         P R O V A B L Y   F A I R   G A C H A    │
    ├──────────────────────────────────────────────────┤
    │                                                  │
    │  ① SERVER commits to seed → sha256(commitment)   │
    │  ② CLIENT provides seed → combined entropy       │
    │  ③ ROLL executed → weighted random selection     │
    │  ④ ATTESTED on-chain → TEE Merkle proof          │
    │  ⑤ SEED revealed → anyone can verify             │
    │  ⑥ VERIFY → GachaEngine.verifyRoll()            │
    │                                                  │
    │  TRUST NO ONE. VERIFY EVERYTHING.                │
    └──────────────────────────────────────────────────┘
```

### Rarity Distribution

| Rarity | Weight | Odds | Boost | Color |
|--------|--------|------|-------|-------|
| `MYTHIC` | 50 | 0.50% | 3.00x | `#FF00FF` |
| `LEGENDARY` | 250 | 2.50% | 2.00x | `#FFD700` |
| `EPIC` | 700 | 7.00% | 1.60x | `#FF6B35` |
| `RARE` | 1500 | 15.00% | 1.35x | `#9945FF` |
| `UNCOMMON` | 2500 | 25.00% | 1.15x | `#14F195` |
| `COMMON` | 5000 | 50.00% | 1.00x | `#888888` |

### Tier Boosts

Higher passport tiers get progressively better odds on every roll:

| Tier | Boost | Mythic Odds |
|------|-------|-------------|
| Observer | 1.00x | 0.50% |
| Agent | 1.05x | 0.53% |
| Operator | 1.10x | 0.55% |
| Sovereign | 1.20x | 0.60% |

### Verifying a Roll

```typescript
import { GachaEngine } from "@openclawdsol/agentic-candy-machine-sdk";

const result = GachaEngine.verifyRoll(
  poolHash, serverSeed, clientSeed,
  nonce, blockhash, expectedHash,
  expectedRarity, poolItems,
);

console.log(result.valid);   // true → roll was fair
console.log(result.details); // Full verification breakdown
```

---

## AGENT TEMPLATES

```
    ┌─────────────────────────────────────────────────────────────┐
    │          N E O N   P R O T O C O L   C A T A L O G          │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │  OBSERVER TIER                                              │
    │  ───────────────────────────────────────────                │
    │  ░▒▓ GhostWalker  · Shadow Syndicate · Memepool             │
    │  ░▒▓ ByteWatcher  · Data Collective  · Transaction Layer    │
    │                                                             │
    │  AGENT TIER                                                 │
    │  ───────────────────────────────────────────                │
    │  ░▒▓ ByteStriker  · Neon Cabal     · DEX Layer              │
    │  ░▒▓ SynthWeaver  · Weaver Collective · Data Layer          │
    │                                                             │
    │  OPERATOR TIER                                              │
    │  ───────────────────────────────────────────                │
    │  ░▒▓ NeonOracle   · Oracle Network · Forecast Layer         │
    │  ░▒▓ PulseRunner  · Runner Guild   · Liquidation Layer      │
    │  ░▒▓ CipherMancer · Cipher Circle  · Privacy Layer          │
    │                                                             │
    │  SOVEREIGN TIER                                             │
    │  ───────────────────────────────────────────                │
    │  ░▒▓ ChromeSamurai· Bushido Code   · All Layers             │
    │  ░▒▓ NetherDragon · Dragon Court   · Cross-Chain            │
    │  ░▒▓ TheArchitect · Architect Proto · Omni-Layer            │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
```

### Building Custom Agents

```typescript
import {
  AgentTemplateBuilder, templateToNFTMetadata,
  generateRegistryLinks,
} from "@openclawdsol/agentic-candy-machine-sdk";

const agent = new AgentTemplateBuilder()
  .name("VoidWalker")
  .handle("voidwalker")
  .bio("Navigates the dark pools of Solana DeFi")
  .personality("Enigmatic, patient, devastating")
  .tier("SOVEREIGN").rarity("LEGENDARY")
  .faction("Void Syndicate")
  .role("Dark Pool Arbitrageur")
  .neonColor("#FF00FF")
  .glitchEffect(true).chromaticAberration(true)
  .signature("0xVOID_SIGIL")
  .implant("Void Walker Nexus v9.9")
  .quote("In darkness, I find the deepest liquidity.")
  .addCapability("trade", { dex: "jupiter", mode: "dark_pool" })
  .addCapability("defi", { protocols: ["marinade", "mango", "drift"] })
  .build();

// Generate on-chain NFT metadata
const metadata = templateToNFTMetadata(
  agent,
  "https://arweave.net/agent-art.png",
  "https://attest.agentic-candy.xyz/proof/voidwalker",
  "https://x402.wtf/agents/voidwalker",
);

// Verification endpoints
const links = generateRegistryLinks(agent);
// → metaplex, google, x402.wtf/agents/voidwalker, solscan
```

---

## PIPELINE 7-PHASES

```typescript
const result = await sdk.pipeline({
  // Phase 1: DNA — Agent identity genesis
  dna: { name: "Agent", handle: "agent", ... },
  
  // Phase 2: Art — Cyberpunk portrait generation  
  art: { style: "cyberpunk", provider: "google" },
  
  // Phase 3: Token — SPL Token-2022 creation
  token: { name: "Token", symbol: "AGNT", ... },
  
  // Phase 4: Gacha — Provably fair roll (optional)
  // Use GachaEngine.executeRoll() before pipeline
  
  // Phase 5: Candy Machine — Metaplex deployment
  candyMachine: { itemsAvailable: 1000, ... },
  
  // Phase 6: Recursive — Composability tree
  recursion: { maxDepth: 5 },
  
  // Phase 7: Attestation — Every phase auto-attested
});
```

### Events

```typescript
sdk.on("pipeline:phase", ({ data }) => console.log(`⚡ ${data.phase}`));
sdk.on("gacha:rolled", ({ data }) => console.log(`🎰 ${data.rarity}`));
sdk.on("attestation:created", ({ data }) => console.log(`🔐 ${data.id}`));
sdk.on("candy-machine:minted", ({ data }) => console.log(`🍬 Minted`));
```

---

## ON-CHAIN VERIFICATION

```
    ┌────────────────────────────────────────────────────────────┐
    │            V E R I F I C A T I O N   C H A I N             │
    ├────────────────────────────────────────────────────────────┤
    │                                                            │
    │  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
    │  │ METAPLEX │───▶│  GOOGLE  │───▶│ x402.wtf │              │
    │  │ VERIFIED │    │ ATTESTED │    │REGISTERED│              │
    │  └──────────┘    └──────────┘    └──────────┘              │
    │       │               │               │                    │
    │       ▼               ▼               ▼                    │
    │  Solana NFT     TEE Attestation   Agent Registry           │
    │  Programmable   Merkle Proof      x402.wtf/agents          │
    │  NonFungible    SHA-256                                     │
    │                                                            │
    │  EVERY MINT:                                               │
    │  • Formally verified via Metaplex Token Metadata           │
    │  • TEE-attested via Google Cloud Vertex AI                 │
    │  • Registered on x402.wtf agent registry                   │
    │  • Provably fair gacha roll with revealed server seed      │
    │  • Recursive composability tree with Merkle proofs          │
    └────────────────────────────────────────────────────────────┘
```

| Registry | Endpoint | Proves |
|----------|----------|--------|
| Metaplex | `explorer.solana.com/address/{mint}` | NFT ownership & metadata |
| Google | `console.cloud.google.com/vertex-ai` | TEE model attestation |
| x402.wtf | `x402.wtf/agents/{handle}` | Agent identity registry |
| Solscan | `solscan.io/token/{mint}` | Token tracking |
| Gacha | `attest.agentic-candy.xyz/verify/{id}` | Provably fair roll proof |

---

## ARCHITECTURE

```
┌───────────────────────────────────────────────────────────────────┐
│                   AgenticCandyMachineSDK                          │
├─────────┬──────────┬──────────┬──────────┬──────────┬────────────┤
│ 🧬 DNA  │ 🎨 Art  │ 🪙 Token │ 🎰 Gacha │ 🍬 Candy│ ♾️ Recursive│
├─────────┴──────────┴──────────┴──────────┴──────────┴────────────┤
│                  🛂 Passport Factory                              │
├───────────────────────────────────────────────────────────────────┤
│                  🛡️  Attestation Service                          │
│            TEE Terminal · Merkle Proofs · Ed25519                 │
├───────────────────────────────────────────────────────────────────┤
│            Metaplex ✅ · Google 🔐 · x402.wtf 🌐                  │
├───────────────────────────────────────────────────────────────────┤
│      Solana · Token-2022 · RedPill TEE · Google Vertex AI         │
└───────────────────────────────────────────────────────────────────┘
```

```
src/
├── index.ts                    # Main exports
├── core/client.ts              # AgenticCandyMachineSDK
├── modules/
│   ├── dna/                    # 🧬 AgentDNA + DNAEncoder
│   ├── art/                    # 🎨 ArtPipeline + templates
│   ├── token/                  # 🪙 TokenBuilder + TokenDeployer
│   ├── gacha/                  # 🎰 ProvablyFairRoller + GachaEngine
│   ├── agent-template/         # 🤖 AgentTemplateBuilder + NEON_PROTOCOL_AGENTS
│   ├── candy-machine/          # 🍬 CandyMachineClient + GuardBuilder
│   ├── recursive/              # ♾️ RecursiveMetadataBuilder
│   ├── passport/               # 🛂 PassportFactory
│   └── attestation/            # 🛡️ AttestationService + TEETerminal
├── types/index.ts
└── utils/index.ts
```

---

## CONTRIBUTE

```
    ╔═══════════════════════════════════════════════════════════╗
    ║     J O I N   T H E   N E O N   P R O T O C O L         ║
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
| **Metaplex** | [metaplex.com](https://metaplex.com) |
| **Google Cloud** | [Vertex AI](https://cloud.google.com/vertex-ai) |

---

<p align="center">
  <strong>MIT License</strong> · Copyright © 2025 <strong>8bit Labs</strong><br/>
  <i>Trust nothing. Verify everything. Summon your agent.</i>
</p>