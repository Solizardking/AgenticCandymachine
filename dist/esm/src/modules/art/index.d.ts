import { ArtConfig, ArtArtifact, AgentDNA, ArtPromptTemplate } from "../../types/index.js";
export declare const PROMPT_TEMPLATES: Record<string, ArtPromptTemplate>;
export declare class ArtPipeline {
    private config;
    private providers;
    constructor(config: {
        googleApiKey?: string;
        nanoBananaApiKey?: string;
    });
    private registerDefaults;
    registerProvider(name: string, handler: (prompt: string, config: any) => Promise<ArtArtifact>): void;
    generate(config: ArtConfig, dna: AgentDNA): Promise<ArtArtifact>;
    private fillTemplate;
    generatePassportSet(dna: AgentDNA, config: {
        provider: string;
    }): Promise<{
        main: ArtArtifact;
        capabilities: ArtArtifact[];
    }>;
}
