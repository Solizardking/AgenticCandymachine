// ═══════════════════════════════════════════════════════════════════════════
//  Candy Machine Module — Metaplex Candy Machine V2 via Umi
//  Create, configure guards, load items, and mint pNFTs on Solana
// ═══════════════════════════════════════════════════════════════════════════

import { PublicKey, Keypair, Connection, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  create,
  addConfigLines,
  mintV2,
  fetchCandyMachine,
  fetchCandyGuard,
  route,
  GuardSetArgs,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  mplTokenMetadata,
  createNft,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  transactionBuilder,
  publicKey,
  sol,
  some,
  none,
  percentAmount,
  keypairIdentity,
  dateTime,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import type {
  CandyMachineConfig, CandyMachineDeployResult, ConfigLine, MintResult,
  GuardConfig, GuardGroup, Creator, ConfigLineSettings, HiddenSettings,
  CostEstimate, Buildable, Deployable, PassportTier,
} from "../../types/index.js";
import { sha256Bytes, uuid, chunk, TIER_DEFINITIONS } from "../../utils/index.js";

// ─── Guard Builder ───────────────────────────────────────────────────────

export class GuardBuilder {
  private guards: GuardConfig = {};

  solPayment(lamports: number, destination: PublicKey): this {
    this.guards.solPayment = { lamports, destination };
    return this;
  }

  mintLimit(id: number, limit: number): this {
    this.guards.mintLimit = { id, limit };
    return this;
  }

  startDate(date: Date | number): this {
    const unix = typeof date === "number" ? date : Math.floor(date.getTime() / 1000);
    this.guards.startDate = { date: unix };
    return this;
  }

  endDate(date: Date | number): this {
    const unix = typeof date === "number" ? date : Math.floor(date.getTime() / 1000);
    this.guards.endDate = { date: unix };
    return this;
  }

  nftGate(requiredCollection: PublicKey): this {
    this.guards.nftGate = { requiredCollection };
    return this;
  }

  tokenGate(mint: PublicKey, amount: bigint): this {
    this.guards.tokenGate = { mint, amount };
    return this;
  }

  allowList(addresses: string[]): this {
    // Build Merkle root from addresses
    const root = sha256Bytes(addresses.sort().join(","));
    this.guards.allowList = { merkleRoot: root };
    return this;
  }

  thirdPartySigner(signerKey: PublicKey): this {
    this.guards.thirdPartySigner = { signerKey };
    return this;
  }

  botTax(lamports: number): this {
    this.guards.botTax = { lamports, lastInstruction: true };
    return this;
  }

  addressGate(address: PublicKey): this {
    this.guards.addressGate = { address };
    return this;
  }

  redeemedAmountMax(max: number): this {
    this.guards.redeemedAmount = { maximum: max };
    return this;
  }

  build(): GuardConfig {
    return { ...this.guards };
  }
}

// ─── Candy Machine Config Builder ────────────────────────────────────────

export class CandyMachineBuilder implements Buildable<CandyMachineConfig> {
  private config: Partial<CandyMachineConfig> = {
    sellerFeeBasisPoints: 500,
    tokenStandard: "ProgrammableNonFungible",
    maxEditionSupply: 0,
    isMutable: true,
    creators: [],
    groups: [],
  };

  items(count: number): this { this.config.itemsAvailable = count; return this; }
  symbol(sym: string): this { this.config.symbol = sym; return this; }
  sellerFee(bps: number): this { this.config.sellerFeeBasisPoints = bps; return this; }
  standard(std: "NonFungible" | "ProgrammableNonFungible"): this { this.config.tokenStandard = std; return this; }
  mutable(m: boolean): this { this.config.isMutable = m; return this; }

  addCreator(address: PublicKey, share: number): this {
    this.config.creators = [...(this.config.creators || []), { address, share }];
    return this;
  }

  configLines(settings: ConfigLineSettings): this {
    this.config.configLineSettings = settings;
    this.config.hiddenSettings = undefined;
    return this;
  }

  hiddenSettings(name: string, uri: string, hash: Uint8Array): this {
    this.config.hiddenSettings = { name, uri, hash };
    this.config.configLineSettings = undefined;
    return this;
  }

  defaultGuards(guards: GuardConfig): this {
    this.config.guards = guards;
    return this;
  }

  addGroup(label: string, guards: GuardConfig): this {
    this.config.groups = [...(this.config.groups || []), { label, guards }];
    return this;
  }

  /**
   * Pre-built tiered guard groups for the agentic passport system
   */
  withTieredGroups(treasury: PublicKey, agentSigner?: PublicKey, collectionNft?: PublicKey): this {
    const groups: GuardGroup[] = [];

    // Free tier — requires existing passport NFT
    if (collectionNft) {
      groups.push({
        label: "free",
        guards: {
          nftGate: { requiredCollection: collectionNft },
          botTax: { lamports: 0.01 * LAMPORTS_PER_SOL, lastInstruction: true },
        },
      });
    }

    // Agent tier — small SOL payment + third party signer
    groups.push({
      label: "agent",
      guards: {
        solPayment: { lamports: TIER_DEFINITIONS.AGENT.price, destination: treasury },
        ...(agentSigner ? { thirdPartySigner: { signerKey: agentSigner } } : {}),
        botTax: { lamports: 0.01 * LAMPORTS_PER_SOL, lastInstruction: true },
      },
    });

    // Operator tier — moderate payment + mint limit
    groups.push({
      label: "operator",
      guards: {
        solPayment: { lamports: TIER_DEFINITIONS.OPERATOR.price, destination: treasury },
        mintLimit: { id: 1, limit: 5 },
        botTax: { lamports: 0.01 * LAMPORTS_PER_SOL, lastInstruction: true },
      },
    });

    // Sovereign tier — premium, unlimited
    groups.push({
      label: "sovereign",
      guards: {
        solPayment: { lamports: TIER_DEFINITIONS.SOVEREIGN.price, destination: treasury },
        botTax: { lamports: 0.01 * LAMPORTS_PER_SOL, lastInstruction: true },
      },
    });

    this.config.groups = groups;
    // Default guards = bot tax only
    this.config.guards = {
      botTax: { lamports: 0.01 * LAMPORTS_PER_SOL, lastInstruction: true },
    };
    return this;
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.config.itemsAvailable || this.config.itemsAvailable < 1) errors.push("Items available must be ≥ 1");
    if (!this.config.symbol) errors.push("Symbol is required");
    if ((this.config.creators || []).length === 0) errors.push("At least one creator is required");
    const shareTotal = (this.config.creators || []).reduce((s, c) => s + c.share, 0);
    if (shareTotal !== 100) errors.push(`Creator shares must total 100, got ${shareTotal}`);
    if (!this.config.configLineSettings && !this.config.hiddenSettings) {
      errors.push("Either configLineSettings or hiddenSettings is required");
    }
    return { valid: errors.length === 0, errors };
  }

  build(): CandyMachineConfig {
    const v = this.validate();
    if (!v.valid) throw new Error(`Candy Machine config invalid: ${v.errors.join(", ")}`);
    return this.config as CandyMachineConfig;
  }
}

// ─── Candy Machine Client ────────────────────────────────────────────────

export class CandyMachineClient {
  private connection: Connection;
  private authority: Keypair;
  private umi: ReturnType<typeof createUmi>;

  constructor(connection: Connection, authority: Keypair) {
    this.connection = connection;
    this.authority = authority;
    this.umi = createUmi(connection.rpcEndpoint)
      .use(mplCandyMachine())
      .use(mplTokenMetadata())
      .use(keypairIdentity(fromWeb3JsKeypair(authority)));
  }

  /**
   * Create a new collection NFT for the candy machine
   */
  async createCollection(name: string, uri: string, sellerFeeBps: number): Promise<PublicKey> {
    const collectionMint = generateSigner(this.umi);

    await createNft(this.umi, {
      mint: collectionMint,
      name,
      uri,
      sellerFeeBasisPoints: percentAmount(sellerFeeBps / 100),
      isCollection: true,
    }).sendAndConfirm(this.umi);

    return new PublicKey(collectionMint.publicKey.toString());
  }

  /**
   * Deploy a Candy Machine with full configuration
   */
  async deploy(config: CandyMachineConfig, collectionMint: PublicKey): Promise<CandyMachineDeployResult> {
    const candyMachineSigner = generateSigner(this.umi);
    const collectionUpdateAuthority = this.umi.identity;

    // Build guard args
    const guards = this.buildGuardArgs(config.guards);

    // Build groups
    const groups = (config.groups || []).map(g => ({
      label: g.label,
      guards: this.buildGuardArgs(g.guards),
    }));

    // Create candy machine
    const builder = create(this.umi, {
      candyMachine: candyMachineSigner,
      collectionMint: publicKey(collectionMint.toBase58()),
      collectionUpdateAuthority,
      tokenStandard: config.tokenStandard === "ProgrammableNonFungible"
        ? TokenStandard.ProgrammableNonFungible
        : TokenStandard.NonFungible,
      sellerFeeBasisPoints: percentAmount(config.sellerFeeBasisPoints / 100),
      itemsAvailable: config.itemsAvailable,
      symbol: config.symbol,
      maxEditionSupply: config.maxEditionSupply,
      isMutable: config.isMutable,
      creators: config.creators.map(c => ({
        address: publicKey(c.address.toBase58()),
        percentageShare: c.share,
        verified: false,
      })),
      guards,
      groups: groups.length > 0 ? groups : undefined,
      ...(config.configLineSettings ? {
        configLineSettings: some({
          prefixName: config.configLineSettings.prefixName,
          nameLength: config.configLineSettings.nameLength,
          prefixUri: config.configLineSettings.prefixUri,
          uriLength: config.configLineSettings.uriLength,
          isSequential: config.configLineSettings.isSequential,
        }),
        hiddenSettings: none(),
      } : {}),
      ...(config.hiddenSettings ? {
        hiddenSettings: some({
          name: config.hiddenSettings.name,
          uri: config.hiddenSettings.uri,
          hash: Array.from(config.hiddenSettings.hash),
        }),
        configLineSettings: none(),
      } : {}),
    });

    await builder.sendAndConfirm(this.umi);

    return {
      candyMachine: new PublicKey(candyMachineSigner.publicKey.toString()),
      collection: collectionMint,
      collectionAuthority: new PublicKey(this.umi.identity.publicKey.toString()),
      authority: this.authority.publicKey,
      itemsAvailable: config.itemsAvailable,
      itemsLoaded: 0,
      transactions: [],
    };
  }

  /**
   * Add config lines (items) to the candy machine
   * Batches into chunks of 10 to avoid transaction size limits
   */
  async addItems(candyMachine: PublicKey, items: ConfigLine[]): Promise<number> {
    const batches = chunk(items, 10);
    let loaded = 0;
    let index = 0;

    for (const batch of batches) {
      await addConfigLines(this.umi, {
        candyMachine: publicKey(candyMachine.toBase58()),
        index,
        configLines: batch.map(item => ({
          name: item.name,
          uri: item.uri,
        })),
      }).sendAndConfirm(this.umi);

      loaded += batch.length;
      index += batch.length;
    }

    return loaded;
  }

  /**
   * Mint an NFT from the candy machine
   */
  async mint(candyMachine: PublicKey, group?: string): Promise<MintResult> {
    const nftMint = generateSigner(this.umi);

    const mintArgs: any = {
      candyMachine: publicKey(candyMachine.toBase58()),
      nftMint,
      collectionMint: publicKey((await this.getStatus(candyMachine)).collection.toBase58()),
      collectionUpdateAuthority: this.umi.identity.publicKey,
    };

    if (group) {
      mintArgs.group = some(group);
    }

    await mintV2(this.umi, mintArgs).sendAndConfirm(this.umi);

    return {
      nft: new PublicKey(nftMint.publicKey.toString()),
      metadata: PublicKey.default, // Would be derived from nft mint
      masterEdition: PublicKey.default,
      tokenAccount: PublicKey.default,
      candyMachine,
      transaction: new Transaction(),
    };
  }

  /**
   * Mint multiple NFTs in sequence
   */
  async mintBatch(candyMachine: PublicKey, count: number, group?: string): Promise<MintResult[]> {
    const results: MintResult[] = [];
    for (let i = 0; i < count; i++) {
      const result = await this.mint(candyMachine, group);
      results.push(result);
    }
    return results;
  }

  /**
   * Get candy machine status
   */
  async getStatus(candyMachine: PublicKey): Promise<{
    itemsAvailable: number;
    itemsMinted: number;
    itemsRemaining: number;
    isActive: boolean;
    authority: PublicKey;
    collection: PublicKey;
  }> {
    const cm = await fetchCandyMachine(this.umi, publicKey(candyMachine.toBase58()));

    return {
      itemsAvailable: Number(cm.data.itemsAvailable),
      itemsMinted: Number(cm.itemsRedeemed),
      itemsRemaining: Number(cm.data.itemsAvailable) - Number(cm.itemsRedeemed),
      isActive: Number(cm.itemsRedeemed) < Number(cm.data.itemsAvailable),
      authority: new PublicKey(cm.authority.toString()),
      collection: new PublicKey(cm.collectionMint.toString()),
    };
  }

  /**
   * Generate config lines for agentic passports
   */
  generateAgentConfigLines(
    namePrefix: string,
    uriPrefix: string,
    count: number,
    tiers: PassportTier[] = ["AGENT"],
  ): ConfigLine[] {
    const lines: ConfigLine[] = [];
    for (let i = 0; i < count; i++) {
      const tier = tiers[i % tiers.length];
      lines.push({
        name: `${namePrefix} #${(i + 1).toString().padStart(4, "0")}`,
        uri: `${uriPrefix}/${tier.toLowerCase()}/${i}.json`,
      });
    }
    return lines;
  }

  /**
   * Estimate deployment cost
   */
  async estimateCost(config: CandyMachineConfig): Promise<CostEstimate> {
    const cmRent = 5_616_000 + (config.itemsAvailable * 40); // Base + per-item
    const collectionRent = 5_616_000;
    const guardRent = 1_000_000;
    const perItemUpload = 10_000; // ~0.00001 SOL per config line tx
    const txFees = 10_000 * (Math.ceil(config.itemsAvailable / 10) + 3); // batch + create + guard

    const total = cmRent + collectionRent + guardRent + (config.itemsAvailable * perItemUpload) + txFees;

    return {
      accountRent: cmRent + collectionRent + guardRent,
      metadataUpload: config.itemsAvailable * perItemUpload,
      mintFees: 0,
      candyMachineRent: cmRent,
      tokenCreation: 0,
      transactionFees: txFees,
      total,
      totalSol: total / LAMPORTS_PER_SOL,
    };
  }

  // ─── Guard Serialization ───────────────────────────────────────────

  private buildGuardArgs(guards: GuardConfig): GuardSetArgs {
    const args: any = {};

    if (guards.solPayment) {
      args.solPayment = some({
        lamports: sol(guards.solPayment.lamports / LAMPORTS_PER_SOL),
        destination: publicKey(guards.solPayment.destination.toBase58()),
      });
    }

    if (guards.mintLimit) {
      args.mintLimit = some({
        id: guards.mintLimit.id,
        limit: guards.mintLimit.limit,
      });
    }

    if (guards.startDate) {
      args.startDate = some({ date: dateTime(guards.startDate.date) });
    }

    if (guards.endDate) {
      args.endDate = some({ date: dateTime(guards.endDate.date) });
    }

    if (guards.botTax) {
      args.botTax = some({
        lamports: sol(guards.botTax.lamports / LAMPORTS_PER_SOL),
        lastInstruction: guards.botTax.lastInstruction,
      });
    }

    if (guards.nftGate) {
      args.nftGate = some({
        requiredCollection: publicKey(guards.nftGate.requiredCollection.toBase58()),
      });
    }

    if (guards.thirdPartySigner) {
      args.thirdPartySigner = some({
        signerKey: publicKey(guards.thirdPartySigner.signerKey.toBase58()),
      });
    }

    if (guards.tokenGate) {
      args.tokenGate = some({
        amount: guards.tokenGate.amount,
        mint: publicKey(guards.tokenGate.mint.toBase58()),
      });
    }

    if (guards.addressGate) {
      args.addressGate = some({
        address: publicKey(guards.addressGate.address.toBase58()),
      });
    }

    if (guards.redeemedAmount) {
      args.redeemedAmount = some({ maximum: guards.redeemedAmount.maximum });
    }

    if (guards.allowList) {
      args.allowList = some({ merkleRoot: Array.from(guards.allowList.merkleRoot) });
    }

    return args;
  }
}
