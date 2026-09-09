import React, { useState } from 'react';
import { Network } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';

interface Node {
  id: string;
  label: string;
  type: 'identity' | 'bounty' | 'contribution' | 'proof' | 'escrow';
  x: number;
  y: number;
  details: string;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

export const GraphView: React.FC = () => {
  const { identities, bounties, reports, proofs, escrows } = useTrust();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const nodes: Node[] = [
    {
      id: identities[0]?.id || 'id-1',
      label: identities[0]?.name || 'Alex Rivera',
      type: 'identity',
      x: 120,
      y: 180,
      details: `DID: ${identities[0]?.id} • Trust Score: ${identities[0]?.trustScore}`
    },
    {
      id: bounties[0]?.id || 'bounty-1',
      label: bounties[0]?.title.slice(0, 24) + '...' || 'Nexus Bounty',
      type: 'bounty',
      x: 360,
      y: 100,
      details: `Bounty ID: ${bounties[0]?.id} • Reward: $${bounties[0]?.rewardAmount} USDC`
    },
    {
      id: escrows[0]?.id || 'escrow-1',
      label: `Escrow ($${escrows[0]?.amount})`,
      type: 'escrow',
      x: 600,
      y: 100,
      details: `Escrow Contract: ${escrows[0]?.escrowContractAddress} • Status: ${escrows[0]?.status}`
    },
    {
      id: reports[0]?.id || 'rep-1',
      label: reports[0]?.title.slice(0, 22) + '...' || 'Vulnerability Report',
      type: 'contribution',
      x: 360,
      y: 260,
      details: `Report ID: ${reports[0]?.id} • Severity: ${reports[0]?.severity}`
    },
    {
      id: proofs[0]?.id || 'proof-1',
      label: 'SHA-256 Proof Anchor',
      type: 'proof',
      x: 600,
      y: 260,
      details: `Content Hash: ${proofs[0]?.contentHash.slice(0, 20)}...`
    }
  ];

  const edges: Edge[] = [
    { source: nodes[0].id, target: nodes[3].id, label: 'Submitted' },
    { source: nodes[1].id, target: nodes[2].id, label: 'Locked Funds' },
    { source: nodes[1].id, target: nodes[3].id, label: 'Target Scope' },
    { source: nodes[3].id, target: nodes[4].id, label: 'Hashed Evidence' },
    { source: nodes[4].id, target: nodes[2].id, label: 'Triggers Release' }
  ];

  const getNodeColor = (type: Node['type']) => {
    switch (type) {
      case 'identity':
        return '#10b981';
      case 'bounty':
        return '#6366f1';
      case 'escrow':
        return '#f59e0b';
      case 'contribution':
        return '#38bdf8';
      case 'proof':
        return '#a855f7';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Network className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-slate-100">Interactive Trust Graph</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Visual representation linking identities, bounties, proofs, verifications, and smart contract escrows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
          <svg viewBox="0 0 720 360" className="w-full h-full max-h-[400px]">
            {edges.map((edge, idx) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="#334155"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={midX - 35}
                    y={midY - 10}
                    width="70"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke="#1e293b"
                  />
                  <text
                    x={midX}
                    y={midY + 2}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="500"
                    fontFamily="monospace"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.type);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-all"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? "26" : "22"}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth={isSelected ? "4" : "2"}
                  />
                  <text
                    x={node.x}
                    y={node.y + 35}
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Graph Node Details
          </h3>

          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Node Label</span>
                <span className="font-bold text-slate-200 text-sm mt-0.5 block">{selectedNode.label}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Entity Type</span>
                <span className="font-mono text-indigo-400 uppercase font-semibold">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Properties</span>
                <p className="text-slate-300 leading-relaxed font-mono mt-1 bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px]">
                  {selectedNode.details}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>Click any node in the trust graph to inspect its properties and relationships.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
