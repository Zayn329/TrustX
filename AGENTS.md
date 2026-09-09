# AGENTS.md

## Project Purpose
The Trust Engine is an open-source, blockchain-powered infrastructure designed to enable trustless cooperation between researchers and organizations. It is demonstrated through a Trustless Bug Bounty Platform where security contributions generate cryptographic proofs, undergo technical verification, update portable researcher reputation, and trigger conditional escrow payouts.

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript (strict mode enabled)

## Repository Structure
```
├── src/
│   ├── components/      # UI components (views, navigation, modals, visualizers)
│   ├── domain/          # Pure domain types, mock data generation, models
│   ├── store/           # Application state management (e.g. React Context / Zustand)
│   ├── App.tsx          # Main application layout and view router
│   ├── main.tsx         # Application entry point
│   └── index.css        # Tailwind CSS imports and global styles
├── exploration-report.md
├── spec.md
├── design.md
├── plan.md
├── task.md
├── index.html
├── package.json
└── tsconfig.json
```

## Development Commands
- **Install dependencies**: `npm install`
- **Development server**: `npm run dev`
- **Build verification**: `npm run build`
- **Preview build**: `npm run preview`

## Coding Conventions
- **TypeScript**: Use strict type definitions for domain entities (e.g. `Identity`, `Bounty`, `Proof`, `Verification`, `Escrow`). Avoid `any`.
- **Component Architecture**: Keep UI components modular, accessible, and responsive. Domain logic should remain separated in `src/domain/`.
- **State Management**: Use React state / simple store patterns. Keep local deterministic state synchronized across all views.
- **Styling**: Use standard Tailwind CSS utility classes. Maintain a cohesive, professional security/trust platform aesthetic.

## Constraints & Integrity Rules
- **No Faked Guarantees**: Cryptographic proofs anchor timestamped evidence integrity; technical verification determines vulnerability validity against scope rules. Do not claim blockchain verifies vulnerability validity.
- **Explicit Demo Labeling**: Simulated decentralized identities, escrow smart contracts, and blockchain ledger events must be explicitly marked or understood as deterministic demo constructs.
- **Zero Heavy Infrastructure Dependencies**: Do not introduce external databases, real wallet/blockchain RPC connections, or complex backend microservices in this frontend MVP phase.
