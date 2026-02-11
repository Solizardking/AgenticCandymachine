"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DNAEncoder = exports.DNABuilder = exports.CAPABILITY_WEIGHTS = exports.CAPABILITY_ACTIONS = void 0;
exports.diffDNA = diffDNA;
const index_js_1 = require("../../utils/index.js");
// ─── Constants ───────────────────────────────────────────────────────────────
exports.CAPABILITY_ACTIONS = {
    trade: "execute",
    analysis: "embed",
    social: "compose",
    defi: "execute",
    governance: "verify",
};
exports.CAPABILITY_WEIGHTS = {
    trade: 90,
    analysis: 70,
    social: 60,
    defi: 85,
    governance: 50,
};
// ─── Builder ─────────────────────────────────────────────────────────────────
class DNABuilder {
    _dna = {
        capabilities: [],
        tier: "AGENT",
    };
    name(name) {
        this._dna.name = name;
        return this;
    }
    handle(handle) {
        this._dna.handle = handle;
        return this;
    }
    bio(bio) {
        this._dna.bio = bio;
        return this;
    }
    personality(personality) {
        this._dna.personality = personality;
        return this;
    }
    tier(tier) {
        this._dna.tier = tier;
        return this;
    }
    lore(lore) {
        this._dna.lore = lore;
        return this;
    }
    systemPrompt(prompt) {
        this._dna.systemPrompt = prompt;
        return this;
    }
    model(config) {
        this._dna.model = config;
        return this;
    }
    addCapability(type, config = {}, version = "1.0.0") {
        const caps = this._dna.capabilities || [];
        caps.push({
            type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Module`,
            version,
            config,
            action: exports.CAPABILITY_ACTIONS[type],
            weight: exports.CAPABILITY_WEIGHTS[type],
        });
        this._dna.capabilities = caps;
        return this;
    }
    build() {
        if (!this._dna.name || !this._dna.handle) {
            throw new Error("DNA requires at least a name and handle");
        }
        // Calculate DNA hash
        const traits = [
            this._dna.name,
            this._dna.handle,
            this._dna.bio,
            this._dna.personality,
            this._dna.tier,
            ...(this._dna.capabilities?.map(c => c.type) || [])
        ];
        this._dna.dnaHash = (0, index_js_1.dnaHash)(traits);
        return this._dna;
    }
}
exports.DNABuilder = DNABuilder;
// ─── Encoder ─────────────────────────────────────────────────────────────────
class DNAEncoder {
    static encode(dna) {
        const traits = [];
        // Core Identity
        traits.push({ layer: "Identity", value: dna.name, dnaHash: (0, index_js_1.sha256)(dna.name) });
        traits.push({ layer: "Handle", value: dna.handle, dnaHash: (0, index_js_1.sha256)(dna.handle) });
        traits.push({ layer: "Tier", value: dna.tier, dnaHash: (0, index_js_1.sha256)(dna.tier) });
        // Capabilities
        for (const cap of dna.capabilities) {
            traits.push({
                layer: `Cap:${cap.type}`,
                value: `${cap.name} v${cap.version}`,
                dnaHash: (0, index_js_1.sha256)(JSON.stringify(cap)),
            });
        }
        // Compute Merkle Root (simplified)
        const hashes = traits.map(t => t.dnaHash);
        const merkleRoot = (0, index_js_1.sha256)(hashes.join(""));
        return {
            traits,
            merkleRoot,
        };
    }
    static verify(encoding) {
        const hashes = encoding.traits.map(t => t.dnaHash);
        const computedRoot = (0, index_js_1.sha256)(hashes.join(""));
        return computedRoot === encoding.merkleRoot;
    }
    static diffDNA(dnaA, dnaB) {
        const diffs = [];
        if (dnaA.name !== dnaB.name)
            diffs.push("name");
        if (dnaA.tier !== dnaB.tier)
            diffs.push("tier");
        // ... extensive logic
        return diffs;
    }
}
exports.DNAEncoder = DNAEncoder;
function diffDNA(dnaA, dnaB) {
    return DNAEncoder.diffDNA(dnaA, dnaB);
}
//# sourceMappingURL=index.js.map