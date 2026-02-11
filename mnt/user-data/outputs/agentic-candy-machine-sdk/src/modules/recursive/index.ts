// ═══════════════════════════════════════════════════════════════════════════
//  Recursive Metadata Module — NFT Pointer System
//  Self-referential metadata trees with action-based resolution
//  recurse://<mint>/<depth>/<action>
// ═══════════════════════════════════════════════════════════════════════════

import { PublicKey } from "@solana/web3.js";
import type {
  RecursiveMetadata, RecursivePointer, RecursiveAction,
  ExecutionLink, CompositionLayer, AgentContext, ResolvedTree,
  MetadataFetcher, CapabilityType, PassportTier, Buildable,
} from "../../types/index.js";
import {
  sha256, buildPointerUri, parsePointerUri, contentHash,
  POINTER_PREFIX, SCHEMA_VERSION, SCHEMA_ID, MAX_RECURSION_DEPTH,
  uuid, nowUnix,
} from "../../utils/index.js";

// ─── Action → Capability Mapping ─────────────────────────────────────────

const CAPABILITY_ACTION_MAP: Record<CapabilityType, RecursiveAction> = {
  trade:      "execute",
  social:     "compose",
  payment:    "execute",
  analysis:   "embed",
  mint:       "execute",
  governance: "verify",
  defi:       "execute",
  voice:      "transform",
  custom:     "resolve",
};

// ─── Recursive Metadata Builder ──────────────────────────────────────────

export class RecursiveMetadataBuilder implements Buildable<RecursiveMetadata> {
  private meta: Partial<RecursiveMetadata> = {
    version: SCHEMA_VERSION,
    schema: SCHEMA_ID,
    depth: 0,
    maxDepth: 3,
    childPointers: [],
    executionChain: [],
    compositionLayers: [],
  };

  depth(d: number): this { this.meta.depth = d; return this; }
  maxDepth(d: number): this { this.meta.maxDepth = Math.min(d, MAX_RECURSION_DEPTH); return this; }

  parent(mint: PublicKey, action: RecursiveAction = "resolve"): this {
    this.meta.parentPointer = {
      uri: buildPointerUri(mint, (this.meta.depth || 0) - 1, action),
      mint,
      depth: (this.meta.depth || 0) - 1,
      action,
      weight: 100,
    };
    return this;
  }

  addChild(mint: PublicKey, action: RecursiveAction, weight: number = 100, condition?: string): this {
    const childDepth = (this.meta.depth || 0) + 1;
    this.meta.childPointers = [...(this.meta.childPointers || []), {
      uri: buildPointerUri(mint, childDepth, action),
      mint,
      depth: childDepth,
      action,
      weight,
      condition,
    }];
    return this;
  }

  addExecutionStep(
    pointer: RecursivePointer,
    inputMapping: Record<string, string> = {},
    outputMapping: Record<string, string> = {},
    timeout?: number,
  ): this {
    const step = (this.meta.executionChain || []).length;
    this.meta.executionChain = [...(this.meta.executionChain || []), {
      step,
      pointer,
      inputMapping,
      outputMapping,
      timeout,
    }];
    return this;
  }

  addCompositionLayer(
    pointer: RecursivePointer,
    blendMode: "overlay" | "merge" | "replace" | "append" = "merge",
    opacity: number = 1,
  ): this {
    const order = (this.meta.compositionLayers || []).length;
    this.meta.compositionLayers = [...(this.meta.compositionLayers || []), {
      order,
      pointer,
      blendMode,
      opacity,
    }];
    return this;
  }

  attestation(ref: string): this { this.meta.attestationRef = ref; return this; }

  agentContext(ctx: AgentContext): this { this.meta.agentContext = ctx; return this; }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if ((this.meta.depth || 0) > MAX_RECURSION_DEPTH) {
      errors.push(`Depth ${this.meta.depth} exceeds max ${MAX_RECURSION_DEPTH}`);
    }
    if ((this.meta.maxDepth || 0) > MAX_RECURSION_DEPTH) {
      errors.push(`Max depth ${this.meta.maxDepth} exceeds limit ${MAX_RECURSION_DEPTH}`);
    }
    // Validate no self-referential immediate children
    for (const child of this.meta.childPointers || []) {
      if (this.meta.parentPointer && child.mint.equals(this.meta.parentPointer.mint)) {
        errors.push("Child pointer cannot reference parent (immediate cycle)");
      }
    }
    return { valid: errors.length === 0, errors };
  }

  build(): RecursiveMetadata {
    const v = this.validate();
    if (!v.valid) throw new Error(`Recursive metadata invalid: ${v.errors.join(", ")}`);

    const meta: RecursiveMetadata = {
      version: this.meta.version!,
      schema: this.meta.schema!,
      depth: this.meta.depth!,
      maxDepth: this.meta.maxDepth!,
      selfHash: "", // Computed below
      parentPointer: this.meta.parentPointer,
      childPointers: this.meta.childPointers!,
      executionChain: this.meta.executionChain!,
      compositionLayers: this.meta.compositionLayers!,
      attestationRef: this.meta.attestationRef,
      agentContext: this.meta.agentContext,
    };

    meta.selfHash = computeSelfHash(meta);
    return meta;
  }
}

// ─── Self-Hash Computation ───────────────────────────────────────────────

export function computeSelfHash(meta: RecursiveMetadata): string {
  const hashInput = {
    version: meta.version,
    schema: meta.schema,
    depth: meta.depth,
    maxDepth: meta.maxDepth,
    parentPointer: meta.parentPointer?.uri || null,
    childPointers: meta.childPointers.map(p => p.uri),
    executionChain: meta.executionChain.map(e => ({ step: e.step, pointer: e.pointer.uri })),
    compositionLayers: meta.compositionLayers.map(l => ({ order: l.order, pointer: l.pointer.uri, blendMode: l.blendMode })),
    agentContext: meta.agentContext ? {
      dnaHash: meta.agentContext.dnaHash,
      tier: meta.agentContext.tier,
    } : null,
  };
  return sha256(JSON.stringify(hashInput));
}

// ─── Tree Resolution Engine ──────────────────────────────────────────────

export class RecursiveResolver {
  private fetcher: MetadataFetcher;
  private cache: Map<string, RecursiveMetadata> = new Map();
  private maxConcurrency: number;

  constructor(fetcher: MetadataFetcher, options?: { maxConcurrency?: number }) {
    this.fetcher = fetcher;
    this.maxConcurrency = options?.maxConcurrency || 5;
  }

  /**
   * Resolve the full recursive tree starting from a root mint
   */
  async resolve(rootMint: PublicKey, maxDepth?: number): Promise<ResolvedTree> {
    const visited = new Set<string>();
    return this.resolveNode(rootMint, 0, maxDepth || MAX_RECURSION_DEPTH, visited);
  }

  /**
   * Resolve a single node and its children recursively
   */
  private async resolveNode(
    mint: PublicKey,
    currentDepth: number,
    maxDepth: number,
    visited: Set<string>,
  ): Promise<ResolvedTree> {
    const mintStr = mint.toBase58();

    // Cycle detection
    if (visited.has(mintStr)) {
      return {
        mint,
        metadata: this.createCycleMetadata(mint, currentDepth),
        children: [],
        depth: currentDepth,
        resolvedAt: nowUnix(),
        integrityValid: false,
      };
    }

    visited.add(mintStr);

    // Fetch metadata (check cache first)
    let metadata = this.cache.get(mintStr);
    if (!metadata) {
      metadata = await this.fetcher(mint);
      if (metadata) this.cache.set(mintStr, metadata);
    }

    if (!metadata) {
      return {
        mint,
        metadata: this.createEmptyMetadata(currentDepth),
        children: [],
        depth: currentDepth,
        resolvedAt: nowUnix(),
        integrityValid: false,
      };
    }

    // Verify integrity
    const expectedHash = computeSelfHash(metadata);
    const integrityValid = expectedHash === metadata.selfHash;

    // Depth guard
    if (currentDepth >= maxDepth) {
      return {
        mint, metadata, children: [], depth: currentDepth,
        resolvedAt: nowUnix(), integrityValid,
      };
    }

    // Resolve children
    const children: ResolvedTree[] = [];
    for (const pointer of metadata.childPointers) {
      const child = await this.resolveNode(
        pointer.mint, currentDepth + 1, maxDepth, visited,
      );
      children.push(child);
    }

    return {
      mint, metadata, children, depth: currentDepth,
      resolvedAt: nowUnix(), integrityValid,
    };
  }

  /**
   * Flatten the tree into an ordered list for execution
   */
  flattenTree(tree: ResolvedTree): ResolvedTree[] {
    const result: ResolvedTree[] = [tree];
    for (const child of tree.children) {
      result.push(...this.flattenTree(child));
    }
    return result;
  }

  /**
   * Find a specific node in the tree by mint
   */
  findNode(tree: ResolvedTree, mint: PublicKey): ResolvedTree | null {
    if (tree.mint.equals(mint)) return tree;
    for (const child of tree.children) {
      const found = this.findNode(child, mint);
      if (found) return found;
    }
    return null;
  }

  /**
   * Get the execution chain — ordered pointers with "execute" action
   */
  getExecutionChain(tree: ResolvedTree): RecursivePointer[] {
    const chain: RecursivePointer[] = [];
    const flat = this.flattenTree(tree);
    for (const node of flat) {
      for (const link of node.metadata.executionChain) {
        chain.push(link.pointer);
      }
    }
    return chain;
  }

  /**
   * Get all nodes of a specific action type
   */
  filterByAction(tree: ResolvedTree, action: RecursiveAction): ResolvedTree[] {
    const results: ResolvedTree[] = [];
    const flat = this.flattenTree(tree);
    for (const node of flat) {
      const hasAction = node.metadata.childPointers.some(p => p.action === action)
        || node.metadata.executionChain.some(e => e.pointer.action === action);
      if (hasAction) results.push(node);
    }
    return results;
  }

  /**
   * Verify the entire tree's integrity
   */
  verifyTree(tree: ResolvedTree): { valid: boolean; invalidNodes: PublicKey[] } {
    const invalid: PublicKey[] = [];
    const flat = this.flattenTree(tree);
    for (const node of flat) {
      if (!node.integrityValid) {
        invalid.push(node.mint);
      }
    }
    return { valid: invalid.length === 0, invalidNodes: invalid };
  }

  /**
   * Clear the metadata cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  private createCycleMetadata(mint: PublicKey, depth: number): RecursiveMetadata {
    return {
      version: SCHEMA_VERSION, schema: SCHEMA_ID, depth, maxDepth: depth,
      selfHash: sha256(`cycle:${mint.toBase58()}`),
      childPointers: [], executionChain: [], compositionLayers: [],
    };
  }

  private createEmptyMetadata(depth: number): RecursiveMetadata {
    return {
      version: SCHEMA_VERSION, schema: SCHEMA_ID, depth, maxDepth: depth,
      selfHash: sha256("empty"),
      childPointers: [], executionChain: [], compositionLayers: [],
    };
  }
}

// ─── Passport Tree Builder ───────────────────────────────────────────────

export class PassportTreeBuilder {
  /**
   * Build a full recursive metadata tree for an agentic passport
   * Root passport → capability modules → sub-nodes
   */
  static buildTree(
    rootMint: PublicKey,
    capabilities: { type: CapabilityType; mint: PublicKey }[],
    tier: PassportTier,
    dnaHash: string,
    maxDepth: number = 3,
  ): { root: RecursiveMetadata; children: RecursiveMetadata[] } {
    // Build root
    const rootBuilder = new RecursiveMetadataBuilder()
      .depth(0)
      .maxDepth(maxDepth)
      .agentContext({
        dnaHash,
        tier,
        capabilities: capabilities.map(c => c.type),
        modelTag: "",
        systemPromptHash: "",
      });

    // Add capability children
    for (const cap of capabilities) {
      const action = CAPABILITY_ACTION_MAP[cap.type];
      rootBuilder.addChild(cap.mint, action, CAPABILITY_WEIGHTS[cap.type] || 50);
    }

    // Build execution chain
    const executionCaps = capabilities.filter(c =>
      CAPABILITY_ACTION_MAP[c.type] === "execute"
    );
    for (const cap of executionCaps) {
      const pointer: RecursivePointer = {
        uri: buildPointerUri(cap.mint, 1, "execute"),
        mint: cap.mint,
        depth: 1,
        action: "execute",
        weight: CAPABILITY_WEIGHTS[cap.type] || 50,
      };
      rootBuilder.addExecutionStep(pointer, { trigger: "auto" }, { result: "output" });
    }

    // Build composition layers for visual capabilities
    const compositionCaps = capabilities.filter(c =>
      CAPABILITY_ACTION_MAP[c.type] === "compose"
    );
    for (const cap of compositionCaps) {
      const pointer: RecursivePointer = {
        uri: buildPointerUri(cap.mint, 1, "compose"),
        mint: cap.mint,
        depth: 1,
        action: "compose",
        weight: CAPABILITY_WEIGHTS[cap.type] || 50,
      };
      rootBuilder.addCompositionLayer(pointer, "merge", 0.8);
    }

    const root = rootBuilder.build();

    // Build child metadata
    const children: RecursiveMetadata[] = [];
    for (const cap of capabilities) {
      const childBuilder = new RecursiveMetadataBuilder()
        .depth(1)
        .maxDepth(maxDepth)
        .parent(rootMint, "resolve")
        .agentContext({
          dnaHash,
          tier,
          capabilities: [cap.type],
          modelTag: "",
          systemPromptHash: "",
        });

      children.push(childBuilder.build());
    }

    return { root, children };
  }

  /**
   * Serialize the recursive metadata into the NFT metadata format
   */
  static serializeForNFT(meta: RecursiveMetadata): object {
    return {
      recursive: {
        version: meta.version,
        schema: meta.schema,
        depth: meta.depth,
        maxDepth: meta.maxDepth,
        selfHash: meta.selfHash,
        parentPointer: meta.parentPointer ? meta.parentPointer.uri : null,
        childPointers: meta.childPointers.map(p => ({
          uri: p.uri,
          action: p.action,
          weight: p.weight,
          condition: p.condition,
        })),
        executionChain: meta.executionChain.map(e => ({
          step: e.step,
          uri: e.pointer.uri,
          inputMapping: e.inputMapping,
          outputMapping: e.outputMapping,
          timeout: e.timeout,
        })),
        compositionLayers: meta.compositionLayers.map(l => ({
          order: l.order,
          uri: l.pointer.uri,
          blendMode: l.blendMode,
          opacity: l.opacity,
        })),
        attestationRef: meta.attestationRef,
        agent: meta.agentContext,
      },
    };
  }

  /**
   * Deserialize recursive metadata from NFT metadata JSON
   */
  static deserializeFromNFT(json: any): RecursiveMetadata | null {
    const r = json?.recursive;
    if (!r) return null;

    try {
      const meta: RecursiveMetadata = {
        version: r.version || SCHEMA_VERSION,
        schema: r.schema || SCHEMA_ID,
        depth: r.depth || 0,
        maxDepth: r.maxDepth || MAX_RECURSION_DEPTH,
        selfHash: r.selfHash || "",
        parentPointer: r.parentPointer ? parsePointerUri(r.parentPointer) || undefined : undefined,
        childPointers: (r.childPointers || []).map((p: any) => parsePointerUri(p.uri)).filter(Boolean) as RecursivePointer[],
        executionChain: (r.executionChain || []).map((e: any) => ({
          step: e.step,
          pointer: parsePointerUri(e.uri)!,
          inputMapping: e.inputMapping || {},
          outputMapping: e.outputMapping || {},
          timeout: e.timeout,
        })).filter((e: any) => e.pointer),
        compositionLayers: (r.compositionLayers || []).map((l: any) => ({
          order: l.order,
          pointer: parsePointerUri(l.uri)!,
          blendMode: l.blendMode || "merge",
          opacity: l.opacity ?? 1,
        })).filter((l: any) => l.pointer),
        attestationRef: r.attestationRef,
        agentContext: r.agent,
      };
      return meta;
    } catch {
      return null;
    }
  }
}

// ─── Weight Constants ────────────────────────────────────────────────────

const CAPABILITY_WEIGHTS: Record<CapabilityType, number> = {
  trade: 90, social: 60, payment: 80, analysis: 70,
  mint: 85, governance: 50, defi: 95, voice: 40, custom: 30,
};

// ─── Hidden Settings Hash ────────────────────────────────────────────────

export function computeHiddenSettingsHash(configLines: { name: string; uri: string }[]): Uint8Array {
  const data = configLines.map(l => `${l.name}:${l.uri}`).join("|");
  return new Uint8Array(Buffer.from(sha256(data), "hex"));
}

// ─── Exports ─────────────────────────────────────────────────────────────

export { CAPABILITY_ACTION_MAP };
