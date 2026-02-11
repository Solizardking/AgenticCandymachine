import { Keypair } from "@solana/web3.js";
import { sleep } from "../../utils/index.js";
// ─── Builder ─────────────────────────────────────────────────────────────────
export class CandyMachineBuilder {
    config = {
        itemsAvailable: 0,
        sellerFeeBasisPoints: 500, // 5%
        symbol: "CM",
        tokenStandard: "ProgrammableNonFungible",
    };
    items(count) {
        this.config.itemsAvailable = count;
        return this;
    }
    symbol(symbol) {
        this.config.symbol = symbol;
        return this;
    }
    sellerFee(bps) {
        this.config.sellerFeeBasisPoints = bps;
        return this;
    }
    addCreator(address, share) {
        if (!this.config.creators)
            this.config.creators = [];
        this.config.creators.push({ address, share, verified: false });
        return this;
    }
    configLines(settings) {
        this.config.configLineSettings = settings;
        return this;
    }
    hiddenSettings(name, uri, hash) {
        this.config.hiddenSettings = { name, uri, hash };
        return this;
    }
    groups(groups) {
        this.config.groups = groups;
        return this;
    }
    defaultGuards(guards) {
        this.config.guards = guards;
        return this;
    }
    build() {
        if (!this.config.itemsAvailable || !this.config.symbol) {
            throw new Error("Candy Machine configuration invalid");
        }
        return this.config;
    }
}
// ─── Guard Builder ───────────────────────────────────────────────────────────
export class GuardBuilder {
    guards = {};
    solPayment(amount, destination) {
        this.guards.solPayment = { value: amount, destination };
        return this;
    }
    mintLimit(id, limit) {
        this.guards.mintLimit = { id, limit };
        return this;
    }
    startDate(date) {
        this.guards.startDate = { date };
        return this;
    }
    botTax(value) {
        this.guards.botTax = { value, lastInstruction: true };
        return this;
    }
    allowList(merkleRoot) {
        this.guards.allowList = { merkleRoot };
        return this;
    }
    build() {
        return this.guards;
    }
}
// ─── Client ──────────────────────────────────────────────────────────────────
export class CandyMachineClient {
    connection;
    authority;
    constructor(connection, authority) {
        this.connection = connection;
        this.authority = authority;
    }
    async estimateCost(config) {
        // Basic estimate: ~0.0016 SOL per config line + account rent
        return 0.05 + (config.itemsAvailable * 0.00167);
    }
    async createCollection(name, uri, royalties) {
        await sleep(400);
        return Keypair.generate().publicKey; // Mock Collection Mint
    }
    async deploy(config, collectionMint) {
        await sleep(600);
        const cmKey = Keypair.generate().publicKey;
        return {
            candyMachine: cmKey,
            signature: "mock_cm_deploy_sig_" + cmKey.toBase58().slice(0, 8),
            itemsLoaded: 0,
        };
    }
    async addItems(candyMachine, items) {
        await sleep(items.length * 2); // Simulate processing time
        return items.length;
    }
    async mint(candyMachine, group) {
        await sleep(500);
        const nftMint = Keypair.generate().publicKey;
        return {
            nft: nftMint,
            signature: "mock_mint_sig_" + nftMint.toBase58().slice(0, 8),
        };
    }
    generateAgentConfigLines(prefixName, prefixUri, count, tiers) {
        const lines = [];
        for (let i = 0; i < count; i++) {
            lines.push({
                name: `${prefixName} #${i + 1}`,
                uri: `${prefixUri}/${i}.json`,
            });
        }
        return lines;
    }
    async getStatus(candyMachine) {
        await sleep(100);
        return { itemsMinted: 5, itemsAvailable: 1000 };
    }
}
//# sourceMappingURL=index.js.map