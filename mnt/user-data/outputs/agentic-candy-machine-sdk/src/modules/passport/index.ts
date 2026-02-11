// ═══════════════════════════════════════════════════════════════════════════
//  Passport Module — Agentic Passport Factory
//  Builds full passport bundles: root NFT + capability modules + recursive tree
// ═══════════════════════════════════════════════════════════════════════════

import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import type {
  PassportBundle, PassportNFT, AgentDNA, NFTMetadata, NFTAttribute,
  RecursiveMetadata, CapabilityModule, CapabilityType, PassportTier,
  ArtArtifact, TokenDeployResult, DeploymentStep, CostEstimate,
  AttestationRecord,
} from "../../types/index.js";
import { PassportTreeBuilder } from "../recursive/index.js";
import { sha256, uuid, nowUnix, TIER_DEFINITIONS } from "../../utils/index.js";

// ─── Tier Display ────────────────────────────────────────────────────────

const TIER_DISPLAY: Record<PassportTier, {
  badge: string;
  rarity: string;
  frame: string;
}> = {
  OBSERVER:  { badge: "👁", rarity: "Common", frame: "carbon" },
  AGENT:     { badge: "⚡", rarity: "Uncommon", frame: "purple_alloy" },
  OPERATOR:  { badge: "🔧", rarity: "Rare", frame: "emerald_circuit" },
  SOVEREIGN: { badge: "👑", rarity: "Legendary", frame: "golden_sovereign" },
};

// ─── Passport Factory ────────────────────────────────────────────────────

export class PassportFactory {
  private authority: PublicKey;
  private symbol: string;
  private sellerFeeBps: number;
  private externalUrl?: string;

  constructor(config: {
    authority: PublicKey;
    symbol?: string;
    sellerFeeBps?: number;
    externalUrl?: string;
  }) {
    this.authority = config.authority;
    this.symbol = config.symbol || "AGNT";
    this.sellerFeeBps = config.sellerFeeBps || 500;
    this.externalUrl = config.externalUrl;
  }

  /**
   * Build a complete passport bundle from agent DNA
   */
  buildBundle(
    dna: AgentDNA,
    art?: ArtArtifact,
    token?: TokenDeployResult,
  ): PassportBundle {
    // Generate placeholder mints (in production these come from Metaplex)
    const rootMint = Keypair.generate().publicKey;
    const capMints = dna.capabilities.map(() => Keypair.generate().publicKey);

    // Build recursive tree
    const capWithMints = dna.capabilities.map((cap, i) => ({
      type: cap.type,
      mint: capMints[i],
    }));
    const { root: rootTree, children: childTrees } = PassportTreeBuilder.buildTree(
      rootMint, capWithMints, dna.tier, dna.dnaHash,
    );

    // Build root passport NFT
    const rootNFT = this.buildRootPassport(dna, rootTree, art);

    // Build capability NFTs
    const capNFTs = dna.capabilities.map((cap, i) =>
      this.buildCapabilityNFT(dna, cap, childTrees[i], i)
    );

    // Build deployment plan
    const deploymentPlan = this.buildDeploymentPlan(dna, rootNFT, capNFTs);

    // Estimate costs
    const estimatedCost = this.estimateCost(dna);

    return {
      root: rootNFT,
      capabilities: capNFTs,
      tree: rootTree,
      dna,
      art,
      token,
      attestations: [],
      deploymentPlan,
      estimatedCost,
    };
  }

  /**
   * Build the root passport NFT metadata
   */
  private buildRootPassport(
    dna: AgentDNA,
    recursive: RecursiveMetadata,
    art?: ArtArtifact,
  ): PassportNFT {
    const tierDisplay = TIER_DISPLAY[dna.tier];
    const tierDef = TIER_DEFINITIONS[dna.tier];

    const attributes: NFTAttribute[] = [
      { trait_type: "Tier", value: dna.tier },
      { trait_type: "Level", value: tierDef.level },
      { trait_type: "DNA Hash", value: dna.dnaHash.slice(0, 16) },
      { trait_type: "Capabilities", value: dna.capabilities.length, display_type: "number" },
      { trait_type: "Model", value: dna.model.tag },
      { trait_type: "Temperature", value: dna.model.temperature, display_type: "number" },
      { trait_type: "Rarity", value: tierDisplay.rarity },
      { trait_type: "Frame", value: tierDisplay.frame },
      { trait_type: "Recursion Depth", value: recursive.maxDepth, display_type: "number" },
      { trait_type: "Created", value: dna.createdAt, display_type: "date" },
    ];

    // Add capability attributes
    for (const cap of dna.capabilities) {
      attributes.push({ trait_type: `Cap: ${cap.name}`, value: cap.version });
    }

    const metadata: NFTMetadata = {
      name: `${dna.name} Passport`,
      symbol: this.symbol,
      description: `${tierDisplay.badge} ${dna.tier} Tier Agentic Passport for ${dna.name}. ${dna.bio}`,
      image: art?.uri || "",
      external_url: this.externalUrl,
      seller_fee_basis_points: this.sellerFeeBps,
      attributes,
      properties: {
        files: art ? [{ uri: art.uri || "", type: art.contentType }] : [],
        category: "image",
        creators: [{ address: this.authority.toBase58(), share: 100 }],
      },
      recursive: recursive,
      agent: recursive.agentContext,
    };

    return {
      name: metadata.name,
      symbol: this.symbol,
      uri: "", // Set after upload
      metadata,
      recursive,
      image: art?.uri,
      tier: dna.tier,
    };
  }

  /**
   * Build a capability module NFT
   */
  private buildCapabilityNFT(
    dna: AgentDNA,
    capability: CapabilityModule,
    recursive: RecursiveMetadata,
    index: number,
  ): PassportNFT {
    const attributes: NFTAttribute[] = [
      { trait_type: "Type", value: "Capability Module" },
      { trait_type: "Capability", value: capability.type },
      { trait_type: "Version", value: capability.version },
      { trait_type: "Action", value: capability.action },
      { trait_type: "Weight", value: capability.weight, display_type: "number" },
      { trait_type: "Parent Agent", value: dna.name },
      { trait_type: "Parent Tier", value: dna.tier },
      { trait_type: "Module Index", value: index, display_type: "number" },
    ];

    const metadata: NFTMetadata = {
      name: `${dna.name} :: ${capability.name}`,
      symbol: this.symbol,
      description: `Capability module: ${capability.name} (${capability.type}). Recursive action: ${capability.action}. Part of ${dna.name}'s agentic passport.`,
      image: "",
      seller_fee_basis_points: this.sellerFeeBps,
      attributes,
      properties: {
        files: [],
        category: "image",
        creators: [{ address: this.authority.toBase58(), share: 100 }],
      },
      recursive,
    };

    return {
      name: metadata.name,
      symbol: this.symbol,
      uri: "",
      metadata,
      recursive,
      capabilityType: capability.type,
    };
  }

  /**
   * Build the deployment plan — ordered instructions for on-chain execution
   */
  private buildDeploymentPlan(
    dna: AgentDNA,
    root: PassportNFT,
    capabilities: PassportNFT[],
  ): DeploymentStep[] {
    const steps: DeploymentStep[] = [];

    // Step 1: Upload all metadata to Arweave
    steps.push({
      order: 0,
      action: "upload_metadata",
      description: `Upload ${1 + capabilities.length} metadata files to Arweave`,
      instructions: [],
      signers: [],
      estimatedFee: 0,
    });

    // Step 2: Create collection NFT
    steps.push({
      order: 1,
      action: "create_collection",
      description: `Create collection NFT: ${dna.name} Collection`,
      instructions: [], // Populated by CandyMachineClient
      signers: [],
      estimatedFee: 5_000_000, // ~0.005 SOL rent
    });

    // Step 3: Initialize Candy Machine
    steps.push({
      order: 2,
      action: "create_candy_machine",
      description: "Initialize Candy Machine V2 with tiered guards",
      instructions: [],
      signers: [],
      estimatedFee: 10_000_000,
    });

    // Step 4: Add config lines
    steps.push({
      order: 3,
      action: "add_config_lines",
      description: `Load ${1 + capabilities.length} config lines`,
      instructions: [],
      signers: [],
      estimatedFee: 50_000,
    });

    // Step 5: Mint root passport
    steps.push({
      order: 4,
      action: "mint_root",
      description: `Mint root passport: ${root.name}`,
      instructions: [],
      signers: [],
      estimatedFee: 5_000_000,
    });

    // Step 6: Mint capability modules
    for (const cap of capabilities) {
      steps.push({
        order: 5 + steps.length - 5,
        action: "mint_capability",
        description: `Mint capability: ${cap.name}`,
        instructions: [],
        signers: [],
        estimatedFee: 5_000_000,
      });
    }

    return steps;
  }

  /**
   * Estimate total deployment cost
   */
  estimateCost(dna: AgentDNA): CostEstimate {
    const nftCount = 1 + dna.capabilities.length;
    const accountRent = nftCount * 5_616_000; // ~0.00561 SOL per NFT account
    const metadataUpload = nftCount * 100_000; // Arweave upload estimate
    const candyMachineRent = 10_000_000; // ~0.01 SOL
    const transactionFees = nftCount * 10_000; // ~0.00001 per tx
    const total = accountRent + metadataUpload + candyMachineRent + transactionFees;

    return {
      accountRent,
      metadataUpload,
      mintFees: 0,
      candyMachineRent,
      tokenCreation: 0,
      transactionFees,
      total,
      totalSol: total / LAMPORTS_PER_SOL,
    };
  }

  /**
   * Verify a passport bundle's integrity
   */
  static verifyBundle(bundle: PassportBundle): {
    valid: boolean;
    checks: { name: string; passed: boolean; detail?: string }[];
  } {
    const checks: { name: string; passed: boolean; detail?: string }[] = [];

    // Check DNA hash
    const expectedHash = sha256(`${bundle.dna.name}:${bundle.dna.tier}:${bundle.dna.capabilities.map(c => c.type).sort().join(",")}:${bundle.dna.model.tag}`);
    checks.push({
      name: "DNA Hash",
      passed: expectedHash === bundle.dna.dnaHash,
      detail: `Expected ${expectedHash.slice(0, 16)}, got ${bundle.dna.dnaHash.slice(0, 16)}`,
    });

    // Check root metadata
    checks.push({
      name: "Root Metadata",
      passed: !!bundle.root.metadata && !!bundle.root.recursive,
    });

    // Check capability count
    checks.push({
      name: "Capability Count",
      passed: bundle.capabilities.length === bundle.dna.capabilities.length,
      detail: `${bundle.capabilities.length} / ${bundle.dna.capabilities.length}`,
    });

    // Check recursive tree integrity
    const treeHash = bundle.tree.selfHash;
    checks.push({
      name: "Tree Integrity",
      passed: !!treeHash && treeHash.length === 64,
    });

    // Check child pointers match capabilities
    checks.push({
      name: "Pointer-Capability Alignment",
      passed: bundle.tree.childPointers.length === bundle.dna.capabilities.length,
    });

    return {
      valid: checks.every(c => c.passed),
      checks,
    };
  }
}
