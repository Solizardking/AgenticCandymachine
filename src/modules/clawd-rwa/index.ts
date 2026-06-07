// ═══════════════════════════════════════════════════════════════════════════
//  Clawd RWA — Tokenized AI Model as Metaplex Core Asset
//
//  The world's first tokenized Real-World AI Asset on Solana:
//  A Metaplex Core NFT that IS the model, bound to an on-chain agent,
//  capitalized by a Genesis bonding curve token, and monetized via x402.
//
//  Stack:
//    ClawdModel NFT   →  MPL Core asset representing the AI model
//    ClawdAgent PDA   →  AgentIdentityV2 registered on the NFT
//    CLAWD Token      →  Genesis bonding curve, setAgentTokenV1 binding
//    Asset Signer PDA →  Agent treasury (seeds: ["mpl-core-execute", asset])
//    x402 Gateway     →  Payment-gated inference endpoints (HTTP 402)
// ═══════════════════════════════════════════════════════════════════════════

import { sha256, uuid, nowUnix } from "../../utils/index.js";
import type { AgentService, AgentRegistrationDocument } from "../metaplex-agent/index.js";
import type { X402Endpoint } from "../x402/index.js";

// ─── RWA Model Types ──────────────────────────────────────────────────────

export type ModelProvider = "anthropic" | "openai" | "google" | "mistral" | "custom";
export type InferenceAccess = "x402" | "token-gated" | "public" | "holder-only";

export interface ModelSpec {
  provider: ModelProvider;
  modelId: string;         // e.g. "claude-sonnet-4-6", "gpt-4o", "gemini-pro"
  paramCount?: string;     // e.g. "7B", "70B", "unknown"
  contextWindow?: number;
  modalities?: ("text" | "image" | "audio" | "video" | "code")[];
  capabilities?: string[];
  inferenceEndpoint?: string;
  accessMethod: InferenceAccess;
}

export interface ClaWdModelConfig {
  name: string;
  symbol: string;
  description: string;
  model: ModelSpec;

  // On-chain token
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals?: number;
  creatorFeePercent?: number;   // % routed to Asset Signer PDA

  // Agent identity
  agentHandle: string;
  agentBio: string;
  agentServices?: AgentService[];

  // x402 pricing
  inferencePrice?: {
    token: "USDC" | "SOL";
    amountPerCall: number;   // micro-USDC or lamports
  };

  // Metadata
  imageUri?: string;
  externalUrl?: string;
  arweaveMetadataUri?: string;

  // SPL tokens to bind (additional utility tokens)
  boundSplTokens?: BoundSplToken[];
}

export interface BoundSplToken {
  mint: string;
  symbol: string;
  role: "utility" | "governance" | "fee-sharing" | "access";
  requiredHolding?: number;   // min tokens to access tier
}

// ─── On-chain layout ──────────────────────────────────────────────────────

export interface ClaWdModelNFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  animation_url?: string;
  attributes: Array<{ trait_type: string; value: string | number | boolean }>;
  properties: {
    category: "model";
    files: Array<{ uri: string; type: string }>;
    creators: Array<{ address: string; share: number }>;
    model: ModelSpec;
    agentIdentity: {
      handle: string;
      registryUrl: string;
      x402Url: string;
    };
    token: {
      name: string;
      symbol: string;
      bonding_curve: boolean;
      binding: "setAgentTokenV1";
    };
    boundSplTokens: BoundSplToken[];
    rwa: {
      type: "ai-model";
      assetClass: "tokenized-inference";
      underlyingAsset: string;  // model ID
      inferenceEndpoint: string;
      accessControl: InferenceAccess;
      x402PaymentChallenge?: string;
    };
  };
}

export interface AgentTokenBinding {
  agentAssetAddress: string;
  tokenMint: string;
  agentTokenField: "setAgentTokenV1";
  permanent: true;
  boundAt?: string;
}

export interface ClaWdRwaBundle {
  id: string;
  config: ClaWdModelConfig;

  /** MPL Core NFT metadata (upload to Arweave before minting) */
  nftMetadata: ClaWdModelNFTMetadata;

  /** EIP-8004 agent registration document */
  agentDocument: AgentRegistrationDocument;

  /** x402 endpoint definitions for inference gating */
  x402Endpoints: X402Endpoint[];

  /** Instructions for setAgentTokenV1 */
  tokenBinding: Omit<AgentTokenBinding, "agentAssetAddress" | "tokenMint"> & {
    agentAssetAddress: "PENDING_MINT";
    tokenMint: "PENDING_LAUNCH";
  };

  /** CLI commands to execute the full launch */
  cliCommands: string[];

  /** SDK code to run after minting */
  sdkSnippet: string;

  createdAt: string;
  signature: string;
}

// ─── Clawd RWA Builder ────────────────────────────────────────────────────

export class ClaWdRwaBuilder {
  private cfg: Partial<ClaWdModelConfig> = {};

  name(n: string)         { this.cfg.name = n; return this; }
  symbol(s: string)       { this.cfg.symbol = s; return this; }
  description(d: string)  { this.cfg.description = d; return this; }
  image(i: string)        { this.cfg.imageUri = i; return this; }
  externalUrl(u: string)  { this.cfg.externalUrl = u; return this; }

  model(spec: ModelSpec)  { this.cfg.model = spec; return this; }

  token(name: string, symbol: string, creatorFeePercent = 2.5) {
    this.cfg.tokenName = name;
    this.cfg.tokenSymbol = symbol;
    this.cfg.creatorFeePercent = creatorFeePercent;
    return this;
  }

  agent(handle: string, bio: string) {
    this.cfg.agentHandle = handle;
    this.cfg.agentBio = bio;
    return this;
  }

  inferencePrice(token: "USDC" | "SOL", amountPerCall: number) {
    this.cfg.inferencePrice = { token, amountPerCall };
    return this;
  }

  bindSplToken(token: BoundSplToken) {
    if (!this.cfg.boundSplTokens) this.cfg.boundSplTokens = [];
    this.cfg.boundSplTokens.push(token);
    return this;
  }

  build(paymentAddress: string): ClaWdRwaBundle {
    const cfg = this.cfg as ClaWdModelConfig;
    if (!cfg.name || !cfg.model || !cfg.agentHandle || !cfg.tokenSymbol) {
      throw new Error("ClaWdRwaBuilder: name, model, agentHandle, and tokenSymbol are required");
    }

    const id = uuid();
    const x402Base = cfg.externalUrl ?? `https://x402.wtf/agents/${cfg.agentHandle}`;
    const inferEndpoint = cfg.model.inferenceEndpoint ?? `${x402Base}/infer`;
    const now = new Date(nowUnix() * 1000).toISOString();

    // ── NFT Metadata ─────────────────────────────────────────────────────
    const nftMetadata: ClaWdModelNFTMetadata = {
      name: cfg.name,
      symbol: cfg.symbol ?? cfg.tokenSymbol,
      description: cfg.description ?? `${cfg.name} — Tokenized AI model on Solana`,
      image: cfg.imageUri ?? "",
      external_url: x402Base,
      attributes: [
        { trait_type: "Asset Class",        value: "Tokenized AI Model" },
        { trait_type: "Model Provider",     value: cfg.model.provider },
        { trait_type: "Model ID",           value: cfg.model.modelId },
        { trait_type: "Param Count",        value: cfg.model.paramCount ?? "proprietary" },
        { trait_type: "Context Window",     value: cfg.model.contextWindow ?? 0 },
        { trait_type: "Access Method",      value: cfg.model.accessMethod },
        { trait_type: "Token Symbol",       value: cfg.tokenSymbol },
        { trait_type: "Creator Fee",        value: `${cfg.creatorFeePercent ?? 2.5}%` },
        { trait_type: "Metaplex Verified",  value: true },
        { trait_type: "x402 Registered",   value: true },
        { trait_type: "TEE Attested",       value: true },
        { trait_type: "Agent Registered",   value: true },
        ...(cfg.model.modalities ?? []).map(m => ({ trait_type: "Modality", value: m })),
      ],
      properties: {
        category: "model",
        files: [{ uri: cfg.imageUri ?? "", type: "image/png" }],
        creators: [{ address: paymentAddress, share: 100 }],
        model: cfg.model,
        agentIdentity: {
          handle: cfg.agentHandle,
          registryUrl: `https://api.metaplex.com/v1/agents/${cfg.agentHandle}`,
          x402Url: x402Base,
        },
        token: {
          name: cfg.tokenName ?? `${cfg.name} Token`,
          symbol: cfg.tokenSymbol,
          bonding_curve: true,
          binding: "setAgentTokenV1",
        },
        boundSplTokens: cfg.boundSplTokens ?? [],
        rwa: {
          type: "ai-model",
          assetClass: "tokenized-inference",
          underlyingAsset: cfg.model.modelId,
          inferenceEndpoint: inferEndpoint,
          accessControl: cfg.model.accessMethod,
        },
      },
    };

    // ── EIP-8004 Document ─────────────────────────────────────────────────
    const services: AgentService[] = [
      { name: "web",         endpoint: x402Base },
      { name: "inference",   endpoint: inferEndpoint,           version: "1.0" },
      { name: "A2A",         endpoint: `${x402Base}/agent-card.json`, version: "0.3.0" },
      { name: "MCP",         endpoint: `${x402Base}/mcp`,       version: "2025-06-18" },
      ...(cfg.agentServices ?? []),
    ];

    const agentDocument: AgentRegistrationDocument = {
      type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
      name: cfg.name,
      description: cfg.agentBio,
      image: cfg.imageUri,
      services,
      active: true,
      registrations: [
        { agentId: "PENDING_MINT", agentRegistry: "solana:101:metaplex" },
      ],
      supportedTrust: ["tee-attestation", "crypto-economic", "reputation"],
      x402: {
        endpoint: inferEndpoint,
        paymentToken: cfg.inferencePrice?.token ?? "USDC",
      },
    };

    // ── x402 Endpoints ────────────────────────────────────────────────────
    const x402Endpoints: X402Endpoint[] = [
      {
        path: `/agents/${cfg.agentHandle}/infer`,
        method: "POST",
        description: `${cfg.name} inference — single LLM call`,
        price: {
          token: cfg.inferencePrice?.token ?? "USDC",
          amount: cfg.inferencePrice?.amountPerCall ?? 100_000,
          recipient: paymentAddress,
          network: "solana-mainnet",
        },
        rateLimit: { requests: 20, windowSeconds: 60 },
      },
      {
        path: `/agents/${cfg.agentHandle}/stream`,
        method: "POST",
        description: `${cfg.name} streaming inference`,
        price: {
          token: cfg.inferencePrice?.token ?? "USDC",
          amount: Math.floor((cfg.inferencePrice?.amountPerCall ?? 100_000) * 1.5),
          recipient: paymentAddress,
          network: "solana-mainnet",
        },
        rateLimit: { requests: 10, windowSeconds: 60 },
      },
      {
        path: `/agents/${cfg.agentHandle}/embed`,
        method: "POST",
        description: `${cfg.name} embeddings`,
        price: {
          token: cfg.inferencePrice?.token ?? "USDC",
          amount: Math.floor((cfg.inferencePrice?.amountPerCall ?? 100_000) * 0.1),
          recipient: paymentAddress,
          network: "solana-mainnet",
        },
        rateLimit: { requests: 100, windowSeconds: 60 },
      },
    ];

    // ── CLI Commands ───────────────────────────────────────────────────────
    const cliCommands = [
      `# 1. Mint the Clawd model as a Metaplex Core agent`,
      `mplx agents mint \\`,
      `  --name "${cfg.name}" \\`,
      `  --uri "${cfg.arweaveMetadataUri ?? "<ARWEAVE_URI>"}" \\`,
      `  --agent-metadata-uri "${x402Base}/agent-card.json"`,
      ``,
      `# 2. Optionally register identity separately`,
      `mplx agents register \\`,
      `  --asset <ASSET_ADDRESS> \\`,
      `  --registration-uri "${x402Base}/agent-registration.json"`,
      ``,
      `# 3. Launch ${cfg.tokenSymbol} token with bonding curve + atomic agent binding`,
      `mplx genesis launch create --launchType bonding-curve \\`,
      `  --name "${cfg.tokenName ?? cfg.name + " Token"}" \\`,
      `  --symbol "${cfg.tokenSymbol}" \\`,
      `  --image "${cfg.imageUri ?? "<TOKEN_IMAGE_URI>"}" \\`,
      `  --agentAsset <AGENT_ASSET_ADDRESS> \\`,
      `  --agentSetToken`,
    ];

    // ── SDK Snippet ────────────────────────────────────────────────────────
    const sdkSnippet = `
import {
  mintAndSubmitAgent, mplAgentIdentity,
} from '@metaplex-foundation/mpl-agent-registry';
import { createAndRegisterLaunch } from '@metaplex-foundation/mpl-genesis'; // genesis SDK
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import {
  X402Client, registerAgentsOnX402,
} from '@openclawdsol/agentic-candy-machine-sdk/x402';

// 1. Set up Umi
const umi = createUmi('https://api.mainnet-beta.solana.com')
  .use(mplAgentIdentity());
umi.use(keypairIdentity(keypair));

// 2. Mint ${cfg.name} as a Metaplex Core agent + AgentIdentityV2 in one tx
const { assetAddress, signature } = await mintAndSubmitAgent(umi, {}, {
  wallet: umi.identity.publicKey,
  name: '${cfg.name}',
  uri: '${cfg.arweaveMetadataUri ?? "<ARWEAVE_METADATA_URI>"}',
  agentMetadata: {
    type: 'agent',
    name: '${cfg.name}',
    description: '${cfg.agentBio.replace(/'/g, "\\'")}',
    services: [
      { name: 'inference', endpoint: '${inferEndpoint}' },
      { name: 'MCP',       endpoint: '${x402Base}/mcp', version: '2025-06-18' },
    ],
    registrations: [],
    supportedTrust: ['tee-attestation', 'crypto-economic'],
  },
});
console.log('Agent asset:', assetAddress);

// 3. Launch ${cfg.tokenSymbol} bonding curve + permanently bind to agent
await createAndRegisterLaunch(umi, {
  name: '${cfg.tokenName ?? cfg.name + " Token"}',
  symbol: '${cfg.tokenSymbol}',
  image: '${cfg.imageUri ?? "<TOKEN_IMAGE_URI>"}',
  agent: { mint: assetAddress, setToken: true }, // triggers setAgentTokenV1
}).sendAndConfirm(umi);
console.log('${cfg.tokenSymbol} launched and permanently bound to agent');

// 4. Register on x402.wtf
const x402 = new X402Client();
const registration = await x402.register(
  { handle: '${cfg.agentHandle}', name: '${cfg.name}', ...template },
  umi.identity.publicKey.toString(),
);
console.log('x402 registry:', registration.registryUrl);
`.trim();

    const payload = JSON.stringify({ id, name: cfg.name, handle: cfg.agentHandle, now });

    return {
      id,
      config: cfg as ClaWdModelConfig,
      nftMetadata,
      agentDocument,
      x402Endpoints,
      tokenBinding: {
        agentAssetAddress: "PENDING_MINT",
        tokenMint: "PENDING_LAUNCH",
        agentTokenField: "setAgentTokenV1",
        permanent: true,
      },
      cliCommands,
      sdkSnippet,
      createdAt: now,
      signature: sha256(payload),
    };
  }
}

// ─── Clawd Canonical Stack ────────────────────────────────────────────────
// The reference Clawd model — Claude Sonnet on Solana via x402

export const CLAWD_MODEL_STACK = new ClaWdRwaBuilder()
  .name("Clawd")
  .symbol("CLAWD")
  .description(
    "Clawd — Claude Sonnet 4.6 tokenized on Solana as a Metaplex Core RWA. " +
    "The world's first on-chain AI inference asset: hold $CLAWD, access the model via x402 micropayments."
  )
  .model({
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    paramCount: "proprietary",
    contextWindow: 200_000,
    modalities: ["text", "code", "image"],
    capabilities: ["reasoning", "analysis", "coding", "agents", "tool-use", "vision"],
    inferenceEndpoint: "https://x402.wtf/agents/clawd/infer",
    accessMethod: "x402",
  })
  .token("Clawd Token", "CLAWD", 2.5)
  .agent(
    "clawd",
    "Claude Sonnet 4.6 — TEE-attested AI inference on Solana. " +
    "Tokenized as a Metaplex Core RWA. Access via x402 micropayments. " +
    "Hold $CLAWD for fee revenue and governance rights.",
  )
  .inferencePrice("USDC", 100_000)   // 0.10 USDC per inference call
  .image("https://x402.wtf/assets/clawd-model.png")
  .externalUrl("https://x402.wtf/agents/clawd");

// ─── Helper: build a custom AI model RWA ─────────────────────────────────

export function createModelRwa(
  config: ClaWdModelConfig,
  paymentAddress: string,
): ClaWdRwaBundle {
  const builder = new ClaWdRwaBuilder()
    .name(config.name)
    .description(config.description)
    .model(config.model)
    .token(config.tokenName, config.tokenSymbol, config.creatorFeePercent)
    .agent(config.agentHandle, config.agentBio);

  if (config.imageUri)      builder.image(config.imageUri);
  if (config.externalUrl)   builder.externalUrl(config.externalUrl);
  if (config.inferencePrice) {
    builder.inferencePrice(config.inferencePrice.token, config.inferencePrice.amountPerCall);
  }
  for (const t of config.boundSplTokens ?? []) builder.bindSplToken(t);

  return builder.build(paymentAddress);
}
