import React from 'react';
import { ExplainabilityResult } from '../types';
import { Sparkles, TrendingUp, TrendingDown, HelpCircle, FileCode } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ShapWaterfallChartProps {
  explainability: ExplainabilityResult | null;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({ explainability }) => {
  if (!explainability) return null;

  const barData = explainability.top_features.map((f) => ({
    name: f.feature_name,
    value: f.percentage_contribution,
    shapValue: f.shap_value,
    featureValue: f.feature_value,
    direction: f.direction
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Local Additive Feature Attribution
          </span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            SHAP Explainability & Risk Contributors
          </h3>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-md">
          {explainability.explanation_type}
        </span>
      </div>

      {/* Natural Language Diagnostic Summary */}
      <div className="bg-slate-50 border-l-4 border-sky-500 rounded-r-lg p-3.5 text-xs text-slate-800 leading-relaxed">
        <div className="font-semibold text-slate-900 mb-0.5 flex items-center gap-1.5">
          <span>Model Attribution Synthesis:</span>
        </div>
        <p className="font-medium text-slate-700">
          "{explainability.natural_language_explanation}"
        </p>
      </div>

      {/* SHAP Percentage Contribution Bar Chart */}
      <div>
        <div className="flex justify-between items-center text-xs text-slate-600 mb-2 font-semibold">
          <span>Sensor Feature Attribution Breakdown (%)</span>
          <span className="text-[11px] font-normal text-slate-400">Sum = 100% Normalized</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 60]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#334155' }} 
                width={85}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg">
                        <div className="font-bold">{data.name}</div>
                        <div>Contribution: +{data.value}%</div>
                        <div>Observed Value: {data.featureValue}</div>
                        <div>Raw SHAP φ: {data.shapValue}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{data.direction}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.direction === 'INCREASES_RISK' ? (index === 0 ? '#ef4444' : '#f97316') : '#10b981'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Value & Local Contribution Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="py-2.5 px-3">Feature</th>
              <th className="py-2.5 px-3">Observed Reading</th>
              <th className="py-2.5 px-3">Relative Impact</th>
              <th className="py-2.5 px-3">SHAP Value (φ)</th>
              <th className="py-2.5 px-3">Direction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {explainability.top_features.map((feat, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70">
                <td className="py-2 px-3 font-semibold text-slate-800">{feat.feature_name}</td>
                <td className="py-2 px-3 font-mono text-slate-600">{feat.feature_value}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${feat.direction === 'INCREASES_RISK' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                        style={{ width: `${feat.percentage_contribution}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-bold">+{feat.percentage_contribution}%</span>
                  </div>
                </td>
                <td className="py-2 px-3 font-mono text-[11px]">
                  {feat.shap_value > 0 ? `+${feat.shap_value.toFixed(4)}` : feat.shap_value.toFixed(4)}
                </td>
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                    feat.direction === 'INCREASES_RISK' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {feat.direction === 'INCREASES_RISK' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {feat.direction === 'INCREASES_RISK' ? 'Elevates Risk' : 'Mitigates'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Distinction Disclaimer */}
      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
        <span>Scientific boundary: SHAP reflects local machine learning decision boundaries from empirical sensor data.</span>
        <span className="font-semibold text-slate-700">Non-LLM Mathematical Attribution</span>
      </div>
    </div>
  );
};
