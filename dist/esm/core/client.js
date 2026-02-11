// ═══════════════════════════════════════════════════════════════════════════
//  Core Client — AgenticCandyMachine SDK
//  Orchestrates all modules into a unified pipeline
// ═══════════════════════════════════════════════════════════════════════════
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { EventEmitter } from "eventemitter3";
import { getConnection, lamportsToSol } from "../utils/index.js";
import { DNABuilder, DNAEncoder } from "../modules/dna/index.js";
import { ArtPipeline } from "../modules/art/index.js";
import { TokenBuilder, TokenDeployer } from "../modules/token/index.js";
import { CandyMachineBuilder, CandyMachineClient, GuardBuilder } from "../modules/candy-machine/index.js";
import { RecursiveMetadataBuilder, RecursiveResolver } from "../modules/recursive/index.js";
import { PassportFactory } from "../modules/passport/index.js";
import { AttestationService, TEETerminal } from "../modules/attestation/index.js";
// ─── SDK Client ──────────────────────────────────────────────────────────
export class AgenticCandyMachineSDK extends EventEmitter {
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
    static DNABuilder = DNABuilder;
    static DNAEncoder = DNAEncoder;
    static TokenBuilder = TokenBuilder;
    static CandyMachineBuilder = CandyMachineBuilder;
    static GuardBuilder = GuardBuilder;
    static RecursiveMetadataBuilder = RecursiveMetadataBuilder;
    constructor(config) {
        super();
        this.config = config;
        this.connection = getConnection(config.cluster, config.rpcEndpoint);
        // Initialize modules
        this.dna = DNABuilder;
        this.art = new ArtPipeline({
            googleApiKey: config.googleApiKey,
            nanoBananaApiKey: config.nanoBananaApiKey,
        });
        this.token = new TokenDeployer(this.connection, config.authority);
        this.candyMachine = new CandyMachineClient(this.connection, config.authority);
        this.passport = new PassportFactory({
            authority: config.authority.publicKey,
            symbol: "AGNT",
            sellerFeeBps: 500,
        });
        this.attestation = new AttestationService(this.connection, config.authority, {
            enclaveKey: config.redpillApiKey || "dev-enclave",
            submitOnChain: config.cluster === "mainnet-beta",
            hmacFallback: !config.redpillApiKey,
        });
        this.tee = config.redpillApiKey
            ? new TEETerminal(config.redpillApiKey, this.attestation, {
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
            const encoding = DNAEncoder.encode(dna);
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
        const builder = new DNABuilder()
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
        return new RecursiveResolver(fetcher);
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
        return { lamports, sol: lamportsToSol(lamports) };
    }
    /**
     * Request airdrop (devnet only)
     */
    async airdrop(sol = 2) {
        if (this.config.cluster !== "devnet" && this.config.cluster !== "testnet") {
            throw new Error("Airdrop only available on devnet/testnet");
        }
        const sig = await this.connection.requestAirdrop(this.config.authority.publicKey, sol * LAMPORTS_PER_SOL);
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
//# sourceMappingURL=client.js.map