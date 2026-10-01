import React, { useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Download, Filter } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Filter Toggles
  const [visibleTypes, setVisibleTypes] = useState<Record<string, boolean>>({
    identity: true,
    bounty: true,
    escrow: true,
    contribution: true,
    proof: true
  });

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  const toggleType = (type: string) => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleExportSVG = () => {
    const svgElement = document.getElementById('trust-graph-svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `trust_graph_${Date.now()}.svg`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  // Dynamic Graph Nodes derived directly from Trust Layer state
  const nodes: Node[] = [];

  identities.forEach((id, idx) => {
    nodes.push({
      id: id.id,
      label: id.name || id.handle,
      type: 'identity',
      x: 90,
      y: 90 + idx * 110,
      details: `DID: ${id.id} • Trust Score: ${id.trustScore}/100 • Verified Claims: ${id.verifiedContributionsCount} • Earned: $${id.totalRewardsEarned}`
    });
  });

  bounties.forEach((b, idx) => {
    nodes.push({
      id: b.id,
      label: b.title.length > 20 ? b.title.slice(0, 18) + '...' : b.title,
      type: 'bounty',
      x: 270,
      y: 80 + idx * 110,
      details: `Bounty ID: ${b.id} • Reward: $${b.rewardAmount} ${b.rewardCurrency} • Severity: ${b.severity} • Org: ${b.organizationName}`
    });
  });

  reports.forEach((r, idx) => {
    nodes.push({
      id: r.id,
      label: r.title.length > 18 ? r.title.slice(0, 16) + '...' : r.title,
      type: 'contribution',
      x: 450,
      y: 70 + idx * 85,
      details: `Report ID: ${r.id} • Type: ${r.vulnerabilityType} • Severity: ${r.severity} • Researcher: ${r.researcherId}`
    });
  });

  proofs.forEach((p, idx) => {
    nodes.push({
      id: p.id,
      label: `Proof ${p.contentHash.slice(0, 6)}...`,
      type: 'proof',
      x: 630,
      y: 70 + idx * 85,
      details: `Proof ID: ${p.id} • SHA-256 Hash: ${p.contentHash} • Status: ${p.proofStatus} • Signature: ${p.signature.slice(0, 24)}...`
    });
  });

  escrows.forEach((e, idx) => {
    nodes.push({
      id: e.id,
      label: `Escrow ($${e.amount})`,
      type: 'escrow',
      x: 810,
      y: 90 + idx * 110,
      details: `Escrow ID: ${e.id} • Contract: ${e.escrowContractAddress} • Amount: $${e.amount} ${e.currency} • Status: ${e.status}`
    });
  });

  const filteredNodes = nodes.filter(n => visibleTypes[n.type]);

  // Dynamic Graph Edges calculated from state foreign relationships
  const edges: Edge[] = [];

  // Identity -> Report (Submitted)
  reports.forEach(r => {
    if (nodes.some(n => n.id === r.researcherId)) {
      edges.push({ source: r.researcherId, target: r.id, label: 'Submitted' });
    }
  });

  // Bounty -> Escrow (Locked Funds)
  bounties.forEach(b => {
    if (b.escrowId && nodes.some(n => n.id === b.escrowId)) {
      edges.push({ source: b.id, target: b.escrowId, label: 'Locked Funds' });
    }
  });

  // Bounty -> Report (Target Scope)
  reports.forEach(r => {
    if (nodes.some(n => n.id === r.bountyId)) {
      edges.push({ source: r.bountyId, target: r.id, label: 'Target Scope' });
    }
  });

  // Report -> Proof (Hashed Evidence)
  proofs.forEach(p => {
    if (nodes.some(n => n.id === p.contributionId)) {
      edges.push({ source: p.contributionId, target: p.id, label: 'SHA-256 Anchor' });
    }
  });

  // Proof -> Escrow (Triggers Payout)
  proofs.forEach(p => {
    const report = reports.find(r => r.id === p.contributionId);
    if (report) {
      const bounty = bounties.find(b => b.id === report.bountyId);
      if (bounty && bounty.escrowId && nodes.some(n => n.id === bounty.escrowId)) {
        edges.push({ source: p.id, target: bounty.escrowId, label: 'Triggers Payout' });
      }
    }
  });

  const getNodeColor = (type: Node['type']) => {
    switch (type) {
      case 'identity':
        return '#D7FF3F';
      case 'bounty':
        return '#F5F5F2';
      case 'escrow':
        return '#f59e0b';
      case 'contribution':
        return '#34D399';
      case 'proof':
        return '#A1A1A1';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.location.hash = '#dashboard'; }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Network className="w-5 h-5 text-[#D7FF3F]" />
            <h1 className="tx-page-title">Trust graph</h1>
          </div>
          <p className="text-sm text-slate-400 mt-3 max-w-2xl leading-6">
            Interactive, real-time visual graph displaying dynamic relationships between Identities, Bounties, Reports, SHA-256 Proofs, and Smart Contract Escrows.
          </p>
        </div>

        {/* Zoom & Export Controls */}
        <div className="flex items-center gap-2 bg-slate-900/70 p-1.5 rounded-xl border border-slate-700/50 text-xs">
          <button
            onClick={handleExportSVG}
            className="p-2 hover:bg-white/[0.06] text-[#D7FF3F] rounded-md transition-colors flex items-center gap-1 font-semibold"
            title="Export Graph Image"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>
          <div className="w-px h-5 bg-white/[0.08]" />
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-white/[0.06] text-zinc-300 rounded-md transition-colors flex items-center gap-1 font-semibold"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-[#D7FF3F]" />
            <span className="hidden sm:inline">Zoom In</span>
          </button>
          <div className="w-px h-5 bg-white/[0.08]" />
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-white/[0.06] text-zinc-300 rounded-md transition-colors flex items-center gap-1 font-semibold"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-[#D7FF3F]" />
            <span className="hidden sm:inline">Zoom Out</span>
          </button>
          <div className="w-px h-5 bg-white/[0.08]" />
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-white/[0.06] text-zinc-300 rounded-md transition-colors flex items-center gap-1 font-semibold"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Graph Filters & Legend */}
      <div className="tx-surface rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <Filter className="w-4 h-4 text-blue-300" />
          <span>Toggle Node Types:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'identity', label: 'Identities', color: '#D7FF3F' },
            { key: 'bounty', label: 'Bounties', color: '#F5F5F2' },
            { key: 'escrow', label: 'Escrows', color: '#f59e0b' },
            { key: 'contribution', label: 'Reports', color: '#34D399' },
            { key: 'proof', label: 'Proofs', color: '#A1A1A1' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => toggleType(item.key)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                visibleTypes[item.key]
                  ? 'bg-[#D7FF3F]/10 text-zinc-100 border-[#D7FF3F]/20'
                  : 'bg-[#050505] text-zinc-600 border-white/[0.05] line-through'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 tx-surface rounded-[1.75rem] p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[460px] shadow-sm">
          <svg
            id="trust-graph-svg"
            viewBox="0 0 900 440"
            className="w-full h-full max-h-[460px] transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {edges.map((edge, idx) => {
              const sourceNode = filteredNodes.find(n => n.id === edge.source);
              const targetNode = filteredNodes.find(n => n.id === edge.target);
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
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1.5"
                    strokeDasharray="5 6"
                  />
                  <rect
                    x={midX - 45}
                    y={midY - 11}
                    width="90"
                    height="22"
                    rx="6"
                    fill="#050505"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#A1A1A1"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.type);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-all hover:opacity-90"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? "28" : "22"}
                    fill="#0B0B0B"
                    stroke={color}
                    strokeWidth={isSelected ? "4" : "2.5"}
                    className={isSelected ? 'filter drop-shadow-[0_0_8px_rgba(215,255,63,0.28)]' : ''}
                  />
                  <text
                    x={node.x}
                    y={node.y + 34}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="tx-surface rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-white/[0.07] pb-2">
            Graph Node Inspector
          </h3>

          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Node Label</span>
                <span className="font-bold text-slate-200 text-sm mt-0.5 block">{selectedNode.label}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Entity Type</span>
                <span className="font-mono text-[#D7FF3F] uppercase font-bold text-xs">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Properties & Hashes</span>
                <p className="text-slate-300 leading-relaxed font-mono mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] break-all">
                  {selectedNode.details}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>Click any node in the trust graph to inspect its live properties, contract addresses, and cryptographic hashes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
