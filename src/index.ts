// ═══════════════════════════════════════════════════════════════════════════
//  @agentic-candy-machine/sdk
//  Full-stack SDK for TEE-attested recursive NFT passports on Solana
//
//  DNA → Art → Token → Candy Machine → Recursive Metadata → Mint
// ═══════════════════════════════════════════════════════════════════════════

// ─── Core Client ─────────────────────────────────────────────────────────
export { AgenticCandyMachineSDK } from "./core/client.js";

// ─── DNA Module ──────────────────────────────────────────────────────────
export { DNABuilder, DNAEncoder, diffDNA, CAPABILITY_ACTIONS, CAPABILITY_WEIGHTS } from "./modules/dna/index.js";

// ─── Art Module ──────────────────────────────────────────────────────────
export { ArtPipeline, PROMPT_TEMPLATES } from "./modules/art/index.js";

// ─── Token Module ────────────────────────────────────────────────────────
export { TokenBuilder, TokenDeployer } from "./modules/token/index.js";

// ─── Candy Machine Module ────────────────────────────────────────────────
export { CandyMachineBuilder, CandyMachineClient, GuardBuilder } from "./modules/candy-machine/index.js";

// ─── Recursive Metadata Module ───────────────────────────────────────────
export {
  RecursiveMetadataBuilder, RecursiveResolver, PassportTreeBuilder,
  computeSelfHash, computeHiddenSettingsHash, CAPABILITY_ACTION_MAP,
} from "./modules/recursive/index.js";

// ─── Passport Module ─────────────────────────────────────────────────────
export { PassportFactory } from "./modules/passport/index.js";

// ─── Attestation Module ──────────────────────────────────────────────────
export { AttestationService, TEETerminal } from "./modules/attestation/index.js";

// ─── Provably Fair Gacha Module ──────────────────────────────────────────
export {
  GachaPoolBuilder, ProvablyFairRoller, GachaEngine,
  RARITY_WEIGHTS, GACHA_PRESETS,
} from "./modules/gacha/index.js";

// ─── Agent Template Module ───────────────────────────────────────────────
export {
  AgentTemplateBuilder, NEON_PROTOCOL_AGENTS,
  templatesToConfigLines, templateToNFTMetadata, generateRegistryLinks,
} from "./modules/agent-template/index.js";

// ─── x402 Payment Protocol ───────────────────────────────────────────────
export {
  X402Client, x402, registerAgentsOnX402, build402Response,
} from "./modules/x402/index.js";
export type {
  X402PaymentToken, X402Network, X402PriceConfig, X402Endpoint,
  X402AgentRegistration, X402PaymentChallenge, X402VerifyResult,
} from "./modules/x402/index.js";

// ─── Metaplex Agent Registry ─────────────────────────────────────────────
export {
  AgentDocumentBuilder, MetaplexAgentApiClient, metaplexAgentApi,
  buildEip8004Document,
} from "./modules/metaplex-agent/index.js";
export type {
  MetaplexNetwork, AgentService, AgentRegistration, AgentRegistrationDocument,
  MetaplexAgentMintInput, MetaplexAgentMintResult,
} from "./modules/metaplex-agent/index.js";

// ─── Clawd RWA — Tokenized AI Model ──────────────────────────────────────
export {
  ClaWdRwaBuilder, CLAWD_MODEL_STACK, createModelRwa,
} from "./modules/clawd-rwa/index.js";
export type {
  ModelProvider, InferenceAccess, ModelSpec, ClaWdModelConfig,
  BoundSplToken, ClaWdModelNFTMetadata, AgentTokenBinding, ClaWdRwaBundle,
} from "./modules/clawd-rwa/index.js";

// ─── Utilities ───────────────────────────────────────────────────────────
export {
  sha256, sha384, sha256Bytes, hmacSha256, contentHash, dnaHash, traitVector,
  buildMerkleTree, getMerklePath, verifyMerklePath,
  buildPointerUri, parsePointerUri, validatePointer,
  getConnection, getBalance, getBalanceSol, requestAirdrop,
  sendAndConfirm, estimateRent, createMemoInstruction,
  findPDA, encodeString,
  isValidPublicKey, isValidKeypair, validateConfig,
  sleep, uuid, shortId, nowUnix, lamportsToSol, solToLamports,
  truncateAddress, chunk,
  POINTER_PREFIX, SCHEMA_VERSION, SCHEMA_ID, MAX_RECURSION_DEPTH,
  MEMO_PROGRAM_ID, TIER_DEFINITIONS, RPC_ENDPOINTS,
} from "./utils/index.js";

// ─── Types ───────────────────────────────────────────────────────────────
export type {
  // Config
  SdkConfig, SolanaCluster, MetadataUploader,

  // DNA
  AgentDNA, DNAEncoding, TraitBlock, PassportTier, Permission,
  CapabilityType, CapabilityModule, ModelConfig,

  // Art
  ArtConfig, ArtArtifact, ArtProvider, ArtStyle, ArtPromptTemplate, CustomArtProvider,

  // Token
  TokenConfig, TokenMetadata, TokenExtension, TokenDeployResult,

  // Candy Machine
  CandyMachineConfig, CandyMachineTokenStandard, CandyMachineDeployResult,
  MintResult, ConfigLine, ConfigLineSettings, HiddenSettings,
  GuardConfig, GuardGroup, Creator,

  // Recursive
  RecursiveMetadata, RecursivePointer, RecursiveAction,
  ExecutionLink, CompositionLayer, AgentContext,
  ResolvedTree, MetadataFetcher,

  // Passport
  PassportBundle, PassportNFT, NFTMetadata, NFTAttribute,
  DeploymentStep, CostEstimate,

  // Attestation
  AttestationRecord, AttestationConfig, AttestationVerification, MerkleTree,
  TEERequest, TEEResponse, TEEMessage, EmbeddingRequest, EmbeddingResponse,

  // Events
  SdkEvent, SdkEventType,

  // Pipeline
  PipelineConfig, PipelineResult,

  // Patterns
  Buildable, Deployable,
} from "./types/index.js";
