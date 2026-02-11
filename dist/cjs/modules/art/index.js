"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtPipeline = exports.PROMPT_TEMPLATES = void 0;
const index_js_1 = require("../../utils/index.js");
// ─── Templates ───────────────────────────────────────────────────────────────
exports.PROMPT_TEMPLATES = {
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
class ArtPipeline {
    config;
    providers = {};
    constructor(config) {
        this.config = config;
        this.registerDefaults();
    }
    registerDefaults() {
        this.registerProvider("google", async (prompt, config) => {
            // Mock Google Imagen call
            await (0, index_js_1.sleep)(500);
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
            await (0, index_js_1.sleep)(800);
            return {
                imageData: Buffer.from("mock-image-data-mj"),
                contentType: "image/png",
                contentHash: "hash-mj",
                provider: "midjourney",
                metadata: { prompt, model: "v6" },
            };
        });
    }
    registerProvider(name, handler) {
        this.providers[name] = handler;
    }
    async generate(config, dna) {
        const provider = this.providers[config.provider];
        if (!provider) {
            throw new Error(`Art provider '${config.provider}' not registered`);
        }
        const template = exports.PROMPT_TEMPLATES[config.style] || exports.PROMPT_TEMPLATES.passport;
        const prompt = this.fillTemplate(template, dna, config.prompt);
        const artifact = await provider(prompt, config);
        // Compute deterministic hash of the content
        artifact.contentHash = (0, index_js_1.contentHash)({
            prompt,
            provider: config.provider,
            style: config.style,
            timestamp: Date.now(),
        });
        return artifact;
    }
    fillTemplate(template, dna, extraPrompt = "") {
        let result = template.template;
        result = result.replace("{{name}}", dna.name);
        result = result.replace("{{handle}}", dna.handle);
        result = result.replace("{{bio}}", dna.bio);
        result = result.replace("{{personality}}", dna.personality);
        result = result.replace("{{style}}", dna.tier); // using tier as style hint
        result = result.replace("{{capabilities}}", dna.capabilities.map(c => c.name).join(", "));
        if (extraPrompt) {
            result += ` ${extraPrompt}`;
        }
        return result;
    }
    async generatePassportSet(dna, config) {
        const main = await this.generate({ style: "passport", provider: config.provider }, dna);
        const capabilities = [];
        for (const cap of dna.capabilities) {
            const capArt = await this.generate({
                style: "minimalist",
                provider: config.provider,
                prompt: `Icon for capability: ${cap.name}`,
            }, dna);
            capabilities.push(capArt);
        }
        return { main, capabilities };
    }
}
exports.ArtPipeline = ArtPipeline;
//# sourceMappingURL=index.js.map