// ═══════════════════════════════════════════════════════════════════════════
//  @agentic-candy-machine/sdk — Utilities
//  Cryptographic hashing, encoding, Solana helpers, Merkle tree
// ═══════════════════════════════════════════════════════════════════════════

import { PublicKey, Keypair, Connection, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import { createHash, createHmac, randomBytes } from "crypto";
import type { MerkleTree, RecursiveAction, RecursivePointer, SolanaCluster } from "../types/index.js";

// ─── Constants ───────────────────────────────────────────────────────────

export const POINTER_PREFIX = "recurse://";
export const SCHEMA_VERSION = 1;
export const SCHEMA_ID = "agentic-recursive-v1";
export const MAX_RECURSION_DEPTH = 7;
export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export const TIER_DEFINITIONS = {
  OBSERVER: { level: 0, color: "#666666", price: 0 },
  AGENT:    { level: 1, color: "#9945FF", price: 0.05 * LAMPORTS_PER_SOL },
  OPERATOR: { level: 2, color: "#14F195", price: 0.1  * LAMPORTS_PER_SOL },
  SOVEREIGN:{ level: 3, color: "#FFD700", price: 1    * LAMPORTS_PER_SOL },
} as const;

export const RPC_ENDPOINTS: Record<SolanaCluster, string> = {
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  "devnet":       "https://api.devnet.solana.com",
  "testnet":      "https://api.testnet.solana.com",
  "localnet":     "http://localhost:8899",
};

// ─── Hashing ─────────────────────────────────────────────────────────────

export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

export function sha384(data: string | Buffer): string {
  return createHash("sha384").update(data).digest("hex");
}

export function sha256Bytes(data: string | Buffer): Uint8Array {
  return new Uint8Array(createHash("sha256").update(data).digest());
}

export function hmacSha256(data: string, key: string): string {
  return createHmac("sha256", key).update(data).digest("hex");
}

export function contentHash(content: unknown): string {
  const serialized = typeof content === "string" ? content : JSON.stringify(content, null, 0);
  return sha256(serialized);
}

export function dnaHash(name: string, tier: string, capabilities: string[], model: string): string {
  const seed = `${name}:${tier}:${capabilities.sort().join(",")}:${model}`;
  return sha256(seed);
}

export function traitVector(dna: { name: string; tier: string; capabilities: string[] }): number[] {
  const hash = sha256(`${dna.name}:${dna.tier}:${dna.capabilities.join(",")}`);
  const vec: number[] = [];
  for (let i = 0; i < 32; i++) {
    vec.push(parseInt(hash.slice(i * 2, i * 2 + 2), 16) / 255);
  }
  return vec;
}

export function deterministicSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Merkle Tree ─────────────────────────────────────────────────────────

export function buildMerkleTree(leaves: string[]): MerkleTree {
  if (leaves.length === 0) {
    const emptyHash = sha256("empty");
    return { root: emptyHash, leaves: [], layers: [[emptyHash]] };
  }

  const hashedLeaves = leaves.map(l => sha256(l));
  const layers: string[][] = [hashedLeaves];

  let current = hashedLeaves;
  while (current.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] || left; // duplicate last if odd
      next.push(sha256(left + right));
    }
    layers.push(next);
    current = next;
  }

  return {
    root: current[0],
    leaves: hashedLeaves,
    layers,
  };
}

export function getMerklePath(tree: MerkleTree, leafIndex: number): string[] {
  const path: string[] = [];
  let idx = leafIndex;

  for (let i = 0; i < tree.layers.length - 1; i++) {
    const layer = tree.layers[i];
    const isRight = idx % 2 === 1;
    const siblingIdx = isRight ? idx - 1 : idx + 1;
    if (siblingIdx < layer.length) {
      path.push(layer[siblingIdx]);
    } else {
      path.push(layer[idx]); // self-sibling
    }
    idx = Math.floor(idx / 2);
  }

  return path;
}

export function verifyMerklePath(leaf: string, path: string[], root: string): boolean {
  let current = sha256(leaf);

  for (const sibling of path) {
    // Canonical ordering
    if (current < sibling) {
      current = sha256(current + sibling);
    } else {
      current = sha256(sibling + current);
    }
  }

  return current === root;
}

export function addMerkleLeaf(tree: MerkleTree, leaf: string): MerkleTree {
  const newLeaves = [...tree.leaves, sha256(leaf)];
  return buildMerkleTree(newLeaves.map((_, i) => tree.leaves[i] ? `pre:${tree.leaves[i]}` : leaf));
}

// ─── Recursive Pointer Parsing ───────────────────────────────────────────

export function buildPointerUri(mint: PublicKey, depth: number, action: RecursiveAction): string {
  return `${POINTER_PREFIX}${mint.toBase58()}/${depth}/${action}`;
}

export function parsePointerUri(uri: string): RecursivePointer | null {
  if (!uri.startsWith(POINTER_PREFIX)) return null;
  const parts = uri.slice(POINTER_PREFIX.length).split("/");
  if (parts.length < 3) return null;

  try {
    return {
      uri,
      mint: new PublicKey(parts[0]),
      depth: parseInt(parts[1]),
      action: parts[2] as RecursiveAction,
      weight: 100,
    };
  } catch {
    return null;
  }
}

export function validatePointer(pointer: RecursivePointer): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!pointer.uri.startsWith(POINTER_PREFIX)) {
    errors.push(`Invalid pointer prefix: ${pointer.uri}`);
  }
  if (pointer.depth < 0 || pointer.depth > MAX_RECURSION_DEPTH) {
    errors.push(`Depth ${pointer.depth} exceeds max ${MAX_RECURSION_DEPTH}`);
  }
  if (!["resolve", "execute", "compose", "verify", "embed", "transform"].includes(pointer.action)) {
    errors.push(`Unknown action: ${pointer.action}`);
  }
  if (pointer.weight < 0 || pointer.weight > 100) {
    errors.push(`Weight must be 0-100, got ${pointer.weight}`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Solana Helpers ──────────────────────────────────────────────────────

export function getConnection(cluster: SolanaCluster, rpcEndpoint?: string): Connection {
  const endpoint = rpcEndpoint || RPC_ENDPOINTS[cluster];
  return new Connection(endpoint, "confirmed");
}

export async function getBalance(connection: Connection, address: PublicKey): Promise<number> {
  return connection.getBalance(address);
}

export async function getBalanceSol(connection: Connection, address: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(address);
  return lamports / LAMPORTS_PER_SOL;
}

export async function requestAirdrop(connection: Connection, address: PublicKey, sol: number = 2): Promise<string> {
  const sig = await connection.requestAirdrop(address, sol * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

export function createMemoInstruction(data: string, signer: PublicKey): TransactionInstruction {
  return new TransactionInstruction({
    keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(data, "utf-8"),
  });
}

export async function sendAndConfirm(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[],
  retries: number = 3,
): Promise<string> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      const sig = await sendAndConfirmTransaction(connection, transaction, signers, {
        commitment: "confirmed",
        maxRetries: 3,
      });
      return sig;
    } catch (e) {
      lastError = e as Error;
      if (i < retries - 1) {
        await sleep(1000 * (i + 1));
      }
    }
  }
  throw lastError || new Error("Transaction failed after retries");
}

export async function estimateRent(connection: Connection, dataSize: number): Promise<number> {
  return connection.getMinimumBalanceForRentExemption(dataSize);
}

// ─── PDA Helpers ─────────────────────────────────────────────────────────

export function findPDA(seeds: (Buffer | Uint8Array)[], programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(seeds, programId);
}

export function encodeString(str: string): Buffer {
  return Buffer.from(str, "utf-8");
}

// ─── Encoding / Serialization ────────────────────────────────────────────

export function toBase58(data: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let num = BigInt("0x" + Buffer.from(data).toString("hex"));
  let result = "";
  while (num > 0n) {
    result = ALPHABET[Number(num % 58n)] + result;
    num = num / 58n;
  }
  for (const byte of data) {
    if (byte === 0) result = "1" + result;
    else break;
  }
  return result || "1";
}

export function jsonToBuffer(json: object): Buffer {
  return Buffer.from(JSON.stringify(json), "utf-8");
}

export function bufferToHex(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer).toString("hex");
}

export function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, "hex");
}

// ─── Validation ──────────────────────────────────────────────────────────

export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

export function isValidKeypair(key: Uint8Array): boolean {
  try {
    Keypair.fromSecretKey(key);
    return true;
  } catch {
    return false;
  }
}

export function validateConfig(config: Record<string, unknown>, required: string[]): { valid: boolean; missing: string[] } {
  const missing = required.filter(k => config[k] === undefined || config[k] === null || config[k] === "");
  return { valid: missing.length === 0, missing };
}

// ─── Misc ────────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function uuid(): string {
  return randomBytes(16).toString("hex").replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    "$1-$2-$3-$4-$5"
  );
}

export function shortId(): string {
  return randomBytes(6).toString("hex");
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function truncateAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
