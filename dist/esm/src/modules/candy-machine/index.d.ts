import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { CandyMachineConfig, CandyMachineDeployResult, MintResult, GuardConfig, ConfigLine, ConfigLineSettings, GuardGroup } from "../../types/index.js";
export declare class CandyMachineBuilder {
    private config;
    items(count: number): this;
    symbol(symbol: string): this;
    sellerFee(bps: number): this;
    addCreator(address: PublicKey, share: number): this;
    configLines(settings: ConfigLineSettings): this;
    hiddenSettings(name: string, uri: string, hash: Uint8Array): this;
    groups(groups: GuardGroup[]): this;
    defaultGuards(guards: GuardConfig): this;
    build(): CandyMachineConfig;
}
export declare class GuardBuilder {
    private guards;
    solPayment(amount: number, destination: PublicKey): this;
    mintLimit(id: number, limit: number): this;
    startDate(date: Date): this;
    botTax(value: number): this;
    allowList(merkleRoot: Uint8Array): this;
    build(): GuardConfig;
}
export declare class CandyMachineClient {
    private connection;
    private authority;
    constructor(connection: Connection, authority: Keypair);
    estimateCost(config: CandyMachineConfig): Promise<number>;
    createCollection(name: string, uri: string, royalties: number): Promise<PublicKey>;
    deploy(config: CandyMachineConfig, collectionMint: PublicKey): Promise<CandyMachineDeployResult>;
    addItems(candyMachine: PublicKey, items: ConfigLine[]): Promise<number>;
    mint(candyMachine: PublicKey, group?: string): Promise<MintResult>;
    generateAgentConfigLines(prefixName: string, prefixUri: string, count: number, tiers: string[]): ConfigLine[];
    getStatus(candyMachine: PublicKey): Promise<{
        itemsMinted: number;
        itemsAvailable: number;
    }>;
}
