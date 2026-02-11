// ═══════════════════════════════════════════════════════════════════════════
//  Attestation Module — TEE Attestation Service
//  Merkle tree proofs, Ed25519 signatures, on-chain submission via Memo
// ═══════════════════════════════════════════════════════════════════════════

import {
  PublicKey, Keypair, Connection, Transaction, LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { sign } from "tweetnacl";
import type {
  AttestationRecord, AttestationConfig, AttestationVerification,
  MerkleTree, TEERequest, TEEResponse, TEEMessage,
  EmbeddingRequest, EmbeddingResponse, SdkConfig,
} from "../../types/index.js";
import {
  sha256, sha384, hmacSha256, contentHash,
  buildMerkleTree, getMerklePath, verifyMerklePath,
  createMemoInstruction, sendAndConfirm, uuid, nowUnix,
} from "../../utils/index.js";

// ─── Attestation Service ─────────────────────────────────────────────────

export class AttestationService {
  private enclaveKey: string;
  private authority: Keypair;
  private connection: Connection;
  private submitOnChain: boolean;
  private hmacFallback: boolean;

  private merkleTree: MerkleTree;
  private records: AttestationRecord[] = [];

  constructor(
    connection: Connection,
    authority: Keypair,
    config: AttestationConfig,
  ) {
    this.connection = connection;
    this.authority = authority;
    this.enclaveKey = config.enclaveKey;
    this.submitOnChain = config.submitOnChain;
    this.hmacFallback = config.hmacFallback;
    this.merkleTree = buildMerkleTree([]);
  }

  /**
   * Create an attestation record for any action
   */
  async attest(action: string, input: unknown, output: unknown, modelTag: string = "pipeline"): Promise<AttestationRecord> {
    const inputHash = contentHash(input);
    const outputHash = contentHash(output);
    const timestamp = nowUnix();
    const enclaveId = sha256(this.enclaveKey).slice(0, 16);
    const measurement = sha384(JSON.stringify({ action, inputHash, outputHash, timestamp }));

    // Add to Merkle tree
    const leafData = `${inputHash}:${outputHash}:${timestamp}`;
    const merkleLeaf = sha256(leafData);
    this.merkleTree = buildMerkleTree([...this.merkleTree.leaves, merkleLeaf]);
    const leafIndex = this.merkleTree.leaves.length - 1;
    const merklePath = getMerklePath(this.merkleTree, leafIndex);

    // Sign
    let signature: string;
    if (this.hmacFallback) {
      signature = hmacSha256(`${merkleLeaf}:${this.merkleTree.root}`, this.enclaveKey);
    } else {
      const message = Buffer.from(`${merkleLeaf}:${this.merkleTree.root}`);
      const sig = sign.detached(message, this.authority.secretKey);
      signature = Buffer.from(sig).toString("hex");
    }

    const record: AttestationRecord = {
      id: uuid(),
      action,
      inputHash,
      outputHash,
      modelTag,
      timestamp,
      enclaveId,
      measurement,
      signature,
      merkleLeaf,
      merkleRoot: this.merkleTree.root,
      merklePath,
    };

    // Optionally submit on-chain
    if (this.submitOnChain) {
      try {
        const onChain = await this.submitToChain(record);
        record.onChain = onChain;
      } catch (e) {
        // Non-fatal: record exists off-chain
        console.warn("Failed to submit attestation on-chain:", e);
      }
    }

    this.records.push(record);
    return record;
  }

  /**
   * Submit attestation to Solana via Memo program
   */
  private async submitToChain(record: AttestationRecord): Promise<{ signature: string; slot: number }> {
    const memoData = JSON.stringify({
      type: "agentic-attestation",
      id: record.id,
      action: record.action,
      inputHash: record.inputHash.slice(0, 16),
      outputHash: record.outputHash.slice(0, 16),
      merkleRoot: record.merkleRoot.slice(0, 16),
      timestamp: record.timestamp,
    });

    const tx = new Transaction().add(
      createMemoInstruction(memoData, this.authority.publicKey),
    );

    tx.feePayer = this.authority.publicKey;
    tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    const sig = await sendAndConfirm(this.connection, tx, [this.authority]);
    const slot = (await this.connection.getTransaction(sig))?.slot || 0;

    return { signature: sig, slot };
  }

  /**
   * Verify an attestation record
   */
  verify(record: AttestationRecord): AttestationVerification {
    // Verify Merkle path
    const merkleValid = verifyMerklePath(
      record.merkleLeaf,
      record.merklePath,
      record.merkleRoot,
    );

    // Verify signature
    let signatureValid = false;
    if (this.hmacFallback) {
      const expected = hmacSha256(
        `${record.merkleLeaf}:${record.merkleRoot}`,
        this.enclaveKey,
      );
      signatureValid = expected === record.signature;
    } else {
      try {
        const message = Buffer.from(`${record.merkleLeaf}:${record.merkleRoot}`);
        const sig = Buffer.from(record.signature, "hex");
        signatureValid = sign.detached.verify(
          message,
          new Uint8Array(sig),
          this.authority.publicKey.toBytes(),
        );
      } catch {
        signatureValid = false;
      }
    }

    // Verify integrity
    const leafData = `${record.inputHash}:${record.outputHash}:${record.timestamp}`;
    const expectedLeaf = sha256(leafData);
    const integrityValid = expectedLeaf === record.merkleLeaf;

    return {
      valid: merkleValid && signatureValid && integrityValid,
      signatureValid,
      merkleValid,
      integrityValid,
      timestamp: record.timestamp,
      details: [
        `Signature: ${signatureValid ? "✓" : "✗"}`,
        `Merkle: ${merkleValid ? "✓" : "✗"}`,
        `Integrity: ${integrityValid ? "✓" : "✗"}`,
      ].join(" | "),
    };
  }

  /**
   * Get all attestation records
   */
  getRecords(): AttestationRecord[] {
    return [...this.records];
  }

  /**
   * Get the current Merkle tree
   */
  getMerkleTree(): MerkleTree {
    return this.merkleTree;
  }

  /**
   * Get a specific record by ID
   */
  getRecord(id: string): AttestationRecord | undefined {
    return this.records.find(r => r.id === id);
  }
}

// ─── TEE Terminal ────────────────────────────────────────────────────────

export class TEETerminal {
  private apiKey: string;
  private baseUrl: string;
  private attestationService: AttestationService;
  private models: Record<string, string>;

  constructor(
    apiKey: string,
    attestationService: AttestationService,
    config?: {
      baseUrl?: string;
      models?: Record<string, string>;
    },
  ) {
    this.apiKey = apiKey;
    this.baseUrl = config?.baseUrl || "https://api.red-pill.ai/v1";
    this.attestationService = attestationService;
    this.models = config?.models || {
      chat: "z-ai/glm-4.7-flash",
      embedding: "qwen/qwen3-embedding-8b",
      uncensored: "phala/uncensored-24b",
    };
  }

  /**
   * Run a chat completion with TEE attestation
   */
  async complete(request: TEERequest): Promise<TEEResponse> {
    const model = this.models[request.model] || request.model;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`RedPill API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    // Generate attestation
    const attestation = await this.attestationService.attest(
      "tee_completion",
      request,
      { content, model },
      model,
    );

    return {
      id: data.id || uuid(),
      content,
      model,
      usage: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      attestation,
      enclave: {
        id: attestation.enclaveId,
        measurement: attestation.measurement,
        timestamp: attestation.timestamp,
      },
    };
  }

  /**
   * Run embeddings with TEE attestation
   */
  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const model = this.models[request.model] || request.model || this.models.embedding;

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: request.input,
      }),
    });

    if (!response.ok) {
      throw new Error(`RedPill Embeddings error: ${response.status}`);
    }

    const data = await response.json();
    const embeddings = (data.data || []).map((d: any) => d.embedding);
    const usage = data.usage || { total_tokens: 0 };

    const attestation = await this.attestationService.attest(
      "tee_embedding", request, { count: embeddings.length }, model,
    );

    return {
      embeddings,
      model,
      usage: { tokens: usage.total_tokens },
      attestation,
    };
  }

  /**
   * Multi-model pipeline: run multiple models in sequence
   */
  async pipeline(steps: {
    model: string;
    messages: TEEMessage[];
    temperature?: number;
  }[]): Promise<TEEResponse[]> {
    const results: TEEResponse[] = [];
    for (const step of steps) {
      const result = await this.complete({
        model: step.model,
        messages: step.messages,
        temperature: step.temperature,
      });
      results.push(result);
    }
    return results;
  }
}
