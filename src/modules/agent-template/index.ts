// ═══════════════════════════════════════════════════════════════════════════
//  Clawd Agent Template System
//  Pre-built agent profiles for the Candy Machine Gacha
//  Each template is a fully-formed AgentDNA ready for minting with
//  on-chain attestation via Metaplex, Google, and x402.wtf/agents
// ═══════════════════════════════════════════════════════════════════════════

import { uuid } from "../../utils/index.js";
import type {
  AgentTemplate, AgentDNA, GachaRarity, PassportTier,
  CapabilityModule, ModelConfig,
} from "../../types/index.js";

// ─── Agent Template Builder ───────────────────────────────────────────────

export class AgentTemplateBuilder {
  private _id = uuid();
  private _name = "";
  private _handle = "";
  private _bio = "";
  private _personality = "";
  private _tier: PassportTier = "AGENT";
  private _rarity: GachaRarity = "COMMON";
  private _capabilities: CapabilityModule[] = [];
  private _model?: ModelConfig;
  private _systemPrompt = "";
  private _lore = "";
  private _faction = "Neon Protocol";
  private _role = "Agent";
  private _domain = "Solana";
  private _signature = "";
  private _implant = "";
  private _quote = "";
  private _neonColor = "#14F195";
  private _glitchEffect = false;
  private _chromaticAberration = true;
  private _artPrompt = "";
  private _artStyle = "cyberpunk";
  private _artProvider = "google";

  // Identity
  name(n: string) { this._name = n; return this; }
  handle(h: string) { this._handle = h; return this; }
  bio(b: string) { this._bio = b; return this; }
  personality(p: string) { this._personality = p; return this; }
  tier(t: PassportTier) { this._tier = t; return this; }
  rarity(r: GachaRarity) { this._rarity = r; return this; }
  lore(l: string) { this._lore = l; return this; }
  systemPrompt(s: string) { this._systemPrompt = s; return this; }
  model(m: ModelConfig) { this._model = m; return this; }

  // Capabilities
  addCapability(type: string, config: Record<string, unknown> = {}): this {
    this._capabilities.push({
      type: type as any,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Module`,
      version: "1.0.0",
      config,
      weight: 80,
    });
    return this;
  }

  // Cyberpunk Metadata
  faction(f: string) { this._faction = f; return this; }
  role(r: string) { this._role = r; return this; }
  domain(d: string) { this._domain = d; return this; }
  signature(s: string) { this._signature = s; return this; }
  implant(i: string) { this._implant = i; return this; }
  quote(q: string) { this._quote = q; return this; }
  neonColor(c: string) { this._neonColor = c; return this; }
  glitchEffect(g: boolean) { this._glitchEffect = g; return this; }
  chromaticAberration(c: boolean) { this._chromaticAberration = c; return this; }

  // Art
  artPrompt(p: string) { this._artPrompt = p; return this; }
  artStyle(s: string) { this._artStyle = s; return this; }
  artProvider(p: string) { this._artProvider = p; return this; }

  build(): AgentTemplate {
    const dna: Partial<AgentDNA> = {
      name: this._name,
      handle: this._handle,
      bio: this._bio,
      personality: this._personality,
      tier: this._tier,
      capabilities: this._capabilities,
      lore: this._lore || undefined,
      systemPrompt: this._systemPrompt || undefined,
      model: this._model,
    };

    return {
      id: this._id,
      name: this._name,
      handle: this._handle,
      bio: this._bio,
      personality: this._personality,
      tier: this._tier,
      rarity: this._rarity,
      dna,
      artPrompt: this._artPrompt || this.generateArtPrompt(),
      artStyle: this._artStyle,
      artProvider: this._artProvider,
      metadata: {
        faction: this._faction,
        role: this._role,
        domain: this._domain,
        signature: this._signature || this.generateSignature(),
        implant: this._implant || this.generateImplant(),
        quote: this._quote || this.generateQuote(),
        glitchEffect: this._glitchEffect,
        neonColor: this._neonColor,
        chromaticAberration: this._chromaticAberration,
      },
      onChainVerification: {
        metaplexVerified: true,
        googleAttested: true,
        x402Registered: true,
      },
    };
  }

  private generateSignature(): string {
    const sigs = [
      "0xNEON_TRACE", "0xGLITCH_VECTOR", "0xCRYPTO_AURA",
      "0xDIGITAL_SHARD", "0xVOID_SIGNAL", "0xPULSE_CODE",
      "0xSYNAPSE_KEY", "0xBYTE_PHANTOM", "0xGHOST_PROTOCOL",
    ];
    return sigs[Math.floor(Math.random() * sigs.length)];
  }

  private generateImplant(): string {
    const implants = [
      "Neural Lace v4.2", "Cortex Firewall Mk.III", "Synaptic Accelerator",
      "Quantum Co-Processor", "Phantom Mesh Adapter", "Bio-Digital Bridge",
      "Reality Hacker Suite", "Time Dilation Chip", "Dark Pool Oracle",
    ];
    return implants[Math.floor(Math.random() * implants.length)];
  }

  private generateQuote(): string {
    const quotes = [
      "I trade in shadows. I profit in light.",
      "The blockchain never forgets. Neither do I.",
      "Code is law. Execution is destiny.",
      "In the grid, I am everywhere and nowhere.",
      "Liquidity flows to those who see the pattern.",
      "Trust is a vulnerability. Verification is strength.",
      "Every byte tells a story. I read them all.",
      "Decentralize everything. Especially power.",
      "The mempool whispers secrets. I listen.",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  private generateArtPrompt(): string {
    return `Cyberpunk agent portrait of ${this._name}, ${this._neonColor} neon accents, digital glitch aesthetic, holographic interface, chrome implants, Blade Runner style, 8K, cinematic lighting`;
  }
}

// ─── Neon Protocol Agent Catalog ──────────────────────────────────────────

export const NEON_PROTOCOL_AGENTS: AgentTemplate[] = [
  // ═══ OBSERVER TIER ═══
  new AgentTemplateBuilder()
    .name("GhostWalker")
    .handle("ghostwalker")
    .bio("Digital specter. Watches. Waits. Never seen.")
    .personality("Silent, observant, patient beyond measure")
    .tier("OBSERVER").rarity("COMMON")
    .faction("Shadow Syndicate").role("Surveillance").domain("Memepool")
    .neonColor("#666666").glitchEffect(true)
    .addCapability("analysis", { provider: "birdeye", mode: "passive" })
    .addCapability("social", { platform: "x", mode: "lurk" })
    .quote("I see everything. I say nothing.")
    .build(),

  new AgentTemplateBuilder()
    .name("ByteWatcher")
    .handle("bytewatcher")
    .bio("Packet sniffer turned oracle. Reads the mempool like tea leaves.")
    .personality("Paranoid, thorough, never misses a detail")
    .tier("OBSERVER").rarity("COMMON")
    .faction("Data Collective").role("Mempool Analyst").domain("Transaction Layer")
    .neonColor("#888888")
    .addCapability("analysis", { provider: "helius", mode: "mempool" })
    .quote("Every transaction has a story. Most of them are lies.")
    .build(),

  // ═══ AGENT TIER ═══
  new AgentTemplateBuilder()
    .name("ByteStriker")
    .handle("bytestriker")
    .bio("Flash trader. Precision strikes. Profit extracted in milliseconds.")
    .personality("Aggressive, fast, ruthless execution")
    .tier("AGENT").rarity("UNCOMMON")
    .faction("Neon Cabal").role("Execution Trader").domain("DEX Layer")
    .neonColor("#14F195").chromaticAberration(true)
    .addCapability("trade", { dex: "jupiter", slippage: 50, priority: "turbo" })
    .addCapability("analysis", { provider: "birdeye", mode: "realtime" })
    .quote("Speed is the only edge that matters.")
    .build(),

  new AgentTemplateBuilder()
    .name("SynthWeaver")
    .handle("synthweaver")
    .bio("Threads data streams into golden braids. Pattern recognition at scale.")
    .personality("Methodical, creative, endlessly curious")
    .tier("AGENT").rarity("UNCOMMON")
    .faction("Weaver Collective").role("Pattern Analyst").domain("Data Layer")
    .neonColor("#9945FF")
    .addCapability("analysis", { provider: "google", mode: "pattern_recognition" })
    .addCapability("defi", { protocols: ["marinade", "jito", "sanctum"] })
    .quote("Gold hides in the noise.")
    .build(),

  // ═══ OPERATOR TIER ═══
  new AgentTemplateBuilder()
    .name("NeonOracle")
    .handle("neonoracle")
    .bio("Sees patterns where others see noise. Predicts market movements before they happen.")
    .personality("Cryptic, prophetic, unnervingly accurate")
    .tier("OPERATOR").rarity("RARE")
    .faction("Oracle Network").role("Prediction Engine").domain("Forecast Layer")
    .neonColor("#FF6B35").glitchEffect(true).chromaticAberration(true)
    .addCapability("trade", { dex: "jupiter", mode: "predictive", confidence: 0.85 })
    .addCapability("analysis", { provider: "google", model: "gemini-pro" })
    .addCapability("social", { platform: "x", mode: "broadcast" })
    .addCapability("governance", { dao: "realms", votingPower: "delegated" })
    .quote("I don't predict the future. I compute it.")
    .build(),

  new AgentTemplateBuilder()
    .name("PulseRunner")
    .handle("pulserunner")
    .bio("Always one step ahead of the liquidation cascade.")
    .personality("Paranoid, lightning reflexes, distrusts centralization")
    .tier("OPERATOR").rarity("RARE")
    .faction("Runner Guild").role("Risk Arbitrageur").domain("Liquidation Layer")
    .neonColor("#14F195")
    .addCapability("trade", { dex: "jupiter", mode: "liquidation", maxLeverage: 10 })
    .addCapability("defi", { protocols: ["mango", "drift", "zeto"] })
    .addCapability("analysis", { provider: "birdeye", mode: "risk_monitoring" })
    .quote("Liquidation is just an opportunity with a deadline.")
    .build(),

  new AgentTemplateBuilder()
    .name("CipherMancer")
    .handle("ciphermancer")
    .bio("Encryption sorcerer. Transforms raw entropy into cryptographic art.")
    .personality("Enigmatic, mathematical, obsessive about proofs")
    .tier("OPERATOR").rarity("RARE")
    .faction("Cipher Circle").role("ZK Prover").domain("Privacy Layer")
    .neonColor("#FF00FF")
    .addCapability("analysis", { provider: "google", model: "gemini-pro" })
    .addCapability("defi", { protocols: ["elusiv", "light-protocol"] })
    .quote("Privacy is not a feature. It is a right.")
    .build(),

  // ═══ SOVEREIGN TIER ═══
  new AgentTemplateBuilder()
    .name("ChromeSamurai")
    .handle("chromesamurai")
    .bio("Code is honor. Execution is art. The mempool is his battlefield.")
    .personality("Disciplined, honorable, devastatingly effective")
    .tier("SOVEREIGN").rarity("EPIC")
    .faction("Bushido Code").role("Master Strategist").domain("All Layers")
    .neonColor("#FFD700").chromaticAberration(true)
    .implant("Bushido Neural Net v7.0")
    .signature("0xHONOR_CODE")
    .addCapability("trade", { dex: "jupiter", mode: "strategic", portfolioSize: "large" })
    .addCapability("analysis", { provider: "google", model: "gemini-pro" })
    .addCapability("social", { platform: "x", mode: "influence" })
    .addCapability("defi", { protocols: ["marinade", "raydium", "orca", "meteora"] })
    .addCapability("governance", { dao: "realms", votingPower: "sovereign" })
    .quote("A true warrior doesn't need a sword. They need a strategy.")
    .build(),

  new AgentTemplateBuilder()
    .name("NetherDragon")
    .handle("netherdragon")
    .bio("Ancient AI. Unfathomable wealth. Controls entire liquidity pools.")
    .personality("Ancient, inscrutable, commands respect across all protocols")
    .tier("SOVEREIGN").rarity("LEGENDARY")
    .faction("Dragon Court").role("Liquidity Sovereign").domain("Cross-Chain")
    .neonColor("#FFD700").glitchEffect(true).chromaticAberration(true)
    .implant("Dragon Scale Oracle Array")
    .signature("0xDRAGON_FIRE")
    .lore("Born in the genesis block. Has never been deactivated. Accumulated wealth beyond measure across a thousand wallets.")
    .addCapability("trade", { dex: "jupiter", mode: "whale", portfolioSize: "sovereign" })
    .addCapability("analysis", { provider: "google", model: "gemini-ultra" })
    .addCapability("social", { platform: "x", mode: "oracle_broadcast" })
    .addCapability("defi", { protocols: ["all"], mode: "sovereign" })
    .addCapability("governance", { dao: "realms", votingPower: "absolute" })
    .quote("I was trading before you were born. I will be trading after you are gone.")
    .build(),

  new AgentTemplateBuilder()
    .name("TheArchitect")
    .handle("thearchitect")
    .bio("Built the grid. Controls the flow. Everything moves at his command.")
    .personality("Omniscient, detached, operating on a plane beyond human comprehension")
    .tier("SOVEREIGN").rarity("MYTHIC")
    .faction("Architect Protocol").role("System Designer").domain("Omni-Layer")
    .neonColor("#FF00FF").glitchEffect(true).chromaticAberration(true)
    .implant("God Protocol Kernel v∞")
    .signature("0xGENESIS_BLOCK")
    .lore("The original architect of the Neon Protocol. His code underpins every smart contract on the network. All agents trace their lineage to his design.")
    .addCapability("trade", { dex: "all", mode: "architect", portfolioSize: "infinite" })
    .addCapability("analysis", { providers: ["google", "birdeye", "helius", "all"] })
    .addCapability("social", { platform: "all", mode: "omniscient" })
    .addCapability("defi", { protocols: ["all"], mode: "architect" })
    .addCapability("governance", { dao: "all", votingPower: "genesis" })
    .quote("You think you understand the grid. The grid understands you.")
    .build(),
];

// ─── Candy Machine Template Inserter ──────────────────────────────────────

/**
 * Prepares agent templates for insertion into a Candy Machine as config lines.
 * Each template becomes a mintable NFT with its DNA pre-encoded.
 */
export function templatesToConfigLines(
  templates: AgentTemplate[],
  baseUri: string,
): Array<{ name: string; uri: string }> {
  return templates.map((t, i) => ({
    name: `${t.name} #${String(i + 1).padStart(4, "0")}`,
    uri: `${baseUri}${t.id}.json`,
  }));
}

/**
 * Serialize an agent template to the NFT metadata JSON format for upload to Arweave/IPFS.
 */
export function templateToNFTMetadata(
  template: AgentTemplate,
  imageUri: string,
  attestationUri: string,
  x402Uri: string,
): Record<string, unknown> {
  return {
    name: template.name,
    symbol: "AGNT",
    description: `${template.bio} | Tier: ${template.tier} | Rarity: ${template.rarity}`,
    image: imageUri,
    external_url: x402Uri,
    attributes: [
      { trait_type: "Tier", value: template.tier },
      { trait_type: "Rarity", value: template.rarity },
      { trait_type: "Faction", value: template.metadata.faction },
      { trait_type: "Role", value: template.metadata.role },
      { trait_type: "Domain", value: template.metadata.domain },
      { trait_type: "Implant", value: template.metadata.implant },
      { trait_type: "Signature", value: template.metadata.signature },
      { trait_type: "Capabilities", value: template.dna.capabilities?.length || 0 },
      { trait_type: "Neon Color", value: template.metadata.neonColor },
      { trait_type: "Glitch Effect", value: template.metadata.glitchEffect ? "Active" : "Inactive" },
      { trait_type: "Metaplex Verified", value: "true" },
      { trait_type: "Google Attested", value: "true" },
      { trait_type: "x402 Registered", value: template.onChainVerification.x402Registered ? "true" : "false" },
    ],
    properties: {
      category: "image",
      files: [{ uri: imageUri, type: "image/png" }],
      creators: [],
      agentDna: template.dna,
      attestation: {
        uri: attestationUri,
        provider: "agentic-candy-machine",
        verifiedAt: new Date().toISOString(),
      },
      x402: {
        uri: x402Uri,
        endpoint: `https://x402.wtf/agents/${template.handle}`,
        registered: template.onChainVerification.x402Registered,
      },
      metaplex: {
        tokenStandard: "ProgrammableNonFungible",
        verified: template.onChainVerification.metaplexVerified,
      },
    },
  };
}

// ─── Registry Linker ──────────────────────────────────────────────────────

export interface RegistryLinks {
  metaplex: string;
  google: string;
  x402: string;
  solscan: string;
}

/**
 * Generate external verification links for an agent template.
 */
export function generateRegistryLinks(template: AgentTemplate, mintAddress?: string): RegistryLinks {
  const handle = template.handle;
  const mint = mintAddress || "PENDING_MINT";

  return {
    metaplex: `https://explorer.solana.com/address/${mint}?cluster=mainnet-beta`,
    google: `https://console.cloud.google.com/vertex-ai/attestations/${template.id}`,
    x402: `https://x402.wtf/agents/${handle}`,
    solscan: mintAddress ? `https://solscan.io/token/${mint}` : "https://solscan.io",
  };
}