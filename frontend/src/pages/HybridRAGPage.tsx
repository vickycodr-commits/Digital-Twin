import React, { useState } from 'react';
import { HybridRAGResponse, MachineTwin } from '../types';
import { api } from '../services/api';
import { 
  Layers, 
  Search, 
  FileText, 
  Share2, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

interface HybridRAGPageProps {
  machineTwin: MachineTwin | null;
  hybridData: HybridRAGResponse | null;
  onRefreshHybrid: (query: string) => void;
  isLoading?: boolean;
}

export const HybridRAGPage: React.FC<HybridRAGPageProps> = ({
  machineTwin,
  hybridData,
  onRefreshHybrid,
  isLoading = false
}) => {
  const [queryInput, setQueryInput] = useState<string>(
    `Why is ${machineTwin?.id || 'CP-001'} predicted to fail?`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      onRefreshHybrid(queryInput);
    }
  };

  const sampleQueries = [
    `Why is ${machineTwin?.id || 'CP-001'} predicted to fail?`,
    'What root cause explains the elevated vibration and temperature?',
    'What replacement parts and maintenance protocols are required?',
    'How does pump cavitation differ from bearing degradation in CP-001?'
  ];

  return (
    <div className="space-y-6">
      {/* Research Header */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded uppercase tracking-wider">
            Primary Research Contribution
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded font-mono">
            Architecture Layer 9
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-teal-600" />
          Hybrid Graph Vector RAG Demonstration
        </h2>
        <p className="text-xs text-slate-500">
          Synergistic fusion of unstructured manual excerpts (Vector RAG) and structured causal knowledge graph paths (GraphRAG) with Cyber-Physical Digital Twin state.
        </p>
      </div>

      {/* Interactive Research Query Console */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask the Hybrid RAG engine..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Synthesizing...' : 'Execute Hybrid RAG'}</span>
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Research Prompts:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { setQueryInput(q); onRefreshHybrid(q); }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition-colors border border-slate-200"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* DUAL RETRIEVAL COLUMNS: Vector RAG vs GraphRAG */}
      {hybridData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN 1: VECTOR RAG RETRIEVAL */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      Vector RAG: Unstructured Evidence
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Technical manuals, OEM repair guides, ISO standards
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded">
                  {hybridData.fused_context.vector_evidence.length} Chunks
                </span>
              </div>

              <div className="space-y-3">
                {hybridData.fused_context.vector_evidence.map((chunk, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">
                        {chunk.document_title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-sky-800">
                        Score: {chunk.similarity_score}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500">
                      {chunk.section} {chunk.page_number && `(Page ${chunk.page_number})`}
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed italic bg-white p-2.5 rounded border border-slate-200">
                      "{chunk.content}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: GRAPHRAG RETRIEVAL */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      GraphRAG: Structured Causal Paths
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ontology relationships, components, faults, root causes
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded">
                  {hybridData.fused_context.graph_paths.length} Paths
                </span>
              </div>

              <div className="space-y-3">
                {hybridData.fused_context.graph_paths.map((path, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                      {path.path_nodes.map((node, nIdx) => (
                        <React.Fragment key={nIdx}>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-teal-900 shadow-2xs">
                            {node}
                          </span>
                          {nIdx < path.path_nodes.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200 font-sans">
                      {path.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FUSED CONTEXT CARD */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Multi-Modal Fused Context (Prompt Payload)
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800 rounded">
                Verified Grounded Context
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-[10px]">Digital Twin Asset</div>
                <div className="font-bold text-white mt-1">{hybridData.fused_context.machine_id}</div>
                <div className="text-[11px] text-teal-400">State: {hybridData.fused_context.machine_state}</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-[10px]">ML Prediction</div>
                <div className="font-bold text-white mt-1">{hybridData.fused_context.ml_prediction.failure_type}</div>
                <div className="text-[11px] text-sky-400">Probability: {Math.round(hybridData.fused_context.ml_prediction.failure_probability * 100)}%</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-[10px]">Uncertainty Interval</div>
                <div className="font-bold text-white mt-1">{hybridData.fused_context.uncertainty.prediction_interval}</div>
                <div className="text-[11px] text-amber-400">Confidence: {hybridData.fused_context.uncertainty.confidence_level}</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 text-[10px]">SHAP Dominant Feature</div>
                <div className="font-bold text-white mt-1">{hybridData.fused_context.explainability.dominant_symptom}</div>
                <div className="text-[11px] text-slate-300 font-sans truncate">{hybridData.fused_context.explainability.natural_language}</div>
              </div>
            </div>
          </div>

          {/* LLM REASONING CARD */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Grounded LLM Reasoning & Evidence Synthesis
                </h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {hybridData.llm_explanation.engine_mode || 'Research Fallback Engine'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Question 1: Why this prediction? */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  1. Why This Prediction?
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {hybridData.llm_explanation.why_this_prediction}
                </p>
              </div>

              {/* Question 2: Likely root cause? */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  2. What Is The Likely Root Cause?
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {hybridData.llm_explanation.what_is_the_likely_root_cause}
                </p>
              </div>

              {/* Question 3: Supporting evidence? */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  3. What Evidence Supports It?
                </h4>
                <p className="text-slate-700 leading-relaxed font-sans">
                  {hybridData.llm_explanation.what_evidence_supports_it}
                </p>
              </div>

              {/* Question 4: Urgency & Missing Information */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    4. How Urgent Is It?
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-bold text-amber-800">
                    {hybridData.llm_explanation.how_urgent_is_it}
                  </p>
                </div>
                <div className="pt-1.5 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">What Information Is Missing?</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {hybridData.llm_explanation.what_information_is_missing}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PRESCRIPTIVE MAINTENANCE RECOMMENDATION */}
          <div className="bg-white rounded-xl border-2 border-teal-600/30 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Prescriptive Maintenance Directive
                </h3>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                hybridData.recommended_maintenance.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                hybridData.recommended_maintenance.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                'bg-sky-100 text-sky-800'
              }`}>
                Priority: {hybridData.recommended_maintenance.priority}
              </span>
            </div>

            <div className="text-xs text-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-slate-900">
                {hybridData.recommended_maintenance.title}
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {hybridData.recommended_maintenance.reason}
              </p>
            </div>

            {/* Action Checklist */}
            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold text-slate-800">
                Prescribed Step-by-Step Actions:
              </h5>
              <div className="space-y-2">
                {hybridData.recommended_maintenance.recommended_actions.map((act, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-start gap-2.5"
                  >
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
              <span>Supporting OEM Document: <strong className="text-slate-700">{hybridData.recommended_maintenance.supporting_evidence}</strong></span>
              <span className="font-semibold text-slate-700">Estimated Horizon: {hybridData.recommended_maintenance.estimated_rul_hours} hrs</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
