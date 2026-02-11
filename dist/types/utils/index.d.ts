import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } from "@solana/web3.js";
export declare const POINTER_PREFIX = "recurse://";
export declare const SCHEMA_VERSION = "1.0.0";
export declare const SCHEMA_ID = "cm_recursive_schema";
export declare const MAX_RECURSION_DEPTH = 5;
export declare const MEMO_PROGRAM_ID: PublicKey;
export declare const TIER_DEFINITIONS: {
    OBSERVER: {
        level: number;
        color: string;
        price: number;
        permissions: string[];
    };
    AGENT: {
        level: number;
        color: string;
        price: number;
        permissions: string[];
    };
    OPERATOR: {
        level: number;
        color: string;
        price: number;
        permissions: string[];
    };
    SOVEREIGN: {
        level: number;
        color: string;
        price: number;
        permissions: string[];
    };
};
export declare const RPC_ENDPOINTS: {
    mainnet: string;
    devnet: string;
    testnet: string;
};
export declare function sha256(data: string | Buffer | Uint8Array): string;
export declare function sha256Bytes(data: string | Buffer | Uint8Array): Uint8Array;
export declare function sha384(data: string | Buffer | Uint8Array): string;
export declare function hmacSha256(key: string, data: string): string;
export declare function contentHash(metadata: any): string;
export declare function dnaHash(traits: string[]): string;
export declare function traitVector(traits: {
    layer: string;
    value: string;
}[]): string;
export declare function buildMerkleTree(leaves: string[]): {
    root: string;
    proofs: string[];
};
export declare function getMerklePath(tree: any, index: number): string[];
export declare function verifyMerklePath(root: string, leaf: string, path: string[]): boolean;
export declare function buildPointerUri(mint: PublicKey, depth: number, action: string): string;
export declare function parsePointerUri(uri: string): {
    mint?: PublicKey;
    depth: number;
    action: string;
};
export declare function validatePointer(pointer: any): boolean;
export declare function getConnection(cluster?: string, rpc?: string): Connection;
export declare function getBalance(connection: Connection, key: PublicKey): Promise<number>;
export declare function getBalanceSol(connection: Connection, key: PublicKey): Promise<number>;
export declare function requestAirdrop(connection: Connection, key: PublicKey, sol?: number): Promise<string>;
export declare function sendAndConfirm(connection: Connection, transaction: Transaction, signers: Keypair[]): Promise<string>;
export declare function estimateRent(connection: Connection, bytes: number): Promise<number>;
export declare function createMemoInstruction(data: string, signer: PublicKey): TransactionInstruction;
export declare function findPDA(seeds: (Buffer | Uint8Array)[], programId: PublicKey): [PublicKey, number];
export declare function encodeString(str: string): Buffer;
export declare function isValidPublicKey(key: string): boolean;
export declare function isValidKeypair(keypair: any): boolean;
export declare function validateConfig(config: any): boolean;
export declare const sleep: (ms: number) => Promise<unknown>;
export declare function uuid(): string;
export declare function shortId(): string;
export declare function nowUnix(): number;
export declare function lamportsToSol(lamports: number | bigint): number;
export declare function solToLamports(sol: number): number;
export declare function truncateAddress(address: string | PublicKey, length?: number): string;
export declare function chunk<T>(array: T[], size: number): T[][];
