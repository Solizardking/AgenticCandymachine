
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
    AttestationConfig, AttestationRecord, AttestationVerification,
    TEERequest, TEEMessage, TEEResponse
} from "../../types/index.js";
import { sha256, hmacSha256, nowUnix, uuid, sleep } from "../../utils/index.js";

// ─── Service ─────────────────────────────────────────────────────────────────

export class AttestationService {
    constructor(
        private connection: Connection,
        private authority: Keypair,
        private config: AttestationConfig
    ) { }

    async attest(
        type: string,
        input: any,
        output: any,
        model: string
    ): Promise<AttestationRecord> {
        const timestamp = nowUnix();
        const dataHash = sha256(JSON.stringify({ input, output, model, timestamp }, (_, v) =>
            typeof v === 'bigint' ? v.toString() : v
        ));

        // Simulate enclave signing
        let signature: string;
        if (this.config.enclaveKey) {
            // In real TEE, this happens inside the enclave with a non-exportable key
            signature = hmacSha256(this.config.enclaveKey, dataHash);
        } else {
            signature = "mock_sig_" + uuid();
        }

        const record: AttestationRecord = {
            id: "att_" + uuid(),
            type,
            timestamp,
            merkleRoot: dataHash, // Simplified, usually root of batch
            dataHash,
            signature,
        };

        if (this.config.submitOnChain) {
            // Mock blockchain submission
            await sleep(200);
            record.onChain = {
                signature: "tx_sig_" + uuid(),
                slot: 12345678,
            };
        }

        return record;
    }

    verify(record: AttestationRecord): AttestationVerification {
        // Verify signature logic
        const expectedSig = hmacSha256(this.config.enclaveKey || "", record.dataHash);

        // For mock purposes, just check if sig exists
        const valid = !!record.signature && (this.config.hmacFallback ? true : record.signature === expectedSig);

        return {
            valid,
            details: valid ? "Valid enclave signature" : "Invalid signature",
            signer: "enclave_1",
        };
    }
}

// ─── Terminal ────────────────────────────────────────────────────────────────

export class TEETerminal {
    constructor(
        private apiKey: string,
        private attestationService: AttestationService,
        private config: { baseUrl?: string }
    ) { }

    async complete(request: TEERequest): Promise<TEEResponse> {
        // 1. Send to TEE (mocked http call)
        // const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, ...);
        await sleep(600 + Math.random() * 400);

        const mockContent = `[TEE-Attested] Analysis for ${request.model}: Based on the data, the optimal strategy depends on volume...`;

        // 2. Generate Attestation
        const attestation = await this.attestationService.attest(
            "llm_completion",
            { messages: request.messages, model: request.model },
            { content: mockContent },
            request.model
        );

        return {
            content: mockContent,
            attestation,
            usage: { promptTokens: 50, completionTokens: 120 },
        };
    }
}
