import { Connection, Keypair } from "@solana/web3.js";
import { TokenConfig, TokenDeployResult, TokenExtension, TokenMetadata } from "../../types/index.js";
export declare class TokenBuilder {
    private config;
    name(name: string): this;
    symbol(symbol: string): this;
    decimals(decimals: number): this;
    initialSupply(amount: bigint): this;
    enableExtension(extension: TokenExtension): this;
    metadata(meta: TokenMetadata): this;
    build(): TokenConfig;
}
export declare class TokenDeployer {
    private connection;
    private authority;
    constructor(connection: Connection, authority: Keypair);
    estimateCost(config: TokenConfig): Promise<number>;
    deploy(config: TokenConfig): Promise<TokenDeployResult>;
}
