
import { ArtConfig, ArtArtifact, AgentDNA, ArtPromptTemplate, SdkConfig } from "../../types/index.js";
import { contentHash, sleep } from "../../utils/index.js";

// ─── Templates ───────────────────────────────────────────────────────────────

export const PROMPT_TEMPLATES: Record<string, ArtPromptTemplate> = {
    passport: {
        template: `A futuristic identity passport for an AI agent named {{name}}. 
    Style: {{style}}. 
    Personality: {{personality}}. 
    Capabilities: {{capabilities}}. 
    High resolution, 8k, digital art.`,
        variables: ["name", "style", "personality", "capabilities"],
    },
    cyberpunk: {
        template: `Cyberpunk character portrait of {{name}}, neon lights, rain, high tech.
    Bio: {{bio}}.`,
        variables: ["name", "bio"],
    },
};

// ─── Pipeline ────────────────────────────────────────────────────────────────

export class ArtPipeline {
    private config: { googleApiKey?: string; nanoBananaApiKey?: string };
    private providers: Record<string, (prompt: string, config: any) => Promise<ArtArtifact>> = {};

    constructor(config: { googleApiKey?: string; nanoBananaApiKey?: string }) {
        this.config = config;
        this.registerDefaults();
    }

    private registerDefaults() {
        this.registerProvider("google", async (prompt, config) => {
            // Mock Google Imagen call
            await sleep(500);
            return {
                imageData: Buffer.from("mock-image-data-google"),
                contentType: "image/png",
                contentHash: "hash-google",
                provider: "google",
                metadata: { prompt, model: "imagen-3" },
            };
        });

        this.registerProvider("midjourney", async (prompt, config) => {
            // Mock Midjourney call
            await sleep(800);
            return {
                imageData: Buffer.from("mock-image-data-mj"),
                contentType: "image/png",
                contentHash: "hash-mj",
                provider: "midjourney",
                metadata: { prompt, model: "v6" },
            };
        });
    }

    registerProvider(name: string, handler: (prompt: string, config: any) => Promise<ArtArtifact>) {
        this.providers[name] = handler;
    }

    async generate(config: ArtConfig, dna: AgentDNA): Promise<ArtArtifact> {
        const provider = this.providers[config.provider];
        if (!provider) {
            throw new Error(`Art provider '${config.provider}' not registered`);
        }

        const template = PROMPT_TEMPLATES[config.style] || PROMPT_TEMPLATES.passport;
        const prompt = this.fillTemplate(template, dna, config.prompt);

        const artifact = await provider(prompt, config);

        // Compute deterministic hash of the content
        artifact.contentHash = contentHash({
            prompt,
            provider: config.provider,
            style: config.style,
            timestamp: Date.now(),
        });

        return artifact;
    }

    private fillTemplate(template: ArtPromptTemplate, dna: AgentDNA, extraPrompt = ""): string {
        let result = template.template;
        result = result.replace("{{name}}", dna.name);
        result = result.replace("{{handle}}", dna.handle);
        result = result.replace("{{bio}}", dna.bio);
        result = result.replace("{{personality}}", dna.personality);
        result = result.replace("{{style}}", dna.tier); // using tier as style hint
        result = result.replace(
            "{{capabilities}}",
            dna.capabilities.map(c => c.name).join(", ")
        );

        if (extraPrompt) {
            result += ` ${extraPrompt}`;
        }
        return result;
    }

    async generatePassportSet(dna: AgentDNA, config: { provider: string }): Promise<{ main: ArtArtifact, capabilities: ArtArtifact[] }> {
        const main = await this.generate({ style: "passport", provider: config.provider as any }, dna);
        const capabilities = [];

        for (const cap of dna.capabilities) {
            const capArt = await this.generate({
                style: "minimalist",
                provider: config.provider as any,
                prompt: `Icon for capability: ${cap.name}`,
            }, dna);
            capabilities.push(capArt);
        }

        return { main, capabilities };
    }
}
