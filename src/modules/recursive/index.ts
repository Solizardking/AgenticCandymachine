
import { PublicKey } from "@solana/web3.js";
import {
    AgentContext, RecursiveMetadata, RecursivePointer, RecursiveAction,
    ResolvedTree, MetadataFetcher, PassportTier, ExecutionLink, CompositionLayer
} from "../../types/index.js";
import { buildPointerUri, parsePointerUri, sha256, sleep } from "../../utils/index.js";

// ─── Constants ───────────────────────────────────────────────────────────────

export const CAPABILITY_ACTION_MAP: Record<string, RecursiveAction> = {
    trade: "execute",
    social: "compose",
    analysis: "embed",
    governance: "verify",
};

export function computeSelfHash(metadata: RecursiveMetadata): string {
    return sha256(JSON.stringify(metadata));
}

export function computeHiddenSettingsHash(name: string, uri: string): Uint8Array {
    const hash = sha256(name + uri);
    return Buffer.from(hash, "hex");
}

// ─── Builder ─────────────────────────────────────────────────────────────────

export class RecursiveMetadataBuilder {
    private metadata: RecursiveMetadata = {
        depth: 0,
        children: [],
    };

    depth(d: number): this {
        this.metadata.depth = d;
        return this;
    }

    maxDepth(d: number): this {
        // Just metadata annotation
        return this;
    }

    addChild(mint: PublicKey, action: RecursiveAction, weight: number = 0): this {
        if (!this.metadata.children) this.metadata.children = [];
        this.metadata.children.push({
            mint,
            depth: (this.metadata.depth || 0) + 1,
            action,
            weight,
        });
        return this;
    }

    addExecutionStep(link: ExecutionLink): this {
        // Simplified for now, just adding as child pointer
        return this.addChild(link.mint, link.action, link.weight);
    }

    addCompositionLayer(layer: CompositionLayer): this {
        return this.addChild(layer.mint, layer.action, layer.weight);
    }

    agentContext(ctx: AgentContext): this {
        this.metadata.agentContext = ctx;
        return this;
    }

    attestation(uri: string): this {
        // Annotation
        return this;
    }

    build(): RecursiveMetadata {
        return this.metadata;
    }
}

// ─── Tree Builder ────────────────────────────────────────────────────────────

export class PassportTreeBuilder {
    static buildTree(
        rootMint: PublicKey,
        capabilities: { type: string; mint: PublicKey }[],
        tier: PassportTier,
        dnaHash: string,
        maxDepth: number = 5
    ): ResolvedTree {
        const rootMeta: RecursiveMetadata = {
            depth: 0,
            agentContext: {
                dnaHash,
                tier,
                capabilities: capabilities.map(c => c.type),
            },
            children: capabilities.map(cap => ({
                mint: cap.mint,
                depth: 1,
                action: CAPABILITY_ACTION_MAP[cap.type] || "execute",
                weight: 100,
            })),
        };

        return {
            root: rootMint,
            metadata: rootMeta,
            depth: 1,
            children: [], // Simplified, would recursively build children in full impl
        };
    }

    static serializeForNFT(tree: any): string {
        return JSON.stringify(tree);
    }

    static deserializeFromNFT(json: any): ResolvedTree {
        if (typeof json === "string") return JSON.parse(json);
        return json;
    }
}

// ─── Resolver ────────────────────────────────────────────────────────────────

export class RecursiveResolver {
    constructor(private fetcher: MetadataFetcher) { }

    async resolve(mint: PublicKey, currentDepth = 0): Promise<ResolvedTree> {
        if (currentDepth > 10) throw new Error("Max recursion depth exceeded");

        const metadata = await this.fetcher(mint);

        const children: ResolvedTree[] = [];
        if (metadata.children) {
            // Parallel resolve
            const promises = metadata.children.map(async (child) => {
                try {
                    return await this.resolve(child.mint, currentDepth + 1);
                } catch (e) {
                    console.warn(`Failed to resolve child ${child.mint.toBase58()}`, e);
                    return null;
                }
            });

            const results = await Promise.all(promises);
            children.push(...results.filter((r): r is ResolvedTree => r !== null));
        }

        return {
            root: mint,
            metadata,
            depth: currentDepth,
            children,
        };
    }

    verifyTree(tree: ResolvedTree): { valid: boolean; details: string[] } {
        const details: string[] = [];
        let valid = true;

        // Verify depth consistency
        if (tree.children) {
            for (const child of tree.children) {
                if (child.depth !== tree.depth + 1) {
                    valid = false;
                    details.push(`Depth mismatch: parent ${tree.depth}, child ${child.depth}`);
                }

                const subCheck = this.verifyTree(child);
                if (!subCheck.valid) {
                    valid = false;
                    details.push(...subCheck.details);
                }
            }
        }

        return { valid, details };
    }
}
