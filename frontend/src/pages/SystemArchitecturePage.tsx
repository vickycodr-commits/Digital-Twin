import React, { useState } from 'react';
import { Workflow, Layers, ArrowDown, Cpu, Activity, LineChart, ShieldAlert, Sparkles, FileText, Share2, HelpCircle, Wrench, CheckCircle } from 'lucide-react';

export const SystemArchitecturePage: React.FC = () => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>('L8');

  const architectureLayers = [
    {
      id: 'L1',
      number: '1',
      title: 'Physical Industrial Asset',
      tech: 'Centrifugal Pump CP-001, 37kW AC Motor, SKF Spherical Bearings, API 682 Seals',
      desc: 'Heavy industrial slurry pump under continuous operation. Subject to mechanical stress, thermal expansion, cavitation, and bearing fatigue.',
      icon: Cpu,
      color: 'bg-slate-700'
    },
    {
      id: 'L2',
      number: '2',
      title: 'Sensor Telemetry & Simulation',
      tech: 'Piezoelectric Accelerometers, PT100 RTD, Pressure Transmitters, CT Ammeter, Mag Flowmeter',
      desc: 'Real-time multi-channel data acquisition with physical fault coupling, noise generation, and load modulation.',
      icon: Activity,
      color: 'bg-sky-600'
    },
    {
      id: 'L3',
      number: '3',
      title: 'Digital Twin Cyber-Physical Engine',
      tech: 'Component Wear Modeling, Operational Hours Sync, Health Scoring Engine',
      desc: 'Maintains cyber-physical synchronized virtual model of pump components with real-time health degradation tracking.',
      icon: Workflow,
      color: 'bg-teal-600'
    },
    {
      id: 'L4',
      number: '4',
      title: 'Ensemble ML Prediction Engine',
      tech: 'Random Forest + Extra Trees Classifiers & Gradient Boosted RUL Regressor',
      desc: 'Multi-class fault classification (Bearing, Cavitation, Motor Overheat, Misalignment, Seal) and Remaining Useful Life regression.',
      icon: LineChart,
      color: 'bg-indigo-600'
    },
    {
      id: 'L5',
      number: '5',
      title: 'Uncertainty Estimation Layer',
      tech: 'Ensemble Variance, 90% Confidence Intervals, Epistemic vs Aleatoric Decomposition',
      desc: 'Quantifies prediction confidence boundaries and flags when observations lie outside calibrated training domains.',
      icon: ShieldAlert,
      color: 'bg-amber-600'
    },
    {
      id: 'L6',
      number: '6',
      title: 'Explainable AI (SHAP)',
      tech: 'TreeSHAP & KernelSHAP Additive Feature Attributions',
      desc: 'Provides exact local feature importance percentages (Vibration +42%, Temperature +27%) and plain-language summaries.',
      icon: Sparkles,
      color: 'bg-purple-600'
    },
    {
      id: 'L7',
      number: '7',
      title: 'Vector RAG (Unstructured)',
      tech: 'TF-IDF / Cosine Semantic Vector Store over OEM Manuals & ISO 10816 Criteria',
      desc: 'Extracts verbatim maintenance manual chunks, operating limits, and lubrication procedures matching current anomaly symptoms.',
      icon: FileText,
      color: 'bg-blue-600'
    },
    {
      id: 'L8',
      number: '8',
      title: 'GraphRAG (Structured Ontology)',
      tech: 'NetworkX Industrial Ontology & Directed Causal Path Traversal',
      desc: 'Traces relationships between Machine -> Component -> Sensor -> Symptom -> Fault -> Root Cause -> Action -> Part.',
      icon: Share2,
      color: 'bg-emerald-600'
    },
    {
      id: 'L9',
      number: '9',
      title: 'Hybrid Context Fusion',
      tech: 'Evidence Ranking & Prompt Context Synthesis',
      desc: 'Unifies Digital Twin telemetry, ML prediction, uncertainty bounds, SHAP explanations, Vector manual chunks, and Graph paths into an integrated context.',
      icon: Layers,
      color: 'bg-teal-700'
    },
    {
      id: 'L10',
      number: '10',
      title: 'Grounded LLM Reasoning & Directives',
      tech: 'Multi-Provider Abstraction (Gemini, OpenAI, Ollama, Deterministic Research Engine)',
      desc: 'Generates evidence-backed root cause analysis and step-by-step prescriptive maintenance directives without hallucinations.',
      icon: Wrench,
      color: 'bg-slate-900'
    }
  ];

  const selectedLayer = architectureLayers.find(l => l.id === selectedLayerId) || architectureLayers[0];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Workflow className="w-6 h-6 text-sky-600" />
          End-to-End System Architecture & Research Pipeline
        </h2>
        <p className="text-xs text-slate-500">
          The 10-layer cyber-physical dataflow from physical sensors through Digital Twin, Ensemble ML, Uncertainty, Explainability, Dual RAG, and Grounded Reasoning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Architecture Flowchart Column */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>System Pipeline Flowchart</span>
            <span className="text-[11px] text-slate-400 font-normal">Click any layer to inspect role</span>
          </div>

          <div className="space-y-2">
            {architectureLayers.map((layer, idx) => {
              const Icon = layer.icon;
              const isSelected = layer.id === selectedLayerId;

              return (
                <React.Fragment key={layer.id}>
                  <div
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${layer.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {layer.number}. {layer.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm">
                          {layer.tech}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      Layer {layer.number}
                    </span>
                  </div>

                  {idx < architectureLayers.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Layer Role & Details Inspector */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 sticky top-20">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Layer Specification
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {selectedLayer.number}. {selectedLayer.title}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold">Technology & Implementation:</span>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 mt-1">
                {selectedLayer.tech}
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold">Functional Role & Scientific Value:</span>
              <p className="text-slate-700 leading-relaxed mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedLayer.desc}
              </p>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-xs">
              <strong className="block mb-0.5">Research Contribution:</strong>
              This modular architecture guarantees that predictive machine learning is validated by both empirical uncertainty bounds and dual-grounded literature retrieval before recommendations are generated.
            </div>
          </div>
        </div>
      </div>

      {/* 9 Core Research Novelties & Scientific Contributions (§31 Requirement) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Academic & Experimental Value
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              9 Core Research Contributions & Novelty Dimensions
            </h3>
            <p className="text-xs text-slate-500">
              Distinct scientific advancements uniting cyber-physical twins, uncertainty quantification, dual-grounded RAG, and trustworthy LLM reasoning.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
            Section 31 Compliance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              num: '01',
              title: 'Digital Twin Cyber-Physical Representation',
              desc: 'High-fidelity state synchronization modeling component wear (impeller, bearings, shaft seals, stator) with continuous health scoring and ISO 10816 condition limits.',
              badge: 'Cyber-Physical Modeling'
            },
            {
              num: '02',
              title: 'Multi-Class Predictive Maintenance',
              desc: 'Ensemble Random Forest & Extra Trees classifiers diagnosing 5 distinct industrial failure modes combined with Gradient Boosted RUL horizon regression.',
              badge: 'Supervised ML'
            },
            {
              num: '03',
              title: 'Uncertainty-Aware Decision Boundaries',
              desc: 'Decomposes total prediction variance into epistemic (model ignorance) and aleatoric (sensor noise) components with calibrated 90% confidence intervals to avoid overconfident alarms.',
              badge: 'Quantified Uncertainty'
            },
            {
              num: '04',
              title: 'Local Feature Attribution (SHAP)',
              desc: 'Rigorous TreeSHAP attributions breaking down exact sensor contributions (+42% vibration RMS, +27% bearing temperature) alongside human-interpretable explanations.',
              badge: 'Explainable AI'
            },
            {
              num: '05',
              title: 'Domain-Grounded Vector RAG',
              desc: 'High-precision retrieval over indexed OEM technical service manuals, API 682 seal plans, and SKF bearing catalogues ensuring verbatim engineering standard adherence.',
              badge: 'Information Retrieval'
            },
            {
              num: '06',
              title: 'Ontological GraphRAG (Knowledge Graph)',
              desc: 'Traverses directed causal pathways linking Machine → Component → Sensor → Symptom → Fault Mode → Root Cause → Corrective Action → Spare Part.',
              badge: 'Knowledge Graph'
            },
            {
              num: '07',
              title: 'Hybrid Context Fusion Engine',
              desc: 'Dual-retrieval context synthesis engine combining unstructured text excerpts and structured ontology paths into a cross-validated context window.',
              badge: 'Multi-Modal Fusion'
            },
            {
              num: '08',
              title: 'Evidence-Grounded LLM Reasoning',
              desc: 'Multi-provider LLM abstraction (Gemini / OpenAI / Ollama / Demo Engine) strictly conditioned on retrieved empirical evidence, eliminating synthetic hallucinations.',
              badge: 'Trustworthy AI'
            },
            {
              num: '09',
              title: 'Prescriptive Maintenance Directives',
              desc: 'Automated synthesis of prioritized maintenance work orders, required tooling, safety lockout/tagout procedures, and OEM spare part numbers with complete provenance.',
              badge: 'Actionable Prescriptions'
            }
          ].map((item) => (
            <div 
              key={item.num}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-300 hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-mono text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                  {item.num}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                  {item.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
