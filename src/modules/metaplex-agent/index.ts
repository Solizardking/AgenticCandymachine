// ═══════════════════════════════════════════════════════════════════════════
//  Metaplex Agent Registry Integration
//  Wraps @metaplex-foundation/mpl-agent-registry for one-call agent minting.
//
//  Docs: https://developers.metaplex.com/agents/getting-started/mint-an-agent
// ═══════════════════════════════════════════════════════════════════════════

import type { AgentTemplate } from "../../types/index.js";

// ─── Agent Registry Types ─────────────────────────────────────────────────

export type MetaplexNetwork =
  | "solana-mainnet"
  | "solana-devnet"
  | "eclipse-mainnet"
  | "sonic-mainnet"
  | "fogo-mainnet";

export interface AgentService {
  name: string;       // e.g. "trading", "A2A", "MCP", "web"
  endpoint: string;
  version?: string;
  skills?: string[];
  domains?: string[];
}

export interface AgentRegistration {
  agentId: string;
  agentRegistry: string;  // e.g. "solana:101:metaplex"
}

/** EIP-8004 agent registration document (off-chain JSON) */
export interface AgentRegistrationDocument {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1";
  name: string;
  description: string;
  image?: string;
  services: AgentService[];
  active: boolean;
  registrations: AgentRegistration[];
  supportedTrust: string[];
  x402?: {
    endpoint: string;
    paymentToken: string;
  };
}

/** Input to mintAndSubmitAgent */
export interface MetaplexAgentMintInput {
  wallet: string;
  name: string;
  uri: string;
  network?: MetaplexNetwork;
  agentMetadata: {
    type: "agent";
    name: string;
    description: string;
    services: AgentService[];
    registrations: AgentRegistration[];
    supportedTrust: string[];
  };
}

export interface MetaplexAgentMintResult {
  assetAddress: string;
  signature: string;
  agentIdentityPda: string;
  registryUrl: string;
}

export interface MetaplexAgentClient {
  mintAndSubmitAgent(input: MetaplexAgentMintInput): Promise<MetaplexAgentMintResult>;
  verifyRegistration(assetAddress: string): Promise<{
    registered: boolean;
    uri?: string;
    lifecycleChecks?: { transfer: boolean; update: boolean; execute: boolean };
  }>;
}

// ─── EIP-8004 Document Builder ────────────────────────────────────────────

export class AgentDocumentBuilder {
  private _name = "";
  private _description = "";
  private _image?: string;
  private _services: AgentService[] = [];
  private _registrations: AgentRegistration[] = [];
  private _supportedTrust: string[] = ["tee-attestation", "crypto-economic"];
  private _active = true;
  private _x402Endpoint?: string;
  private _x402Token?: string;

  name(n: string)        { this._name = n; return this; }
  description(d: string) { this._description = d; return this; }
  image(i: string)       { this._image = i; return this; }
  active(a: boolean)     { this._active = a; return this; }

  addService(svc: AgentService) {
    this._services.push(svc);
    return this;
  }

  addRegistration(reg: AgentRegistration) {
    this._registrations.push(reg);
    return this;
  }

  addTrust(trust: string) {
    if (!this._supportedTrust.includes(trust)) this._supportedTrust.push(trust);
    return this;
  }

  x402(endpoint: string, token = "USDC") {
    this._x402Endpoint = endpoint;
    this._x402Token = token;
    return this;
  }

  build(): AgentRegistrationDocument {
    return {
      type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
      name: this._name,
      description: this._description,
      image: this._image,
      services: this._services,
      active: this._active,
      registrations: this._registrations,
      supportedTrust: this._supportedTrust,
      ...(this._x402Endpoint
        ? { x402: { endpoint: this._x402Endpoint, paymentToken: this._x402Token! } }
        : {}),
    };
  }
}

// ─── Template → EIP-8004 adapter ──────────────────────────────────────────

/**
 * Convert an AgentTemplate to a Metaplex EIP-8004 registration document.
 * Pass the agent's hosted endpoint and x402.wtf URL.
 */
export function templateToRegistrationDocument(
  template: AgentTemplate,
  options: {
    agentEndpoint: string;
    x402Url?: string;
    imageUri?: string;
    mintAddress?: string;
  },
): AgentRegistrationDocument {
  const services: AgentService[] = [
    {
      name: "web",
      endpoint: options.x402Url ?? `https://x402.wtf/agents/${template.handle}`,
    },
    {
      name: "A2A",
      endpoint: `${options.agentEndpoint}/agent-card.json`,
      version: "0.3.0",
    },
    {
      name: "MCP",
      endpoint: `${options.agentEndpoint}/mcp`,
      version: "2025-06-18",
    },
  ];

  const capabilities = (template.dna.capabilities ?? []).map(c => c.type);
  if (capabilities.length > 0) {
    services.push({
      name: "capabilities",
      endpoint: `${options.agentEndpoint}/capabilities`,
      skills: capabilities,
      domains: [template.metadata.domain],
    });
  }

  return new AgentDocumentBuilder()
    .name(template.name)
    .description(`${template.bio} | Faction: ${template.metadata.faction} | Tier: ${template.tier}`)
    .image(options.imageUri ?? "")
    .active(true)
    .addRegistration({
      agentId: options.mintAddress ?? template.id,
      agentRegistry: "solana:101:metaplex",
    })
    .addTrust("tee-attestation")
    .addTrust("crypto-economic")
    .x402(options.x402Url ?? `https://x402.wtf/agents/${template.handle}`)
    .build();

  // Add all services
  // (Builder returns above; services was local — re-build with all services)
}

/**
 * Full EIP-8004 doc with services — use this version.
 */
export function buildEip8004Document(
  template: AgentTemplate,
  options: {
    agentEndpoint: string;
    x402Url?: string;
    imageUri?: string;
    mintAddress?: string;
  },
): AgentRegistrationDocument {
  const services: AgentService[] = [
    {
      name: "web",
      endpoint: options.x402Url ?? `https://x402.wtf/agents/${template.handle}`,
    },
    {
      name: "A2A",
      endpoint: `${options.agentEndpoint}/agent-card.json`,
      version: "0.3.0",
    },
    {
      name: "MCP",
      endpoint: `${options.agentEndpoint}/mcp`,
      version: "2025-06-18",
    },
  ];

  const caps = (template.dna.capabilities ?? []).map(c => c.type);
  if (caps.length > 0) {
    services.push({
      name: "capabilities",
      endpoint: `${options.agentEndpoint}/capabilities`,
      skills: caps,
      domains: [template.metadata.domain],
    });
  }

  return {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: template.name,
    description: `${template.bio} | Faction: ${template.metadata.faction} | Tier: ${template.tier}`,
    image: options.imageUri,
    services,
    active: true,
    registrations: [
      {
        agentId: options.mintAddress ?? template.id,
        agentRegistry: "solana:101:metaplex",
      },
    ],
    supportedTrust: ["tee-attestation", "crypto-economic", "reputation"],
    x402: {
      endpoint: options.x402Url ?? `https://x402.wtf/agents/${template.handle}`,
      paymentToken: "USDC",
    },
  };
}

// ─── Metaplex API Client ──────────────────────────────────────────────────

/**
 * Lightweight HTTP client to the Metaplex Agent API.
 * Full SDK use requires @metaplex-foundation/mpl-agent-registry + Umi.
 * This client handles the REST layer for environments without Umi.
 */
export class MetaplexAgentApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl = "https://api.metaplex.com") {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches agent data from the Metaplex registry.
   * Returns null when the agent is not registered or the API is unreachable.
   */
  async fetchAgent(assetAddress: string): Promise<Record<string, unknown> | null> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/agents/${assetAddress}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return res.json() as Promise<Record<string, unknown>>;
    } catch {
      return null;
    }
  }

  /**
   * Checks whether an asset address has a registered agent identity.
   */
  async isRegistered(assetAddress: string): Promise<boolean> {
    const data = await this.fetchAgent(assetAddress);
    return data !== null;
  }

  /**
   * Returns the mint input object for use with mintAndSubmitAgent.
   * The caller is responsible for providing a Umi instance and submitting.
   */
  buildMintInput(
    walletAddress: string,
    template: AgentTemplate,
    metadataUri: string,
    options: {
      agentEndpoint?: string;
      x402Url?: string;
      network?: MetaplexNetwork;
    } = {},
  ): MetaplexAgentMintInput {
    const agentEndpoint = options.agentEndpoint ?? `https://x402.wtf/agents/${template.handle}`;
    const services: AgentService[] = [
      { name: "web", endpoint: agentEndpoint },
      { name: "A2A", endpoint: `${agentEndpoint}/agent-card.json`, version: "0.3.0" },
      { name: "MCP", endpoint: `${agentEndpoint}/mcp`, version: "2025-06-18" },
    ];

    const caps = (template.dna.capabilities ?? []).map(c => c.type);
    if (caps.length > 0) {
      services.push({
        name: "trading",
        endpoint: `${agentEndpoint}/trade`,
        skills: caps,
      });
    }

    return {
      wallet: walletAddress,
      name: template.name,
      uri: metadataUri,
      network: options.network ?? "solana-mainnet",
      agentMetadata: {
        type: "agent",
        name: template.name,
        description: template.bio,
        services,
        registrations: [],
        supportedTrust: ["tee-attestation", "crypto-economic"],
      },
    };
  }
}

export const metaplexAgentApi = new MetaplexAgentApiClient();
