import React, { useState } from 'react';
import { KnowledgeGraphData, KnowledgeGraphNode } from '../types';
import { Share2, Filter, Layers, Info, Search, ArrowRight } from 'lucide-react';

interface GraphVisualizerProps {
  graphData: KnowledgeGraphData;
  highlightFault?: string;
  onSelectNode?: (node: KnowledgeGraphNode) => void;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  graphData,
  highlightFault,
  onSelectNode
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const nodeTypes = [
    { type: 'ALL', label: 'All Entities', color: '#64748b' },
    { type: 'MACHINE', label: 'Machine', color: '#0369a1' },
    { type: 'COMPONENT', label: 'Component', color: '#4f46e5' },
    { type: 'SENSOR', label: 'Sensor', color: '#0284c7' },
    { type: 'SYMPTOM', label: 'Symptom', color: '#d97706' },
    { type: 'FAULT', label: 'Fault Mode', color: '#dc2626' },
    { type: 'CAUSE', label: 'Root Cause', color: '#7c3aed' },
    { type: 'MAINTENANCE_ACTION', label: 'Action', color: '#059669' },
    { type: 'SPARE_PART', label: 'Spare Part', color: '#475569' },
    { type: 'DOCUMENT', label: 'Document', color: '#0284c7' }
  ];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'MACHINE': return '#0369a1';
      case 'COMPONENT': return '#4f46e5';
      case 'SENSOR': return '#0284c7';
      case 'SYMPTOM': return '#d97706';
      case 'FAULT': return '#dc2626';
      case 'CAUSE': return '#7c3aed';
      case 'MAINTENANCE_ACTION': return '#059669';
      case 'SPARE_PART': return '#475569';
      case 'DOCUMENT': return '#0284c7';
      default: return '#64748b';
    }
  };

  const filteredNodes = graphData.nodes.filter(n => {
    const matchesType = selectedType === 'ALL' || n.node_type === selectedType;
    const matchesSearch = !searchFilter || n.label.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleNodeClick = (node: KnowledgeGraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  // Find incoming & outgoing edges for selected node
  const activeEdges = selectedNode ? graphData.edges.filter(
    e => e.source_id === selectedNode.id || e.target_id === selectedNode.id
  ) : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Ontological Knowledge Graph (GraphRAG)
          </span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-600" />
            Industrial Failure Modes & Causal Graph
          </h3>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search graph entities..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 w-48 text-slate-800"
          />
        </div>
      </div>

      {/* Entity Type Filter Chips */}
      <div className="flex flex-wrap gap-1.5">
        {nodeTypes.map((t) => (
          <button
            key={t.type}
            onClick={() => setSelectedType(t.type)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
              selectedType === t.type
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.type !== 'ALL' && (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
            )}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Grid: Interactive Canvas & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Node Explorer Cards Canvas */}
        <div className="lg:col-span-8 bg-slate-50/70 border border-slate-200 rounded-xl p-4 min-h-[420px] max-h-[560px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span>Showing <strong>{filteredNodes.length}</strong> Entities</span>
            <span className="text-[11px] font-mono">Total Edges: {graphData.edges.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.node_type);
              const isHighlighted = highlightFault && node.label.toLowerCase().includes(highlightFault.toLowerCase());

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-white border-sky-500 ring-2 ring-sky-200 shadow-sm'
                      : isHighlighted
                      ? 'bg-red-50 border-red-300 ring-2 ring-red-100 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span 
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-white"
                      style={{ backgroundColor: color }}
                    >
                      {node.node_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{node.id}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1">
                    {node.label}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {node.description || 'Ontological graph node entity.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Entity & Causal Relations Inspector */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          {selectedNode ? (
            <>
              <div className="pb-3 border-b border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span 
                    className="text-[9px] font-bold px-2 py-0.5 rounded uppercase text-white"
                    style={{ backgroundColor: getNodeColor(selectedNode.node_type) }}
                  >
                    {selectedNode.node_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedNode.id}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedNode.label}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Connected Relationships */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>Graph Relationships ({activeEdges.length})</span>
                </h5>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeEdges.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No direct relationships found.</p>
                  ) : (
                    activeEdges.map((edge) => {
                      const isOutgoing = edge.source_id === selectedNode.id;
                      const partnerId = isOutgoing ? edge.target_id : edge.source_id;
                      const partnerNode = graphData.nodes.find(n => n.id === partnerId);

                      return (
                        <div 
                          key={edge.id}
                          className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-700 uppercase mb-1">
                            <span>{isOutgoing ? 'OUTGOING' : 'INCOMING'}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="bg-sky-50 px-1 rounded">{edge.relation_type}</span>
                          </div>
                          <div className="font-semibold text-slate-900 text-xs">
                            {partnerNode?.label || partnerId}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Type: {partnerNode?.node_type || 'Entity'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Linked Evidence & Documents (§21 Requirement) */}
              <div className="pt-2 border-t border-slate-200">
                <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>Linked Technical Documents & Standards</span>
                </h5>

                <div className="space-y-1.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      {selectedNode.node_type === 'FAULT' || selectedNode.node_type === 'SYMPTOM'
                        ? 'ISO 10816-3 Mechanical Vibration Standard'
                        : selectedNode.node_type === 'COMPONENT'
                        ? 'KSB Etanorm Maintenance Manual §5.2'
                        : 'SKF Rolling Bearings Engineering Handbook'}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Standardized threshold limits, inspection frequencies, and root cause diagnostic flowcharts.
                    </p>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      API 682 Standard Shaft Sealing & Lubrication Specs
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Material compatibility matrix, seal flush plans, and predictive replacement criteria.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs font-semibold text-slate-600">Select an Entity to Inspect</div>
              <p className="text-[11px] text-slate-400 px-4">
                Click any node on the left to inspect its domain relationships, causal links, and repair actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
