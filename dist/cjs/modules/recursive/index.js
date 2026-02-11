"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursiveResolver = exports.PassportTreeBuilder = exports.RecursiveMetadataBuilder = exports.CAPABILITY_ACTION_MAP = void 0;
exports.computeSelfHash = computeSelfHash;
exports.computeHiddenSettingsHash = computeHiddenSettingsHash;
const index_js_1 = require("../../utils/index.js");
// ─── Constants ───────────────────────────────────────────────────────────────
exports.CAPABILITY_ACTION_MAP = {
    trade: "execute",
    social: "compose",
    analysis: "embed",
    governance: "verify",
};
function computeSelfHash(metadata) {
    return (0, index_js_1.sha256)(JSON.stringify(metadata));
}
function computeHiddenSettingsHash(name, uri) {
    const hash = (0, index_js_1.sha256)(name + uri);
    return Buffer.from(hash, "hex");
}
// ─── Builder ─────────────────────────────────────────────────────────────────
class RecursiveMetadataBuilder {
    metadata = {
        depth: 0,
        children: [],
    };
    depth(d) {
        this.metadata.depth = d;
        return this;
    }
    maxDepth(d) {
        // Just metadata annotation
        return this;
    }
    addChild(mint, action, weight = 0) {
        if (!this.metadata.children)
            this.metadata.children = [];
        this.metadata.children.push({
            mint,
            depth: (this.metadata.depth || 0) + 1,
            action,
            weight,
        });
        return this;
    }
    addExecutionStep(link) {
        // Simplified for now, just adding as child pointer
        return this.addChild(link.mint, link.action, link.weight);
    }
    addCompositionLayer(layer) {
        return this.addChild(layer.mint, layer.action, layer.weight);
    }
    agentContext(ctx) {
        this.metadata.agentContext = ctx;
        return this;
    }
    attestation(uri) {
        // Annotation
        return this;
    }
    build() {
        return this.metadata;
    }
}
exports.RecursiveMetadataBuilder = RecursiveMetadataBuilder;
// ─── Tree Builder ────────────────────────────────────────────────────────────
class PassportTreeBuilder {
    static buildTree(rootMint, capabilities, tier, dnaHash, maxDepth = 5) {
        const rootMeta = {
            depth: 0,
            agentContext: {
                dnaHash,
                tier,
                capabilities: capabilities.map(c => c.type),
            },
            children: capabilities.map(cap => ({
                mint: cap.mint,
                depth: 1,
                action: exports.CAPABILITY_ACTION_MAP[cap.type] || "execute",
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
    static serializeForNFT(tree) {
        return JSON.stringify(tree);
    }
    static deserializeFromNFT(json) {
        if (typeof json === "string")
            return JSON.parse(json);
        return json;
    }
}
exports.PassportTreeBuilder = PassportTreeBuilder;
// ─── Resolver ────────────────────────────────────────────────────────────────
class RecursiveResolver {
    fetcher;
    constructor(fetcher) {
        this.fetcher = fetcher;
    }
    async resolve(mint, currentDepth = 0) {
        if (currentDepth > 10)
            throw new Error("Max recursion depth exceeded");
        const metadata = await this.fetcher(mint);
        const children = [];
        if (metadata.children) {
            // Parallel resolve
            const promises = metadata.children.map(async (child) => {
                try {
                    return await this.resolve(child.mint, currentDepth + 1);
                }
                catch (e) {
                    console.warn(`Failed to resolve child ${child.mint.toBase58()}`, e);
                    return null;
                }
            });
            const results = await Promise.all(promises);
            children.push(...results.filter((r) => r !== null));
        }
        return {
            root: mint,
            metadata,
            depth: currentDepth,
            children,
        };
    }
    verifyTree(tree) {
        const details = [];
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
exports.RecursiveResolver = RecursiveResolver;
//# sourceMappingURL=index.js.map