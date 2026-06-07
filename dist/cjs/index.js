"use strict";
// ═══════════════════════════════════════════════════════════════════════════
//  @agentic-candy-machine/sdk
//  Full-stack SDK for TEE-attested recursive NFT passports on Solana
//
//  DNA → Art → Token → Candy Machine → Recursive Metadata → Mint
// ═══════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAndConfirm = exports.requestAirdrop = exports.getBalanceSol = exports.getBalance = exports.getConnection = exports.validatePointer = exports.parsePointerUri = exports.buildPointerUri = exports.verifyMerklePath = exports.getMerklePath = exports.buildMerkleTree = exports.traitVector = exports.dnaHash = exports.contentHash = exports.hmacSha256 = exports.sha256Bytes = exports.sha384 = exports.sha256 = exports.generateRegistryLinks = exports.templateToNFTMetadata = exports.templatesToConfigLines = exports.NEON_PROTOCOL_AGENTS = exports.AgentTemplateBuilder = exports.GACHA_PRESETS = exports.RARITY_WEIGHTS = exports.GachaEngine = exports.ProvablyFairRoller = exports.GachaPoolBuilder = exports.TEETerminal = exports.AttestationService = exports.PassportFactory = exports.CAPABILITY_ACTION_MAP = exports.computeHiddenSettingsHash = exports.computeSelfHash = exports.PassportTreeBuilder = exports.RecursiveResolver = exports.RecursiveMetadataBuilder = exports.GuardBuilder = exports.CandyMachineClient = exports.CandyMachineBuilder = exports.TokenDeployer = exports.TokenBuilder = exports.PROMPT_TEMPLATES = exports.ArtPipeline = exports.CAPABILITY_WEIGHTS = exports.CAPABILITY_ACTIONS = exports.diffDNA = exports.DNAEncoder = exports.DNABuilder = exports.AgenticCandyMachineSDK = void 0;
exports.RPC_ENDPOINTS = exports.TIER_DEFINITIONS = exports.MEMO_PROGRAM_ID = exports.MAX_RECURSION_DEPTH = exports.SCHEMA_ID = exports.SCHEMA_VERSION = exports.POINTER_PREFIX = exports.chunk = exports.truncateAddress = exports.solToLamports = exports.lamportsToSol = exports.nowUnix = exports.shortId = exports.uuid = exports.sleep = exports.validateConfig = exports.isValidKeypair = exports.isValidPublicKey = exports.encodeString = exports.findPDA = exports.createMemoInstruction = exports.estimateRent = void 0;
// ─── Core Client ─────────────────────────────────────────────────────────
var client_js_1 = require("./core/client.js");
Object.defineProperty(exports, "AgenticCandyMachineSDK", { enumerable: true, get: function () { return client_js_1.AgenticCandyMachineSDK; } });
// ─── DNA Module ──────────────────────────────────────────────────────────
var index_js_1 = require("./modules/dna/index.js");
Object.defineProperty(exports, "DNABuilder", { enumerable: true, get: function () { return index_js_1.DNABuilder; } });
Object.defineProperty(exports, "DNAEncoder", { enumerable: true, get: function () { return index_js_1.DNAEncoder; } });
Object.defineProperty(exports, "diffDNA", { enumerable: true, get: function () { return index_js_1.diffDNA; } });
Object.defineProperty(exports, "CAPABILITY_ACTIONS", { enumerable: true, get: function () { return index_js_1.CAPABILITY_ACTIONS; } });
Object.defineProperty(exports, "CAPABILITY_WEIGHTS", { enumerable: true, get: function () { return index_js_1.CAPABILITY_WEIGHTS; } });
// ─── Art Module ──────────────────────────────────────────────────────────
var index_js_2 = require("./modules/art/index.js");
Object.defineProperty(exports, "ArtPipeline", { enumerable: true, get: function () { return index_js_2.ArtPipeline; } });
Object.defineProperty(exports, "PROMPT_TEMPLATES", { enumerable: true, get: function () { return index_js_2.PROMPT_TEMPLATES; } });
// ─── Token Module ────────────────────────────────────────────────────────
var index_js_3 = require("./modules/token/index.js");
Object.defineProperty(exports, "TokenBuilder", { enumerable: true, get: function () { return index_js_3.TokenBuilder; } });
Object.defineProperty(exports, "TokenDeployer", { enumerable: true, get: function () { return index_js_3.TokenDeployer; } });
// ─── Candy Machine Module ────────────────────────────────────────────────
var index_js_4 = require("./modules/candy-machine/index.js");
Object.defineProperty(exports, "CandyMachineBuilder", { enumerable: true, get: function () { return index_js_4.CandyMachineBuilder; } });
Object.defineProperty(exports, "CandyMachineClient", { enumerable: true, get: function () { return index_js_4.CandyMachineClient; } });
Object.defineProperty(exports, "GuardBuilder", { enumerable: true, get: function () { return index_js_4.GuardBuilder; } });
// ─── Recursive Metadata Module ───────────────────────────────────────────
var index_js_5 = require("./modules/recursive/index.js");
Object.defineProperty(exports, "RecursiveMetadataBuilder", { enumerable: true, get: function () { return index_js_5.RecursiveMetadataBuilder; } });
Object.defineProperty(exports, "RecursiveResolver", { enumerable: true, get: function () { return index_js_5.RecursiveResolver; } });
Object.defineProperty(exports, "PassportTreeBuilder", { enumerable: true, get: function () { return index_js_5.PassportTreeBuilder; } });
Object.defineProperty(exports, "computeSelfHash", { enumerable: true, get: function () { return index_js_5.computeSelfHash; } });
Object.defineProperty(exports, "computeHiddenSettingsHash", { enumerable: true, get: function () { return index_js_5.computeHiddenSettingsHash; } });
Object.defineProperty(exports, "CAPABILITY_ACTION_MAP", { enumerable: true, get: function () { return index_js_5.CAPABILITY_ACTION_MAP; } });
// ─── Passport Module ─────────────────────────────────────────────────────
var index_js_6 = require("./modules/passport/index.js");
Object.defineProperty(exports, "PassportFactory", { enumerable: true, get: function () { return index_js_6.PassportFactory; } });
// ─── Attestation Module ──────────────────────────────────────────────────
var index_js_7 = require("./modules/attestation/index.js");
Object.defineProperty(exports, "AttestationService", { enumerable: true, get: function () { return index_js_7.AttestationService; } });
Object.defineProperty(exports, "TEETerminal", { enumerable: true, get: function () { return index_js_7.TEETerminal; } });
// ─── Provably Fair Gacha Module ──────────────────────────────────────────
var index_js_8 = require("./modules/gacha/index.js");
Object.defineProperty(exports, "GachaPoolBuilder", { enumerable: true, get: function () { return index_js_8.GachaPoolBuilder; } });
Object.defineProperty(exports, "ProvablyFairRoller", { enumerable: true, get: function () { return index_js_8.ProvablyFairRoller; } });
Object.defineProperty(exports, "GachaEngine", { enumerable: true, get: function () { return index_js_8.GachaEngine; } });
Object.defineProperty(exports, "RARITY_WEIGHTS", { enumerable: true, get: function () { return index_js_8.RARITY_WEIGHTS; } });
Object.defineProperty(exports, "GACHA_PRESETS", { enumerable: true, get: function () { return index_js_8.GACHA_PRESETS; } });
// ─── Agent Template Module ───────────────────────────────────────────────
var index_js_9 = require("./modules/agent-template/index.js");
Object.defineProperty(exports, "AgentTemplateBuilder", { enumerable: true, get: function () { return index_js_9.AgentTemplateBuilder; } });
Object.defineProperty(exports, "NEON_PROTOCOL_AGENTS", { enumerable: true, get: function () { return index_js_9.NEON_PROTOCOL_AGENTS; } });
Object.defineProperty(exports, "templatesToConfigLines", { enumerable: true, get: function () { return index_js_9.templatesToConfigLines; } });
Object.defineProperty(exports, "templateToNFTMetadata", { enumerable: true, get: function () { return index_js_9.templateToNFTMetadata; } });
Object.defineProperty(exports, "generateRegistryLinks", { enumerable: true, get: function () { return index_js_9.generateRegistryLinks; } });
// ─── Utilities ───────────────────────────────────────────────────────────
var index_js_10 = require("./utils/index.js");
Object.defineProperty(exports, "sha256", { enumerable: true, get: function () { return index_js_10.sha256; } });
Object.defineProperty(exports, "sha384", { enumerable: true, get: function () { return index_js_10.sha384; } });
Object.defineProperty(exports, "sha256Bytes", { enumerable: true, get: function () { return index_js_10.sha256Bytes; } });
Object.defineProperty(exports, "hmacSha256", { enumerable: true, get: function () { return index_js_10.hmacSha256; } });
Object.defineProperty(exports, "contentHash", { enumerable: true, get: function () { return index_js_10.contentHash; } });
Object.defineProperty(exports, "dnaHash", { enumerable: true, get: function () { return index_js_10.dnaHash; } });
Object.defineProperty(exports, "traitVector", { enumerable: true, get: function () { return index_js_10.traitVector; } });
Object.defineProperty(exports, "buildMerkleTree", { enumerable: true, get: function () { return index_js_10.buildMerkleTree; } });
Object.defineProperty(exports, "getMerklePath", { enumerable: true, get: function () { return index_js_10.getMerklePath; } });
Object.defineProperty(exports, "verifyMerklePath", { enumerable: true, get: function () { return index_js_10.verifyMerklePath; } });
Object.defineProperty(exports, "buildPointerUri", { enumerable: true, get: function () { return index_js_10.buildPointerUri; } });
Object.defineProperty(exports, "parsePointerUri", { enumerable: true, get: function () { return index_js_10.parsePointerUri; } });
Object.defineProperty(exports, "validatePointer", { enumerable: true, get: function () { return index_js_10.validatePointer; } });
Object.defineProperty(exports, "getConnection", { enumerable: true, get: function () { return index_js_10.getConnection; } });
Object.defineProperty(exports, "getBalance", { enumerable: true, get: function () { return index_js_10.getBalance; } });
Object.defineProperty(exports, "getBalanceSol", { enumerable: true, get: function () { return index_js_10.getBalanceSol; } });
Object.defineProperty(exports, "requestAirdrop", { enumerable: true, get: function () { return index_js_10.requestAirdrop; } });
Object.defineProperty(exports, "sendAndConfirm", { enumerable: true, get: function () { return index_js_10.sendAndConfirm; } });
Object.defineProperty(exports, "estimateRent", { enumerable: true, get: function () { return index_js_10.estimateRent; } });
Object.defineProperty(exports, "createMemoInstruction", { enumerable: true, get: function () { return index_js_10.createMemoInstruction; } });
Object.defineProperty(exports, "findPDA", { enumerable: true, get: function () { return index_js_10.findPDA; } });
Object.defineProperty(exports, "encodeString", { enumerable: true, get: function () { return index_js_10.encodeString; } });
Object.defineProperty(exports, "isValidPublicKey", { enumerable: true, get: function () { return index_js_10.isValidPublicKey; } });
Object.defineProperty(exports, "isValidKeypair", { enumerable: true, get: function () { return index_js_10.isValidKeypair; } });
Object.defineProperty(exports, "validateConfig", { enumerable: true, get: function () { return index_js_10.validateConfig; } });
Object.defineProperty(exports, "sleep", { enumerable: true, get: function () { return index_js_10.sleep; } });
Object.defineProperty(exports, "uuid", { enumerable: true, get: function () { return index_js_10.uuid; } });
Object.defineProperty(exports, "shortId", { enumerable: true, get: function () { return index_js_10.shortId; } });
Object.defineProperty(exports, "nowUnix", { enumerable: true, get: function () { return index_js_10.nowUnix; } });
Object.defineProperty(exports, "lamportsToSol", { enumerable: true, get: function () { return index_js_10.lamportsToSol; } });
Object.defineProperty(exports, "solToLamports", { enumerable: true, get: function () { return index_js_10.solToLamports; } });
Object.defineProperty(exports, "truncateAddress", { enumerable: true, get: function () { return index_js_10.truncateAddress; } });
Object.defineProperty(exports, "chunk", { enumerable: true, get: function () { return index_js_10.chunk; } });
Object.defineProperty(exports, "POINTER_PREFIX", { enumerable: true, get: function () { return index_js_10.POINTER_PREFIX; } });
Object.defineProperty(exports, "SCHEMA_VERSION", { enumerable: true, get: function () { return index_js_10.SCHEMA_VERSION; } });
Object.defineProperty(exports, "SCHEMA_ID", { enumerable: true, get: function () { return index_js_10.SCHEMA_ID; } });
Object.defineProperty(exports, "MAX_RECURSION_DEPTH", { enumerable: true, get: function () { return index_js_10.MAX_RECURSION_DEPTH; } });
Object.defineProperty(exports, "MEMO_PROGRAM_ID", { enumerable: true, get: function () { return index_js_10.MEMO_PROGRAM_ID; } });
Object.defineProperty(exports, "TIER_DEFINITIONS", { enumerable: true, get: function () { return index_js_10.TIER_DEFINITIONS; } });
Object.defineProperty(exports, "RPC_ENDPOINTS", { enumerable: true, get: function () { return index_js_10.RPC_ENDPOINTS; } });
//# sourceMappingURL=index.js.map