
import { AgentDNA, CapabilityModule, CapabilityType, DNAEncoding, PassportTier, TraitBlock } from "../../types/index.js";
import { dnaHash, sha256 } from "../../utils/index.js";

// ─── Constants ───────────────────────────────────────────────────────────────

export const CAPABILITY_ACTIONS: Record<CapabilityType, string> = {
    trade: "execute",
    analysis: "embed",
    social: "compose",
    defi: "execute",
    governance: "verify",
};

export const CAPABILITY_WEIGHTS: Record<CapabilityType, number> = {
    trade: 90,
    analysis: 70,
    social: 60,
    defi: 85,
    governance: 50,
};

// ─── Builder ─────────────────────────────────────────────────────────────────

export class DNABuilder {
    private _dna: Partial<AgentDNA> = {
        capabilities: [],
        tier: "AGENT",
    };

    name(name: string): this {
        this._dna.name = name;
        return this;
    }

    handle(handle: string): this {
        this._dna.handle = handle;
        return this;
    }

    bio(bio: string): this {
        this._dna.bio = bio;
        return this;
    }

    personality(personality: string): this {
        this._dna.personality = personality;
        return this;
    }

    tier(tier: PassportTier): this {
        this._dna.tier = tier;
        return this;
    }

    lore(lore: string): this {
        this._dna.lore = lore;
        return this;
    }

    systemPrompt(prompt: string): this {
        this._dna.systemPrompt = prompt;
        return this;
    }

    model(config: any): this {
        this._dna.model = config;
        return this;
    }

    addCapability(type: CapabilityType, config: Record<string, any> = {}, version: string = "1.0.0"): this {
        const caps = this._dna.capabilities || [];
        caps.push({
            type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Module`,
            version,
            config,
            action: CAPABILITY_ACTIONS[type],
            weight: CAPABILITY_WEIGHTS[type],
        });
        this._dna.capabilities = caps;
        return this;
    }

    build(): AgentDNA {
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

        this._dna.dnaHash = dnaHash(traits as string[]);

        return this._dna as AgentDNA;
    }
}

// ─── Encoder ─────────────────────────────────────────────────────────────────

export class DNAEncoder {

    static encode(dna: AgentDNA): DNAEncoding {
        const traits: TraitBlock[] = [];

        // Core Identity
        traits.push({ layer: "Identity", value: dna.name, dnaHash: sha256(dna.name) });
        traits.push({ layer: "Handle", value: dna.handle, dnaHash: sha256(dna.handle) });
        traits.push({ layer: "Tier", value: dna.tier, dnaHash: sha256(dna.tier) });

        // Capabilities
        for (const cap of dna.capabilities) {
            traits.push({
                layer: `Cap:${cap.type}`,
                value: `${cap.name} v${cap.version}`,
                dnaHash: sha256(JSON.stringify(cap)),
            });
        }

        // Compute Merkle Root (simplified)
        const hashes = traits.map(t => t.dnaHash);
        const merkleRoot = sha256(hashes.join(""));

        return {
            traits,
            merkleRoot,
        };
    }

    static verify(encoding: DNAEncoding): boolean {
        const hashes = encoding.traits.map(t => t.dnaHash);
        const computedRoot = sha256(hashes.join(""));
        return computedRoot === encoding.merkleRoot;
    }

    static diffDNA(dnaA: AgentDNA, dnaB: AgentDNA): string[] {
        const diffs: string[] = [];
        if (dnaA.name !== dnaB.name) diffs.push("name");
        if (dnaA.tier !== dnaB.tier) diffs.push("tier");
        // ... extensive logic
        return diffs;
    }
}

export function diffDNA(dnaA: AgentDNA, dnaB: AgentDNA) {
    return DNAEncoder.diffDNA(dnaA, dnaB);
}
