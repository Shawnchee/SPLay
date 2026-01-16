<div align="center">
  <img src="./public/SPLay-icon.svg" width="100" height="100" />
  <h1>⚡ SPLay: Solana Devnet Playground</h1>
  <p><i>"Where the Solana Program Library meets the Playground."</i></p>
</div>

---

## 🧐 Why SPLay?
The name is a technical pun: **SPL** (Solana Program Library) + Pl**ay**ground. 

DeFi and SPL tokens can be intimidating. **SPLay** was built to turn those complex "black box" instructions into a visual, interactive experience. It’s a safe space to play with the SOL ecosystem without the "Mainnet anxiety."

---

## ⚡ Overview
**SPLay** is a premium educational and development platform...
SPLay is a specialized "sandbox" for the Solana Devnet. It allows users to perform real blockchain actions like minting tokens, staking, and providing liquidity, trying out delegation and knowing what you can do with Solana without risking real-world capital. The platform integrates live market data from **Pyth Network** to provide a realistic "Mainnet-feel" simulation while operating entirely on testnet infrastructure (only for Solana/USD tho)

---

## 🛠️ Technical Tech Stack
*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router architecture)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode for type-safe blockchain interactions)
*   **Blockchain Integration**: 
    *   [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) for core network communication.
    *   [@solana/spl-token](https://www.npmjs.com/package/@solana/spl-token) for standard and Token-2022 program management.
    *   [@solana/wallet-adapter-react](https://github.com/solana-labs/wallet-adapter) for multi-wallet connectivity (Phantom, Solflare, etc.).
*   **Oracles & Data**: 
    *   **Pyth Network Hermes API**: For high-fidelity, sub-second SOL/USD price feeds.
*   **Storage & Metadata**: 
    *   **GitHub Content API**: Used as a decentralized-style metadata host for newly minted SPL tokens. (Wanted to use Pinata but since this is just a fun playground, skipped the extra technical complexity)
*   **UI/UX Engine**: 
    *   **Tailwind CSS**: Custom design system with a premium "Glassmorphism" aesthetic.
    *   **Framer Motion**: For buttery-smooth micro-animations and state transitions.
    *   **Lucide Icons**: For sharp, semantic visual cues.

---

## 🚀 Key Features in Detail

### 1. Advanced Token Minting Factory
Unlike basic minting tools, SPLay handles the entire lifecycle of a token:
*   **On-Chain Creation**: Generates Mint Addresses on Solana Devnet.
*   **Metadata Hosting**: Automatically pushes token metadata (name, symbol, icon) to a dedicated GitHub repository and links it on-chain using the `metadata_url` extension.
*   **Management Suite**: Direct interface to freeze, unfreeze, delegate, or transfer newly created assets.

### 2. DeFi Interactive Playground
A set of isolated "Money Lego" modules designed to teach protocol logic:
*   **Subscription Simulator**: Demonstrates **Token Delegation**. Teaches users how a service can "pull" monthly payments without requiring a signature for every transaction, essential for Web3 SaaS. (basically like an automated subscription deduction)
*   **Staking Simulator**: Simulates PoS and liquid staking. Teaches the mechanics of **APY**, inflationary rewards, and "unbonding" periods.
*   **Liquidity Pools (AMM)**: A visual representation of Constant Product Market Makers ($x \cdot y = k$). Users can provide liquidity to mock pairs and see their LP share fluctuate.

### 3. The Signing Center (Cryptography Explorer)
A deep-dive tool that breaks down a transaction before it's sent:
1.  **Build**: Shows the raw JSON instructions.
2.  **Simulate (Pre-flight)**: Runs the transaction against the Devnet state to predict balance changes and catch errors before they cost gas.
3.  **Serialize**: Shows the binary/hex message that actually travels through the network.
4.  **Authorize**: Final wallet signature step.

### 4. Direct Activity Ledger
A high-speed transaction history component that bypasses heavy indexing:
*   **Signature Feed**: Pulls raw signatures directly from the RPC node for lowest possible latency.
*   **Smart Fallbacks**: If parsing fails (due to custom contract instructions), it falls back to a signature view with links to the Explorer.

### 5. Live Portfolio & Market HUD
*   **SOL-Centric HUD**: A dedicated sidebar module that tracks your native SOL balance and its realtime USD value via Pyth.
*   **Market Ticker**: Realtime streaming of SOL price directly in the sidebar for constant market awareness (it's just me trying out Pyth)

---

## 🏆 For Developers
The codebase is structured to be modular and defensive. Key patterns include:
*   **Custom RPC Batcher**: Consolidates multiple metadata requests into single calls to respect node rate limits.
*   **Conditional Simulation Logic**: Prevents unnecessary state updates and UI thrashing by throttling RPC polling.
*   **Educational Tooltips**: Thousands of lines of documentation are baked directly into the UI via an interactive tooltip system.

---

## Hosted [here](https://splay-mocha.vercel.app/)

---

*“SPLay: The most intuitive way to learn how the Solana machine actually works.”*
