import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  AGENTIC CANDY MACHINE — Full Stack Application
//  DNA → Art → Token → Candy Machine → Recursive Metadata → Mint
//  Solana × Metaplex × RedPill TEE × Recursive NFTs
// ═══════════════════════════════════════════════════════════════

// ─── Design Tokens ───────────────────────────────────────────
const C = {
  abyss: "#06060e",
  deep: "#0a0b18",
  mid: "#0f1024",
  panel: "rgba(12,13,30,0.85)",
  card: "rgba(16,17,38,0.7)",
  cardHover: "rgba(22,24,52,0.8)",
  purple: "#9945FF",
  purpleDim: "#7733cc",
  purpleGlow: "rgba(153,69,255,0.15)",
  green: "#14F195",
  greenDim: "#0fb876",
  greenGlow: "rgba(20,241,149,0.12)",
  gold: "#FFD700",
  goldGlow: "rgba(255,215,0,0.15)",
  cyan: "#00D4FF",
  red: "#FF4466",
  text: "#e8e6f0",
  textDim: "#8b89a3",
  textMuted: "#5a587a",
  border: "rgba(153,69,255,0.12)",
  borderActive: "rgba(20,241,149,0.3)",
};

const FONTS = {
  display: "'Oxanium', 'Orbitron', sans-serif",
  body: "'IBM Plex Mono', 'JetBrains Mono', monospace",
  accent: "'Chakra Petch', sans-serif",
};

// ─── Phase Definitions ───────────────────────────────────────
const PHASES = [
  { id: "dna",     label: "DNA LAB",       icon: "🧬", desc: "Agent identity & capabilities" },
  { id: "art",     label: "ART FORGE",     icon: "🎨", desc: "Generate NFT artwork" },
  { id: "token",   label: "TOKEN",         icon: "🪙", desc: "SPL token + bonding curve" },
  { id: "candy",   label: "CANDY MACHINE", icon: "🍬", desc: "Metaplex configuration" },
  { id: "recursive",label: "RECURSION",    icon: "♾️", desc: "Recursive metadata tree" },
  { id: "x402",    label: "x402 PAY",      icon: "💳", desc: "HTTP 402 payment gating" },
  { id: "mint",    label: "MINT",          icon: "⚡", desc: "Deploy & mint on Solana" },
];

const TIERS = [
  { id: "OBSERVER", name: "Observer", level: 0, color: "#666", perms: ["read"], price: "Free" },
  { id: "AGENT", name: "Agent", level: 1, color: C.purple, perms: ["read","execute"], price: "0.05 SOL" },
  { id: "OPERATOR", name: "Operator", level: 2, color: C.green, perms: ["read","execute","delegate"], price: "0.1 SOL" },
  { id: "SOVEREIGN", name: "Sovereign", level: 3, color: C.gold, perms: ["read","execute","delegate","mint","attest"], price: "1 SOL" },
];

const CAPABILITIES = [
  { id: "trade", name: "Token Swap", icon: "⇄", desc: "Jupiter aggregator trading" },
  { id: "social", name: "Social Agent", icon: "📡", desc: "Twitter/X & Farcaster" },
  { id: "payment", name: "X402 Pay", icon: "💳", desc: "HTTP 402 micropayments" },
  { id: "analysis", name: "Analytics", icon: "📊", desc: "Birdeye market data" },
  { id: "mint", name: "NFT Minter", icon: "🖼", desc: "Autonomous minting" },
  { id: "governance", name: "Governance", icon: "🏛", desc: "DAO voting & proposals" },
  { id: "defi", name: "DeFi Yield", icon: "🌾", desc: "Farming & liquidity" },
  { id: "voice", name: "Voice Agent", icon: "🎙", desc: "Speech-to-trade" },
];

const MODELS = [
  { id: "glm-flash",      name: "GLM-4.7 Flash",        provider: "RedPill TEE", tag: "z-ai/glm-4.7-flash" },
  { id: "phala-24b",      name: "Phala Uncensored 24B",  provider: "RedPill TEE", tag: "phala/uncensored-24b" },
  { id: "claude-sonnet46",name: "Claude Sonnet 4.6",     provider: "Anthropic (Clawd RWA)", tag: "claude-sonnet-4-6" },
  { id: "claude-opus48",  name: "Claude Opus 4.8",       provider: "Anthropic",   tag: "claude-opus-4-8" },
  { id: "gpt-4o",         name: "GPT-4o",                provider: "OpenAI",      tag: "gpt-4o" },
  { id: "grok-3",         name: "Grok-3",                provider: "xAI",         tag: "grok-3" },
  { id: "gemini-2.5",     name: "Gemini 2.5 Pro",        provider: "Google",      tag: "gemini-2.5-pro" },
];

const X402_PAYMENT_TOKENS = [
  { id: "USDC", symbol: "USDC", name: "USD Coin",  decimals: 6, mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { id: "SOL",  symbol: "SOL",  name: "Solana",    decimals: 9, mint: "So11111111111111111111111111111111111111112" },
  { id: "BONK", symbol: "BONK", name: "Bonk",      decimals: 5, mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { id: "JUP",  symbol: "JUP",  name: "Jupiter",   decimals: 6, mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
];

const METAPLEX_NETWORKS = [
  { id: "solana-mainnet", label: "Solana Mainnet", rpc: "https://api.mainnet-beta.solana.com" },
  { id: "solana-devnet",  label: "Solana Devnet",  rpc: "https://api.devnet.solana.com" },
  { id: "eclipse-mainnet",label: "Eclipse",        rpc: "https://mainnetbeta-rpc.eclipse.xyz" },
  { id: "sonic-mainnet",  label: "Sonic",          rpc: "https://api.mainnet.sonic.game" },
];

const GUARD_PRESETS = [
  { id: "open", name: "Open Mint", desc: "No restrictions, anyone can mint", guards: {} },
  { id: "paid", name: "SOL Payment", desc: "Charge SOL per mint", guards: { solPayment: true } },
  { id: "gated", name: "Token Gated", desc: "Require token holdings", guards: { tokenGate: true } },
  { id: "allowlist", name: "Allow List", desc: "Whitelist-only access", guards: { allowList: true } },
  { id: "tiered", name: "Tiered Groups", desc: "Multiple price tiers", guards: { tiered: true } },
  { id: "timed", name: "Timed Release", desc: "Start/end date windows", guards: { startDate: true, endDate: true } },
];

const ART_STYLES = [
  { id: "passport", name: "Holographic Passport", preview: "linear-gradient(135deg, #9945FF44, #14F19544, #FFD70044)" },
  { id: "circuit", name: "Circuit Mandala", preview: "linear-gradient(135deg, #0f1024, #9945FF33, #14F19522)" },
  { id: "abstract", name: "Fractal Recursive", preview: "linear-gradient(135deg, #14F19533, #00D4FF33, #9945FF22)" },
  { id: "avatar", name: "Neural Portrait", preview: "linear-gradient(135deg, #FF446622, #9945FF44, #14F19522)" },
  { id: "glitch", name: "Glitch Artifact", preview: "linear-gradient(135deg, #FF446633, #00D4FF33, #FFD70022)" },
  { id: "cosmic", name: "Cosmic Genesis", preview: "linear-gradient(135deg, #06060e, #9945FF22, #FFD70033)" },
];

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AgenticCandyMachine() {
  const [phase, setPhase] = useState(0);
  const [animating, setAnimating] = useState(false);

  // ─── DNA State ─────────────────────────────────────────
  const [agentName, setAgentName] = useState("");
  const [agentHandle, setAgentHandle] = useState("");
  const [agentBio, setAgentBio] = useState("");
  const [agentPersonality, setAgentPersonality] = useState("");
  const [tier, setTier] = useState("AGENT");
  const [capabilities, setCapabilities] = useState(new Set(["trade"]));
  const [primaryModel, setPrimaryModel] = useState("glm-flash");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [lore, setLore] = useState("");

  // ─── Art State ─────────────────────────────────────────
  const [artStyle, setArtStyle] = useState("passport");
  const [artPrompt, setArtPrompt] = useState("");
  const [artProvider, setArtProvider] = useState("google");
  const [generatedArt, setGeneratedArt] = useState(null);
  const [artGenerating, setArtGenerating] = useState(false);

  // ─── Token State ───────────────────────────────────────
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [tokenSupply, setTokenSupply] = useState("1000000");
  const [tokenMintAuth, setTokenMintAuth] = useState(true);
  const [tokenFreezeAuth, setTokenFreezeAuth] = useState(false);

  // ─── Candy Machine State ───────────────────────────────
  const [cmItemsAvailable, setCmItemsAvailable] = useState(1000);
  const [cmSellerFee, setCmSellerFee] = useState(500);
  const [cmTokenStandard, setCmTokenStandard] = useState("ProgrammableNonFungible");
  const [cmGuardPreset, setCmGuardPreset] = useState("tiered");
  const [cmMintPrice, setCmMintPrice] = useState(0.1);
  const [cmStartDate, setCmStartDate] = useState("");
  const [cmEndDate, setCmEndDate] = useState("");
  const [cmMintLimit, setCmMintLimit] = useState(5);
  const [cmHidden, setCmHidden] = useState(false);
  const [cmSequential, setCmSequential] = useState(false);

  // ─── Recursive State ───────────────────────────────────
  const [recursionDepth, setRecursionDepth] = useState(3);
  const [recursionActions, setRecursionActions] = useState(["resolve", "execute", "compose"]);
  const [recursionPreview, setRecursionPreview] = useState(null);

  // ─── x402 State ───────────────────────────────────────
  const [x402PaymentToken, setX402PaymentToken] = useState("USDC");
  const [x402PricePerCall, setX402PricePerCall] = useState("100000");
  const [x402StreamPrice, setX402StreamPrice] = useState("150000");
  const [x402EmbedPrice, setX402EmbedPrice] = useState("10000");
  const [x402RateLimit, setX402RateLimit] = useState("20");
  const [x402Registered, setX402Registered] = useState(false);
  const [x402Registering, setX402Registering] = useState(false);

  // ─── Metaplex Agent State ──────────────────────────────
  const [metaplexNetwork, setMetaplexNetwork] = useState("solana-devnet");
  const [metaplexMetadataUri, setMetaplexMetadataUri] = useState("");
  const [metaplexAssetAddress, setMetaplexAssetAddress] = useState("");
  const [metaplexMinting, setMetaplexMinting] = useState(false);
  const [metaplexMinted, setMetaplexMinted] = useState(false);
  const [metaplexTxSig, setMetaplexTxSig] = useState("");
  const [launchBondingCurve, setLaunchBondingCurve] = useState(true);
  const [creatorFeePercent, setCreatorFeePercent] = useState("2.5");

  // ─── Mint State ────────────────────────────────────────
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("devnet");
  const [rpcEndpoint, setRpcEndpoint] = useState("");
  const [redpillKey, setRedpillKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployPhase, setDeployPhase] = useState("");
  const [deployed, setDeployed] = useState(false);
  const [mintLog, setMintLog] = useState([]);

  // ─── Shared ────────────────────────────────────────────
  const [attestations, setAttestations] = useState([]);
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);

  // Sync token name with agent
  useEffect(() => {
    if (agentName && !tokenName) setTokenName(agentName + " Token");
    if (agentName && !tokenSymbol) setTokenSymbol(agentName.slice(0, 4).toUpperCase());
  }, [agentName]);

  // ─── Phase Navigation ──────────────────────────────────
  const goPhase = (idx) => {
    if (idx === phase || animating) return;
    setAnimating(true);
    setTimeout(() => { setPhase(idx); setAnimating(false); }, 300);
  };

  const nextPhase = () => { if (phase < 6) goPhase(phase + 1); };
  const prevPhase = () => { if (phase > 0) goPhase(phase - 1); };

  // ─── Capability Toggle ─────────────────────────────────
  const toggleCap = (id) => {
    const next = new Set(capabilities);
    next.has(id) ? next.delete(id) : next.add(id);
    setCapabilities(next);
  };

  // ─── Art Generation (simulated) ────────────────────────
  const generateArt = () => {
    setArtGenerating(true);
    setTimeout(() => {
      setGeneratedArt({
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        style: artStyle,
        prompt: artPrompt,
        provider: artProvider,
        timestamp: Date.now(),
      });
      setAttestations(prev => [...prev, {
        id: Math.random().toString(36).slice(2, 10),
        action: "art_generation",
        model: artProvider === "google" ? "gemini-2.0-flash-exp" : "nanobanan-v1",
        verified: true,
        timestamp: new Date().toISOString(),
      }]);
      setArtGenerating(false);
    }, 3000);
  };

  // ─── Recursive Tree Preview ────────────────────────────
  const generateRecursionPreview = () => {
    const tree = buildTreePreview(agentName || "Agent", capabilities, recursionDepth, 0);
    setRecursionPreview(tree);
  };

  useEffect(() => { if (phase === 4) generateRecursionPreview(); }, [phase, recursionDepth, capabilities]);

  // ─── Deploy Pipeline (simulated) ───────────────────────
  const deployAll = async () => {
    setDeploying(true);
    setMintLog([]);
    const steps = [
      "Connecting to Solana...",
      "Initializing TEE enclave...",
      "Generating attestation...",
      "Creating Collection NFT...",
      "Uploading metadata to Arweave...",
      "Initializing Candy Machine V2...",
      "Configuring guard groups...",
      "Adding config lines...",
      "Creating SPL token...",
      "Building recursive metadata tree...",
      "Minting passport NFT...",
      "Linking capability modules...",
      "Verifying on-chain state...",
      "Deployment complete ✓",
    ];
    for (let i = 0; i < steps.length; i++) {
      setDeployPhase(steps[i]);
      setMintLog(prev => [...prev, { step: i, msg: steps[i], time: new Date().toLocaleTimeString() }]);
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    }
    setAttestations(prev => [...prev, {
      id: Math.random().toString(36).slice(2, 10),
      action: "full_deployment",
      model: "pipeline",
      verified: true,
      timestamp: new Date().toISOString(),
    }]);
    setDeploying(false);
    setDeployed(true);
  };

  // ─── DNA Hash (visual fingerprint) ─────────────────────
  const dnaHash = useCallback(() => {
    const seed = `${agentName}:${tier}:${[...capabilities].join(",")}:${primaryModel}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0; }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }, [agentName, tier, capabilities, primaryModel]);

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      background: C.abyss, color: C.text, fontFamily: FONTS.body,
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&family=Chakra+Petch:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Global Styles */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.purple}44; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.purple}88; }

        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes drift { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.1); } 100% { transform: translate(0,0) scale(1); } }
        @keyframes drift2 { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,15px) scale(0.95); } 100% { transform: translate(0,0) scale(1); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scanline { 0% { top: -2px; } 100% { top: 100%; } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px ${C.purple}22; } 50% { box-shadow: 0 0 40px ${C.purple}44, 0 0 80px ${C.green}11; } }
        @keyframes borderShift {
          0% { border-color: ${C.purple}22; }
          50% { border-color: ${C.green}33; }
          100% { border-color: ${C.purple}22; }
        }
        @keyframes typewriter { from { width: 0; } to { width: 100%; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes dnaHelix {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes treeGrow {
          from { stroke-dashoffset: 100; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }

        input:focus, textarea:focus, select:focus { outline: none; }
      `}</style>

      {/* ─── Ambient Background ──────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.purple}08 0%, transparent 70%)`,
          top: "-10%", right: "-5%", animation: "drift 25s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.green}06 0%, transparent 70%)`,
          bottom: "-8%", left: "-3%", animation: "drift2 20s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.gold}04 0%, transparent 70%)`,
          top: "40%", left: "50%", animation: "drift 30s ease-in-out infinite",
        }} />
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.015,
          backgroundImage: `linear-gradient(${C.purple}33 1px, transparent 1px), linear-gradient(90deg, ${C.purple}33 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* ─── Top Bar ─────────────────────────────────────── */}
      <div style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", borderBottom: `1px solid ${C.border}`,
        background: `linear-gradient(180deg, ${C.panel}, transparent)`,
        position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: `linear-gradient(135deg, ${C.purple}, ${C.green})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: `0 0 20px ${C.purple}33`,
          }}>🍬</div>
          <div>
            <div style={{ fontFamily: FONTS.display, fontSize: 13, fontWeight: 700, letterSpacing: 3, color: C.text }}>
              AGENTIC CANDY MACHINE
            </div>
            <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: 2 }}>
              SOLANA × METAPLEX × RECURSIVE NFT
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* DNA Hash badge */}
          {agentName && (
            <div style={{
              fontFamily: FONTS.body, fontSize: 10, color: C.green,
              padding: "4px 10px", borderRadius: 4,
              background: `${C.green}0a`, border: `1px solid ${C.green}22`,
              letterSpacing: 1,
            }}>
              DNA: 0x{dnaHash()}
            </div>
          )}
          <div style={{
            fontSize: 10, color: C.textDim, padding: "4px 10px",
            borderRadius: 4, background: C.card, border: `1px solid ${C.border}`,
            letterSpacing: 1,
          }}>
            {network.toUpperCase()} • {attestations.length} ATTESTATIONS
          </div>
        </div>
      </div>

      {/* ─── Phase Navigation ────────────────────────────── */}
      <div style={{
        height: 64, display: "flex", alignItems: "center",
        padding: "0 24px", gap: 4, position: "relative", zIndex: 10,
        borderBottom: `1px solid ${C.border}`,
      }}>
        {PHASES.map((p, i) => {
          const active = i === phase;
          const completed = i < phase;
          const tierColor = i <= phase ? C.purple : C.textMuted;
          return (
            <button key={p.id} onClick={() => goPhase(i)} style={{
              flex: 1, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, border: "none", cursor: "pointer", borderRadius: 6,
              transition: "all 0.3s ease",
              background: active
                ? `linear-gradient(135deg, ${C.purple}18, ${C.green}0a)`
                : "transparent",
              border: active
                ? `1px solid ${C.purple}33`
                : `1px solid transparent`,
              position: "relative", overflow: "hidden",
            }}>
              {active && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${C.purple}, ${C.green})`,
                }} />
              )}
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontFamily: FONTS.display, fontSize: 10, fontWeight: 700,
                  color: active ? C.text : completed ? C.green : C.textMuted,
                  letterSpacing: 2,
                }}>{p.label}</div>
                <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: 0.5 }}>{p.desc}</div>
              </div>
              {completed && (
                <span style={{ fontSize: 10, color: C.green }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Main Content ────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", overflow: "hidden",
        position: "relative", zIndex: 5,
      }}>
        {/* Left: Phase Content */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: "auto", padding: "24px 32px",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(8px)" : "translateY(0)",
          transition: "all 0.3s ease",
        }}>
          {phase === 0 && <PhaseDNA {...{
            agentName, setAgentName, agentHandle, setAgentHandle,
            agentBio, setAgentBio, agentPersonality, setAgentPersonality,
            tier, setTier, capabilities, toggleCap,
            primaryModel, setPrimaryModel, systemPrompt, setSystemPrompt,
            temperature, setTemperature, lore, setLore,
          }} />}
          {phase === 1 && <PhaseArt {...{
            artStyle, setArtStyle, artPrompt, setArtPrompt,
            artProvider, setArtProvider, generatedArt,
            artGenerating, generateArt, agentName, tier,
          }} />}
          {phase === 2 && <PhaseToken {...{
            tokenName, setTokenName, tokenSymbol, setTokenSymbol,
            tokenDecimals, setTokenDecimals, tokenSupply, setTokenSupply,
            tokenMintAuth, setTokenMintAuth, tokenFreezeAuth, setTokenFreezeAuth,
            agentName,
          }} />}
          {phase === 3 && <PhaseCandyMachine {...{
            cmItemsAvailable, setCmItemsAvailable,
            cmSellerFee, setCmSellerFee,
            cmTokenStandard, setCmTokenStandard,
            cmGuardPreset, setCmGuardPreset,
            cmMintPrice, setCmMintPrice,
            cmStartDate, setCmStartDate, cmEndDate, setCmEndDate,
            cmMintLimit, setCmMintLimit,
            cmHidden, setCmHidden, cmSequential, setCmSequential,
            agentName, tier,
          }} />}
          {phase === 4 && <PhaseRecursive {...{
            recursionDepth, setRecursionDepth,
            recursionActions, setRecursionActions,
            recursionPreview, capabilities, agentName, tier,
          }} />}
          {phase === 5 && <PhaseX402 {...{
            agentName, agentHandle: agentHandle || agentName.toLowerCase().replace(/\s+/g, ""),
            x402PaymentToken, setX402PaymentToken,
            x402PricePerCall, setX402PricePerCall,
            x402StreamPrice, setX402StreamPrice,
            x402EmbedPrice, setX402EmbedPrice,
            x402RateLimit, setX402RateLimit,
            x402Registered, setX402Registered,
            x402Registering, setX402Registering,
            walletAddress,
          }} />}
          {phase === 6 && <PhaseMint {...{
            walletAddress, setWalletAddress, network, setNetwork,
            rpcEndpoint, setRpcEndpoint, redpillKey, setRedpillKey,
            googleKey, setGoogleKey,
            deploying, deployPhase, deployed, deployAll, mintLog,
            agentName, tier, capabilities, primaryModel,
            generatedArt, cmItemsAvailable, cmGuardPreset,
            tokenName, tokenSymbol, recursionDepth, attestations,
            // Metaplex agent
            metaplexNetwork, setMetaplexNetwork,
            metaplexMetadataUri, setMetaplexMetadataUri,
            metaplexAssetAddress, setMetaplexAssetAddress,
            metaplexMinting, setMetaplexMinting,
            metaplexMinted, setMetaplexMinted,
            metaplexTxSig, setMetaplexTxSig,
            launchBondingCurve, setLaunchBondingCurve,
            creatorFeePercent, setCreatorFeePercent,
          }} />}
        </div>

        {/* Right: Live Preview Sidebar */}
        <div style={{
          width: 340, borderLeft: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          background: `linear-gradient(180deg, ${C.deep}ee, ${C.abyss}ee)`,
          overflowY: "auto",
        }}>
          <LivePreview {...{
            agentName, agentHandle, tier, capabilities, primaryModel,
            generatedArt, artStyle, tokenName, tokenSymbol,
            cmItemsAvailable, cmGuardPreset, cmTokenStandard,
            recursionDepth, dnaHash: dnaHash(),
            attestations, deployed, phase,
          }} />
        </div>
      </div>

      {/* ─── Bottom Nav ──────────────────────────────────── */}
      <div style={{
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", borderTop: `1px solid ${C.border}`,
        background: `linear-gradient(0deg, ${C.panel}, transparent)`,
        position: "relative", zIndex: 10,
      }}>
        <button onClick={prevPhase} disabled={phase === 0} style={{
          ...btnStyle(false), opacity: phase === 0 ? 0.3 : 1,
        }}>← BACK</button>
        <div style={{ display: "flex", gap: 6 }}>
          {PHASES.map((_, i) => (
            <div key={i} style={{
              width: i === phase ? 24 : 8, height: 4, borderRadius: 2,
              background: i === phase
                ? `linear-gradient(90deg, ${C.purple}, ${C.green})`
                : i < phase ? C.green + "44" : C.textMuted + "33",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
        <button onClick={nextPhase} disabled={phase === 6} style={{
          ...btnStyle(true), opacity: phase === 6 ? 0.3 : 1,
        }}>NEXT →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 0: DNA LAB
// ═══════════════════════════════════════════════════════════════

function PhaseDNA({
  agentName, setAgentName, agentHandle, setAgentHandle,
  agentBio, setAgentBio, agentPersonality, setAgentPersonality,
  tier, setTier, capabilities, toggleCap,
  primaryModel, setPrimaryModel, systemPrompt, setSystemPrompt,
  temperature, setTemperature, lore, setLore,
}) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PhaseHeader icon="🧬" title="DNA LAB" subtitle="Define your agent's genetic code — identity, capabilities, and intelligence model" />

      {/* Identity Section */}
      <Section title="IDENTITY STRAND">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Agent Name" value={agentName} onChange={setAgentName} placeholder="TerminAgent Alpha" />
          <Field label="Handle" value={agentHandle} onChange={setAgentHandle} placeholder="@terminagent" prefix="@" />
        </div>
        <Field label="Bio" value={agentBio} onChange={setAgentBio} placeholder="Autonomous trading agent with deep market analysis capabilities..." multiline rows={3} />
        <Field label="Personality" value={agentPersonality} onChange={setAgentPersonality} placeholder="Aggressive alpha hunter with dry wit and data-driven confidence" />
        <Field label="Lore / Background" value={lore} onChange={setLore} placeholder="Born in the depths of the Solana blockchain during the great bull run of 2025..." multiline rows={3} />
      </Section>

      {/* Tier Selection */}
      <Section title="PASSPORT TIER">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {TIERS.map(t => (
            <button key={t.id} onClick={() => setTier(t.id)} style={{
              padding: "16px 12px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${tier === t.id ? t.color + "66" : C.border}`,
              background: tier === t.id
                ? `linear-gradient(180deg, ${t.color}15, ${t.color}08)`
                : C.card,
              transition: "all 0.2s ease",
              textAlign: "center",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", margin: "0 auto 8px",
                background: `linear-gradient(135deg, ${t.color}33, ${t.color}11)`,
                border: `2px solid ${t.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: t.color, fontWeight: 700,
                fontFamily: FONTS.display,
              }}>{t.level}</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 11, fontWeight: 700, color: tier === t.id ? t.color : C.text, letterSpacing: 1 }}>
                {t.name.toUpperCase()}
              </div>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>{t.price}</div>
              <div style={{ fontSize: 8, color: C.textMuted, marginTop: 6, lineHeight: 1.5 }}>
                {t.perms.join(" · ")}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Capabilities */}
      <Section title="CAPABILITY MODULES">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {CAPABILITIES.map(cap => {
            const active = capabilities.has(cap.id);
            return (
              <button key={cap.id} onClick={() => toggleCap(cap.id)} style={{
                padding: "14px 12px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${active ? C.green + "44" : C.border}`,
                background: active ? `${C.green}08` : C.card,
                transition: "all 0.2s ease", textAlign: "center",
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{cap.icon}</div>
                <div style={{ fontFamily: FONTS.accent, fontSize: 10, fontWeight: 600, color: active ? C.green : C.text, letterSpacing: 0.5 }}>
                  {cap.name}
                </div>
                <div style={{ fontSize: 8, color: C.textMuted, marginTop: 4 }}>{cap.desc}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Model Selection */}
      <Section title="INTELLIGENCE MODEL">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {MODELS.map(m => (
            <button key={m.id} onClick={() => setPrimaryModel(m.id)} style={{
              padding: "14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${primaryModel === m.id ? C.purple + "55" : C.border}`,
              background: primaryModel === m.id ? `${C.purple}0c` : C.card,
              transition: "all 0.2s ease", textAlign: "left",
            }}>
              <div style={{ fontFamily: FONTS.accent, fontSize: 11, fontWeight: 600, color: primaryModel === m.id ? C.purple : C.text }}>
                {m.name}
              </div>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>{m.provider}</div>
              <div style={{ fontSize: 8, color: C.textMuted + "88", marginTop: 2, fontFamily: FONTS.body }}>{m.tag}</div>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div>
            <label style={labelStyle}>Temperature: {temperature}</label>
            <input type="range" min="0" max="2" step="0.1" value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: C.purple }} />
          </div>
          <Field label="System Prompt" value={systemPrompt} onChange={setSystemPrompt} multiline rows={3} placeholder="You are a sovereign agent on Solana..." />
        </div>
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 1: ART FORGE
// ═══════════════════════════════════════════════════════════════

function PhaseArt({ artStyle, setArtStyle, artPrompt, setArtPrompt, artProvider, setArtProvider, generatedArt, artGenerating, generateArt, agentName, tier }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PhaseHeader icon="🎨" title="ART FORGE" subtitle="Generate unique NFT artwork — holographic passports, neural portraits, and recursive fractals" />

      <Section title="ART STYLE">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {ART_STYLES.map(s => (
            <button key={s.id} onClick={() => setArtStyle(s.id)} style={{
              height: 100, borderRadius: 8, cursor: "pointer",
              border: `1px solid ${artStyle === s.id ? C.purple + "66" : C.border}`,
              background: s.preview,
              transition: "all 0.2s ease",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
              padding: 12, position: "relative", overflow: "hidden",
            }}>
              {artStyle === s.id && <div style={{
                position: "absolute", inset: 0, border: `2px solid ${C.purple}88`,
                borderRadius: 8, pointerEvents: "none",
              }} />}
              <div style={{
                fontFamily: FONTS.accent, fontSize: 10, fontWeight: 600,
                color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.8)", letterSpacing: 1,
              }}>{s.name}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="GENERATION">
        <Field label="Custom Prompt (optional)" value={artPrompt} onChange={setArtPrompt} multiline rows={3}
          placeholder="Add custom elements — glowing circuitry, quantum entanglement patterns, specific color emphasis..." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
          <div>
            <label style={labelStyle}>Provider</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[["google","Google Imagen"],["nanobanan","Nano Banana"]].map(([id, name]) => (
                <button key={id} onClick={() => setArtProvider(id)} style={{
                  flex: 1, padding: "10px", borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${artProvider === id ? C.purple + "55" : C.border}`,
                  background: artProvider === id ? `${C.purple}0c` : C.card,
                  fontFamily: FONTS.body, fontSize: 11, color: artProvider === id ? C.purple : C.textDim,
                  transition: "all 0.2s ease",
                }}>{name}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={generateArt} disabled={artGenerating} style={{
              width: "100%", height: 44, borderRadius: 6, border: "none", cursor: "pointer",
              background: artGenerating
                ? C.textMuted + "33"
                : `linear-gradient(135deg, ${C.purple}, ${C.green})`,
              fontFamily: FONTS.display, fontSize: 12, fontWeight: 700,
              color: "#fff", letterSpacing: 2,
              boxShadow: artGenerating ? "none" : `0 4px 20px ${C.purple}33`,
              transition: "all 0.3s ease",
            }}>
              {artGenerating ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                  GENERATING...
                </span>
              ) : "GENERATE ART"}
            </button>
          </div>
        </div>
      </Section>

      {/* Generated Art Preview */}
      {generatedArt && (
        <Section title="GENERATED ARTIFACT">
          <div style={{
            width: "100%", aspectRatio: "1/1", maxWidth: 400, margin: "0 auto",
            borderRadius: 12, overflow: "hidden",
            border: `1px solid ${C.purple}33`,
            background: ART_STYLES.find(s => s.id === generatedArt.style)?.preview || C.card,
            position: "relative",
            animation: "glowPulse 4s ease-in-out infinite",
          }}>
            {/* Simulated art - in production this would be the actual generated image */}
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              <div style={{ fontSize: 48 }}>🎨</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 14, color: C.text, letterSpacing: 2 }}>
                {agentName || "AGENT"} PASSPORT
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, fontFamily: FONTS.body }}>
                Style: {generatedArt.style} • Provider: {generatedArt.provider}
              </div>
              <div style={{
                fontSize: 9, color: C.green, fontFamily: FONTS.body,
                padding: "4px 10px", background: `${C.green}11`, borderRadius: 4,
              }}>
                TEE Attested ✓ • {new Date(generatedArt.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 2: TOKEN FOUNDRY
// ═══════════════════════════════════════════════════════════════

function PhaseToken({ tokenName, setTokenName, tokenSymbol, setTokenSymbol, tokenDecimals, setTokenDecimals, tokenSupply, setTokenSupply, tokenMintAuth, setTokenMintAuth, tokenFreezeAuth, setTokenFreezeAuth, agentName }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PhaseHeader icon="🪙" title="TOKEN FOUNDRY" subtitle="Create an SPL token for your agent's ecosystem — governance, utility, or payment" />

      <Section title="TOKEN IDENTITY">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Token Name" value={tokenName} onChange={setTokenName} placeholder="Agent Token" />
          <Field label="Symbol" value={tokenSymbol} onChange={setTokenSymbol} placeholder="AGNT" maxLength={8} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Field label="Decimals" value={tokenDecimals} onChange={v => setTokenDecimals(parseInt(v) || 0)} type="number" />
          <Field label="Total Supply" value={tokenSupply} onChange={setTokenSupply} placeholder="1000000" />
          <div>
            <label style={labelStyle}>Supply Display</label>
            <div style={{
              ...inputStyle, display: "flex", alignItems: "center",
              color: C.green, fontSize: 13, fontWeight: 600,
            }}>
              {Number(tokenSupply || 0).toLocaleString()} {tokenSymbol}
            </div>
          </div>
        </div>
      </Section>

      <Section title="AUTHORITIES">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Toggle label="Mint Authority" desc="Allow minting new tokens after creation" value={tokenMintAuth} onChange={setTokenMintAuth} />
          <Toggle label="Freeze Authority" desc="Allow freezing token accounts" value={tokenFreezeAuth} onChange={setTokenFreezeAuth} />
        </div>
        <div style={{
          marginTop: 16, padding: 16, borderRadius: 8,
          background: `${C.gold}06`, border: `1px solid ${C.gold}15`,
        }}>
          <div style={{ fontFamily: FONTS.accent, fontSize: 10, color: C.gold, letterSpacing: 1, marginBottom: 6 }}>
            ⚡ TOKEN PROGRAM
          </div>
          <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
            Token will be created via Solana Token-2022 program with metadata extension.
            {!tokenMintAuth && " Mint authority will be revoked after initial supply creation."}
            {tokenFreezeAuth && " Freeze authority enables compliance features."}
          </div>
        </div>
      </Section>

      {/* Token Preview Card */}
      <Section title="PREVIEW">
        <div style={{
          maxWidth: 360, margin: "0 auto", padding: 24, borderRadius: 12,
          background: `linear-gradient(135deg, ${C.purple}11, ${C.green}08)`,
          border: `1px solid ${C.purple}22`, textAlign: "center",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${C.purple}44, ${C.green}44)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, border: `2px solid ${C.purple}33`,
          }}>🪙</div>
          <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: 1 }}>
            {tokenSymbol || "TOKEN"}
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{tokenName || "Unnamed Token"}</div>
          <div style={{ fontSize: 11, color: C.green, marginTop: 12, fontFamily: FONTS.body }}>
            {Number(tokenSupply || 0).toLocaleString()} supply • {tokenDecimals} decimals
          </div>
        </div>
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 3: CANDY MACHINE
// ═══════════════════════════════════════════════════════════════

function PhaseCandyMachine({ cmItemsAvailable, setCmItemsAvailable, cmSellerFee, setCmSellerFee, cmTokenStandard, setCmTokenStandard, cmGuardPreset, setCmGuardPreset, cmMintPrice, setCmMintPrice, cmStartDate, setCmStartDate, cmEndDate, setCmEndDate, cmMintLimit, setCmMintLimit, cmHidden, setCmHidden, cmSequential, setCmSequential, agentName, tier }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PhaseHeader icon="🍬" title="CANDY MACHINE" subtitle="Configure your Metaplex Candy Machine V2 — items, guards, pricing, and token standard" />

      <Section title="MACHINE CONFIG">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Field label="Items Available" value={cmItemsAvailable} onChange={v => setCmItemsAvailable(parseInt(v) || 0)} type="number" />
          <Field label={`Seller Fee (${(cmSellerFee / 100).toFixed(1)}%)`} value={cmSellerFee} onChange={v => setCmSellerFee(parseInt(v) || 0)} type="number" />
          <div>
            <label style={labelStyle}>Token Standard</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[["ProgrammableNonFungible", "pNFT"], ["NonFungible", "NFT"]].map(([val, label]) => (
                <button key={val} onClick={() => setCmTokenStandard(val)} style={{
                  flex: 1, padding: "10px", borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${cmTokenStandard === val ? C.purple + "55" : C.border}`,
                  background: cmTokenStandard === val ? `${C.purple}0c` : C.card,
                  fontFamily: FONTS.body, fontSize: 11,
                  color: cmTokenStandard === val ? C.purple : C.textDim,
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
          <Toggle label="Hidden Settings (Reveal)" desc="Use hidden settings for a reveal mechanic" value={cmHidden} onChange={setCmHidden} />
          <Toggle label="Sequential Minting" desc="Mint NFTs in order instead of random" value={cmSequential} onChange={setCmSequential} />
        </div>
      </Section>

      {/* Guard Presets */}
      <Section title="GUARD CONFIGURATION">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {GUARD_PRESETS.map(g => (
            <button key={g.id} onClick={() => setCmGuardPreset(g.id)} style={{
              padding: "14px 12px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${cmGuardPreset === g.id ? C.green + "44" : C.border}`,
              background: cmGuardPreset === g.id ? `${C.green}08` : C.card,
              transition: "all 0.2s ease", textAlign: "left",
            }}>
              <div style={{ fontFamily: FONTS.accent, fontSize: 11, fontWeight: 600, color: cmGuardPreset === g.id ? C.green : C.text }}>
                {g.name}
              </div>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>{g.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Guard Details */}
      <Section title="GUARD PARAMETERS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Mint Price (SOL)" value={cmMintPrice} onChange={v => setCmMintPrice(parseFloat(v) || 0)} type="number" />
          <Field label="Mint Limit per Wallet" value={cmMintLimit} onChange={v => setCmMintLimit(parseInt(v) || 0)} type="number" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
          <Field label="Start Date" value={cmStartDate} onChange={setCmStartDate} type="datetime-local" />
          <Field label="End Date" value={cmEndDate} onChange={setCmEndDate} type="datetime-local" />
        </div>

        {/* Tiered Groups Preview */}
        {cmGuardPreset === "tiered" && (
          <div style={{ marginTop: 16 }}>
            <label style={{ ...labelStyle, marginBottom: 10, display: "block" }}>TIERED GUARD GROUPS</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {TIERS.map(t => (
                <div key={t.id} style={{
                  padding: 12, borderRadius: 8,
                  background: `${t.color}08`, border: `1px solid ${t.color}22`,
                  textAlign: "center",
                }}>
                  <div style={{ fontFamily: FONTS.display, fontSize: 10, color: t.color, fontWeight: 700, letterSpacing: 1 }}>
                    {t.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 6 }}>{t.price}</div>
                  <div style={{ fontSize: 8, color: C.textMuted, marginTop: 4 }}>
                    {t.id === "OBSERVER" ? "NFT Gate" : t.id === "AGENT" ? "Agent Signer" : t.id === "OPERATOR" ? `Limit: ${cmMintLimit}` : "Unlimited"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 4: RECURSIVE METADATA
// ═══════════════════════════════════════════════════════════════

function PhaseRecursive({ recursionDepth, setRecursionDepth, recursionActions, setRecursionActions, recursionPreview, capabilities, agentName, tier }) {
  const actions = ["resolve", "execute", "compose", "verify", "embed", "transform"];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PhaseHeader icon="♾️" title="RECURSIVE METADATA" subtitle="Build a self-referential metadata tree — NFTs that contain and point to other NFTs" />

      <Section title="RECURSION PARAMETERS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Max Recursion Depth: {recursionDepth}</label>
            <input type="range" min="1" max="7" step="1" value={recursionDepth}
              onChange={e => setRecursionDepth(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: C.purple }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.textMuted, marginTop: 4 }}>
              <span>Shallow</span><span>Deep</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Pointer Actions</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {actions.map(a => {
                const active = recursionActions.includes(a);
                return (
                  <button key={a} onClick={() => {
                    setRecursionActions(active
                      ? recursionActions.filter(x => x !== a)
                      : [...recursionActions, a]);
                  }} style={{
                    padding: "5px 10px", borderRadius: 4, cursor: "pointer",
                    border: `1px solid ${active ? C.cyan + "44" : C.border}`,
                    background: active ? `${C.cyan}0c` : "transparent",
                    fontFamily: FONTS.body, fontSize: 10,
                    color: active ? C.cyan : C.textMuted,
                  }}>{a}</button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* URI Schema */}
      <Section title="POINTER SCHEMA">
        <div style={{
          padding: 16, borderRadius: 8, background: C.card,
          border: `1px solid ${C.border}`, fontFamily: FONTS.body,
        }}>
          <div style={{ fontSize: 11, color: C.cyan, marginBottom: 8 }}>recurse://{"<mint_address>/<depth>/<action>"}</div>
          <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.8 }}>
            Each NFT's metadata contains pointers to child NFTs. When resolved, the tree is traversed
            recursively up to depth {recursionDepth}, executing the specified action at each node.
            Cycle detection prevents infinite loops. Integrity verified via SHA-256 self-hashing.
          </div>
        </div>
      </Section>

      {/* Tree Visualization */}
      <Section title="METADATA TREE">
        {recursionPreview && (
          <div style={{
            padding: 20, borderRadius: 8, background: C.card,
            border: `1px solid ${C.border}`, fontFamily: FONTS.body,
          }}>
            <TreeNode node={recursionPreview} depth={0} maxDepth={recursionDepth} />
          </div>
        )}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 5: x402 PAYMENT GATING
// ═══════════════════════════════════════════════════════════════

function PhaseX402({
  agentName, agentHandle,
  x402PaymentToken, setX402PaymentToken,
  x402PricePerCall, setX402PricePerCall,
  x402StreamPrice, setX402StreamPrice,
  x402EmbedPrice, setX402EmbedPrice,
  x402RateLimit, setX402RateLimit,
  x402Registered, setX402Registered,
  x402Registering, setX402Registering,
  walletAddress,
}) {
  const handle = agentHandle || agentName?.toLowerCase().replace(/\s+/g, "") || "my-agent";
  const registryUrl = `https://x402.wtf/agents/${handle}`;

  const simulate402Register = () => {
    setX402Registering(true);
    setTimeout(() => {
      setX402Registering(false);
      setX402Registered(true);
    }, 2200);
  };

  const endpoints = [
    { path: `infer`,   label: "Inference",  price: x402PricePerCall, icon: "🧠" },
    { path: `stream`,  label: "Streaming",  price: x402StreamPrice,  icon: "⚡" },
    { path: `embed`,   label: "Embeddings", price: x402EmbedPrice,   icon: "🔢" },
  ];

  const selectedToken = X402_PAYMENT_TOKENS.find(t => t.id === x402PaymentToken) || X402_PAYMENT_TOKENS[0];
  const toHuman = (raw) => {
    const n = parseInt(raw, 10) || 0;
    return (n / (10 ** selectedToken.decimals)).toFixed(selectedToken.decimals === 9 ? 6 : 4);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PhaseHeader icon="💳" title="x402 PAY GATE" subtitle="Register payment-gated API endpoints on x402.wtf — agents charge per inference call via HTTP 402" />

      {/* Payment Token */}
      <Section title="PAYMENT TOKEN">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {X402_PAYMENT_TOKENS.map(t => (
            <button key={t.id} onClick={() => setX402PaymentToken(t.id)} style={{
              padding: "14px 10px", borderRadius: 8, cursor: "pointer", textAlign: "center",
              border: `1px solid ${x402PaymentToken === t.id ? `${C.cyan}55` : C.border}`,
              background: x402PaymentToken === t.id ? `${C.cyan}0c` : C.card,
              transition: "all 0.2s ease",
            }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 13, fontWeight: 700, color: x402PaymentToken === t.id ? C.cyan : C.text }}>{t.symbol}</div>
              <div style={{ fontSize: 9, color: C.textMuted, marginTop: 3 }}>{t.name}</div>
              <div style={{ fontSize: 8, color: `${C.textMuted}88`, marginTop: 2, fontFamily: FONTS.body }}>{t.decimals} decimals</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Endpoint Pricing */}
      <Section title="ENDPOINT PRICING">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, alignItems: "end" }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 9, color: C.textMuted, letterSpacing: 2 }}>ENDPOINT</div>
            <div style={{ fontFamily: FONTS.display, fontSize: 9, color: C.textMuted, letterSpacing: 2 }}>AMOUNT (raw)</div>
            <div style={{ fontFamily: FONTS.display, fontSize: 9, color: C.textMuted, letterSpacing: 2 }}>HUMAN</div>
            <div style={{ fontFamily: FONTS.display, fontSize: 9, color: C.textMuted, letterSpacing: 2 }}>RATE LIMIT/min</div>
          </div>
          {[
            { label: "🧠  /infer",   val: x402PricePerCall, set: setX402PricePerCall },
            { label: "⚡  /stream",  val: x402StreamPrice,  set: setX402StreamPrice  },
            { label: "🔢  /embed",   val: x402EmbedPrice,   set: setX402EmbedPrice   },
          ].map(({ label, val, set }, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
              <div style={{
                padding: "10px 12px", borderRadius: 6, fontFamily: FONTS.body,
                fontSize: 11, color: C.cyan, background: `${C.cyan}08`, border: `1px solid ${C.cyan}15`,
              }}>
                /agents/{handle}/{label.split("/")[1]}
              </div>
              <input value={val} onChange={e => set(e.target.value)} style={{ ...inputStyle, textAlign: "right" }} type="number" />
              <div style={{ ...inputStyle, color: C.green, fontWeight: 600, fontSize: 12 }}>
                {toHuman(val)} {selectedToken.symbol}
              </div>
              {i === 0 && (
                <input value={x402RateLimit} onChange={e => setX402RateLimit(e.target.value)}
                  style={{ ...inputStyle, textAlign: "right" }} type="number" placeholder="20" />
              )}
              {i > 0 && <div style={{ ...inputStyle, color: C.textMuted }}>—</div>}
            </div>
          ))}
        </div>
      </Section>

      {/* Payment Flow Diagram */}
      <Section title="HTTP 402 FLOW">
        <div style={{
          padding: 20, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`,
          fontFamily: FONTS.body, fontSize: 11, lineHeight: 2,
        }}>
          {[
            [`Client`, `POST /agents/${handle}/infer`, C.text],
            [`Server`, `← 402 Payment Required { x402 challenge, payTo: ${walletAddress?.slice(0,8) || "YOUR_WALLET"}..., amount: ${toHuman(x402PricePerCall)} ${selectedToken.symbol} }`, C.gold],
            [`Client`, `pays on-chain → proof header`, C.cyan],
            [`Server`, `← 200 OK { inference result }`, C.green],
          ].map(([actor, msg, color], i) => (
            <div key={i} style={{ display: "flex", gap: 12 }}>
              <span style={{ minWidth: 50, color: C.textMuted, fontSize: 9, paddingTop: 2 }}>{actor}</span>
              <span style={{ color }}>{msg}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Registration */}
      <Section title="REGISTER ON x402.wtf">
        <div style={{
          padding: 16, borderRadius: 8, marginBottom: 16,
          background: `${C.cyan}06`, border: `1px solid ${C.cyan}15`,
        }}>
          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>Registry URL</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 12, color: C.cyan }}>{registryUrl}</div>
        </div>

        {!x402Registered ? (
          <button type="button" onClick={simulate402Register} disabled={x402Registering} style={{
            width: "100%", height: 48, borderRadius: 8, border: "none", cursor: "pointer",
            background: x402Registering ? `${C.textMuted}22` : `linear-gradient(135deg, ${C.cyan}, ${C.green})`,
            fontFamily: FONTS.display, fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 2,
            boxShadow: x402Registering ? "none" : `0 4px 20px ${C.cyan}33`,
            transition: "all 0.3s ease",
          }}>
            {x402Registering
              ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: 8 }}>
                  <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> REGISTERING...
                </span>
              : "💳 REGISTER ON x402.wtf"}
          </button>
        ) : (
          <div style={{
            padding: 16, borderRadius: 8, textAlign: "center",
            background: `${C.green}0a`, border: `1px solid ${C.green}22`,
          }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 12, color: C.green, letterSpacing: 2, fontWeight: 700 }}>
              ✓ REGISTERED ON x402.wtf
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 6 }}>{registryUrl}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
              {endpoints.map(ep => (
                <div key={ep.path} style={{
                  padding: "6px 12px", borderRadius: 4,
                  background: `${C.cyan}0a`, border: `1px solid ${C.cyan}15`,
                  fontSize: 9, color: C.cyan,
                }}>
                  {ep.icon} /{ep.path} • {toHuman(ep.price)} {selectedToken.symbol}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 6: MINT PORTAL
// ═══════════════════════════════════════════════════════════════

function PhaseMint({
  walletAddress, setWalletAddress, network, setNetwork,
  rpcEndpoint, setRpcEndpoint, redpillKey, setRedpillKey,
  googleKey, setGoogleKey,
  deploying, deployPhase, deployed, deployAll, mintLog,
  agentName, tier, capabilities, primaryModel,
  generatedArt, cmItemsAvailable, cmGuardPreset,
  tokenName, tokenSymbol, recursionDepth, attestations,
}) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PhaseHeader icon="⚡" title="MINT PORTAL" subtitle="Connect your wallet, configure keys, and deploy everything to Solana" />

      {!deployed ? (
        <>
          <Section title="WALLET & NETWORK">
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              <Field label="Wallet Address" value={walletAddress} onChange={setWalletAddress} placeholder="Your Solana wallet address..." />
              <div>
                <label style={labelStyle}>Network</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["devnet","mainnet-beta"].map(n => (
                    <button key={n} onClick={() => setNetwork(n)} style={{
                      flex: 1, padding: "10px", borderRadius: 6, cursor: "pointer",
                      border: `1px solid ${network === n ? C.green + "44" : C.border}`,
                      background: network === n ? `${C.green}08` : C.card,
                      fontFamily: FONTS.body, fontSize: 10,
                      color: network === n ? C.green : C.textDim,
                    }}>{n === "mainnet-beta" ? "MAINNET" : "DEVNET"}</button>
                  ))}
                </div>
              </div>
            </div>
            <Field label="RPC Endpoint (optional)" value={rpcEndpoint} onChange={setRpcEndpoint} placeholder="https://api.devnet.solana.com" />
          </Section>

          <Section title="API KEYS">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="RedPill API Key" value={redpillKey} onChange={setRedpillKey} placeholder="sk-..." type="password" />
              <Field label="Google API Key" value={googleKey} onChange={setGoogleKey} placeholder="AIza..." type="password" />
            </div>
          </Section>

          {/* Deployment Summary */}
          <Section title="DEPLOYMENT SUMMARY">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Agent", agentName || "—"],
                ["Tier", tier],
                ["Capabilities", capabilities?.size || 0],
                ["Model", MODELS.find(m => m.id === primaryModel)?.name || "—"],
                ["Art", generatedArt ? "Generated ✓" : "Not generated"],
                ["Token", tokenName || "—"],
                ["Candy Machine", `${cmItemsAvailable} items`],
                ["Guards", cmGuardPreset],
                ["Recursion Depth", recursionDepth],
                ["Token Standard", "pNFT"],
                ["Network", network],
                ["Attestations", attestations?.length || 0],
              ].map(([k, v], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 12px",
                  borderRadius: 6, background: C.card, border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{k}</span>
                  <span style={{ fontSize: 10, color: C.text, fontWeight: 500 }}>{String(v)}</span>
                </div>
              ))}
            </div>

            <button onClick={deployAll} disabled={deploying} style={{
              width: "100%", height: 56, marginTop: 20, borderRadius: 8,
              border: "none", cursor: deploying ? "default" : "pointer",
              background: deploying
                ? `${C.textMuted}22`
                : `linear-gradient(135deg, ${C.purple}, ${C.green})`,
              fontFamily: FONTS.display, fontSize: 14, fontWeight: 700,
              color: "#fff", letterSpacing: 3,
              boxShadow: deploying ? "none" : `0 4px 30px ${C.purple}44, 0 4px 30px ${C.green}22`,
              transition: "all 0.3s ease",
            }}>
              {deploying ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                  {deployPhase}
                </span>
              ) : "🚀 DEPLOY TO SOLANA"}
            </button>
          </Section>

          {/* Deploy Log */}
          {mintLog.length > 0 && (
            <Section title="DEPLOYMENT LOG">
              <div style={{
                maxHeight: 300, overflowY: "auto", borderRadius: 8,
                background: C.card, border: `1px solid ${C.border}`, padding: 12,
              }}>
                {mintLog.map((log, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, padding: "6px 0",
                    borderBottom: i < mintLog.length - 1 ? `1px solid ${C.border}` : "none",
                    animation: "slideIn 0.3s ease-out",
                    animationFillMode: "both",
                    animationDelay: `${i * 0.05}s`,
                  }}>
                    <span style={{ fontSize: 9, color: C.textMuted, minWidth: 70 }}>{log.time}</span>
                    <span style={{ fontSize: 10, color: log.msg.includes("✓") ? C.green : C.text }}>
                      {log.msg}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      ) : (
        <DeployedView {...{
          agentName, tier, capabilities, tokenName, tokenSymbol,
          cmItemsAvailable, recursionDepth, network, attestations, walletAddress,
        }} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DEPLOYED SUCCESS VIEW
// ═══════════════════════════════════════════════════════════════

function DeployedView({ agentName, tier, capabilities, tokenName, tokenSymbol, cmItemsAvailable, recursionDepth, network, attestations, walletAddress }) {
  const tierData = TIERS.find(t => t.id === tier);
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px",
        background: `linear-gradient(135deg, ${C.purple}33, ${C.green}33)`,
        border: `3px solid ${C.green}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, animation: "glowPulse 3s ease-in-out infinite",
      }}>✓</div>

      <div style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, letterSpacing: 4, color: C.text }}>
        DEPLOYED
      </div>
      <div style={{ fontSize: 12, color: C.textDim, marginTop: 8 }}>
        {agentName} is live on Solana {network}
      </div>

      <div style={{
        maxWidth: 500, margin: "32px auto 0", padding: 24, borderRadius: 12,
        background: `linear-gradient(135deg, ${C.purple}08, ${C.green}05)`,
        border: `1px solid ${C.purple}22`, textAlign: "left",
      }}>
        {[
          ["Passport NFT", `${agentName} Passport`, C.purple],
          ["Tier", tierData?.name || tier, tierData?.color || C.text],
          ["Capabilities", `${capabilities?.size || 0} modules active`, C.green],
          ["Token", `${tokenSymbol} (${tokenName})`, C.gold],
          ["Candy Machine", `${cmItemsAvailable} items available`, C.cyan],
          ["Recursion", `${recursionDepth} layers deep`, C.purple],
          ["Attestations", `${(attestations?.length || 0) + 3} verified`, C.green],
          ["Network", network, C.textDim],
        ].map(([k, v, color], i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0",
            borderBottom: i < 7 ? `1px solid ${C.border}` : "none",
          }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>{k}</span>
            <span style={{ fontSize: 11, color, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24, padding: "12px 20px", borderRadius: 8, display: "inline-block",
        background: `${C.green}0a`, border: `1px solid ${C.green}22`,
        fontSize: 10, color: C.green, fontFamily: FONTS.body, letterSpacing: 1,
      }}>
        MINT ENDPOINT: https://terminagent.io/mint/{walletAddress?.slice(0, 8) || "xxxx"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LIVE PREVIEW SIDEBAR
// ═══════════════════════════════════════════════════════════════

function LivePreview({
  agentName, agentHandle, tier, capabilities, primaryModel,
  generatedArt, artStyle, tokenName, tokenSymbol,
  cmItemsAvailable, cmGuardPreset, cmTokenStandard,
  recursionDepth, dnaHash, attestations, deployed, phase,
}) {
  const tierData = TIERS.find(t => t.id === tier);

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Passport Card */}
      <div style={{
        borderRadius: 12, overflow: "hidden",
        border: `1px solid ${tierData?.color || C.purple}22`,
        background: `linear-gradient(180deg, ${tierData?.color || C.purple}08, ${C.card})`,
      }}>
        {/* Card Header */}
        <div style={{
          height: 6,
          background: `linear-gradient(90deg, ${C.purple}, ${tierData?.color || C.green}, ${C.purple})`,
        }} />

        <div style={{ padding: 20, textAlign: "center" }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: 12, margin: "0 auto 14px",
            background: generatedArt
              ? (ART_STYLES.find(s => s.id === generatedArt.style)?.preview || C.card)
              : `linear-gradient(135deg, ${C.purple}22, ${C.green}11)`,
            border: `2px solid ${tierData?.color || C.purple}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: generatedArt ? 32 : 28,
          }}>
            {generatedArt ? "🎨" : "🧬"}
          </div>

          <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: 1 }}>
            {agentName || "UNNAMED AGENT"}
          </div>
          {agentHandle && (
            <div style={{ fontSize: 11, color: C.purple, marginTop: 2 }}>
              @{agentHandle.replace("@", "")}
            </div>
          )}

          {/* Tier Badge */}
          <div style={{
            display: "inline-block", marginTop: 10,
            padding: "4px 12px", borderRadius: 20,
            background: `${tierData?.color || C.purple}15`,
            border: `1px solid ${tierData?.color || C.purple}33`,
            fontFamily: FONTS.display, fontSize: 9, fontWeight: 700,
            color: tierData?.color || C.purple, letterSpacing: 2,
          }}>
            {tierData?.name?.toUpperCase() || "AGENT"} TIER
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: `1px solid ${C.border}`,
        }}>
          {[
            [capabilities?.size || 0, "CAPS"],
            [recursionDepth, "DEPTH"],
            [attestations?.length || 0, "ATTEST"],
          ].map(([val, label], i) => (
            <div key={i} style={{
              padding: "10px 0", textAlign: "center",
              borderRight: i < 2 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, color: C.text }}>
                {val}
              </div>
              <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: 1, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Capabilities */}
      <div>
        <div style={{ fontFamily: FONTS.display, fontSize: 9, color: C.textMuted, letterSpacing: 2, marginBottom: 8 }}>
          ACTIVE MODULES
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CAPABILITIES.filter(c => capabilities?.has(c.id)).map(cap => (
            <div key={cap.id} style={{
              padding: "5px 10px", borderRadius: 4,
              background: `${C.green}0a`, border: `1px solid ${C.green}15`,
              fontSize: 10, color: C.green,
            }}>
              {cap.icon} {cap.name}
            </div>
          ))}
          {(!capabilities || capabilities.size === 0) && (
            <div style={{ fontSize: 10, color: C.textMuted }}>No capabilities selected</div>
          )}
        </div>
      </div>

      {/* Config Summary */}
      <div>
        <div style={{ fontFamily: FONTS.display, fontSize: 9, color: C.textMuted, letterSpacing: 2, marginBottom: 8 }}>
          CONFIGURATION
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            ["Model", MODELS.find(m => m.id === primaryModel)?.name || "—"],
            ["Token", tokenSymbol || "—"],
            ["Items", cmItemsAvailable],
            ["Standard", cmTokenStandard === "ProgrammableNonFungible" ? "pNFT" : "NFT"],
            ["Guards", cmGuardPreset || "—"],
            ["DNA", `0x${dnaHash}`],
          ].map(([k, v], i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "5px 10px", borderRadius: 4,
              background: i % 2 === 0 ? `${C.purple}05` : "transparent",
            }}>
              <span style={{ fontSize: 9, color: C.textMuted }}>{k}</span>
              <span style={{ fontSize: 9, color: C.text }}>{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Progress */}
      <div>
        <div style={{ fontFamily: FONTS.display, fontSize: 9, color: C.textMuted, letterSpacing: 2, marginBottom: 8 }}>
          PIPELINE PROGRESS
        </div>
        {PHASES.map((p, i) => (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 0", opacity: i <= phase ? 1 : 0.3,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4,
              background: i < phase ? C.green + "22" : i === phase ? C.purple + "22" : C.card,
              border: `1px solid ${i < phase ? C.green + "44" : i === phase ? C.purple + "44" : C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: i < phase ? C.green : C.text,
            }}>
              {i < phase ? "✓" : p.icon}
            </div>
            <span style={{
              fontSize: 9,
              color: i === phase ? C.text : i < phase ? C.green : C.textMuted,
              fontWeight: i === phase ? 600 : 400,
            }}>
              {p.label}
            </span>
          </div>
        ))}
      </div>

      {/* Status */}
      {deployed && (
        <div style={{
          padding: 12, borderRadius: 8, textAlign: "center",
          background: `${C.green}0a`, border: `1px solid ${C.green}22`,
        }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 10, color: C.green, letterSpacing: 2, fontWeight: 700 }}>
            ⚡ DEPLOYED
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RECURSIVE TREE VISUALIZATION
// ═══════════════════════════════════════════════════════════════

function TreeNode({ node, depth, maxDepth }) {
  if (!node) return null;
  const indent = depth * 24;
  const color = depth === 0 ? C.purple : depth === 1 ? C.green : C.cyan;
  const lineColor = color + "33";

  return (
    <div style={{ animation: "slideIn 0.3s ease-out", animationDelay: `${depth * 0.1}s`, animationFillMode: "both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: indent, paddingTop: 6, paddingBottom: 6 }}>
        {depth > 0 && (
          <div style={{ width: 16, height: 1, background: lineColor, flexShrink: 0 }} />
        )}
        <div style={{
          width: 8, height: 8, borderRadius: 2, flexShrink: 0,
          background: color + "44", border: `1px solid ${color}88`,
        }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 11, color, fontWeight: 600 }}>{node.name}</span>
          <span style={{ fontSize: 9, color: C.textMuted, marginLeft: 8 }}>
            depth:{depth} • {node.action || "root"}
          </span>
        </div>
        <span style={{ fontSize: 8, color: C.textMuted + "88", fontFamily: FONTS.body }}>
          {node.hash?.slice(0, 8) || "..."}
        </span>
      </div>
      {node.children && depth < maxDepth && node.children.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} maxDepth={maxDepth} />
      ))}
    </div>
  );
}

function buildTreePreview(name, capabilities, maxDepth, currentDepth) {
  const caps = capabilities ? [...capabilities] : [];
  const hash = Math.random().toString(36).slice(2, 10);
  const actions = ["execute", "compose", "embed", "verify", "resolve"];

  const children = currentDepth < 1
    ? caps.map((cap, i) => ({
      name: `${cap.charAt(0).toUpperCase() + cap.slice(1)} Module`,
      action: actions[i % actions.length],
      hash: Math.random().toString(36).slice(2, 10),
      children: currentDepth + 1 < maxDepth
        ? [{ name: `${cap} Sub-node`, action: "resolve", hash: Math.random().toString(36).slice(2, 10), children: currentDepth + 2 < maxDepth
          ? [{ name: `Leaf`, action: "verify", hash: Math.random().toString(36).slice(2, 10), children: [] }]
          : []
        }]
        : [],
    }))
    : [];

  return { name: `${name || "Agent"} Passport`, action: "root", hash, children };
}

// ═══════════════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════

function PhaseHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: 4 }}>{title}</div>
      </div>
      <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6, paddingLeft: 38 }}>{subtitle}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontFamily: FONTS.display, fontSize: 9, color: C.textMuted,
        letterSpacing: 3, marginBottom: 12, fontWeight: 700,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline, rows, type, prefix, maxLength }) {
  const Component = multiline ? "textarea" : "input";
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 12, color: C.textMuted,
          }}>{prefix}</span>
        )}
        <Component
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          type={type || "text"}
          rows={rows}
          maxLength={maxLength}
          style={{
            ...inputStyle,
            ...(multiline && { resize: "vertical", minHeight: (rows || 3) * 24 }),
            ...(prefix && { paddingLeft: 28 }),
          }}
        />
      </div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      padding: "12px 14px", borderRadius: 8, cursor: "pointer",
      border: `1px solid ${value ? C.green + "33" : C.border}`,
      background: value ? `${C.green}06` : C.card,
      display: "flex", alignItems: "center", gap: 12,
      transition: "all 0.2s ease",
    }}>
      <div style={{
        width: 36, height: 20, borderRadius: 10, position: "relative",
        background: value ? `${C.green}33` : C.textMuted + "22",
        transition: "all 0.2s ease",
      }}>
        <div style={{
          position: "absolute", top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%",
          background: value ? C.green : C.textMuted,
          transition: "all 0.2s ease",
        }} />
      </div>
      <div>
        <div style={{ fontFamily: FONTS.accent, fontSize: 11, fontWeight: 600, color: value ? C.green : C.text }}>{label}</div>
        {desc && <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
    </div>
  );
}

// ─── Style Helpers ───────────────────────────────────────────

const labelStyle = {
  display: "block", fontFamily: FONTS.display, fontSize: 9,
  color: C.textMuted, letterSpacing: 2, marginBottom: 6, fontWeight: 600,
};

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 6,
  background: C.card, border: `1px solid ${C.border}`,
  color: C.text, fontFamily: FONTS.body, fontSize: 12,
  transition: "border-color 0.2s ease",
};

function btnStyle(primary) {
  return {
    padding: "10px 20px", borderRadius: 6, cursor: "pointer",
    border: primary ? "none" : `1px solid ${C.border}`,
    background: primary ? `linear-gradient(135deg, ${C.purple}, ${C.green})` : "transparent",
    color: primary ? "#fff" : C.textDim,
    fontFamily: FONTS.display, fontSize: 10, fontWeight: 700, letterSpacing: 2,
    transition: "all 0.2s ease",
  };
}
