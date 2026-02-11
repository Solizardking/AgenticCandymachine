// ═══════════════════════════════════════════════════════════════════════════
//  DNA Module — Agent Identity Encoding & Trait Computation
//  Encodes agent identity into a deterministic DNA hash with trait vectors
// ═══════════════════════════════════════════════════════════════════════════

import type {
  AgentDNA, CapabilityModule, CapabilityType, DNAEncoding, ModelConfig,
  PassportTier, RecursiveAction, TraitBlock, Buildable,
} from "../../types/index.js";
import { sha256, sha256Bytes, dnaHash, traitVector, contentHash, uuid, nowUnix, SCHEMA_VERSION } from "../../utils/index.js";

// ─── Capability Defaults ─────────────────────────────────────────────────

const CAPABILITY_ACTIONS: Record<CapabilityType, RecursiveAction> = {
  trade:      "execute",
  social:     "compose",
  payment:    "execute",
  analysis:   "embed",
  mint:       "execute",
  governance: "verify",
  defi:       "execute",
  voice:      "transform",
  custom:     "resolve",
};

const CAPABILITY_WEIGHTS: Record<CapabilityType, number> = {
  trade: 90, social: 60, payment: 80, analysis: 70,
  mint: 85, governance: 50, defi: 95, voice: 40, custom: 30,
};

// ─── DNA Builder ─────────────────────────────────────────────────────────

export class DNABuilder implements Buildable<AgentDNA> {
  private _name = "";
  private _handle = "";
  private _bio = "";
  private _personality = "";
  private _lore?: string;
  private _tier: PassportTier = "AGENT";
  private _capabilities: CapabilityModule[] = [];
  private _model: ModelConfig = {
    id: "glm-flash",
    provider: "RedPill TEE",
    tag: "z-ai/glm-4.7-flash",
    temperature: 0.7,
  };
  private _systemPrompt?: string;

  name(name: string): this { this._name = name; return this; }
  handle(handle: string): this { this._handle = handle.replace(/^@/, ""); return this; }
  bio(bio: string): this { this._bio = bio; return this; }
  personality(personality: string): this { this._personality = personality; return this; }
  lore(lore: string): this { this._lore = lore; return this; }
  tier(tier: PassportTier): this { this._tier = tier; return this; }
  systemPrompt(prompt: string): this { this._systemPrompt = prompt; return this; }

  model(config: Partial<ModelConfig>): this {
    this._model = { ...this._model, ...config };
    return this;
  }

  addCapability(type: CapabilityType, config?: Record<string, unknown>): this {
    if (this._capabilities.some(c => c.type === type)) return this;
    this._capabilities.push({
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1) + " Module",
      version: "1.0.0",
      config: config || {},
      action: CAPABILITY_ACTIONS[type],
      weight: CAPABILITY_WEIGHTS[type],
    });
    return this;
  }

  removeCapability(type: CapabilityType): this {
    this._capabilities = this._capabilities.filter(c => c.type !== type);
    return this;
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this._name) errors.push("Agent name is required");
    if (this._name.length > 32) errors.push("Agent name must be ≤ 32 characters");
    if (!this._handle) errors.push("Agent handle is required");
    if (!this._bio) errors.push("Agent bio is required");
    if (!this._personality) errors.push("Personality description is required");
    if (this._capabilities.length === 0) errors.push("At least one capability is required");
    return { valid: errors.length === 0, errors };
  }

  build(): AgentDNA {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`DNA validation failed: ${validation.errors.join(", ")}`);
    }

    const capTypes = this._capabilities.map(c => c.type);
    const hash = dnaHash(this._name, this._tier, capTypes, this._model.tag);
    const traits = traitVector({ name: this._name, tier: this._tier, capabilities: capTypes });

    return {
      name: this._name,
      handle: this._handle,
      bio: this._bio,
      personality: this._personality,
      lore: this._lore,
      tier: this._tier,
      capabilities: this._capabilities,
      model: this._model,
      systemPrompt: this._systemPrompt,
      dnaHash: hash,
      traitVector: traits,
      createdAt: nowUnix(),
    };
  }
}

// ─── DNA Encoder ─────────────────────────────────────────────────────────

export class DNAEncoder {
  /**
   * Encode an AgentDNA into a compact DNAEncoding with trait blocks
   * and a Merkle root over all trait hashes.
   */
  static encode(dna: AgentDNA): DNAEncoding {
    const blocks = this.computeTraitBlocks(dna);
    const blockHashes = blocks.map(b => b.hash);

    // Build simple Merkle root over trait blocks
    let layer = blockHashes;
    while (layer.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < layer.length; i += 2) {
        const left = layer[i];
        const right = layer[i + 1] || left;
        next.push(sha256(left + right));
      }
      layer = next;
    }

    const merkleRoot = layer[0] || sha256("empty");
    const signature = sha256(`${dna.dnaHash}:${merkleRoot}:${SCHEMA_VERSION}`);

    return {
      hash: dna.dnaHash,
      version: SCHEMA_VERSION,
      traits: blocks,
      merkleRoot,
      signature,
    };
  }

  /**
   * Decode and verify a DNA encoding
   */
  static verify(encoding: DNAEncoding): boolean {
    const recomputed = sha256(`${encoding.hash}:${encoding.merkleRoot}:${encoding.version}`);
    return recomputed === encoding.signature;
  }

  /**
   * Generate trait blocks from agent DNA
   */
  private static computeTraitBlocks(dna: AgentDNA): TraitBlock[] {
    const blocks: TraitBlock[] = [];

    // Identity block
    blocks.push(this.makeBlock("identity", [
      ...this.stringToValues(dna.name, 8),
      ...this.stringToValues(dna.handle, 4),
    ], 1.0));

    // Personality block
    blocks.push(this.makeBlock("personality", [
      ...this.stringToValues(dna.personality, 16),
    ], 0.8));

    // Tier block
    const tierValues = { OBSERVER: 0, AGENT: 1, OPERATOR: 2, SOVEREIGN: 3 };
    blocks.push(this.makeBlock("tier", [
      tierValues[dna.tier] / 3, // normalized 0-1
    ], 0.5));

    // Capability block — each capability contributes a weighted value
    const capValues = dna.capabilities.map(c => c.weight / 100);
    blocks.push(this.makeBlock("capabilities", capValues, 0.9));

    // Model block
    blocks.push(this.makeBlock("model", [
      dna.model.temperature / 2,  // normalized 0-1
      ...this.stringToValues(dna.model.tag, 8),
    ], 0.6));

    return blocks;
  }

  private static makeBlock(category: string, values: number[], weight: number): TraitBlock {
    const hash = sha256(`${category}:${values.join(",")}`);
    return { category, values, weight, hash };
  }

  private static stringToValues(str: string, count: number): number[] {
    const hash = sha256(str);
    const values: number[] = [];
    for (let i = 0; i < count; i++) {
      values.push(parseInt(hash.slice(i * 2, i * 2 + 2), 16) / 255);
    }
    return values;
  }
}

// ─── DNA Diff ────────────────────────────────────────────────────────────

export function diffDNA(a: AgentDNA, b: AgentDNA): {
  changed: string[];
  similarity: number;
} {
  const changed: string[] = [];
  if (a.name !== b.name) changed.push("name");
  if (a.handle !== b.handle) changed.push("handle");
  if (a.tier !== b.tier) changed.push("tier");
  if (a.personality !== b.personality) changed.push("personality");
  if (a.model.tag !== b.model.tag) changed.push("model");

  const aCaps = new Set(a.capabilities.map(c => c.type));
  const bCaps = new Set(b.capabilities.map(c => c.type));
  if (![...aCaps].every(c => bCaps.has(c)) || ![...bCaps].every(c => aCaps.has(c))) {
    changed.push("capabilities");
  }

  // Cosine similarity of trait vectors
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < Math.min(a.traitVector.length, b.traitVector.length); i++) {
    dot += a.traitVector[i] * b.traitVector[i];
    magA += a.traitVector[i] ** 2;
    magB += b.traitVector[i] ** 2;
  }
  const similarity = magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;

  return { changed, similarity };
}

// ─── Exports ─────────────────────────────────────────────────────────────

export { CAPABILITY_ACTIONS, CAPABILITY_WEIGHTS };
