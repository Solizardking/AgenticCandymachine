
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { CandyMachineConfig, CandyMachineDeployResult, MintResult, GuardConfig, Creator, ConfigLine, ConfigLineSettings, GuardGroup } from "../../types/index.js";
import { sleep } from "../../utils/index.js";

// ─── Builder ─────────────────────────────────────────────────────────────────

export class CandyMachineBuilder {
    private config: Partial<CandyMachineConfig> = {
        itemsAvailable: 0,
        sellerFeeBasisPoints: 500, // 5%
        symbol: "CM",
        tokenStandard: "ProgrammableNonFungible",
    };

    items(count: number): this {
        this.config.itemsAvailable = count;
        return this;
    }

    symbol(symbol: string): this {
        this.config.symbol = symbol;
        return this;
    }

    sellerFee(bps: number): this {
        this.config.sellerFeeBasisPoints = bps;
        return this;
    }

    addCreator(address: PublicKey, share: number): this {
        if (!this.config.creators) this.config.creators = [];
        this.config.creators.push({ address, share, verified: false });
        return this;
    }

    configLines(settings: ConfigLineSettings): this {
        this.config.configLineSettings = settings;
        return this;
    }

    hiddenSettings(name: string, uri: string, hash: Uint8Array): this {
        this.config.hiddenSettings = { name, uri, hash };
        return this;
    }

    groups(groups: GuardGroup[]): this {
        this.config.groups = groups;
        return this;
    }

    defaultGuards(guards: GuardConfig): this {
        this.config.guards = guards;
        return this;
    }

    build(): CandyMachineConfig {
        if (!this.config.itemsAvailable || !this.config.symbol) {
            throw new Error("Candy Machine configuration invalid");
        }
        return this.config as CandyMachineConfig;
    }
}

// ─── Guard Builder ───────────────────────────────────────────────────────────

export class GuardBuilder {
    private guards: GuardConfig = {};

    solPayment(amount: number, destination: PublicKey): this {
        this.guards.solPayment = { value: amount, destination };
        return this;
    }

    mintLimit(id: number, limit: number): this {
        this.guards.mintLimit = { id, limit };
        return this;
    }

    startDate(date: Date): this {
        this.guards.startDate = { date };
        return this;
    }

    botTax(value: number): this {
        this.guards.botTax = { value, lastInstruction: true };
        return this;
    }

    allowList(merkleRoot: Uint8Array): this {
        this.guards.allowList = { merkleRoot };
        return this;
    }

    build(): GuardConfig {
        return this.guards;
    }
}

// ─── Client ──────────────────────────────────────────────────────────────────

export class CandyMachineClient {
    constructor(
        private connection: Connection,
        private authority: Keypair
    ) { }

    async estimateCost(config: CandyMachineConfig): Promise<number> {
        // Basic estimate: ~0.0016 SOL per config line + account rent
        return 0.05 + (config.itemsAvailable * 0.00167);
    }

    async createCollection(name: string, uri: string, royalties: number): Promise<PublicKey> {
        await sleep(400);
        return Keypair.generate().publicKey; // Mock Collection Mint
    }

    async deploy(config: CandyMachineConfig, collectionMint: PublicKey): Promise<CandyMachineDeployResult> {
        await sleep(600);
        const cmKey = Keypair.generate().publicKey;

        return {
            candyMachine: cmKey,
            signature: "mock_cm_deploy_sig_" + cmKey.toBase58().slice(0, 8),
            itemsLoaded: 0,
        };
    }

    async addItems(candyMachine: PublicKey, items: ConfigLine[]): Promise<number> {
        await sleep(items.length * 2); // Simulate processing time
        return items.length;
    }

    async mint(candyMachine: PublicKey, group?: string): Promise<MintResult> {
        await sleep(500);
        const nftMint = Keypair.generate().publicKey;
        return {
            nft: nftMint,
            signature: "mock_mint_sig_" + nftMint.toBase58().slice(0, 8),
        };
    }

    generateAgentConfigLines(
        prefixName: string,
        prefixUri: string,
        count: number,
        tiers: string[]
    ): ConfigLine[] {
        const lines: ConfigLine[] = [];
        for (let i = 0; i < count; i++) {
            lines.push({
                name: `${prefixName} #${i + 1}`,
                uri: `${prefixUri}/${i}.json`,
            });
        }
        return lines;
    }

    async getStatus(candyMachine: PublicKey) {
        await sleep(100);
        return { itemsMinted: 5, itemsAvailable: 1000 };
    }
}
