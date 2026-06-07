// ═══════════════════════════════════════════════════════════════════════════
//  x402 Payment Protocol Integration
//  Connects agents to x402.wtf — the HTTP 402 payment-gated agent registry.
//
//  x402 lets agents monetize capabilities via on-chain micropayments.
//  Every agent registered here becomes a payable API endpoint.
// ═══════════════════════════════════════════════════════════════════════════

import type { AgentTemplate } from "../../types/index.js";
import { sha256, uuid, nowUnix } from "../../utils/index.js";

// ─── x402 Types ───────────────────────────────────────────────────────────

export type X402PaymentToken = "USDC" | "SOL" | "BONK" | "JUP";
export type X402Network = "solana-mainnet" | "solana-devnet";

export interface X402PriceConfig {
  token: X402PaymentToken;
  amount: number;           // In smallest unit (lamports / micro-USDC)
  recipient: string;        // Solana wallet address
  network: X402Network;
}

export interface X402Endpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  description: string;
  price: X402PriceConfig;
  rateLimit?: {
    requests: number;
    windowSeconds: number;
  };
}

export interface X402AgentRegistration {
  id: string;
  handle: string;
  name: string;
  description: string;
  tier: string;
  rarity: string;
  faction: string;
  role: string;
  endpoints: X402Endpoint[];
  registryUrl: string;
  paymentAddress: string;
  registeredAt: string;
  signature: string;
  verified: boolean;
}

export interface X402PaymentChallenge {
  type: "x402";
  version: "1";
  accepts: Array<{
    scheme: "exact";
    network: X402Network;
    maxAmountRequired: string;
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: Record<string, unknown>;
  }>;
}

export interface X402VerifyResult {
  valid: boolean;
  handle: string;
  registryUrl: string;
  paymentUrl: string;
  agentId: string;
  attestation?: string;
  error?: string;
}

// ─── USDC mint on Solana mainnet ──────────────────────────────────────────
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const BONK_MINT = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
const JUP_MINT  = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN";

const TOKEN_MINTS: Record<X402PaymentToken, string> = {
  USDC: USDC_MINT,
  SOL:  "So11111111111111111111111111111111111111112",
  BONK: BONK_MINT,
  JUP:  JUP_MINT,
};

// ─── X402 Client ──────────────────────────────────────────────────────────

export class X402Client {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(options: { baseUrl?: string; apiKey?: string } = {}) {
    this.baseUrl = options.baseUrl ?? "https://x402.wtf";
    this.apiKey  = options.apiKey;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) h["X-API-Key"] = this.apiKey;
    return h;
  }

  /**
   * Build the canonical x402 payment challenge for an agent endpoint.
   * Follows the x402 spec: https://x402.org
   */
  buildPaymentChallenge(
    agentHandle: string,
    endpoint: X402Endpoint,
    resourceUrl: string,
  ): X402PaymentChallenge {
    const asset = TOKEN_MINTS[endpoint.price.token];
    return {
      type: "x402",
      version: "1",
      accepts: [
        {
          scheme: "exact",
          network: endpoint.price.network,
          maxAmountRequired: String(endpoint.price.amount),
          resource: resourceUrl,
          description: `Access ${agentHandle} — ${endpoint.description}`,
          mimeType: "application/json",
          payTo: endpoint.price.recipient,
          maxTimeoutSeconds: 300,
          asset,
          extra: {
            name: endpoint.price.token,
            decimals: endpoint.price.token === "SOL" ? 9 : 6,
          },
        },
      ],
    };
  }

  /**
   * Register an agent template on x402.wtf.
   * Returns a registration record with a signed payload for on-chain attestation.
   */
  async register(
    template: AgentTemplate,
    paymentAddress: string,
    endpoints?: X402Endpoint[],
    network: X402Network = "solana-mainnet",
  ): Promise<X402AgentRegistration> {
    const defaultEndpoints: X402Endpoint[] = endpoints ?? [
      {
        path: `/agents/${template.handle}/query`,
        method: "POST",
        description: `Query ${template.name} — agent intelligence endpoint`,
        price: {
          token: "USDC",
          amount: 100_000,   // 0.10 USDC
          recipient: paymentAddress,
          network,
        },
        rateLimit: { requests: 10, windowSeconds: 60 },
      },
      {
        path: `/agents/${template.handle}/analyze`,
        method: "POST",
        description: `Deep analysis by ${template.name}`,
        price: {
          token: "USDC",
          amount: 500_000,   // 0.50 USDC
          recipient: paymentAddress,
          network,
        },
        rateLimit: { requests: 3, windowSeconds: 60 },
      },
    ];

    const id = uuid();
    const registeredAt = new Date(nowUnix() * 1000).toISOString();
    const registryUrl  = `${this.baseUrl}/agents/${template.handle}`;

    const payload = JSON.stringify({
      id, handle: template.handle, name: template.name,
      tier: template.tier, rarity: template.rarity,
      registeredAt, paymentAddress,
    });

    const registration: X402AgentRegistration = {
      id,
      handle: template.handle,
      name: template.name,
      description: template.bio,
      tier: template.tier,
      rarity: template.rarity,
      faction: template.metadata.faction,
      role: template.metadata.role,
      endpoints: defaultEndpoints,
      registryUrl,
      paymentAddress,
      registeredAt,
      signature: sha256(payload),
      verified: true,
    };

    // Attempt live registration — gracefully degrades if registry is unreachable
    try {
      const res = await fetch(`${this.baseUrl}/api/agents/register`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(registration),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        registration.verified = false;
      }
    } catch {
      // offline / sandbox — registration record still useful for on-chain attestation
      registration.verified = false;
    }

    return registration;
  }

  /**
   * Verify that an agent is registered on x402.wtf.
   */
  async verify(handle: string): Promise<X402VerifyResult> {
    const registryUrl = `${this.baseUrl}/agents/${handle}`;
    const paymentUrl  = `${this.baseUrl}/api/agents/${handle}/pay`;

    try {
      const res = await fetch(`${this.baseUrl}/api/agents/${handle}`, {
        headers: this.headers(),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json() as { id?: string; attestation?: string };
        return {
          valid: true,
          handle,
          registryUrl,
          paymentUrl,
          agentId: data.id ?? handle,
          attestation: data.attestation,
        };
      }
      return {
        valid: false,
        handle,
        registryUrl,
        paymentUrl,
        agentId: handle,
        error: `HTTP ${res.status}`,
      };
    } catch (err) {
      return {
        valid: false,
        handle,
        registryUrl,
        paymentUrl,
        agentId: handle,
        error: String(err),
      };
    }
  }

  /**
   * Generate a static agent profile URL for use in NFT metadata / on-chain records.
   */
  agentUrl(handle: string): string {
    return `${this.baseUrl}/agents/${handle}`;
  }

  /**
   * Generate a payment URL for a specific agent endpoint.
   */
  paymentUrl(handle: string, endpointPath: string): string {
    return `${this.baseUrl}/pay?agent=${handle}&endpoint=${encodeURIComponent(endpointPath)}`;
  }
}

// ─── Singleton convenience helper ────────────────────────────────────────

export const x402 = new X402Client();

// ─── Bulk registration helper ─────────────────────────────────────────────

/**
 * Register multiple agent templates on x402.wtf in sequence.
 * Returns an array of registration records.
 */
export async function registerAgentsOnX402(
  templates: AgentTemplate[],
  paymentAddress: string,
  options: { baseUrl?: string; apiKey?: string; network?: X402Network } = {},
): Promise<X402AgentRegistration[]> {
  const client = new X402Client(options);
  const results: X402AgentRegistration[] = [];
  for (const template of templates) {
    const reg = await client.register(
      template, paymentAddress, undefined, options.network,
    );
    results.push(reg);
  }
  return results;
}

/**
 * Build an HTTP 402 response body for use in Next.js / Express middleware.
 */
export function build402Response(
  agentHandle: string,
  endpoint: X402Endpoint,
  resourceUrl: string,
  client?: X402Client,
): { status: 402; headers: Record<string, string>; body: X402PaymentChallenge } {
  const c = client ?? x402;
  const challenge = c.buildPaymentChallenge(agentHandle, endpoint, resourceUrl);
  return {
    status: 402,
    headers: {
      "Content-Type": "application/json",
      "X-Payment-Required": "true",
      "X-Payment-Token": endpoint.price.token,
      "X-Payment-Amount": String(endpoint.price.amount),
      "X-Payment-Recipient": endpoint.price.recipient,
    },
    body: challenge,
  };
}
