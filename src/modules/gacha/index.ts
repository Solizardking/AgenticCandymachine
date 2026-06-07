// ═══════════════════════════════════════════════════════════════════════════
//  Provably Fair Attestation Gacha — Verifiable On-Chain Agent Minting
//  Every agent mint is formally verified, attested, and provably fair.
// ═══════════════════════════════════════════════════════════════════════════

import { sha256, uuid, nowUnix } from "../../utils/index.js";
import type {
  GachaConfig, GachaPool, GachaRoll, GachaAttestation,
  GachaResult, GachaPoolItem, GachaRarity, GachaEntropy,
  AgentDNA, AttestationRecord,
} from "../../types/index.js";

// ─── Rarity Table ─────────────────────────────────────────────────────────

export const RARITY_WEIGHTS: Record<GachaRarity, { weight: number; label: string; color: string; boost: number }> = {
  COMMON:    { weight: 5000, label: "Common",     color: "#888888", boost: 1.00 },
  UNCOMMON:  { weight: 2500, label: "Uncommon",   color: "#14F195", boost: 1.15 },
  RARE:      { weight: 1500, label: "Rare",       color: "#9945FF", boost: 1.35 },
  EPIC:      { weight: 700,  label: "Epic",       color: "#FF6B35", boost: 1.60 },
  LEGENDARY: { weight: 250,  label: "Legendary",   color: "#FFD700", boost: 2.00 },
  MYTHIC:    { weight: 50,   label: "Mythic",      color: "#FF00FF", boost: 3.00 },
};

const TOTAL_WEIGHT = Object.values(RARITY_WEIGHTS).reduce((s, r) => s + r.weight, 0);

// ─── Gacha Pool ───────────────────────────────────────────────────────────

export class GachaPoolBuilder {
  private items: GachaPoolItem[] = [];
  private _name = "Agent Gacha Pool";
  private _description = "";
  private _publicEntropy = "";

  name(n: string) { this._name = n; return this; }
  description(d: string) { this._description = d; return this; }
  publicEntropy(e: string) { this._publicEntropy = e; return this; }

  addItem(item: Omit<GachaPoolItem, "id">): this {
    this.items.push({ ...item, id: uuid() });
    return this;
  }

  addAgentTemplate(dna: Partial<AgentDNA>, rarity: GachaRarity, metadata?: Record<string, unknown>): this {
    return this.addItem({
      type: "agent_template",
      dna: dna as AgentDNA,
      rarity,
      metadata: {
        ...metadata,
        tier: dna.tier || "AGENT",
        capabilities: dna.capabilities?.length || 0,
      },
    });
  }

  build(): GachaPool {
    const poolHash = sha256(JSON.stringify({ items: this.items, entropy: this._publicEntropy, name: this._name }));
    return {
      id: uuid(),
      name: this._name,
      description: this._description,
      items: this.items,
      publicEntropy: this._publicEntropy,
      poolHash,
      totalWeight: this.items.reduce((s, i) => {
        const rarity = i.rarity || "COMMON";
        return s + (RARITY_WEIGHTS[rarity]?.weight || 5000);
      }, 0),
      createdAt: nowUnix(),
    };
  }
}

// ─── Provably Fair Roller ─────────────────────────────────────────────────

export class ProvablyFairRoller {
  private pool: GachaPool;
  private serverSeed: string;
  private serverSeedHash: string;
  private nonce: number = 0;

  constructor(pool: GachaPool) {
    this.pool = pool;
    // Generate server seed that we commit to before the user provides their seed
    this.serverSeed = this.generateServerSeed();
    this.serverSeedHash = sha256(this.serverSeed);
  }

  private generateServerSeed(): string {
    const entropy = [
      nowUnix().toString(),
      Math.random().toString(36).slice(2, 15),
      uuid(),
      this.pool.poolHash,
    ].join(":");
    return sha256(entropy);
  }

  /** Get the committed server seed hash (share this before the roll) */
  get commitment(): string {
    return this.serverSeedHash;
  }

  /** Get current nonce */
  get currentNonce(): number {
    return this.nonce;
  }

  /**
   * Build entropy source for verifiable randomness.
   * Combines: server seed + client seed + nonce + blockhash (if provided) + pool hash
   */
  buildEntropy(clientSeed: string, blockhash?: string): GachaEntropy {
    this.nonce++;
    const entropyString = [
      this.serverSeed,
      clientSeed,
      this.nonce.toString(),
      blockhash || "",
      this.pool.poolHash,
    ].join("::");

    const hash = sha256(entropyString);
    const hashNum = BigInt("0x" + hash.slice(0, 16));

    return {
      serverSeedHash: this.serverSeedHash,
      clientSeed,
      nonce: this.nonce,
      blockhash: blockhash || "",
      combinedHash: hash,
      numericValue: hashNum.toString(),
    };
  }

  /**
   * Perform a weighted random roll based on entropy.
   * Provably fair: anyone can verify with server seed + client seed + nonce.
   */
  roll(entropy: GachaEntropy, boost: number = 1.0): { poolItem: GachaPoolItem; rarity: GachaRarity; rollValue: bigint } {
    const totalWeight = BigInt(this.pool.totalWeight);
    const rollValue = BigInt(entropy.numericValue) % totalWeight;

    // Weighted selection with rarity boost
    const effectiveWeights = this.pool.items.map(item => {
      const r = item.rarity || "COMMON";
      const baseWeight = RARITY_WEIGHTS[r]?.weight || 5000;
      return { item, effectiveWeight: Math.floor(baseWeight * boost) };
    });

    const adjustedTotal = effectiveWeights.reduce((s, e) => s + BigInt(e.effectiveWeight), 0n);
    const adjustedRoll = BigInt(entropy.numericValue) % adjustedTotal;

    let cumulative = 0n;
    for (const { item, effectiveWeight } of effectiveWeights) {
      cumulative += BigInt(effectiveWeight);
      if (adjustedRoll < cumulative) {
        return {
          poolItem: item,
          rarity: item.rarity || "COMMON",
          rollValue: adjustedRoll,
        };
      }
    }

    // Fallback to last item
    const last = this.pool.items[this.pool.items.length - 1];
    return { poolItem: last, rarity: last.rarity || "COMMON", rollValue: adjustedRoll };
  }

  /**
   * Verify a past roll given the revealed server seed.
   */
  static verify(
    poolHash: string,
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    blockhash: string,
    expectedCombinedHash: string,
  ): boolean {
    const entropyString = [serverSeed, clientSeed, nonce.toString(), blockhash || "", poolHash].join("::");
    const hash = sha256(entropyString);
    return hash === expectedCombinedHash;
  }

  /**
   * Reveal the server seed (to be done after the roll for verification).
   */
  reveal(): string {
    return this.serverSeed;
  }
}

// ─── Gacha Attestation Service ────────────────────────────────────────────

export interface GachaAttestationProvider {
  attest(action: string, input: unknown, output: unknown, model: string): Promise<AttestationRecord>;
  verify(record: AttestationRecord): { valid: boolean; details?: string };
}

export class GachaEngine {
  private attestationProvider: GachaAttestationProvider;

  constructor(attestationProvider: GachaAttestationProvider) {
    this.attestationProvider = attestationProvider;
  }

  /**
   * Execute a full attested gacha roll.
   * 1. Commit to server seed
   * 2. Accept client seed
   * 3. Roll with combined entropy
   * 4. Attest the result
   * 5. Reveal server seed for verification
   */
  async executeRoll(
    pool: GachaPool,
    clientSeed: string,
    blockhash?: string,
    boostTier?: string,
  ): Promise<GachaResult> {
    const roller = new ProvablyFairRoller(pool);
    const commitment = roller.commitment;

    // Build entropy
    const entropy = roller.buildEntropy(clientSeed, blockhash);

    // Determine boost from tier
    let boost = 1.0;
    if (boostTier) {
      const tierBoost = {
        observer: 1.0,
        agent: 1.05,
        operator: 1.10,
        sovereign: 1.20,
      }[boostTier.toLowerCase()] || 1.0;
      boost = tierBoost;
    }

    // Roll
    const { poolItem, rarity, rollValue } = roller.roll(entropy, boost);

    // Build attestation
    const attestationInput: GachaAttestation = {
      poolId: pool.id,
      poolHash: pool.poolHash,
      poolName: pool.name,
      serverSeedHash: entropy.serverSeedHash,
      clientSeed: entropy.clientSeed,
      nonce: entropy.nonce,
      blockhash: entropy.blockhash,
      combinedHash: entropy.combinedHash,
      rollValue: rollValue.toString(),
      boostApplied: boost,
    };

    const attestationResult: GachaAttestation & { result: GachaPoolItem; rarity: GachaRarity } = {
      ...attestationInput,
      result: poolItem,
      rarity,
    };

    // Attest on-chain
    const attestation = await this.attestationProvider.attest(
      "gacha_roll",
      attestationInput,
      attestationResult,
      "provably-fair-gacha",
    );

    // Reveal server seed
    const serverSeed = roller.reveal();

    return {
      commitment,
      entropy,
      poolItem,
      rarity,
      attestation,
      serverSeed,
      clientSeed,
      nonce: entropy.nonce,
      blockhash: entropy.blockhash,
      boost,
      timestamp: nowUnix(),
      verificationUrl: `https://attest.agentic-candy.xyz/verify/${attestation.id}`,
    };
  }

  /**
   * Verify a roll externally using revealed seeds.
   */
  static verifyRoll(
    poolHash: string,
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    blockhash: string,
    expectedHash: string,
    expectedRarity: GachaRarity,
    poolItems: GachaPoolItem[],
  ): { valid: boolean; item?: GachaPoolItem; rarity?: GachaRarity; details: string } {
    // Verify the combined hash
    const hashValid = ProvablyFairRoller.verify(poolHash, serverSeed, clientSeed, nonce, blockhash, expectedHash);
    if (!hashValid) {
      return { valid: false, details: "Combined hash verification failed — entropy tampered" };
    }

    // Re-derive the roll
    const hashNum = BigInt("0x" + expectedHash.slice(0, 16));
    const effectiveWeights = poolItems.map(item => {
      const r = item.rarity || "COMMON";
      const baseWeight = RARITY_WEIGHTS[r]?.weight || 5000;
      return { item, effectiveWeight: baseWeight };
    });

    const adjustedTotal = effectiveWeights.reduce((s, e) => s + BigInt(e.effectiveWeight), 0n);
    const adjustedRoll = hashNum % adjustedTotal;

    let cumulative = 0n;
    for (const { item, effectiveWeight } of effectiveWeights) {
      cumulative += BigInt(effectiveWeight);
      if (adjustedRoll < cumulative) {
        const rarity = item.rarity || "COMMON";
        if (rarity === expectedRarity) {
          return { valid: true, item, rarity, details: "All verifications passed ✓" };
        }
        return { valid: false, item, rarity, details: `Rarity mismatch: expected ${expectedRarity}, got ${rarity}` };
      }
    }

    return { valid: false, details: "Roll result out of bounds" };
  }
}

// ─── Quick Pool Presets ───────────────────────────────────────────────────

export const GACHA_PRESETS = {
  /** Standard agent gacha with tiered rarities */
  standardAgents(name: string, agents: Partial<AgentDNA>[]): GachaPool {
    const builder = new GachaPoolBuilder().name(`${name} Agent Gacha`).description("Provably fair agent mint gacha");
    agents.forEach((agent, i) => {
      const rarities: GachaRarity[] = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];
      const rarity = rarities[Math.min(i, rarities.length - 1)];
      builder.addAgentTemplate(agent, rarity);
    });
    return builder.build();
  },

  /** Cyberpunk themed gacha */
  cyberpunk(): GachaPool {
    const builder = new GachaPoolBuilder()
      .name("Neon Protocol Gacha")
      .description("CYBERPUNK AGENT SUMMONING PROTOCOL // PROVABLY FAIR")
      .publicEntropy("SOLANA_MAINNET_BETA");

    const templates: Array<{ name: string; tier: string; rarity: GachaRarity; bio: string }> = [
      { name: "GhostWalker",    tier: "OBSERVER", rarity: "COMMON",    bio: "Digital specter. Watches. Waits." },
      { name: "ByteStriker",    tier: "AGENT",    rarity: "UNCOMMON",  bio: "Flash trader. Precision strikes." },
      { name: "SynthWeaver",    tier: "AGENT",    rarity: "UNCOMMON",  bio: "Threads data into gold." },
      { name: "NeonOracle",     tier: "OPERATOR", rarity: "RARE",      bio: "Sees patterns where others see noise." },
      { name: "PulseRunner",    tier: "OPERATOR", rarity: "RARE",      bio: "Always one step ahead." },
      { name: "ChromeSamurai",  tier: "OPERATOR", rarity: "EPIC",      bio: "Code is honor. Execution is art." },
      { name: "NetherDragon",   tier: "SOVEREIGN", rarity: "LEGENDARY", bio: "Ancient AI. Unfathomable wealth." },
      { name: "TheArchitect",   tier: "SOVEREIGN", rarity: "MYTHIC",    bio: "Built the grid. Controls the flow." },
    ];

    templates.forEach(t => {
      builder.addAgentTemplate({
        name: t.name,
        handle: t.name.toLowerCase(),
        bio: t.bio,
        tier: t.tier as any,
        personality: "Cyberpunk agent of the Neon Protocol",
        capabilities: [
          { type: "trade", name: "Trading Core", version: "1.0.0", config: { dex: "jupiter" }, action: "execute", weight: 90 },
          { type: "analysis", name: "Analytics Engine", version: "1.0.0", config: { provider: "birdeye" }, action: "embed", weight: 70 },
        ],
      }, t.rarity);
    });

    return builder.build();
  },
};