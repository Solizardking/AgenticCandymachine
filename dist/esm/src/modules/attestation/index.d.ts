import { Connection, Keypair } from "@solana/web3.js";
import { AttestationConfig, AttestationRecord, AttestationVerification, TEERequest, TEEResponse } from "../../types/index.js";
export declare class AttestationService {
    private connection;
    private authority;
    private config;
    constructor(connection: Connection, authority: Keypair, config: AttestationConfig);
    attest(type: string, input: any, output: any, model: string): Promise<AttestationRecord>;
    verify(record: AttestationRecord): AttestationVerification;
}
export declare class TEETerminal {
    private apiKey;
    private attestationService;
    private config;
    constructor(apiKey: string, attestationService: AttestationService, config: {
        baseUrl?: string;
    });
    complete(request: TEERequest): Promise<TEEResponse>;
}
