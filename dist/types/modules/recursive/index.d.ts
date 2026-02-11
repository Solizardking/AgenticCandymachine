import { PublicKey } from "@solana/web3.js";
import { AgentContext, RecursiveMetadata, RecursiveAction, ResolvedTree, MetadataFetcher, PassportTier, ExecutionLink, CompositionLayer } from "../../types/index.js";
export declare const CAPABILITY_ACTION_MAP: Record<string, RecursiveAction>;
export declare function computeSelfHash(metadata: RecursiveMetadata): string;
export declare function computeHiddenSettingsHash(name: string, uri: string): Uint8Array;
export declare class RecursiveMetadataBuilder {
    private metadata;
    depth(d: number): this;
    maxDepth(d: number): this;
    addChild(mint: PublicKey, action: RecursiveAction, weight?: number): this;
    addExecutionStep(link: ExecutionLink): this;
    addCompositionLayer(layer: CompositionLayer): this;
    agentContext(ctx: AgentContext): this;
    attestation(uri: string): this;
    build(): RecursiveMetadata;
}
export declare class PassportTreeBuilder {
    static buildTree(rootMint: PublicKey, capabilities: {
        type: string;
        mint: PublicKey;
    }[], tier: PassportTier, dnaHash: string, maxDepth?: number): ResolvedTree;
    static serializeForNFT(tree: any): string;
    static deserializeFromNFT(json: any): ResolvedTree;
}
export declare class RecursiveResolver {
    private fetcher;
    constructor(fetcher: MetadataFetcher);
    resolve(mint: PublicKey, currentDepth?: number): Promise<ResolvedTree>;
    verifyTree(tree: ResolvedTree): {
        valid: boolean;
        details: string[];
    };
}
