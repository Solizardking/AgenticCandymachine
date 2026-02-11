
import { Keypair, PublicKey, ConfirmedSignatureInfo } from "@solana/web3.js";

// Callbacks
export type MetadataFetcher = (mint: PublicKey) => Promise<RecursiveMetadata>;

// Enums
export type PassportTier = "OBSERVER" | "AGENT" | "OPERATOR" | "SOVEREIGN";
export type CapabilityType = "trade" | "analysis" | "social" | "defi" | "governance";

// Config
export interface SdkConfig {
  cluster: SolanaCluster;
  authority: Keypair;
  rpcEndpoint?: string;
  redpillApiKey?: string;
  redpillBaseUrl?: string; // Add optional base URL
  googleApiKey?: string;
  nanoBananaApiKey?: string;
  metadataUploader?: MetadataUploader;
}

export type SolanaCluster = "devnet" | "testnet" | "mainnet-beta";

export interface MetadataUploader {
  upload(data: Buffer, contentType: string): Promise<string>;
}

// DNA Module
export interface AgentDNA {
  name: string;
  handle: string;
  bio: string;
  personality: string;
  tier: PassportTier;
  lore?: string;
  systemPrompt?: string;
  model?: ModelConfig;
  capabilities: CapabilityModule[];
  dnaHash?: string;
}

export interface ModelConfig {
  id: string;
  provider: string;
  tag: string;
  temperature?: number;
}

export interface CapabilityModule {
  type: CapabilityType;
  name?: string;     // Optional, defaulting in builder
  version?: string;  // Optional package version
  config: Record<string, any>;
  action?: string;   // e.g. "execute", "embed"
  weight?: number;   // 0-100 logic weight
}

export interface DNAEncoding {
  traits: TraitBlock[];
  merkleRoot: string;
}

export interface TraitBlock {
  layer: string;
  value: string;
  dnaHash: string;
}

export interface Permission {
  resource: string;
  action: "read" | "write" | "execute" | "mint" | "delegate" | "attest";
}

// Art Module
export type ArtStyle = "passport" | "cyberpunk" | "minimalist" | "abstract";

export interface ArtConfig {
  style: ArtStyle;
  provider: ArtProvider;
  prompt?: string;
  negativePrompt?: string;
}

export type ArtProvider = "google" | "midjourney" | "stable-diffusion" | "custom";
export type CustomArtProvider = (prompt: string, config: any) => Promise<ArtArtifact>;

export interface ArtArtifact {
  imageData: Buffer;
  contentType: string;
  contentHash: string;
  provider: ArtProvider;
  uri?: string;
  metadata?: any;
}

export interface ArtPromptTemplate {
  template: string;
  variables: string[];
}

// Token Module
export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  mintAuthority?: boolean;
  freezeAuthority?: boolean;
  metadata?: TokenMetadata;
  extensions?: TokenExtension[];
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
}

export type TokenExtension = "transferFee" | "interestBearing" | "nonTransferable";

export interface TokenDeployResult {
  mint: PublicKey;
  tokenAccount: PublicKey;
  signature: string;
}

// Candy Machine Module
export interface CandyMachineConfig {
  itemsAvailable: number;
  symbol: string;
  sellerFeeBasisPoints: number;
  tokenStandard?: CandyMachineTokenStandard;
  creators: Creator[];
  configLineSettings?: ConfigLineSettings;
  hiddenSettings?: HiddenSettings;
  groups?: GuardGroup[];
  guards?: GuardConfig;
}

export type CandyMachineTokenStandard = "ProgrammableNonFungible" | "NonFungible";

export interface Creator {
  address: PublicKey;
  share: number;
  verified: boolean;
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
  hash: Uint8Array;
}

export interface GuardGroup {
  label: string;
  guards: GuardConfig;
}

export interface GuardConfig {
  botTax?: { value: number; lastInstruction: boolean };
  solPayment?: { value: number; destination: PublicKey };
  tokenPayment?: { amount: bigint; mint: PublicKey; destination: PublicKey };
  startDate?: { date: Date };
  endDate?: { date: Date };
  mintLimit?: { id: number; limit: number };
  allowList?: { merkleRoot: Uint8Array };
  gatekeeper?: { gatekeeperNetwork: PublicKey; expireOnUse: boolean };
}

export interface CandyMachineDeployResult {
  candyMachine: PublicKey;
  lut?: PublicKey;
  signature: string;
  itemsLoaded: number;
}

export interface MintResult {
  nft: PublicKey;
  signature: string;
}

export interface ConfigLine {
  name: string;
  uri: string;
}

// Recursive Module
export interface RecursiveMetadata {
  name?: string;
  symbol?: string;
  uri?: string;
  depth?: number;
  children?: RecursivePointer[];

  // Agent context specific
  agentContext?: AgentContext;
}

export interface RecursivePointer {
  mint: PublicKey;
  depth: number;
  action: RecursiveAction;
  weight?: number; // 0-100 influence
}

export type RecursiveAction = "resolve" | "execute" | "compose" | "verify" | "embed" | "transform";

export interface AgentContext {
  dnaHash: string;
  tier: PassportTier;
  capabilities: string[];
  modelTag?: string;
  systemPromptHash?: string;
}

export interface ResolvedTree {
  root: PublicKey;
  children: ResolvedTree[];
  depth: number;
  metadata: RecursiveMetadata;
}

export interface PassportTree {
  root: any; // Simplified for now
}

export interface ExecutionLink {
  uri: string;
  mint: PublicKey;
  depth: number;
  action: RecursiveAction;
  weight: number;
  trigger?: Record<string, any>;
  result?: Record<string, any>;
  timeout?: number;
}

export interface CompositionLayer {
  uri: string;
  mint: PublicKey;
  depth: number;
  action: RecursiveAction;
  weight: number;
  blendMode?: string;
  opacity?: number;
}

// Passport Module
export interface PassportBundle {
  root: PassportNFT;
  capabilities: PassportNFT[];
  tree: RecursiveMetadata;
  estimatedCost: number;
  attestations: AttestationRecord[];
}

export interface PassportNFT {
  name: string;
  uri?: string;
  mint?: PublicKey;
  metadata?: NFTMetadata;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  properties: any;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// Attestation Module
export interface AttestationRecord {
  id: string;
  type: string;
  timestamp: number;
  merkleRoot: string;
  dataHash: string;
  signature: string; // enclave signature
  onChain?: { signature: string; slot: number };
}

export interface AttestationConfig {
  enclaveKey: string;
  submitOnChain?: boolean;
  hmacFallback?: boolean;
}

export interface AttestationVerification {
  valid: boolean;
  details: string;
  signer: string;
}

export interface MerkleTree {
  root: string;
  proofs: string[];
}

export interface TEERequest {
  model: string;
  messages: TEEMessage[];
  temperature?: number;
}

export interface TEEMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface TEEResponse {
  content: string;
  attestation: AttestationRecord;
  usage: { promptTokens: number; completionTokens: number };
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  attestation: AttestationRecord;
}

// Pipeline
export interface PipelineConfig {
  dna: Partial<AgentDNA>; // Can be partial, builder fills gaps
  art?: ArtConfig;
  token?: TokenConfig;
  candyMachine?: CandyMachineConfig;
  recursion?: { maxDepth: number; actions: RecursiveAction[] };
  options?: {
    dryRun?: boolean;
    skipArt?: boolean;
    skipToken?: boolean;
    autoUpload?: boolean;
  };
}

export interface PipelineResult {
  passport: PassportBundle;
  candyMachine?: CandyMachineDeployResult;
  token?: TokenDeployResult;
  attestations: AttestationRecord[];
  transactions: string[]; // Signature strings
  signatures: string[];
  cost: number; // SOL estimate
  duration: number; // ms
}

// Events
export type SdkEventType = 
  | "pipeline:started" | "pipeline:phase" | "pipeline:completed" | "pipeline:error"
  | "dna:created"
  | "art:generating" | "art:generated" | "art:uploaded"
  | "token:creating" | "token:created" 
  | "passport:building" | "passport:built"
  | "candy-machine:creating" | "candy-machine:created" | "candy-machine:minting" | "candy-machine:minted"
  | "recursive:tree-built"
  | "*";

export interface SdkEvent<T> {
  type: SdkEventType;
  timestamp: number;
  data: T;
}

// Common patterns
export interface Buildable<T> {
  build(): T;
}

export interface Deployable<C, R> {
  deploy(config: C): Promise<R>;
}

export interface CostEstimate {
  totalSol: number;
  breakdown: Record<string, number>;
}

export interface DeploymentStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  updates?: string[];
}
