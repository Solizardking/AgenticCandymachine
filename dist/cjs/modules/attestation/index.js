"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEETerminal = exports.AttestationService = void 0;
const index_js_1 = require("../../utils/index.js");
// ─── Service ─────────────────────────────────────────────────────────────────
class AttestationService {
    connection;
    authority;
    config;
    constructor(connection, authority, config) {
        this.connection = connection;
        this.authority = authority;
        this.config = config;
    }
    async attest(type, input, output, model) {
        const timestamp = (0, index_js_1.nowUnix)();
        const dataHash = (0, index_js_1.sha256)(JSON.stringify({ input, output, model, timestamp }, (_, v) => typeof v === 'bigint' ? v.toString() : v));
        // Simulate enclave signing
        let signature;
        if (this.config.enclaveKey) {
            // In real TEE, this happens inside the enclave with a non-exportable key
            signature = (0, index_js_1.hmacSha256)(this.config.enclaveKey, dataHash);
        }
        else {
            signature = "mock_sig_" + (0, index_js_1.uuid)();
        }
        const record = {
            id: "att_" + (0, index_js_1.uuid)(),
            type,
            timestamp,
            merkleRoot: dataHash, // Simplified, usually root of batch
            dataHash,
            signature,
        };
        if (this.config.submitOnChain) {
            // Mock blockchain submission
            await (0, index_js_1.sleep)(200);
            record.onChain = {
                signature: "tx_sig_" + (0, index_js_1.uuid)(),
                slot: 12345678,
            };
        }
        return record;
    }
    verify(record) {
        // Verify signature logic
        const expectedSig = (0, index_js_1.hmacSha256)(this.config.enclaveKey || "", record.dataHash);
        // For mock purposes, just check if sig exists
        const valid = !!record.signature && (this.config.hmacFallback ? true : record.signature === expectedSig);
        return {
            valid,
            details: valid ? "Valid enclave signature" : "Invalid signature",
            signer: "enclave_1",
        };
    }
}
exports.AttestationService = AttestationService;
// ─── Terminal ────────────────────────────────────────────────────────────────
class TEETerminal {
    apiKey;
    attestationService;
    config;
    constructor(apiKey, attestationService, config) {
        this.apiKey = apiKey;
        this.attestationService = attestationService;
        this.config = config;
    }
    async complete(request) {
        // 1. Send to TEE (mocked http call)
        // const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, ...);
        await (0, index_js_1.sleep)(600 + Math.random() * 400);
        const mockContent = `[TEE-Attested] Analysis for ${request.model}: Based on the data, the optimal strategy depends on volume...`;
        // 2. Generate Attestation
        const attestation = await this.attestationService.attest("llm_completion", { messages: request.messages, model: request.model }, { content: mockContent }, request.model);
        return {
            content: mockContent,
            attestation,
            usage: { promptTokens: 50, completionTokens: 120 },
        };
    }
}
exports.TEETerminal = TEETerminal;
//# sourceMappingURL=index.js.map