import React, { useState, useEffect } from 'react';
import { ExperimentComparison } from '../types';
import { api } from '../services/api';
import { FlaskConical, Settings, CheckCircle2, ShieldCheck, Sparkles, Database, Key, Server, Cpu } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export const SettingsExperimentPage: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentComparison[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [llmProvider, setLlmProvider] = useState<string>('DEMO_FALLBACK');

  useEffect(() => {
    api.getExperiments().then(setExperiments).catch(console.error);
    api.getSystemStatus().then(setSystemStatus).catch(console.error);
  }, []);

  const exp = experiments[0];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-sky-600" />
          Research Experiment Benchmarks & Platform Configuration
        </h2>
        <p className="text-xs text-slate-500">
          Comparative architecture study evaluating Baseline ML, Uncertainty ML, Standalone Vector RAG, Standalone GraphRAG, and Hybrid TWIN-RAG.
        </p>
      </div>

      {/* Comparative Architecture Benchmark Study */}
      {exp && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Ablation & Comparative Study
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {exp.benchmark_name}
              </h3>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 rounded-md">
              Publication Benchmark
            </span>
          </div>

          {/* Comparative Bar Chart */}
          <div>
            <div className="flex justify-between items-center text-xs text-slate-600 mb-2 font-semibold">
              <span>Architecture Evaluation Comparison (%)</span>
              <span className="text-[11px] font-normal text-slate-400">Accuracy vs Actionability vs Hallucination Risk</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exp.chart_data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="architecture" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="accuracy" name="Prediction Accuracy (%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actionability" name="Prescriptive Actionability (%)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hallucination_risk" name="Ungrounded Hallucination Risk (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparative Table */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Architecture Paradigm</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Uncertainty Aware</th>
                  <th className="py-2.5 px-3">Explanation Model</th>
                  <th className="py-2.5 px-3">Evidence Grounding</th>
                  <th className="py-2.5 px-3">Actionability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {exp.configurations.map((cfg, idx) => (
                  <tr key={idx} className={idx === 4 ? 'bg-teal-50/50 font-bold' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-3 text-slate-900">{cfg.name}</td>
                    <td className="py-3 px-3 font-mono">{cfg.accuracy}</td>
                    <td className="py-3 px-3">{cfg.uncertainty_awareness}</td>
                    <td className="py-3 px-3">{cfg.explanation_fidelity}</td>
                    <td className="py-3 px-3">{cfg.retrieval_grounding}</td>
                    <td className="py-3 px-3 font-mono text-teal-800">
                      {typeof cfg.actionability_score === 'number' ? `${(cfg.actionability_score * 100).toFixed(0)}%` : cfg.actionability_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
            <strong>Key Research Finding: </strong>{exp.findings}
          </div>
        </div>
      )}

      {/* Environment & Platform Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-700" />
            Runtime Environment & API Configuration
          </h3>
          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
            Online Standalone
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Server className="w-4 h-4 text-sky-600" />
              <span>LLM Provider Engine</span>
            </div>
            <select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value)}
              className="w-full mt-1 p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
            >
              <option value="DEMO_FALLBACK">Deterministic Research Engine (Offline Demo)</option>
              <option value="GEMINI">Google Gemini API</option>
              <option value="OPENAI">OpenAI GPT-4o-mini</option>
              <option value="OLLAMA">Local Ollama Instance</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Demo mode requires zero paid API tokens and runs 100% offline.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Database className="w-4 h-4 text-teal-600" />
              <span>Database & Vector Store</span>
            </div>
            <div className="text-slate-700 font-mono text-[11px] pt-1">
              SQLite / Standalone In-Memory
            </div>
            <div className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 4 OEM Handbooks Pre-Loaded
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Knowledge Graph Backend</span>
            </div>
            <div className="text-slate-700 font-mono text-[11px] pt-1">
              NetworkX In-Memory (Neo4j Compatible)
            </div>
            <div className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 27 Entities, 32 Relations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
