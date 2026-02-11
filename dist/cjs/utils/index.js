"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.RPC_ENDPOINTS = exports.TIER_DEFINITIONS = exports.MEMO_PROGRAM_ID = exports.MAX_RECURSION_DEPTH = exports.SCHEMA_ID = exports.SCHEMA_VERSION = exports.POINTER_PREFIX = void 0;
exports.sha256 = sha256;
exports.sha256Bytes = sha256Bytes;
exports.sha384 = sha384;
exports.hmacSha256 = hmacSha256;
exports.contentHash = contentHash;
exports.dnaHash = dnaHash;
exports.traitVector = traitVector;
exports.buildMerkleTree = buildMerkleTree;
exports.getMerklePath = getMerklePath;
exports.verifyMerklePath = verifyMerklePath;
exports.buildPointerUri = buildPointerUri;
exports.parsePointerUri = parsePointerUri;
exports.validatePointer = validatePointer;
exports.getConnection = getConnection;
exports.getBalance = getBalance;
exports.getBalanceSol = getBalanceSol;
exports.requestAirdrop = requestAirdrop;
exports.sendAndConfirm = sendAndConfirm;
exports.estimateRent = estimateRent;
exports.createMemoInstruction = createMemoInstruction;
exports.findPDA = findPDA;
exports.encodeString = encodeString;
exports.isValidPublicKey = isValidPublicKey;
exports.isValidKeypair = isValidKeypair;
exports.validateConfig = validateConfig;
exports.uuid = uuid;
exports.shortId = shortId;
exports.nowUnix = nowUnix;
exports.lamportsToSol = lamportsToSol;
exports.solToLamports = solToLamports;
exports.truncateAddress = truncateAddress;
exports.chunk = chunk;
const web3_js_1 = require("@solana/web3.js");
const crypto_1 = __importDefault(require("crypto"));
// ─── Constants ───────────────────────────────────────────────────────────────
exports.POINTER_PREFIX = "recurse://";
exports.SCHEMA_VERSION = "1.0.0";
exports.SCHEMA_ID = "cm_recursive_schema";
exports.MAX_RECURSION_DEPTH = 5;
exports.MEMO_PROGRAM_ID = new web3_js_1.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb");
exports.TIER_DEFINITIONS = {
    OBSERVER: { level: 0, color: "#666666", price: 0, permissions: ["read"] },
    AGENT: { level: 1, color: "#9945FF", price: 0.05, permissions: ["read", "execute"] },
    OPERATOR: { level: 2, color: "#14F195", price: 0.10, permissions: ["read", "execute", "delegate"] },
    SOVEREIGN: { level: 3, color: "#FFD700", price: 1.00, permissions: ["read", "execute", "delegate", "mint", "attest"] },
};
exports.RPC_ENDPOINTS = {
    mainnet: "https://api.mainnet-beta.solana.com",
    devnet: "https://api.devnet.solana.com",
    testnet: "https://api.testnet.solana.com",
};
// ─── Cryptography & Hashing ──────────────────────────────────────────────────
function sha256(data) {
    return crypto_1.default.createHash("sha256").update(data).digest("hex");
}
function sha256Bytes(data) {
    return crypto_1.default.createHash("sha256").update(data).digest();
}
function sha384(data) {
    return crypto_1.default.createHash("sha384").update(data).digest("hex");
}
function hmacSha256(key, data) {
    return crypto_1.default.createHmac("sha256", key).update(data).digest("hex");
}
function contentHash(metadata) {
    // Sort keys for deterministic hash
    const sorted = Object.keys(metadata).sort().reduce((acc, key) => {
        acc[key] = metadata[key];
        return acc;
    }, {});
    return sha256(JSON.stringify(sorted));
}
function dnaHash(traits) {
    if (traits.length === 0)
        return sha256("void");
    return sha256(traits.join("|"));
}
function traitVector(traits) {
    return traits.map(t => `${t.layer}:${t.value}`).join(";");
}
function buildMerkleTree(leaves) {
    // Simplified single-layer hash for mock purposes in SDK setup
    // In production use proper Merkle library
    const root = sha256(leaves.join(""));
    return { root, proofs: [] };
}
function getMerklePath(tree, index) {
    return []; // Mock
}
function verifyMerklePath(root, leaf, path) {
    return true; // Mock
}
// ─── URI & Pointers ──────────────────────────────────────────────────────────
function buildPointerUri(mint, depth, action) {
    return `${exports.POINTER_PREFIX}${mint.toBase58()}/${depth}/${action}`;
}
function parsePointerUri(uri) {
    if (!uri.startsWith(exports.POINTER_PREFIX)) {
        throw new Error(`Invalid pointer URI: ${uri}`);
    }
    const parts = uri.replace(exports.POINTER_PREFIX, "").split("/");
    if (parts.length < 3)
        throw new Error("URI missing parts");
    try {
        const mint = new web3_js_1.PublicKey(parts[0]);
        const depth = parseInt(parts[1], 10);
        const action = parts[2];
        return { mint, depth, action };
    }
    catch (e) {
        throw new Error(`Failed to parse URI: ${uri}`);
    }
}
function validatePointer(pointer) {
    return !!(pointer.mint && pointer.depth >= 0 && pointer.action);
}
// ─── Solana Helpers ──────────────────────────────────────────────────────────
function getConnection(cluster = "devnet", rpc) {
    const endpoint = rpc || exports.RPC_ENDPOINTS[cluster] || exports.RPC_ENDPOINTS.devnet;
    return new web3_js_1.Connection(endpoint, "confirmed");
}
async function getBalance(connection, key) {
    return await connection.getBalance(key);
}
async function getBalanceSol(connection, key) {
    const lamports = await getBalance(connection, key);
    return lamportsToSol(lamports);
}
async function requestAirdrop(connection, key, sol = 2) {
    const sig = await connection.requestAirdrop(key, sol * web3_js_1.LAMPORTS_PER_SOL);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        signature: sig,
        ...latestBlockhash,
    });
    return sig;
}
async function sendAndConfirm(connection, transaction, signers) {
    return await (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, signers);
}
async function estimateRent(connection, bytes) {
    return await connection.getMinimumBalanceForRentExemption(bytes);
}
function createMemoInstruction(data, signer) {
    return new web3_js_1.TransactionInstruction({
        keys: [{ pubkey: signer, isSigner: true, isWritable: true }],
        programId: exports.MEMO_PROGRAM_ID,
        data: Buffer.from(data, "utf-8"),
    });
}
function findPDA(seeds, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync(seeds, programId);
}
function encodeString(str) {
    return Buffer.from(str, "utf-8");
}
// ─── Validation ──────────────────────────────────────────────────────────────
function isValidPublicKey(key) {
    try {
        new web3_js_1.PublicKey(key);
        return true;
    }
    catch {
        return false;
    }
}
function isValidKeypair(keypair) {
    return keypair?.secretKey && keypair?.publicKey;
}
function validateConfig(config) {
    return config && config.authority;
}
// ─── General Utility ─────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.sleep = sleep;
function uuid() {
    return crypto_1.default.randomUUID();
}
function shortId() {
    return uuid().slice(0, 8);
}
function nowUnix() {
    return Math.floor(Date.now() / 1000);
}
function lamportsToSol(lamports) {
    return Number(lamports) / web3_js_1.LAMPORTS_PER_SOL;
}
function solToLamports(sol) {
    return Math.floor(sol * web3_js_1.LAMPORTS_PER_SOL);
}
function truncateAddress(address, length = 4) {
    const str = address.toString();
    return `${str.slice(0, length)}...${str.slice(-length)}`;
}
function chunk(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
//# sourceMappingURL=index.js.map