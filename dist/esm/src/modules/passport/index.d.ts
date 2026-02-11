import { PublicKey } from "@solana/web3.js";
import { AgentDNA, ArtArtifact, TokenDeployResult, PassportBundle } from "../../types/index.js";
interface PassportFactoryConfig {
    authority: PublicKey;
    symbol: string;
    sellerFeeBps: number;
}
export declare class PassportFactory {
    private config;
    constructor(config: PassportFactoryConfig);
    buildBundle(dna: AgentDNA, art?: ArtArtifact, token?: TokenDeployResult): PassportBundle;
}
export {};
