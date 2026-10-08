import React from 'react';
import { ExplainabilityResult } from '../types';
import { ShapWaterfallChart } from '../components/ShapWaterfallChart';
import { Sparkles, HelpCircle, Layers, Info } from 'lucide-react';

interface ExplainabilityPageProps {
  explainability: ExplainabilityResult | null;
}

export const ExplainabilityPage: React.FC<ExplainabilityPageProps> = ({ explainability }) => {
  if (!explainability) {
    return <div className="p-8 text-center text-slate-500">Loading Explainability Engine...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-sky-600" />
          Explainable AI (XAI) & SHAP Attributions
        </h2>
        <p className="text-xs text-slate-500">
          Shapley Additive exPlanations quantify the exact contribution of each sensor feature to the failure prediction.
        </p>
      </div>

      {/* SHAP Chart & Breakdown Component */}
      <ShapWaterfallChart explainability={explainability} />

      {/* Non-Technical Translation Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              Plain-Language Interpretation: "Why Did the Model Predict This?"
            </h3>
            <p className="text-xs text-slate-500">
              Clear, non-technical explanation for plant operators and mechanical technicians
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
          <p>
            The machine learning algorithm looks at all 6 sensor measurements together. Rather than just raising a simple alarm if one sensor reaches a red line, it evaluated the joint pattern of readings against thousands of historical pump conditions.
          </p>
          <div className="p-3 bg-white rounded border border-slate-200 font-medium text-slate-800">
            <strong>Key Finding: </strong>
            {explainability.natural_language_explanation}
          </div>
          <p>
            Because <strong>{explainability.dominant_symptom}</strong> is increasing while the pump is running at steady load, the machine learning model deduces that this is not normal operational fluctuation, but rather mechanical friction or physical degradation.
          </p>
        </div>
      </div>
    </div>
  );
};
