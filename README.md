# 🍬 Agentic Candy Machine SDK

[![npm version](https://img.shields.io/npm/v/@openclawdsol/agentic-candy-machine-sdk)](https://www.npmjs.com/package/@openclawdsol/agentic-candy-machine-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue)](https://www.typescriptlang.org/)

**Full-stack framework for TEE-attested recursive NFT passports on Solana via Metaplex.**

Build, configure, and deploy AI agent identity systems as recursive NFTs — with DNA encoding, generative art, SPL tokens, Candy Machine V2, and TEE attestation baked in.

```
DNA → Art → Token → Candy Machine → Recursive Metadata → Mint
```

---

## Table of Contents

- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Module-by-Module Usage](#module-by-module-usage)
  - [🧬 DNA Lab](#-dna-lab)
  - [🎨 Art Forge](#-art-forge)
  - [🪙 Token Foundry](#-token-foundry)
  - [🍬 Candy Machine](#-candy-machine)
  - [♾️ Recursive Metadata](#️-recursive-metadata)
  - [🛡️ Attestation](#️-attestation)
- [Event System](#event-system)
- [Recursive Pointer Schema](#recursive-pointer-schema)
- [Passport Tier System](#passport-tier-system)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  AgenticCandyMachineSDK                     │
├─────────┬──────────┬──────────┬──────────┬────────┬────────┤
│ DNA Lab │ Art Forge│  Token   │  Candy   │Recursive│Passport│
│         │          │ Foundry  │ Machine  │Metadata │Factory │
├─────────┴──────────┴──────────┴──────────┴────────┴────────┤
│                    Attestation Service                       │
│              TEE Terminal · Merkle Proofs · Ed25519          │
├─────────────────────────────────────────────────────────────┤
│         Solana · Metaplex · Token-2022 · RedPill TEE        │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
npm install @openclawdsol/agentic-candy-machine-sdk
```

## Quick Start

```typescript
import { AgenticCandyMachineSDK, DNABuilder } from "@openclawdsol/agentic-candy-machine-sdk";
import { Keypair } from "@solana/web3.js";

// Initialize
const sdk = new AgenticCandyMachineSDK({
  cluster: "devnet",
  authority: Keypair.generate(),
  redpillApiKey: process.env.REDPILL_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
});

// Full pipeline — one call does everything
const result = await sdk.pipeline({
  dna: {
    name: "TerminAgent",
    handle: "terminagent",
    bio: "Autonomous DeFi hunter on Solana",
    personality: "Aggressive alpha seeker with data-driven precision",
    tier: "OPERATOR",
    capabilities: [
      { type: "trade", name: "Trade Module", version: "1.0.0", config: {}, action: "execute", weight: 90 },
      { type: "analysis", name: "Analytics Module", version: "1.0.0", config: {}, action: "embed", weight: 70 },
      { type: "social", name: "Social Module", version: "1.0.0", config: {}, action: "compose", weight: 60 },
    ],
  },
  art: { style: "passport", provider: "google" },
  token: {
    name: "TerminAgent Token",
    symbol: "TAGNT",
    decimals: 9,
    initialSupply: 1_000_000n,
    mintAuthority: true,
    freezeAuthority: false,
    metadata: { name: "TerminAgent Token", symbol: "TAGNT", uri: "" },
  },
  candyMachine: new (sdk.constructor as any).CandyMachineBuilder()
    .items(1000)
    .symbol("TAGNT")
    .sellerFee(500)
    .standard("ProgrammableNonFungible")
    .addCreator(sdk.authority, 100)
    .configLines({
      prefixName: "TerminAgent #",
      nameLength: 4,
      prefixUri: "https://arweave.net/",
      uriLength: 43,
      isSequential: false,
    })
    .withTieredGroups(sdk.authority)
    .build(),
  options: { dryRun: true },
});

console.log("Deployed!", result.passport.root.name);
console.log("Cost estimate:", result.cost.totalSol, "SOL");
console.log("Attestations:", result.attestations.length);
```

---

## Module-by-Module Usage

### 🧬 DNA Lab

```typescript
import { DNABuilder, DNAEncoder } from "@openclawdsol/agentic-candy-machine-sdk";

const dna = new DNABuilder()
  .name("NeuralTrader")
  .handle("neuraltrader")
  .bio("AI-powered market maker with predictive analytics")
  .personality("Calculated, patient, data-obsessed")
  .tier("SOVEREIGN")
  .addCapability("trade", { dex: "jupiter", slippage: 100 })
  .addCapability("analysis", { provider: "birdeye" })
  .addCapability("defi", { protocols: ["marinade", "raydium"] })
  .addCapability("governance", { dao: "realms" })
  .model({ id: "claude", provider: "Anthropic", tag: "claude-sonnet-4-5", temperature: 0.3 })
  .systemPrompt("You are a sovereign DeFi agent. Maximize yield, minimize risk.")
  .build();

// Encode DNA into compact trait blocks
const encoding = DNAEncoder.encode(dna);
console.log("DNA Hash:", dna.dnaHash);
console.log("Trait blocks:", encoding.traits.length);
console.log("Merkle root:", encoding.merkleRoot);

// Verify encoding integrity
console.log("Valid:", DNAEncoder.verify(encoding));
```

### 🎨 Art Forge

```typescript
import { ArtPipeline } from "@openclawdsol/agentic-candy-machine-sdk";

const art = new ArtPipeline({
  googleApiKey: process.env.GOOGLE_API_KEY,
});

// Generate a single piece
const passport = await art.generate({
  style: "passport",
  provider: "google",
  prompt: "Holographic sovereign passport with golden circuit traces",
}, dna);

// Generate full passport set (main + capability icons)
const { main, capabilities } = await art.generatePassportSet(dna, {
  provider: "google",
});

// Recursive art — each layer derived from parent
const layer0 = await art.generateRecursiveArt(dna, 0);
const layer1 = await art.generateRecursiveArt(dna, 1, layer0.contentHash);

// Register custom provider
art.registerProvider("custom", async (prompt, config) => {
  // Your custom image generation logic
  return { /* ArtArtifact */ } as any;
});
```

### 🪙 Token Foundry

```typescript
import { TokenBuilder, TokenDeployer } from "@openclawdsol/agentic-candy-machine-sdk";

const tokenConfig = new TokenBuilder()
  .name("Agent Governance Token")
  .symbol("AGT")
  .decimals(9)
  .supply(10_000_000n)
  .retainMintAuthority(false)     // Revoke after creation
  .retainFreezeAuthority(false)
  .addTransferFee(100, 1000000n)  // 1% fee, 0.001 max
  .description("Governance token for the Agent DAO")
  .build();

const deployer = new TokenDeployer(connection, authority);
const result = await deployer.deploy(tokenConfig);
console.log("Mint:", result.mint.toBase58());
```

### 🍬 Candy Machine

```typescript
import { CandyMachineBuilder, CandyMachineClient, GuardBuilder } from "@openclawdsol/agentic-candy-machine-sdk";

// Build guards
const publicGuards = new GuardBuilder()
  .solPayment(0.1 * LAMPORTS_PER_SOL, treasury)
  .mintLimit(1, 5)
  .startDate(new Date("2025-01-01"))
  .botTax(0.01 * LAMPORTS_PER_SOL)
  .build();

// Build candy machine config
const cmConfig = new CandyMachineBuilder()
  .items(5000)
  .symbol("AGNT")
  .sellerFee(500) // 5%
  .standard("ProgrammableNonFungible")
  .addCreator(authority.publicKey, 100)
  .configLines({
    prefixName: "Agent Passport #",
    nameLength: 4,
    prefixUri: "https://arweave.net/",
    uriLength: 43,
    isSequential: false,
  })
  .defaultGuards(publicGuards)
  .addGroup("whale", new GuardBuilder()
    .solPayment(1 * LAMPORTS_PER_SOL, treasury)
    .build()
  )
  .addGroup("allowlist", new GuardBuilder()
    .allowList(["address1...", "address2..."])
    .build()
  )
  .withTieredGroups(treasury)   // Pre-built tiers
  .build();

// Deploy
const client = new CandyMachineClient(connection, authority);
const collection = await client.createCollection("Agent Collection", metadataUri, 500);
const cm = await client.deploy(cmConfig, collection);

// Add items
const items = client.generateAgentConfigLines("Agent", "https://arweave.net", 5000);
await client.addItems(cm.candyMachine, items);

// Mint
const nft = await client.mint(cm.candyMachine, "operator");
console.log("Minted:", nft.nft.toBase58());

// Check status
const status = await client.getStatus(cm.candyMachine);
console.log(`${status.itemsMinted}/${status.itemsAvailable} minted`);
```

### ♾️ Recursive Metadata

```typescript
import {
  RecursiveMetadataBuilder, RecursiveResolver, PassportTreeBuilder,
  buildPointerUri, parsePointerUri,
} from "@openclawdsol/agentic-candy-machine-sdk";

// Build recursive metadata manually
const meta = new RecursiveMetadataBuilder()
  .depth(0)
  .maxDepth(5)
  .addChild(tradeMint, "execute", 90)
  .addChild(socialMint, "compose", 60)
  .addChild(analysisMint, "embed", 70)
  .addExecutionStep(
    { uri: buildPointerUri(tradeMint, 1, "execute"), mint: tradeMint, depth: 1, action: "execute", weight: 90 },
    { trigger: "price_alert" },
    { result: "trade_output" },
    30000, // 30s timeout
  )
  .addCompositionLayer(
    { uri: buildPointerUri(socialMint, 1, "compose"), mint: socialMint, depth: 1, action: "compose", weight: 60 },
    "merge", 0.8,
  )
  .attestation("attest://merkle-root-hash")
  .agentContext({ dnaHash: dna.dnaHash, tier: "OPERATOR", capabilities: ["trade", "social"], modelTag: "claude-sonnet-4-5", systemPromptHash: "abc123" })
  .build();

// Build a full passport tree automatically
const tree = PassportTreeBuilder.buildTree(
  rootMint,
  [
    { type: "trade", mint: tradeMint },
    { type: "social", mint: socialMint },
    { type: "analysis", mint: analysisMint },
  ],
  "OPERATOR",
  dna.dnaHash,
  5, // max depth
);

// Serialize for NFT metadata
const nftJson = PassportTreeBuilder.serializeForNFT(tree.root);

// Resolve a tree from on-chain data
const resolver = new RecursiveResolver(async (mint) => {
  // Fetch metadata from Solana (e.g., via Metaplex DAS API)
  const response = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=KEY`, {
    method: "POST",
    body: JSON.stringify({ mintAccounts: [mint.toBase58()] }),
  });
  const data = await response.json();
  return PassportTreeBuilder.deserializeFromNFT(data[0]?.offChainMetadata?.metadata);
});

const resolved = await resolver.resolve(rootMint);
console.log("Tree depth:", resolved.depth);
console.log("Children:", resolved.children.length);

// Verify integrity
const verification = resolver.verifyTree(resolved);
console.log("Tree valid:", verification.valid);

// Parse pointer URIs
const pointer = parsePointerUri("recurse://5FHwk.../2/execute");
// { mint: PublicKey, depth: 2, action: "execute", weight: 100 }
```

### 🛡️ Attestation

```typescript
import { AttestationService, TEETerminal } from "@openclawdsol/agentic-candy-machine-sdk";

// Create attestation for any action
const attestation = await sdk.attestation.attest(
  "custom_action",
  { input: "data" },
  { output: "result" },
  "my-model",
);

console.log("Attestation ID:", attestation.id);
console.log("Merkle root:", attestation.merkleRoot);
console.log("On-chain:", attestation.onChain?.signature);

// Verify
const verification = sdk.attestation.verify(attestation);
console.log("Valid:", verification.valid);
console.log("Details:", verification.details);

// TEE completion with attestation
if (sdk.tee) {
  const response = await sdk.tee.complete({
    model: "chat",
    messages: [
      { role: "system", content: "You are a DeFi analyst." },
      { role: "user", content: "Analyze SOL/USDC liquidity." },
    ],
    temperature: 0.5,
  });
  console.log("Response:", response.content);
  console.log("TEE attested:", response.attestation.id);
}
```

---

## Event System

```typescript
sdk.on("pipeline:phase", (event) => {
  console.log(`Phase: ${event.data.phase} — ${event.data.status}`);
});

sdk.on("candy-machine:minted", (event) => {
  console.log("Minted NFT:", event.data.result.nft.toBase58());
});

sdk.on("attestation:created", (event) => {
  console.log("New attestation:", event.data.id);
});

sdk.on("*", (event) => {
  // Catch all events
  console.log(`[${event.type}]`, event.timestamp);
});
```

---

## Recursive Pointer Schema

```
recurse://<mint_address>/<depth>/<action>
```

| Action | Description | Use Case |
|--------|-------------|----------|
| `resolve` | Fetch and merge child metadata | Standard tree traversal |
| `execute` | Trigger agent action from child | Trade, payment, mint |
| `compose` | Layer visual/data composition | Social, UI rendering |
| `verify` | Verify attestation chain | Governance, compliance |
| `embed` | Generate embeddings from child | Analysis, similarity |
| `transform` | Apply child-defined transformation | Voice, custom logic |

---

## Passport Tier System

| Tier | Level | Color | Price | Permissions |
|------|-------|-------|-------|-------------|
| Observer | 0 | `#666666` | Free | read |
| Agent | 1 | `#9945FF` | 0.05 SOL | read, execute |
| Operator | 2 | `#14F195` | 0.1 SOL | read, execute, delegate |
| Sovereign | 3 | `#FFD700` | 1 SOL | read, execute, delegate, mint, attest |

---

## Project Structure

```
src/
├── index.ts                    # Main exports
├── core/
│   └── client.ts               # AgenticCandyMachineSDK
├── modules/
│   ├── dna/                    # Agent identity encoding
│   │   └── index.ts            # DNABuilder, DNAEncoder
│   ├── art/                    # Image generation pipeline
│   │   └── index.ts            # ArtPipeline, templates
│   ├── token/                  # SPL Token-2022 creation
│   │   └── index.ts            # TokenBuilder, TokenDeployer
│   ├── candy-machine/          # Metaplex Candy Machine V2
│   │   └── index.ts            # CandyMachineClient, GuardBuilder
│   ├── recursive/              # Recursive metadata system
│   │   └── index.ts            # Builder, Resolver, TreeBuilder
│   ├── passport/               # Passport bundle factory
│   │   └── index.ts            # PassportFactory
│   └── attestation/            # TEE attestation + Merkle proofs
│       └── index.ts            # AttestationService, TEETerminal
├── types/
│   └── index.ts                # Complete type definitions
└── utils/
    └── index.ts                # Hashing, encoding, Solana helpers
```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/Solizardking/AgenticCandymachine).

### Development

```bash
git clone https://github.com/Solizardking/AgenticCandymachine.git
cd AgenticCandymachine
npm install
npm run build
```

Make sure to run tests before submitting a PR:

```bash
npm test
```

---

## License

MIT — Copyright (c) 2025 8bit Labs. See [LICENSE](./LICENSE) for details.