// ═══════════════════════════════════════════════════════════════════════════
//  @agentic-candy-machine/sdk — Type Definitions
//  Complete type system for the Agentic Candy Machine framework
// ═══════════════════════════════════════════════════════════════════════════

import { PublicKey, Keypair, Transaction, TransactionInstruction } from "@solana/web3.js";

// ─── Network & Connection ────────────────────────────────────────────────

export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet" | "localnet";

export interface SdkConfig {
  cluster: SolanaCluster;
  rpcEndpoint?: string;
  commitment?: "processed" | "confirmed" | "finalized";
  authority: Keypair;
  treasury?: PublicKey;
  redpillApiKey?: string;
  redpillBaseUrl?: string;
  googleApiKey?: string;
  nanoBananaApiKey?: string;
  metadataUploader?: MetadataUploader;
  maxRetries?: number;
  logLevel?: "silent" | "error" | "warn" | "info" | "debug" | "trace";
}

export interface MetadataUploader {
  upload(data: Buffer | string, contentType: string): Promise<string>;
  uploadJson(json: object): Promise<string>;
}

// ─── DNA / Agent Identity ────────────────────────────────────────────────

export type PassportTier = "OBSERVER" | "AGENT" | "OPERATOR" | "SOVEREIGN";

export interface TierDefinition {
  id: PassportTier;
  name: string;
  level: number;
  color: string;
  permissions: Permission[];
  mintPrice: number; // lamports
}

export type Permission =
  | "read"
  | "execute"
  | "delegate"
  | "mint"
  | "attest"
  | "govern"
  | "transfer";

export type CapabilityType =
  | "trade"
  | "social"
  | "payment"
  | "analysis"
  | "mint"
  | "governance"
  | "defi"
  | "voice"
  | "custom";

export interface CapabilityModule {
  type: CapabilityType;
  name: string;
  version: string;
  config: Record<string, unknown>;
  action: RecursiveAction;
  weight: number; // 0-100 influence on DNA hash
}

export interface AgentDNA {
  // Identity
  name: string;
  handle: string;
  bio: string;
  personality: string;
  lore?: string;

  // Classification
  tier: PassportTier;
  capabilities: CapabilityModule[];

  // Intelligence
  model: ModelConfig;
  systemPrompt?: string;

  // Computed
  dnaHash: string;
  traitVector: number[];
  createdAt: number;
}

export interface ModelConfig {
  id: string;
  provider: string;
  tag: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface DNAEncoding {
  hash: string;
  version: number;
  traits: TraitBlock[];
  merkleRoot: string;
  signature: string;
}

export interface TraitBlock {
  category: string;
  values: number[];
  weight: number;
  hash: string;
}

// ─── Art / Image Generation ──────────────────────────────────────────────

export type ArtProvider = "google" | "nanobanan" | "custom";
export type ArtStyle = "passport" | "circuit" | "abstract" | "avatar" | "glitch" | "cosmic";

export interface ArtConfig {
  style: ArtStyle;
  provider: ArtProvider;
  prompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  tierColor?: string;
  customProvider?: CustomArtProvider;
}

export interface CustomArtProvider {
  generate(prompt: string, config: ArtConfig): Promise<ArtArtifact>;
}

export interface ArtArtifact {
  id: string;
  imageData: Buffer;
  contentType: string;
  width: number;
  height: number;
  prompt: string;
  provider: ArtProvider;
  style: ArtStyle;
  contentHash: string;
  uri?: string; // After upload
  attestation?: AttestationRecord;
  metadata: Record<string, unknown>;
}

export interface ArtPromptTemplate {
  style: ArtStyle;
  basePrompt: string;
  tierModifiers: Record<PassportTier, string>;
  negativePrompt?: string;
}

// ─── SPL Token ───────────────────────────────────────────────────────────

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  mintAuthority: boolean;    // retain after creation
  freezeAuthority: boolean;
  metadata: TokenMetadata;
  extensions?: TokenExtension[];
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
  description?: string;
  image?: string;
  externalUrl?: string;
  additionalMetadata?: [string, string][];
}

export type TokenExtension =
  | { type: "transferFee"; feeBasisPoints: number; maxFee: bigint }
  | { type: "interestBearing"; rate: number }
  | { type: "nonTransferable" }
  | { type: "permanentDelegate"; delegate: PublicKey }
  | { type: "transferHook"; programId: PublicKey }
  | { type: "confidentialTransfers" }
  | { type: "metadataPointer" };

export interface TokenDeployResult {
  mint: PublicKey;
  metadata: PublicKey;
  ata: PublicKey;
  supply: bigint;
  transaction: Transaction;
  signature?: string;
}

// ─── Candy Machine ───────────────────────────────────────────────────────

export type CandyMachineTokenStandard = "NonFungible" | "ProgrammableNonFungible";

export interface CandyMachineConfig {
  itemsAvailable: number;
  sellerFeeBasisPoints: number;
  tokenStandard: CandyMachineTokenStandard;
  symbol: string;
  maxEditionSupply: number;
  isMutable: boolean;
  creators: Creator[];
  configLineSettings?: ConfigLineSettings;
  hiddenSettings?: HiddenSettings;
  guards: GuardConfig;
  groups?: GuardGroup[];
}

export interface Creator {
  address: PublicKey;
  share: number; // 0-100
  verified?: boolean;
}

export interface ConfigLineSettings {
  prefixName: string;
  nameLength: number;
  prefixUri: string;
  uriLength: number;
  isSequential: boolean;
}

export interface HiddenSettings {
  name: string;
  uri: string;
  hash: Uint8Array; // 32 bytes
}

export interface GuardConfig {
  // Payment
  solPayment?: { lamports: number; destination: PublicKey };
  tokenPayment?: { amount: bigint; mint: PublicKey; destinationAta: PublicKey };

  // Limits
  mintLimit?: { id: number; limit: number };
  redeemedAmount?: { maximum: number };
  addressGate?: { address: PublicKey };

  // Time
  startDate?: { date: number }; // unix timestamp
  endDate?: { date: number };

  // Access
  nftGate?: { requiredCollection: PublicKey };
  nftBurn?: { requiredCollection: PublicKey };
  nftPayment?: { requiredCollection: PublicKey; destination: PublicKey };
  tokenGate?: { amount: bigint; mint: PublicKey };
  tokenBurn?: { amount: bigint; mint: PublicKey };
  allowList?: { merkleRoot: Uint8Array };
  thirdPartySigner?: { signerKey: PublicKey };

  // Bot protection
  botTax?: { lamports: number; lastInstruction: boolean };
  freezeSolPayment?: { lamports: number; destination: PublicKey };
  freezeTokenPayment?: { amount: bigint; mint: PublicKey; destinationAta: PublicKey };

  // Program gate
  programGate?: { additional: PublicKey[] };
}

export interface GuardGroup {
  label: string;
  guards: GuardConfig;
}

export interface ConfigLine {
  name: string;
  uri: string;
}

export interface CandyMachineDeployResult {
  candyMachine: PublicKey;
  collection: PublicKey;
  collectionAuthority: PublicKey;
  authority: PublicKey;
  itemsAvailable: number;
  itemsLoaded: number;
  transactions: Transaction[];
  signatures?: string[];
}

export interface MintResult {
  nft: PublicKey;
  metadata: PublicKey;
  masterEdition: PublicKey;
  tokenAccount: PublicKey;
  candyMachine: PublicKey;
  transaction: Transaction;
  signature?: string;
}

// ─── Recursive Metadata ──────────────────────────────────────────────────

export type RecursiveAction =
  | "resolve"    // Fetch and merge child metadata
  | "execute"    // Trigger agent action from child
  | "compose"    // Layer visual/data composition
  | "verify"     // Verify attestation chain
  | "embed"      // Generate embeddings from child
  | "transform"; // Apply child-defined transformation

export interface RecursivePointer {
  uri: string;        // recurse://<mint>/<depth>/<action>
  mint: PublicKey;
  depth: number;
  action: RecursiveAction;
  weight: number;     // 0-100
  condition?: string; // Optional conditional expression
}

export interface RecursiveMetadata {
  version: number;
  schema: string;  // "agentic-recursive-v1"
  depth: number;
  maxDepth: number;
  selfHash: string;

  // Pointers
  parentPointer?: RecursivePointer;
  childPointers: RecursivePointer[];

  // Execution
  executionChain: ExecutionLink[];

  // Composition
  compositionLayers: CompositionLayer[];

  // Attestation
  attestationRef?: string;

  // Agent metadata
  agentContext?: AgentContext;
}

export interface ExecutionLink {
  step: number;
  pointer: RecursivePointer;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  timeout?: number;
  fallback?: RecursivePointer;
}

export interface CompositionLayer {
  order: number;
  pointer: RecursivePointer;
  blendMode: "overlay" | "merge" | "replace" | "append";
  opacity: number; // 0-1
  mask?: string;
}

export interface AgentContext {
  dnaHash: string;
  tier: PassportTier;
  capabilities: CapabilityType[];
  modelTag: string;
  systemPromptHash: string;
}

export interface ResolvedTree {
  mint: PublicKey;
  metadata: RecursiveMetadata;
  children: ResolvedTree[];
  depth: number;
  resolvedAt: number;
  integrityValid: boolean;
}

export type MetadataFetcher = (mint: PublicKey) => Promise<RecursiveMetadata | null>;

// ─── Passport ────────────────────────────────────────────────────────────

export interface PassportBundle {
  root: PassportNFT;
  capabilities: PassportNFT[];
  tree: RecursiveMetadata;
  dna: AgentDNA;
  art?: ArtArtifact;
  token?: TokenDeployResult;
  attestations: AttestationRecord[];
  deploymentPlan: DeploymentStep[];
  estimatedCost: CostEstimate;
}

export interface PassportNFT {
  name: string;
  symbol: string;
  uri: string;
  metadata: NFTMetadata;
  recursive: RecursiveMetadata;
  image?: string;
  tier?: PassportTier;
  capabilityType?: CapabilityType;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  seller_fee_basis_points: number;
  attributes: NFTAttribute[];
  properties: {
    files: { uri: string; type: string }[];
    category: string;
    creators: { address: string; share: number }[];
  };
  // Recursive extension
  recursive?: RecursiveMetadata;
  // Agent extension
  agent?: AgentContext;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface DeploymentStep {
  order: number;
  action: string;
  description: string;
  instructions: TransactionInstruction[];
  signers: Keypair[];
  estimatedFee: number; // lamports
}

export interface CostEstimate {
  accountRent: number;
  metadataUpload: number;
  mintFees: number;
  candyMachineRent: number;
  tokenCreation: number;
  transactionFees: number;
  total: number; // lamports
  totalSol: number;
}

// ─── Attestation ─────────────────────────────────────────────────────────

export interface AttestationRecord {
  id: string;
  action: string;
  inputHash: string;
  outputHash: string;
  modelTag: string;
  timestamp: number;
  enclaveId: string;
  measurement: string;
  signature: string;
  merkleLeaf: string;
  merkleRoot: string;
  merklePath: string[];
  onChain?: {
    signature: string;
    slot: number;
  };
}

export interface AttestationConfig {
  enclaveKey: string;
  programId?: PublicKey;
  submitOnChain: boolean;
  hmacFallback: boolean;
}

export interface MerkleTree {
  root: string;
  leaves: string[];
  layers: string[][];
}

export interface AttestationVerification {
  valid: boolean;
  signatureValid: boolean;
  merkleValid: boolean;
  integrityValid: boolean;
  timestamp: number;
  details?: string;
}

// ─── TEE / Model ─────────────────────────────────────────────────────────

export interface TEERequest {
  model: string;
  messages: TEEMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface TEEMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface TEEResponse {
  id: string;
  content: string;
  model: string;
  usage: { prompt: number; completion: number; total: number };
  attestation: AttestationRecord;
  enclave: { id: string; measurement: string; timestamp: number };
}

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: { tokens: number };
  attestation: AttestationRecord;
}

// ─── Events ──────────────────────────────────────────────────────────────

export type SdkEventType =
  | "dna:created"
  | "dna:encoded"
  | "art:generating"
  | "art:generated"
  | "art:uploaded"
  | "token:creating"
  | "token:created"
  | "candy-machine:creating"
  | "candy-machine:created"
  | "candy-machine:items-loaded"
  | "candy-machine:minting"
  | "candy-machine:minted"
  | "recursive:tree-built"
  | "recursive:resolved"
  | "recursive:verified"
  | "passport:building"
  | "passport:built"
  | "passport:deployed"
  | "attestation:created"
  | "attestation:verified"
  | "attestation:on-chain"
  | "pipeline:started"
  | "pipeline:phase"
  | "pipeline:completed"
  | "pipeline:error"
  | "error";

export interface SdkEvent<T = unknown> {
  type: SdkEventType;
  timestamp: number;
  data: T;
}

// ─── Pipeline ────────────────────────────────────────────────────────────

export interface PipelineConfig {
  dna: Partial<AgentDNA>;
  art?: ArtConfig;
  token?: TokenConfig;
  candyMachine?: CandyMachineConfig;
  recursion?: {
    maxDepth: number;
    actions: RecursiveAction[];
  };
  options?: {
    dryRun?: boolean;
    skipArt?: boolean;
    skipToken?: boolean;
    autoUpload?: boolean;
    submitAttestations?: boolean;
  };
}

export interface PipelineResult {
  passport: PassportBundle;
  candyMachine?: CandyMachineDeployResult;
  token?: TokenDeployResult;
  attestations: AttestationRecord[];
  transactions: Transaction[];
  signatures: string[];
  cost: CostEstimate;
  duration: number;
}

// ─── Builder Patterns ────────────────────────────────────────────────────

export interface Buildable<T> {
  build(): T;
  validate(): { valid: boolean; errors: string[] };
}

export interface Deployable<T> {
  deploy(): Promise<T>;
  dryRun(): Promise<CostEstimate>;
  getInstructions(): TransactionInstruction[];
}
