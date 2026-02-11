import { AgentDNA, CapabilityType, DNAEncoding, PassportTier } from "../../types/index.js";
export declare const CAPABILITY_ACTIONS: Record<CapabilityType, string>;
export declare const CAPABILITY_WEIGHTS: Record<CapabilityType, number>;
export declare class DNABuilder {
    private _dna;
    name(name: string): this;
    handle(handle: string): this;
    bio(bio: string): this;
    personality(personality: string): this;
    tier(tier: PassportTier): this;
    lore(lore: string): this;
    systemPrompt(prompt: string): this;
    model(config: any): this;
    addCapability(type: CapabilityType, config?: Record<string, any>, version?: string): this;
    build(): AgentDNA;
}
export declare class DNAEncoder {
    static encode(dna: AgentDNA): DNAEncoding;
    static verify(encoding: DNAEncoding): boolean;
    static diffDNA(dnaA: AgentDNA, dnaB: AgentDNA): string[];
}
export declare function diffDNA(dnaA: AgentDNA, dnaB: AgentDNA): string[];
