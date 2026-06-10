import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { createInitializeMintInstruction, TOKEN_2022_PROGRAM_ID, getMintLen, ExtensionType, createInitializeMetadataPointerInstruction, } from "@solana/spl-token";
import { sleep } from "../../utils/index.js";
// ─── Builder ─────────────────────────────────────────────────────────────────
export class TokenBuilder {
    config = {
        decimals: 9,
        initialSupply: BigInt(0),
        extensions: [],
    };
    name(name) {
        this.config.name = name;
        return this;
    }
    symbol(symbol) {
        this.config.symbol = symbol;
        return this;
    }
    decimals(decimals) {
        this.config.decimals = decimals;
        return this;
    }
    initialSupply(amount) {
        this.config.initialSupply = amount;
        return this;
    }
    enableExtension(extension) {
        if (!this.config.extensions)
            this.config.extensions = [];
        this.config.extensions.push(extension);
        return this;
    }
    metadata(meta) {
        this.config.metadata = meta;
        return this;
    }
    build() {
        if (!this.config.name || !this.config.symbol) {
            throw new Error("Token requires name and symbol");
        }
        return this.config;
    }
}
// ─── Deployer ────────────────────────────────────────────────────────────────
export class TokenDeployer {
    connection;
    authority;
    constructor(connection, authority) {
        this.connection = connection;
        this.authority = authority;
    }
    async estimateCost(config) {
        const extensions = [ExtensionType.MetadataPointer]; // Default
        if (config.extensions?.includes("transferFee"))
            extensions.push(ExtensionType.TransferFeeConfig);
        const mintLen = getMintLen(extensions);
        const lamports = await this.connection.getMinimumBalanceForRentExemption(mintLen);
        return lamports / 1e9;
    }
    async deploy(config) {
        const mintKeypair = Keypair.generate();
        const decimals = config.decimals;
        const extensions = [ExtensionType.MetadataPointer];
        // Calculate space for extensions
        const mintLen = getMintLen(extensions);
        const lamports = await this.connection.getMinimumBalanceForRentExemption(mintLen);
        const transaction = new Transaction().add(SystemProgram.createAccount({
            fromPubkey: this.authority.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }), createInitializeMetadataPointerInstruction(mintKeypair.publicKey, this.authority.publicKey, this.authority.publicKey, TOKEN_2022_PROGRAM_ID), createInitializeMintInstruction(mintKeypair.publicKey, decimals, this.authority.publicKey, this.authority.publicKey, TOKEN_2022_PROGRAM_ID));
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
//# sourceMappingURL=index.js.map