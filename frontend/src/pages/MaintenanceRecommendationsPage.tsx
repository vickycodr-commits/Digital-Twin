import React from 'react';
import { MachineTwin, HybridRAGResponse } from '../types';
import { Wrench, ShieldCheck, CheckCircle2, AlertTriangle, Clock, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

interface MaintenanceRecommendationsPageProps {
  machineTwin: MachineTwin | null;
  hybridData: HybridRAGResponse | null;
}

export const MaintenanceRecommendationsPage: React.FC<MaintenanceRecommendationsPageProps> = ({
  machineTwin,
  hybridData
}) => {
  if (!machineTwin || !hybridData) {
    return <div className="p-8 text-center text-slate-500">Loading Prescriptive Directives...</div>;
  }

  const rec = hybridData.recommended_maintenance;
  const isCritical = rec.priority === 'CRITICAL';

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-sky-600" />
          Evidence-Grounded Maintenance Recommendations
        </h2>
        <p className="text-xs text-slate-500">
          Prescriptive actions synthesized from real-time digital twin state, SHAP symptoms, and verified OEM literature.
        </p>
      </div>

      {/* Main Directive Banner */}
      <div className={`p-6 rounded-xl border shadow-sm space-y-4 ${
        isCritical 
          ? 'bg-red-50/70 border-red-200 text-red-950' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
              isCritical ? 'bg-red-200 text-red-900' : 'bg-orange-100 text-orange-900'
            }`}>
              Priority: {rec.priority}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Asset: {machineTwin.id} ({machineTwin.name})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Estimated RUL Window: <strong>{rec.estimated_rul_hours} Hours</strong></span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">
            {rec.title}
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
            {rec.reason}
          </p>
        </div>

        {/* Prescribed Actions List */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Standard Maintenance Protocol:
          </h4>
          <div className="space-y-2">
            {rec.recommended_actions.map((act, idx) => (
              <div 
                key={idx}
                className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start gap-3 shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center shrink-0 border border-teal-200 text-[10px]">
                  {idx + 1}
                </div>
                <div className="leading-relaxed font-medium">
                  {act}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Evidence Source */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Literature Verification: <strong>{rec.supporting_evidence}</strong></span>
          </div>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Empirical Confidence
          </span>
        </div>
      </div>

      {/* Epistemic Research Integrity Rule */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-sky-700" />
          <span>Research Integrity Standard: Epistemic Non-Fabrication Rule</span>
        </div>
        <p className="text-[11px] leading-relaxed text-sky-800">
          TWIN-RAG AI strictly frames directives probabilistically using "likely", "predicted", and "indicates". AI recommendations are never represented as guaranteed facts, and human technician physical validation is always mandated.
        </p>
      </div>
    </div>
  );
};
