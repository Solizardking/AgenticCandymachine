
import { AgenticCandyMachineSDK, DNABuilder } from "./src/index.js";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

async function main() {
    console.log("🚀 Starting Agentic Candy Machine SDK Demo...");

    // Initialize
    const sdk = new AgenticCandyMachineSDK({
        cluster: "devnet",
        authority: Keypair.generate(),
        redpillApiKey: "test-redpill-key",
        googleApiKey: "test-google-key",
    });

    console.log("✅ SDK Initialized with authority:", sdk.authority.toBase58());

    // Full pipeline — 
    try {
        const result = await sdk.pipeline({
            dna: {
                name: "TerminAgent",
                handle: "terminagent",
                bio: "Autonomous DeFi hunter on Solana",
                personality: "Aggressive alpha seeker with data-driven precision",
                tier: "OPERATOR",
                capabilities: [
                    { type: "trade", name: "Trade Module", version: "1.0.0", config: {}, action: "execute", weight: 90 },
                    { type: "analysis", name: "Analytics Module", version: "1.0.0", config: {}, action: "embed", weight: 70 },
                    { type: "social", name: "Social Module", version: "1.0.0", config: {}, action: "compose", weight: 60 },
                ],
            },
            art: { style: "passport", provider: "google" },
            token: {
                name: "TerminAgent Token",
                symbol: "TAGNT",
                decimals: 9,
                initialSupply: BigInt(1_000_000),
                mintAuthority: true,
                freezeAuthority: false,
                metadata: { name: "TerminAgent Token", symbol: "TAGNT", uri: "" },
            },
            candyMachine: new (sdk.constructor as any).CandyMachineBuilder()
                .items(1000)
                .symbol("TAGNT")
                .sellerFee(500)
                // .standard("ProgrammableNonFungible") // Optional, defaults used
                .addCreator(sdk.authority, 100)
                .configLines({
                    prefixName: "TerminAgent #",
                    nameLength: 4,
                    prefixUri: "https://arweave.net/",
                    uriLength: 43,
                    isSequential: false,
                })
                .defaultGuards(new (sdk.constructor as any).GuardBuilder()
                    .solPayment(0.1 * LAMPORTS_PER_SOL, sdk.authority)
                    .build()
                )
                .build(),
            options: { dryRun: false }, // Run mocked deployment
        });

        console.log("✨ Pipeline Completed!");
        console.log("---------------------------------------------------");
        console.log("Passports Bundle:", result.passport.root.name);
        console.log("Root Mint:", result.passport.root.mint?.toBase58());
        console.log("Capabilities:", result.passport.capabilities.length);
        console.log("---------------------------------------------------");
        console.log("Candy Machine:", result.candyMachine?.candyMachine.toBase58());
        console.log("Items Loaded:", result.candyMachine?.itemsLoaded);
        console.log("---------------------------------------------------");
        console.log("Token Mint:", result.token?.mint.toBase58());
        console.log("---------------------------------------------------");
        console.log("Attestations:", result.attestations.length);
        result.attestations.forEach(att => {
            console.log(` - [${att.type}] ${att.id} (Hash: ${att.dataHash.substring(0, 10)}...)`);
        });
        console.log("---------------------------------------------------");
        console.log("Total Cost Estimate:", result.cost, "SOL");
        console.log("Duration:", result.duration, "ms");

    } catch (error) {
        console.error("❌ Pipeline Failed:", error);
    }
}

main().catch(console.error);
