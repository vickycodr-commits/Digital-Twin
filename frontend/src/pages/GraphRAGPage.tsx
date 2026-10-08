import React, { useState } from 'react';
import { KnowledgeGraphData, GraphRAGResult, PredictionResult } from '../types';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { Share2, ArrowRight, GitFork, CheckCircle, Wrench, FileText } from 'lucide-react';
import { api } from '../services/api';

interface GraphRAGPageProps {
  graphData: KnowledgeGraphData | null;
  prediction: PredictionResult | null;
}

export const GraphRAGPage: React.FC<GraphRAGPageProps> = ({
  graphData,
  prediction
}) => {
  const [selectedFault, setSelectedFault] = useState<string>(
    prediction?.failure_type || 'Bearing Failure'
  );
  const [graphResult, setGraphResult] = useState<GraphRAGResult | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  const queryGraph = async (fault: string) => {
    setSelectedFault(fault);
    setIsQuerying(true);
    try {
      const res = await api.queryGraphRAG(fault);
      setGraphResult(res);
    } catch (err) {
      console.error('GraphRAG query failed', err);
    } finally {
      setIsQuerying(false);
    }
  };

  React.useEffect(() => {
    queryGraph(selectedFault);
  }, [prediction?.failure_type]);

  const faultOptions = [
    'Bearing Failure',
    'Pump Cavitation',
    'Motor Overheating',
    'Shaft Misalignment',
    'Seal Failure'
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-sky-600" />
          GraphRAG Causal Traversal & Ontology
        </h2>
        <p className="text-xs text-slate-500">
          Knowledge graph path discovery bridging physical machine components, symptoms, failure modes, and OEM repair actions.
        </p>
      </div>

      {/* Query Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-slate-800">
            Graph Causal Path Exploration
          </h3>
          <p className="text-[11px] text-slate-500">
            Select a target fault mode to query structured causal relationships
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {faultOptions.map((f) => (
            <button
              key={f}
              onClick={() => queryGraph(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedFault === f
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Discovered Graph Paths Cards */}
      {graphResult && graphResult.causal_chains.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitFork className="w-4 h-4 text-sky-600" />
              Discovered Causal Chains for {selectedFault}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {graphResult.causal_chains.length} Validated Paths
            </span>
          </div>

          <div className="space-y-3">
            {graphResult.causal_chains.map((chain, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2"
              >
                <div className="flex items-center gap-2 flex-wrap font-mono font-medium text-slate-800">
                  {chain.path_nodes.map((nodeId, nIdx) => (
                    <React.Fragment key={nIdx}>
                      <span className="bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs font-bold text-sky-900">
                        {nodeId}
                      </span>
                      {nIdx < chain.path_nodes.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  <strong>Path Description: </strong>{chain.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Interactive Graph Visualizer Component */}
      {graphData && (
        <GraphVisualizer
          graphData={graphData}
          highlightFault={selectedFault}
        />
      )}
    </div>
  );
};
