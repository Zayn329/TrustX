# Project Knowledge & Developer Instructions (AGENTS.md)

## Project Purpose
The Blockchain-Powered Open-Source Trust Engine is an infrastructure platform that converts contributions into verifiable cryptographic records, establishes portable reputation from verified behavior, and uses programmable smart-contract escrow mechanisms to enforce bug bounty rewards trustlessly.

## Stack
- **Language & Runtime:** TypeScript (Node.js v22+)
- **Build Tool & Framework:** Vite + React 18
- **Styling & UI:** Tailwind CSS + Lucide Icons
- **Testing:** Vitest

## Repository Structure
```
/
├── exploration-report.md    # Initial repo exploration state
├── spec.md                  # Product specifications & functional goals
├── design.md                # Architecture, domain models, and design decisions
├── task.md                  # Task checklist and completion status
├── AGENTS.md                # Standing instructions and project knowledge
├── package.json             # Workspace dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS design system configuration
└── src/
    ├── types/               # TypeScript domain interfaces (Identity, Bounty, Proof, etc.)
    ├── domain/              # Pure domain logic (scoring, hashing, escrow state machines)
    ├── store/               # In-memory reactive state manager with initial seed data
    ├── components/          # Reusable UI & view components
    │   ├── common/          # Badges, Cards, Modals, Hash Displays
    │   ├── views/           # The 15 core trust engine & bug bounty views
    │   └── visualizers/     # Escrow flow, Trust Graph, Verification Timeline
    ├── App.tsx              # Application layout and view router
    └── main.tsx             # Entry point
```

## Commands
- **Install dependencies:** `npm install`
- **Development Server:** `npm run dev`
- **Build:** `npm run build`
- **Run Tests:** `npm test`
- **Type Checking:** `npx tsc --noEmit`

## Development & Verification Conventions
1. **Domain Integrity:** Domain logic (hashing, trust score formulas, escrow transitions, risk metrics) must be pure functions in `src/domain/` with 100% unit test coverage.
2. **Explicit Labeling:** All simulated/demo blockchain components and cryptographic anchors must be clearly labeled as `[Simulated Web3 Environment]` in the user interface. Never falsely claim simulated data is live mainnet data.
3. **Coherent Navigation:** All 15 required user capabilities must be seamlessly integrated into a single unified application shell.
4. **Verification Step:** Before declaring any task step complete, build output (`npm run build`), type checking (`npx tsc --noEmit`), and test suite (`npm test`) MUST pass cleanly.

## Negative Constraints
- Do NOT introduce external heavy backend services, live testnet dependencies, or real money transactions.
- Do NOT edit build artifacts in `dist/`. Always modify source in `src/`.
- Do NOT leave broken navigation or placeholder hidden buttons.
