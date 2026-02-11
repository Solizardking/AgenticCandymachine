import { Keypair } from "@solana/web3.js";
import { sha256, buildPointerUri } from "../../utils/index.js";
export class PassportFactory {
    config;
    constructor(config) {
        this.config = config;
    }
    buildBundle(dna, art, token) {
        // 1. Generate Root Mint (mock)
        const rootMint = Keypair.generate().publicKey;
        const rootNFT = {
            name: dna.name,
            symbol: this.config.symbol,
            mint: rootMint,
            metadata: {
                name: dna.name,
                symbol: this.config.symbol,
                description: dna.bio,
                image: art?.uri || "https://arweave.net/placeholder.png",
                attributes: [
                    { trait_type: "Tier", value: dna.tier },
                    { trait_type: "Personality", value: dna.personality },
                    { trait_type: "Model", value: dna.model?.id || "unknown" },
                ],
                properties: {
                    token_mint: token?.mint.toBase58(),
                    dna_hash: dna.dnaHash,
                },
            },
        };
        // 2. Generate Capability NFTs (recursive children)
        const capabilities = [];
        const childrenPointers = []; // Metadata pointers
        for (const cap of dna.capabilities) {
            const capMint = Keypair.generate().publicKey;
            const capNFT = {
                name: `${cap.name} - ${dna.name}`,
                mint: capMint,
                metadata: {
                    name: cap.name || cap.type,
                    symbol: "CAP",
                    description: `Capability module for ${dna.name}`,
                    image: art?.uri || "", // Ideally unique icon
                    attributes: [
                        { trait_type: "Type", value: cap.type },
                        { trait_type: "Version", value: cap.version || "1.0.0" },
                    ],
                    properties: {
                        config: cap.config,
                        parent: rootMint.toBase58(),
                    },
                },
            };
            capabilities.push(capNFT);
            childrenPointers.push({
                mint: capMint,
                depth: 1,
                action: cap.action || "execute",
                weight: cap.weight || 50,
                uri: buildPointerUri(capMint, 1, cap.action || "execute"),
            });
        }
        // 3. Construct Recursive Tree Metadata
        const tree = {
            name: `${dna.name} Tree`,
            depth: 0,
            agentContext: {
                dnaHash: dna.dnaHash || sha256(dna.name),
                tier: dna.tier,
                capabilities: dna.capabilities.map(c => c.type),
            },
            children: childrenPointers,
        };
        // 4. Estimate Cost
        // Mock cost: 0.012 per NFT + some overhead
        const estimatedCost = 0.02 + ((capabilities.length + 1) * 0.012);
        return {
            root: rootNFT,
            capabilities,
            tree,
            estimatedCost,
            attestations: [],
        };
    }
}
//# sourceMappingURL=index.js.map