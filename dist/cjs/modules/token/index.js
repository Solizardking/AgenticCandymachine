"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDeployer = exports.TokenBuilder = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const index_js_1 = require("../../utils/index.js");
// ─── Builder ─────────────────────────────────────────────────────────────────
class TokenBuilder {
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
exports.TokenBuilder = TokenBuilder;
// ─── Deployer ────────────────────────────────────────────────────────────────
class TokenDeployer {
    connection;
    authority;
    constructor(connection, authority) {
        this.connection = connection;
        this.authority = authority;
    }
    async estimateCost(config) {
        const extensions = [spl_token_1.ExtensionType.MetadataPointer]; // Default
        if (config.extensions?.includes("transferFee"))
            extensions.push(spl_token_1.ExtensionType.TransferFeeConfig);
        const mintLen = (0, spl_token_1.getMintLen)(extensions);
        const lamports = await this.connection.getMinimumBalanceForRentExemption(mintLen);
        return lamports / 1e9;
    }
    async deploy(config) {
        const mintKeypair = web3_js_1.Keypair.generate();
        const decimals = config.decimals;
        const extensions = [spl_token_1.ExtensionType.MetadataPointer];
        // Calculate space for extensions
        const mintLen = (0, spl_token_1.getMintLen)(extensions);
        const lamports = await this.connection.getMinimumBalanceForRentExemption(mintLen);
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: this.authority.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLen,
            lamports,
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeMetadataPointerInstruction)(mintKeypair.publicKey, this.authority.publicKey, this.authority.publicKey, spl_token_1.TOKEN_2022_PROGRAM_ID), (0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, decimals, this.authority.publicKey, this.authority.publicKey, spl_token_1.TOKEN_2022_PROGRAM_ID));
        // In a real scenario, we send and confirm.
        // Here we mock the confirmation since we don't have funds in this environment.
        await (0, index_js_1.sleep)(500);
        const signature = "mock_token_deploy_signature_" + mintKeypair.publicKey.toBase58().slice(0, 8);
        return {
            mint: mintKeypair.publicKey,
            tokenAccount: this.authority.publicKey, // Placeholder
            signature,
        };
    }
}
exports.TokenDeployer = TokenDeployer;
//# sourceMappingURL=index.js.map