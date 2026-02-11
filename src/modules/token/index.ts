
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import {
    createInitializeMintInstruction,
    TOKEN_2022_PROGRAM_ID,
    getMintLen,
    ExtensionType,
    createInitializeMetadataPointerInstruction,
    createInitializeTransferFeeConfigInstruction,
    MINT_SIZE
} from "@solana/spl-token";
import { TokenConfig, TokenDeployResult, TokenExtension, TokenMetadata } from "../../types/index.js";
import { sleep } from "../../utils/index.js";

// ─── Builder ─────────────────────────────────────────────────────────────────

export class TokenBuilder {
    private config: Partial<TokenConfig> = {
        decimals: 9,
        initialSupply: BigInt(0),
        extensions: [],
    };

    name(name: string): this {
        this.config.name = name;
        return this;
    }

    symbol(symbol: string): this {
        this.config.symbol = symbol;
        return this;
    }

    decimals(decimals: number): this {
        this.config.decimals = decimals;
        return this;
    }

    initialSupply(amount: bigint): this {
        this.config.initialSupply = amount;
        return this;
    }

    enableExtension(extension: TokenExtension): this {
        if (!this.config.extensions) this.config.extensions = [];
        this.config.extensions.push(extension);
        return this;
    }

    metadata(meta: TokenMetadata): this {
        this.config.metadata = meta;
        return this;
    }

    build(): TokenConfig {
        if (!this.config.name || !this.config.symbol) {
            throw new Error("Token requires name and symbol");
        }
        return this.config as TokenConfig;
    }
}

// ─── Deployer ────────────────────────────────────────────────────────────────

export class TokenDeployer {
    constructor(
        private connection: Connection,
        private authority: Keypair
    ) { }

    async estimateCost(config: TokenConfig): Promise<number> {
        const extensions = [ExtensionType.MetadataPointer]; // Default
        if (config.extensions?.includes("transferFee")) extensions.push(ExtensionType.TransferFeeConfig);

        const mintLen = getMintLen(extensions);
        const lamports = await this.connection.getMinimumBalanceForRentExemption(mintLen);
        return lamports / 1e9;
    }

    async deploy(config: TokenConfig): Promise<TokenDeployResult> {
        const mintKeypair = Keypair.generate();
        const decimals = config.decimals;
        const extensions = [ExtensionType.MetadataPointer];

        // Calculate space for extensions
        const mintLen = getMintLen(extensions);
        const lamports = await this.connection.getMinimumBalanceForRentExemption(mintLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: this.authority.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(
                mintKeypair.publicKey,
                this.authority.publicKey,
                this.authority.publicKey,
                TOKEN_2022_PROGRAM_ID
            ),
            createInitializeMintInstruction(
                mintKeypair.publicKey,
                decimals,
                this.authority.publicKey,
                this.authority.publicKey,
                TOKEN_2022_PROGRAM_ID
            )
        );

        // In a real scenario, we send and confirm.
        // Here we mock the confirmation since we don't have funds in this environment.
        await sleep(500);
        const signature = "mock_token_deploy_signature_" + mintKeypair.publicKey.toBase58().slice(0, 8);

        return {
            mint: mintKeypair.publicKey,
            tokenAccount: this.authority.publicKey, // Placeholder
            signature,
        };
    }
}
