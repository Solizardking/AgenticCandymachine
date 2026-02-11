import { Connection, PublicKey } from "@solana/web3.js";
import { EventEmitter } from "eventemitter3";
import type { SdkConfig, PipelineConfig, PipelineResult, MintResult, ResolvedTree, MetadataFetcher } from "../types/index.js";
import { DNABuilder, DNAEncoder } from "../modules/dna/index.js";
import { ArtPipeline } from "../modules/art/index.js";
import { TokenBuilder, TokenDeployer } from "../modules/token/index.js";
import { CandyMachineBuilder, CandyMachineClient, GuardBuilder } from "../modules/candy-machine/index.js";
import { RecursiveMetadataBuilder, RecursiveResolver } from "../modules/recursive/index.js";
import { PassportFactory } from "../modules/passport/index.js";
import { AttestationService, TEETerminal } from "../modules/attestation/index.js";
export declare class AgenticCandyMachineSDK extends EventEmitter {
    readonly config: SdkConfig;
    readonly connection: Connection;
    readonly dna: typeof DNABuilder;
    readonly art: ArtPipeline;
    readonly token: TokenDeployer;
    readonly candyMachine: CandyMachineClient;
    readonly passport: PassportFactory;
    readonly attestation: AttestationService;
    readonly tee: TEETerminal | null;
    static DNABuilder: typeof DNABuilder;
    static DNAEncoder: typeof DNAEncoder;
    static TokenBuilder: typeof TokenBuilder;
    static CandyMachineBuilder: typeof CandyMachineBuilder;
    static GuardBuilder: typeof GuardBuilder;
    static RecursiveMetadataBuilder: typeof RecursiveMetadataBuilder;
    constructor(config: SdkConfig);
    private emitEvent;
    /**
     * Execute the full pipeline: DNA → Art → Token → Candy Machine → Recursive → Mint
     */
    pipeline(config: PipelineConfig): Promise<PipelineResult>;
    private buildDNA;
    /**
     * Create a resolver for traversing recursive metadata trees
     */
    createResolver(fetcher: MetadataFetcher): RecursiveResolver;
    /**
     * Resolve a recursive tree from an on-chain NFT mint
     */
    resolveTree(rootMint: PublicKey, fetcher: MetadataFetcher): Promise<ResolvedTree>;
    /**
     * Mint an NFT from an existing candy machine
     */
    mint(candyMachine: PublicKey, group?: string): Promise<MintResult>;
    /**
     * Run a TEE-attested completion
     */
    teeComplete(messages: {
        role: string;
        content: string;
    }[], model?: string): Promise<import("../types/index.js").TEEResponse>;
    /**
     * Get wallet balance
     */
    getBalance(): Promise<{
        lamports: number;
        sol: number;
    }>;
    /**
     * Request airdrop (devnet only)
     */
    airdrop(sol?: number): Promise<string>;
    /**
     * Get the authority public key
     */
    get authority(): PublicKey;
    /**
     * Get cluster info
     */
    get cluster(): import("../types/index.js").SolanaCluster;
}
