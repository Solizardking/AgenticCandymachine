
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction, TransactionInstruction } from "@solana/web3.js";
import crypto from "crypto";

// ─── Constants ───────────────────────────────────────────────────────────────

export const POINTER_PREFIX = "recurse://";
export const SCHEMA_VERSION = "1.0.0";
export const SCHEMA_ID = "cm_recursive_schema";
export const MAX_RECURSION_DEPTH = 5;
export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb");

export const TIER_DEFINITIONS = {
    OBSERVER: { level: 0, color: "#666666", price: 0, permissions: ["read"] },
    AGENT: { level: 1, color: "#9945FF", price: 0.05, permissions: ["read", "execute"] },
    OPERATOR: { level: 2, color: "#14F195", price: 0.10, permissions: ["read", "execute", "delegate"] },
    SOVEREIGN: { level: 3, color: "#FFD700", price: 1.00, permissions: ["read", "execute", "delegate", "mint", "attest"] },
};

export const RPC_ENDPOINTS = {
    mainnet: "https://api.mainnet-beta.solana.com",
    devnet: "https://api.devnet.solana.com",
    testnet: "https://api.testnet.solana.com",
};

// ─── Cryptography & Hashing ──────────────────────────────────────────────────

export function sha256(data: string | Buffer | Uint8Array): string {
    return crypto.createHash("sha256").update(data).digest("hex");
}

export function sha256Bytes(data: string | Buffer | Uint8Array): Uint8Array {
    return crypto.createHash("sha256").update(data).digest();
}

export function sha384(data: string | Buffer | Uint8Array): string {
    return crypto.createHash("sha384").update(data).digest("hex");
}

export function hmacSha256(key: string, data: string): string {
    return crypto.createHmac("sha256", key).update(data).digest("hex");
}

export function contentHash(metadata: any): string {
    // Sort keys for deterministic hash
    const sorted = Object.keys(metadata).sort().reduce((acc, key) => {
        acc[key] = metadata[key];
        return acc;
    }, {} as any);
    return sha256(JSON.stringify(sorted));
}

export function dnaHash(traits: string[]): string {
    if (traits.length === 0) return sha256("void");
    return sha256(traits.join("|"));
}

export function traitVector(traits: { layer: string, value: string }[]): string {
    return traits.map(t => `${t.layer}:${t.value}`).join(";");
}

export function buildMerkleTree(leaves: string[]): { root: string, proofs: string[] } {
    // Simplified single-layer hash for mock purposes in SDK setup
    // In production use proper Merkle library
    const root = sha256(leaves.join(""));
    return { root, proofs: [] };
}

export function getMerklePath(tree: any, index: number): string[] {
    return []; // Mock
}

export function verifyMerklePath(root: string, leaf: string, path: string[]): boolean {
    return true; // Mock
}

// ─── URI & Pointers ──────────────────────────────────────────────────────────

export function buildPointerUri(mint: PublicKey, depth: number, action: string): string {
    return `${POINTER_PREFIX}${mint.toBase58()}/${depth}/${action}`;
}

export function parsePointerUri(uri: string): { mint?: PublicKey, depth: number, action: string } {
    if (!uri.startsWith(POINTER_PREFIX)) {
        throw new Error(`Invalid pointer URI: ${uri}`);
    }
    const parts = uri.replace(POINTER_PREFIX, "").split("/");
    if (parts.length < 3) throw new Error("URI missing parts");

    try {
        const mint = new PublicKey(parts[0]);
        const depth = parseInt(parts[1], 10);
        const action = parts[2];
        return { mint, depth, action };
    } catch (e) {
        throw new Error(`Failed to parse URI: ${uri}`);
    }
}

export function validatePointer(pointer: any): boolean {
    return !!(pointer.mint && pointer.depth >= 0 && pointer.action);
}

// ─── Solana Helpers ──────────────────────────────────────────────────────────

export function getConnection(cluster: string = "devnet", rpc?: string): Connection {
    const endpoint = rpc || (RPC_ENDPOINTS as any)[cluster] || RPC_ENDPOINTS.devnet;
    return new Connection(endpoint, "confirmed");
}

export async function getBalance(connection: Connection, key: PublicKey): Promise<number> {
    return await connection.getBalance(key);
}

export async function getBalanceSol(connection: Connection, key: PublicKey): Promise<number> {
    const lamports = await getBalance(connection, key);
    return lamportsToSol(lamports);
}

export async function requestAirdrop(connection: Connection, key: PublicKey, sol: number = 2): Promise<string> {
    const sig = await connection.requestAirdrop(key, sol * LAMPORTS_PER_SOL);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        signature: sig,
        ...latestBlockhash,
    });
    return sig;
}

export async function sendAndConfirm(
    connection: Connection,
    transaction: Transaction,
    signers: Keypair[]
): Promise<string> {
    return await sendAndConfirmTransaction(connection, transaction, signers);
}

export async function estimateRent(connection: Connection, bytes: number): Promise<number> {
    return await connection.getMinimumBalanceForRentExemption(bytes);
}

export function createMemoInstruction(data: string, signer: PublicKey): TransactionInstruction {
    return new TransactionInstruction({
        keys: [{ pubkey: signer, isSigner: true, isWritable: true }],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(data, "utf-8"),
    });
}

export function findPDA(seeds: (Buffer | Uint8Array)[], programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(seeds, programId);
}

export function encodeString(str: string): Buffer {
    return Buffer.from(str, "utf-8");
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function isValidPublicKey(key: string): boolean {
    try {
        new PublicKey(key);
        return true;
    } catch {
        return false;
    }
}

export function isValidKeypair(keypair: any): boolean {
    return keypair?.secretKey && keypair?.publicKey;
}

export function validateConfig(config: any): boolean {
    return config && config.authority;
}

// ─── General Utility ─────────────────────────────────────────────────────────

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function uuid(): string {
    return crypto.randomUUID();
}

export function shortId(): string {
    return uuid().slice(0, 8);
}

export function nowUnix(): number {
    return Math.floor(Date.now() / 1000);
}

export function lamportsToSol(lamports: number | bigint): number {
    return Number(lamports) / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function truncateAddress(address: string | PublicKey, length = 4): string {
    const str = address.toString();
    return `${str.slice(0, length)}...${str.slice(-length)}`;
}

export function chunk<T>(array: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
