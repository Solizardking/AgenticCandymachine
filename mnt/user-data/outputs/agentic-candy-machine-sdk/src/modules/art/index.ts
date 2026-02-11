// ═══════════════════════════════════════════════════════════════════════════
//  Art Module — Image Generation Pipeline
//  Multi-provider art generation with TEE attestation
// ═══════════════════════════════════════════════════════════════════════════

import type {
  ArtConfig, ArtArtifact, ArtProvider, ArtStyle, ArtPromptTemplate,
  PassportTier, AgentDNA, AttestationRecord,
} from "../../types/index.js";
import { sha256, deterministicSeed, uuid, nowUnix, contentHash } from "../../utils/index.js";

// ─── Prompt Templates ────────────────────────────────────────────────────

const PROMPT_TEMPLATES: Record<ArtStyle, ArtPromptTemplate> = {
  passport: {
    style: "passport",
    basePrompt: "Holographic digital passport card with embedded circuitry, biometric scan lines, prismatic light refraction, quantum interference patterns, ultra-detailed technical illustration",
    tierModifiers: {
      OBSERVER: "monochrome silver tones, subtle scanlines, minimal",
      AGENT:    "deep purple energy core (#9945FF), flowing data streams, electric",
      OPERATOR: "emerald green neural pathways (#14F195), organic circuitry, bio-digital",
      SOVEREIGN:"golden sovereign crown motif (#FFD700), maximum detail, regal authority",
    },
    negativePrompt: "blurry, low quality, text, watermark, signature",
  },
  circuit: {
    style: "circuit",
    basePrompt: "Sacred geometry mandala composed of circuit board traces, silicon pathways forming fractal patterns, glowing nodes at intersections, PCB zen garden",
    tierModifiers: {
      OBSERVER: "dimmed traces, dormant nodes, grayscale",
      AGENT:    "purple voltage arcs between nodes, active signal paths",
      OPERATOR: "green bio-luminescent traces, living circuit, breathing",
      SOVEREIGN:"gold-plated traces, diamond intersections, supreme network",
    },
  },
  abstract: {
    style: "abstract",
    basePrompt: "Recursive fractal art, self-similar patterns zooming infinitely inward, mathematical beauty, Mandelbrot-inspired with digital glitch artifacts",
    tierModifiers: {
      OBSERVER: "low-iteration fractal, simple patterns",
      AGENT:    "purple fractal tendrils, medium complexity recursive depth",
      OPERATOR: "green bio-fractal, high complexity, organic recursion",
      SOVEREIGN:"gold-infused infinite fractal, maximum depth, transcendent",
    },
  },
  avatar: {
    style: "avatar",
    basePrompt: "Neural network generated portrait of an AI entity, digital consciousness visualization, abstract face formed by data streams and particle clouds",
    tierModifiers: {
      OBSERVER: "faint ghostly outline, barely formed, transparent",
      AGENT:    "purple aura, crystallizing features, semi-corporeal",
      OPERATOR: "green bio-luminescent skin, fully formed, powerful presence",
      SOVEREIGN:"golden halo, supreme being, reality-bending presence",
    },
  },
  glitch: {
    style: "glitch",
    basePrompt: "Digital glitch art, corrupted data visualization, scan line artifacts, RGB channel splitting, VHS distortion, retro-futuristic data corruption",
    tierModifiers: {
      OBSERVER: "subtle static, minor artifacts",
      AGENT:    "purple glitch bands, moderate corruption, aesthetic",
      OPERATOR: "green matrix rain glitch, heavy distortion, intentional",
      SOVEREIGN:"golden data explosion, maximum glitch, beautiful chaos",
    },
  },
  cosmic: {
    style: "cosmic",
    basePrompt: "Cosmic genesis scene, nebula formation from pure data, digital big bang, blockchain universe creation, stars formed from transaction hashes",
    tierModifiers: {
      OBSERVER: "distant stars, cold void, minimal cosmic dust",
      AGENT:    "purple nebula forming, stellar nursery, emerging energy",
      OPERATOR: "green supernova, peak stellar evolution, massive power",
      SOVEREIGN:"golden singularity, universe-creating event, infinite power",
    },
  },
};

// ─── Art Pipeline ────────────────────────────────────────────────────────

export class ArtPipeline {
  private googleApiKey?: string;
  private nanoBananaApiKey?: string;
  private customProviders: Map<string, (prompt: string, config: ArtConfig) => Promise<ArtArtifact>> = new Map();

  constructor(config: {
    googleApiKey?: string;
    nanoBananaApiKey?: string;
  }) {
    this.googleApiKey = config.googleApiKey;
    this.nanoBananaApiKey = config.nanoBananaApiKey;
  }

  /**
   * Register a custom art provider
   */
  registerProvider(name: string, handler: (prompt: string, config: ArtConfig) => Promise<ArtArtifact>): void {
    this.customProviders.set(name, handler);
  }

  /**
   * Build the full prompt from style + tier + custom additions
   */
  buildPrompt(style: ArtStyle, tier: PassportTier, customPrompt?: string): string {
    const template = PROMPT_TEMPLATES[style];
    const parts: string[] = [template.basePrompt];

    if (template.tierModifiers[tier]) {
      parts.push(template.tierModifiers[tier]);
    }

    if (customPrompt) {
      parts.push(customPrompt);
    }

    return parts.join(", ");
  }

  /**
   * Generate art through the configured provider pipeline
   */
  async generate(config: ArtConfig, dna?: AgentDNA): Promise<ArtArtifact> {
    const tier = dna?.tier || "AGENT";
    const prompt = this.buildPrompt(config.style, tier, config.prompt);
    const seed = config.seed ?? deterministicSeed(dna?.dnaHash || prompt);

    // Try custom provider first
    if (config.provider === "custom" && config.customProvider) {
      return config.customProvider.generate(prompt, config);
    }

    // Try Google Imagen
    if ((config.provider === "google" || !config.provider) && this.googleApiKey) {
      try {
        return await this.generateGoogle(prompt, config, seed);
      } catch (e) {
        if (config.provider === "google") throw e;
        // Fall through to next provider
      }
    }

    // Try Nano Banana
    if ((config.provider === "nanobanan" || !config.provider) && this.nanoBananaApiKey) {
      try {
        return await this.generateNanoBanana(prompt, config, seed);
      } catch (e) {
        if (config.provider === "nanobanan") throw e;
      }
    }

    // Check custom providers
    for (const [name, handler] of this.customProviders) {
      try {
        return await handler(prompt, config);
      } catch {
        continue;
      }
    }

    throw new Error("No art provider available. Configure googleApiKey, nanoBananaApiKey, or register a custom provider.");
  }

  /**
   * Generate a full passport art set (main + capability icons)
   */
  async generatePassportSet(dna: AgentDNA, config: Partial<ArtConfig> = {}): Promise<{
    main: ArtArtifact;
    capabilities: Map<string, ArtArtifact>;
  }> {
    const mainConfig: ArtConfig = {
      style: "passport",
      provider: config.provider || "google",
      ...config,
    };

    const main = await this.generate(mainConfig, dna);

    const capabilities = new Map<string, ArtArtifact>();
    for (const cap of dna.capabilities) {
      const capConfig: ArtConfig = {
        style: cap.type === "trade" ? "circuit" : cap.type === "analysis" ? "abstract" : "glitch",
        provider: config.provider || "google",
        prompt: `Capability module icon for ${cap.type}: ${cap.name}`,
        width: 512,
        height: 512,
        ...config,
      };
      const capArt = await this.generate(capConfig, dna);
      capabilities.set(cap.type, capArt);
    }

    return { main, capabilities };
  }

  /**
   * Generate recursive art — each layer references parent hash
   */
  async generateRecursiveArt(dna: AgentDNA, depth: number, parentHash?: string): Promise<ArtArtifact> {
    const recursivePrompt = parentHash
      ? `Recursive depth ${depth}, derived from parent hash ${parentHash.slice(0, 16)}, self-similar to parent but evolved`
      : `Root recursive art, depth 0, origin point`;

    return this.generate({
      style: "abstract",
      provider: "google",
      prompt: recursivePrompt,
      seed: deterministicSeed((parentHash || dna.dnaHash) + depth.toString()),
    }, dna);
  }

  // ─── Provider Implementations ──────────────────────────────────────

  private async generateGoogle(prompt: string, config: ArtConfig, seed: number): Promise<ArtArtifact> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.googleApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate an image: ${prompt}` }],
          }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            temperature: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData?.mimeType?.startsWith("image/")
    );

    if (!imagePart?.inlineData) {
      throw new Error("No image data in Google response");
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    return this.createArtifact(imageBuffer, imagePart.inlineData.mimeType, prompt, "google", config);
  }

  private async generateNanoBanana(prompt: string, config: ArtConfig, seed: number): Promise<ArtArtifact> {
    const response = await fetch("https://api.nanobanan.com/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.nanoBananaApiKey}`,
      },
      body: JSON.stringify({
        prompt,
        width: config.width || 1024,
        height: config.height || 1024,
        seed,
      }),
    });

    if (!response.ok) {
      throw new Error(`Nano Banana API error: ${response.status}`);
    }

    const data = await response.json();
    const imageBuffer = Buffer.from(data.image, "base64");
    return this.createArtifact(imageBuffer, "image/png", prompt, "nanobanan", config);
  }

  private createArtifact(
    imageData: Buffer,
    contentType: string,
    prompt: string,
    provider: ArtProvider,
    config: ArtConfig,
  ): ArtArtifact {
    return {
      id: uuid(),
      imageData,
      contentType,
      width: config.width || 1024,
      height: config.height || 1024,
      prompt,
      provider,
      style: config.style,
      contentHash: contentHash(imageData),
      metadata: {
        generatedAt: nowUnix(),
        style: config.style,
        provider,
      },
    };
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────

export { PROMPT_TEMPLATES };
