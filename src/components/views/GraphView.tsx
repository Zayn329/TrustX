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

  // Category H Item 77: Filter Toggles
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

  const filteredNodes = nodes.filter(n => visibleTypes[n.type]);

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
          <p className="text-sm text-zinc-400 mt-3 max-w-2xl leading-6">
            See why a researcher has earned trust by following the relationship between identity, contribution, proof, verification, and escrow.
          </p>
        </div>

        {/* Zoom & Export Controls (Category H Items 73, 80) */}
        <div className="flex items-center gap-2 bg-[#111111] p-1.5 rounded-lg border border-white/[0.08] text-xs">
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

      {/* Graph Filters & Legend (Category H Items 77, 79) */}
      <div className="tx-surface rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400 font-semibold">
          <Filter className="w-4 h-4 text-[#D7FF3F]" />
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
        <div className="lg:col-span-3 tx-surface tx-grid rounded-xl p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
          <svg
            id="trust-graph-svg"
            viewBox="0 0 720 360"
            className="w-full h-full max-h-[420px] transition-transform duration-300"
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
                    y={node.y + 38}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
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
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Properties</span>
                <p className="text-slate-300 leading-relaxed font-mono mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] break-all">
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
