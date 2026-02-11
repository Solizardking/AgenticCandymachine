"use strict";
// ═══════════════════════════════════════════════════════════════════════════
//  Core Client — AgenticCandyMachine SDK
//  Orchestrates all modules into a unified pipeline
// ═══════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenticCandyMachineSDK = void 0;
const web3_js_1 = require("@solana/web3.js");
const eventemitter3_1 = require("eventemitter3");
const index_js_1 = require("../utils/index.js");
const index_js_2 = require("../modules/dna/index.js");
const index_js_3 = require("../modules/art/index.js");
const index_js_4 = require("../modules/token/index.js");
const index_js_5 = require("../modules/candy-machine/index.js");
const index_js_6 = require("../modules/recursive/index.js");
const index_js_7 = require("../modules/passport/index.js");
const index_js_8 = require("../modules/attestation/index.js");
// ─── SDK Client ──────────────────────────────────────────────────────────
class AgenticCandyMachineSDK extends eventemitter3_1.EventEmitter {
    config;
    connection;
    // Module instances
    dna;
    art;
    token;
    candyMachine;
    passport;
    attestation;
    tee;
    // Builders (static access)
    static DNABuilder = index_js_2.DNABuilder;
    static DNAEncoder = index_js_2.DNAEncoder;
    static TokenBuilder = index_js_4.TokenBuilder;
    static CandyMachineBuilder = index_js_5.CandyMachineBuilder;
    static GuardBuilder = index_js_5.GuardBuilder;
    static RecursiveMetadataBuilder = index_js_6.RecursiveMetadataBuilder;
    constructor(config) {
        super();
        this.config = config;
        this.connection = (0, index_js_1.getConnection)(config.cluster, config.rpcEndpoint);
        // Initialize modules
        this.dna = index_js_2.DNABuilder;
        this.art = new index_js_3.ArtPipeline({
            googleApiKey: config.googleApiKey,
            nanoBananaApiKey: config.nanoBananaApiKey,
        });
        this.token = new index_js_4.TokenDeployer(this.connection, config.authority);
        this.candyMachine = new index_js_5.CandyMachineClient(this.connection, config.authority);
        this.passport = new index_js_7.PassportFactory({
            authority: config.authority.publicKey,
            symbol: "AGNT",
            sellerFeeBps: 500,
        });
        this.attestation = new index_js_8.AttestationService(this.connection, config.authority, {
            enclaveKey: config.redpillApiKey || "dev-enclave",
            submitOnChain: config.cluster === "mainnet-beta",
            hmacFallback: !config.redpillApiKey,
        });
        this.tee = config.redpillApiKey
            ? new index_js_8.TEETerminal(config.redpillApiKey, this.attestation, {
                baseUrl: config.redpillBaseUrl,
            })
            : null;
    }
    // ─── Events ────────────────────────────────────────────────────────
    emitEvent(type, data) {
        const event = { type, timestamp: Date.now(), data };
        this.emit(type, event);
        this.emit("*", event);
    }
    // ─── Full Pipeline ─────────────────────────────────────────────────
    /**
     * Execute the full pipeline: DNA → Art → Token → Candy Machine → Recursive → Mint
     */
    async pipeline(config) {
        const startTime = Date.now();
        const signatures = [];
        const attestations = [];
        this.emitEvent("pipeline:started", { config });
        try {
            // ═══ Phase 1: DNA ═══
            this.emitEvent("pipeline:phase", { phase: "dna", status: "started" });
            const dna = this.buildDNA(config.dna);
            const encoding = index_js_2.DNAEncoder.encode(dna);
            attestations.push(await this.attestation.attest("dna_creation", config.dna, { hash: dna.dnaHash }, "pipeline"));
            this.emitEvent("dna:created", { dna, encoding });
            // ═══ Phase 2: Art (optional) ═══
            let art;
            if (config.art && !config.options?.skipArt) {
                this.emitEvent("pipeline:phase", { phase: "art", status: "started" });
                this.emitEvent("art:generating", { config: config.art });
                art = await this.art.generate(config.art, dna);
                attestations.push(await this.attestation.attest("art_generation", config.art, { hash: art.contentHash }, art.provider));
                // Upload if uploader configured
                if (this.config.metadataUploader && config.options?.autoUpload) {
                    const uri = await this.config.metadataUploader.upload(art.imageData, art.contentType);
                    art.uri = uri;
                    this.emitEvent("art:uploaded", { uri });
                }
                this.emitEvent("art:generated", { art });
            }
            // ═══ Phase 3: Token (optional) ═══
            let tokenResult;
            if (config.token && !config.options?.skipToken) {
                this.emitEvent("pipeline:phase", { phase: "token", status: "started" });
                this.emitEvent("token:creating", { config: config.token });
                if (config.options?.dryRun) {
                    const cost = await this.token.estimateCost(config.token);
                    this.emitEvent("token:created", { dryRun: true, cost });
                }
                else {
                    tokenResult = await this.token.deploy(config.token);
                    attestations.push(await this.attestation.attest("token_creation", config.token, { mint: tokenResult.mint.toBase58() }, "spl-token"));
                    this.emitEvent("token:created", { result: tokenResult });
                }
            }
            // ═══ Phase 4: Passport Bundle ═══
            this.emitEvent("pipeline:phase", { phase: "passport", status: "started" });
            this.emitEvent("passport:building", { dna });
            const bundle = this.passport.buildBundle(dna, art, tokenResult);
            bundle.attestations = attestations;
            attestations.push(await this.attestation.attest("passport_built", { name: dna.name }, { capabilities: dna.capabilities.length }, "pipeline"));
            this.emitEvent("passport:built", { bundle });
            // ═══ Phase 5: Candy Machine ═══
            let cmResult;
            if (config.candyMachine) {
                this.emitEvent("pipeline:phase", { phase: "candy-machine", status: "started" });
                this.emitEvent("candy-machine:creating", { config: config.candyMachine });
                if (config.options?.dryRun) {
                    const cost = await this.candyMachine.estimateCost(config.candyMachine);
                    this.emitEvent("candy-machine:created", { dryRun: true, cost });
                }
                else {
                    // Create collection
                    const collection = await this.candyMachine.createCollection(`${dna.name} Collection`, bundle.root.uri || "", config.candyMachine.sellerFeeBasisPoints);
                    // Deploy candy machine
                    cmResult = await this.candyMachine.deploy(config.candyMachine, collection);
                    // Generate and add config lines
                    const configLines = this.candyMachine.generateAgentConfigLines(dna.name, bundle.root.uri || "https://arweave.net", config.candyMachine.itemsAvailable, ["AGENT", "OPERATOR", "SOVEREIGN"]);
                    const loaded = await this.candyMachine.addItems(cmResult.candyMachine, configLines);
                    cmResult.itemsLoaded = loaded;
                    attestations.push(await this.attestation.attest("candy_machine_deployed", { items: config.candyMachine.itemsAvailable }, { candyMachine: cmResult.candyMachine.toBase58() }, "metaplex"));
                    this.emitEvent("candy-machine:created", { result: cmResult });
                }
            }
            // ═══ Phase 6: Recursive Tree ═══
            this.emitEvent("pipeline:phase", { phase: "recursive", status: "started" });
            const recursionConfig = config.recursion || { maxDepth: 3, actions: ["resolve", "execute", "compose"] };
            attestations.push(await this.attestation.attest("recursive_tree", { depth: recursionConfig.maxDepth }, bundle.tree, "recursive"));
            this.emitEvent("recursive:tree-built", { tree: bundle.tree });
            // ═══ Complete ═══
            const duration = Date.now() - startTime;
            const cost = bundle.estimatedCost;
            this.emitEvent("pipeline:completed", {
                duration,
                cost,
                attestations: attestations.length,
            });
            return {
                passport: bundle,
                candyMachine: cmResult,
                token: tokenResult,
                attestations,
                transactions: [],
                signatures,
                cost,
                duration,
            };
        }
        catch (error) {
            this.emitEvent("pipeline:error", { error });
            throw error;
        }
    }
    // ─── DNA Helpers ───────────────────────────────────────────────────
    buildDNA(partial) {
        const builder = new index_js_2.DNABuilder()
            .name(partial.name || "Unnamed Agent")
            .handle(partial.handle || "agent")
            .bio(partial.bio || "An autonomous agent on Solana")
            .personality(partial.personality || "Analytical and efficient")
            .tier(partial.tier || "AGENT");
        if (partial.lore)
            builder.lore(partial.lore);
        if (partial.systemPrompt)
            builder.systemPrompt(partial.systemPrompt);
        if (partial.model)
            builder.model(partial.model);
        for (const cap of partial.capabilities || []) {
            builder.addCapability(cap.type, cap.config);
        }
        // Default to at least one capability
        if (!partial.capabilities?.length) {
            builder.addCapability("trade");
        }
        return builder.build();
    }
    // ─── Recursive Resolution ──────────────────────────────────────────
    /**
     * Create a resolver for traversing recursive metadata trees
     */
    createResolver(fetcher) {
        return new index_js_6.RecursiveResolver(fetcher);
    }
    /**
     * Resolve a recursive tree from an on-chain NFT mint
     */
    async resolveTree(rootMint, fetcher) {
        const resolver = this.createResolver(fetcher);
        return resolver.resolve(rootMint);
    }
    // ─── Minting ───────────────────────────────────────────────────────
    /**
     * Mint an NFT from an existing candy machine
     */
    async mint(candyMachine, group) {
        this.emitEvent("candy-machine:minting", { candyMachine: candyMachine.toBase58(), group });
        const result = await this.candyMachine.mint(candyMachine, group);
        await this.attestation.attest("nft_minted", { candyMachine: candyMachine.toBase58(), group }, { nft: result.nft.toBase58() }, "metaplex");
        this.emitEvent("candy-machine:minted", { result });
        return result;
    }
    // ─── TEE ───────────────────────────────────────────────────────────
    /**
     * Run a TEE-attested completion
     */
    async teeComplete(messages, model) {
        if (!this.tee)
            throw new Error("TEE not configured. Provide redpillApiKey in config.");
        return this.tee.complete({
            model: model || "chat",
            messages: messages,
        });
    }
    // ─── Utility ───────────────────────────────────────────────────────
    /**
     * Get wallet balance
     */
    async getBalance() {
        const lamports = await this.connection.getBalance(this.config.authority.publicKey);
        return { lamports, sol: (0, index_js_1.lamportsToSol)(lamports) };
    }
    /**
     * Request airdrop (devnet only)
     */
    async airdrop(sol = 2) {
        if (this.config.cluster !== "devnet" && this.config.cluster !== "testnet") {
            throw new Error("Airdrop only available on devnet/testnet");
        }
        const sig = await this.connection.requestAirdrop(this.config.authority.publicKey, sol * web3_js_1.LAMPORTS_PER_SOL);
        await this.connection.confirmTransaction(sig, "confirmed");
        return sig;
    }
    /**
     * Get the authority public key
     */
    get authority() {
        return this.config.authority.publicKey;
    }
    /**
     * Get cluster info
     */
    get cluster() {
        return this.config.cluster;
    }
}
exports.AgenticCandyMachineSDK = AgenticCandyMachineSDK;
//# sourceMappingURL=client.js.map