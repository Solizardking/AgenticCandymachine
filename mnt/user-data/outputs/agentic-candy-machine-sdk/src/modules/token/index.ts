// ═══════════════════════════════════════════════════════════════════════════
//  Token Module — SPL Token Creation via Token-2022
//  Full token lifecycle: create, configure extensions, mint, revoke authority
// ═══════════════════════════════════════════════════════════════════════════

import {
  PublicKey, Keypair, Connection, Transaction, TransactionInstruction,
  SystemProgram, LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddressSync,
  getMintLen,
  AuthorityType,
  ExtensionType,
  createInitializeTransferFeeConfigInstruction,
  createInitializeNonTransferableMintInstruction,
  createInitializePermanentDelegateInstruction,
  createInitializeMetadataPointerInstruction,
} from "@solana/spl-token";
import {
  createInitializeInstruction as createMetadataInitInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata as SplTokenMetadata,
} from "@solana/spl-token-metadata";
import type { TokenConfig, TokenDeployResult, TokenExtension, CostEstimate, Buildable, Deployable } from "../../types/index.js";
import { uuid, solToLamports, lamportsToSol } from "../../utils/index.js";

// ─── Token Builder ───────────────────────────────────────────────────────

export class TokenBuilder implements Buildable<TokenConfig> {
  private config: Partial<TokenConfig> = {
    decimals: 9,
    initialSupply: BigInt(1_000_000),
    mintAuthority: true,
    freezeAuthority: false,
    extensions: [],
  };

  name(name: string): this { this.config.name = name; return this; }
  symbol(symbol: string): this { this.config.symbol = symbol.toUpperCase(); return this; }
  decimals(d: number): this { this.config.decimals = d; return this; }
  supply(amount: bigint): this { this.config.initialSupply = amount; return this; }
  retainMintAuthority(retain: boolean): this { this.config.mintAuthority = retain; return this; }
  retainFreezeAuthority(retain: boolean): this { this.config.freezeAuthority = retain; return this; }
  description(desc: string): this {
    if (!this.config.metadata) this.config.metadata = {} as any;
    this.config.metadata!.description = desc;
    return this;
  }
  image(uri: string): this {
    if (!this.config.metadata) this.config.metadata = {} as any;
    this.config.metadata!.image = uri;
    return this;
  }
  uri(uri: string): this {
    if (!this.config.metadata) this.config.metadata = {} as any;
    this.config.metadata!.uri = uri;
    return this;
  }

  addExtension(ext: TokenExtension): this {
    this.config.extensions = [...(this.config.extensions || []), ext];
    return this;
  }

  addTransferFee(basisPoints: number, maxFee: bigint): this {
    return this.addExtension({ type: "transferFee", feeBasisPoints: basisPoints, maxFee });
  }

  makeNonTransferable(): this {
    return this.addExtension({ type: "nonTransferable" });
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.config.name) errors.push("Token name is required");
    if (!this.config.symbol) errors.push("Token symbol is required");
    if ((this.config.symbol?.length || 0) > 10) errors.push("Symbol must be ≤ 10 chars");
    if ((this.config.decimals ?? -1) < 0 || (this.config.decimals ?? 0) > 18) errors.push("Decimals must be 0-18");
    if ((this.config.initialSupply ?? 0n) <= 0n) errors.push("Supply must be > 0");
    return { valid: errors.length === 0, errors };
  }

  build(): TokenConfig {
    const v = this.validate();
    if (!v.valid) throw new Error(`Token config invalid: ${v.errors.join(", ")}`);

    return {
      name: this.config.name!,
      symbol: this.config.symbol!,
      decimals: this.config.decimals!,
      initialSupply: this.config.initialSupply!,
      mintAuthority: this.config.mintAuthority!,
      freezeAuthority: this.config.freezeAuthority!,
      metadata: {
        name: this.config.name!,
        symbol: this.config.symbol!,
        uri: this.config.metadata?.uri || "",
        description: this.config.metadata?.description,
        image: this.config.metadata?.image,
      },
      extensions: this.config.extensions || [],
    };
  }
}

// ─── Token Deployer ──────────────────────────────────────────────────────

export class TokenDeployer {
  private connection: Connection;
  private authority: Keypair;

  constructor(connection: Connection, authority: Keypair) {
    this.connection = connection;
    this.authority = authority;
  }

  /**
   * Compute the required extensions for the mint account
   */
  private getExtensionTypes(config: TokenConfig): ExtensionType[] {
    const exts: ExtensionType[] = [ExtensionType.MetadataPointer];
    for (const ext of config.extensions || []) {
      switch (ext.type) {
        case "transferFee": exts.push(ExtensionType.TransferFeeConfig); break;
        case "nonTransferable": exts.push(ExtensionType.NonTransferable); break;
        case "permanentDelegate": exts.push(ExtensionType.PermanentDelegate); break;
      }
    }
    return exts;
  }

  /**
   * Build all instructions for token creation
   */
  buildInstructions(config: TokenConfig, mintKeypair: Keypair): TransactionInstruction[] {
    const instructions: TransactionInstruction[] = [];
    const mintPubkey = mintKeypair.publicKey;
    const authorityPubkey = this.authority.publicKey;

    // Compute space needed
    const extensionTypes = this.getExtensionTypes(config);
    const mintLen = getMintLen(extensionTypes);

    // Build metadata for space calculation
    const tokenMetadata: SplTokenMetadata = {
      mint: mintPubkey,
      name: config.metadata.name,
      symbol: config.metadata.symbol,
      uri: config.metadata.uri,
      additionalMetadata: config.metadata.additionalMetadata || [],
      updateAuthority: authorityPubkey,
    };
    const metadataLen = pack(tokenMetadata).length;
    const totalLen = mintLen + metadataLen;

    // 1. Create account
    instructions.push(
      SystemProgram.createAccount({
        fromPubkey: authorityPubkey,
        newAccountPubkey: mintPubkey,
        space: totalLen,
        lamports: 0, // Will be computed at deploy time
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );

    // 2. Initialize metadata pointer (must come before InitializeMint)
    instructions.push(
      createInitializeMetadataPointerInstruction(
        mintPubkey,
        authorityPubkey,
        mintPubkey,
        TOKEN_2022_PROGRAM_ID,
      )
    );

    // 3. Extension-specific initialization
    for (const ext of config.extensions || []) {
      switch (ext.type) {
        case "transferFee":
          instructions.push(
            createInitializeTransferFeeConfigInstruction(
              mintPubkey,
              authorityPubkey,
              authorityPubkey,
              ext.feeBasisPoints,
              ext.maxFee,
              TOKEN_2022_PROGRAM_ID,
            )
          );
          break;
        case "nonTransferable":
          instructions.push(
            createInitializeNonTransferableMintInstruction(
              mintPubkey,
              TOKEN_2022_PROGRAM_ID,
            )
          );
          break;
        case "permanentDelegate":
          instructions.push(
            createInitializePermanentDelegateInstruction(
              mintPubkey,
              ext.delegate,
              TOKEN_2022_PROGRAM_ID,
            )
          );
          break;
      }
    }

    // 4. Initialize mint
    instructions.push(
      createInitializeMintInstruction(
        mintPubkey,
        config.decimals,
        authorityPubkey,
        config.freezeAuthority ? authorityPubkey : null,
        TOKEN_2022_PROGRAM_ID,
      )
    );

    // 5. Initialize metadata
    instructions.push(
      createMetadataInitInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintPubkey,
        metadata: mintPubkey,
        name: config.metadata.name,
        symbol: config.metadata.symbol,
        uri: config.metadata.uri,
        mintAuthority: authorityPubkey,
        updateAuthority: authorityPubkey,
      })
    );

    // 6. Additional metadata fields
    if (config.metadata.description) {
      instructions.push(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintPubkey,
          updateAuthority: authorityPubkey,
          field: "description",
          value: config.metadata.description,
        })
      );
    }

    // 7. Create ATA
    const ata = getAssociatedTokenAddressSync(
      mintPubkey, authorityPubkey, false, TOKEN_2022_PROGRAM_ID,
    );
    instructions.push(
      createAssociatedTokenAccountInstruction(
        authorityPubkey, ata, authorityPubkey, mintPubkey, TOKEN_2022_PROGRAM_ID,
      )
    );

    // 8. Mint initial supply
    const supplyWithDecimals = config.initialSupply * BigInt(10 ** config.decimals);
    instructions.push(
      createMintToInstruction(
        mintPubkey, ata, authorityPubkey, supplyWithDecimals, [], TOKEN_2022_PROGRAM_ID,
      )
    );

    // 9. Optionally revoke mint authority
    if (!config.mintAuthority) {
      instructions.push(
        createSetAuthorityInstruction(
          mintPubkey, authorityPubkey, AuthorityType.MintTokens, null, [], TOKEN_2022_PROGRAM_ID,
        )
      );
    }

    return instructions;
  }

  /**
   * Deploy the token to Solana
   */
  async deploy(config: TokenConfig): Promise<TokenDeployResult> {
    const mintKeypair = Keypair.generate();
    const instructions = this.buildInstructions(config, mintKeypair);

    // Compute rent
    const extensionTypes = this.getExtensionTypes(config);
    const mintLen = getMintLen(extensionTypes);
    const tokenMetadata: SplTokenMetadata = {
      mint: mintKeypair.publicKey,
      name: config.metadata.name,
      symbol: config.metadata.symbol,
      uri: config.metadata.uri,
      additionalMetadata: config.metadata.additionalMetadata || [],
      updateAuthority: this.authority.publicKey,
    };
    const metadataLen = pack(tokenMetadata).length;
    const rent = await this.connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    // Patch the create account instruction with correct lamports
    (instructions[0] as any).keys; // Ensure it's the SystemProgram instruction
    instructions[0] = SystemProgram.createAccount({
      fromPubkey: this.authority.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen + metadataLen,
      lamports: rent,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const tx = new Transaction().add(...instructions);
    tx.feePayer = this.authority.publicKey;
    tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    const ata = getAssociatedTokenAddressSync(
      mintKeypair.publicKey, this.authority.publicKey, false, TOKEN_2022_PROGRAM_ID,
    );

    return {
      mint: mintKeypair.publicKey,
      metadata: mintKeypair.publicKey, // Token-2022 stores metadata in the mint account
      ata,
      supply: config.initialSupply,
      transaction: tx,
    };
  }

  /**
   * Estimate deployment cost
   */
  async estimateCost(config: TokenConfig): Promise<number> {
    const extensionTypes = this.getExtensionTypes(config);
    const mintLen = getMintLen(extensionTypes);
    const metadataLen = 200; // Approximate
    const rent = await this.connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
    const txFee = 10000; // ~0.00001 SOL per transaction
    return rent + txFee;
  }
}
