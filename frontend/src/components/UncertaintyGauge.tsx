import React from 'react';
import { UncertaintyResult } from '../types';
import { ShieldCheck, ShieldAlert, AlertCircle, Info, HelpCircle } from 'lucide-react';

interface UncertaintyGaugeProps {
  uncertainty: UncertaintyResult | null;
  failureProbability: number;
}

export const UncertaintyGauge: React.FC<UncertaintyGaugeProps> = ({
  uncertainty,
  failureProbability
}) => {
  if (!uncertainty) return null;

  const failPct = Math.round(failureProbability * 100);
  const lowerPct = Math.round(uncertainty.prediction_interval_lower * 100);
  const upperPct = Math.round(uncertainty.prediction_interval_upper * 100);
  const uncPct = Math.round(uncertainty.uncertainty_score * 100);

  const getConfidenceBadge = () => {
    switch (uncertainty.confidence_level) {
      case 'HIGH':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: ShieldCheck,
          text: 'HIGH CONFIDENCE',
          barColor: 'bg-emerald-500'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertCircle,
          text: 'MEDIUM CONFIDENCE',
          barColor: 'bg-amber-500'
        };
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: ShieldAlert,
          text: 'LOW CONFIDENCE',
          barColor: 'bg-rose-500'
        };
    }
  };

  const badge = getConfidenceBadge();
  const Icon = badge.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header & Confidence Status Pill */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Bayesian / Ensemble Quantification
          </span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Uncertainty-Aware Prediction Profile
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${badge.bg}`}>
          <Icon className="w-4 h-4" />
          <span>{badge.text}</span>
        </div>
      </div>

      {/* Primary Metrics Trio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <span className="text-[11px] text-slate-500 font-medium">Point Failure Probability</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {failPct}%
          </div>
          <span className="text-[10px] text-slate-400">Mean: {Math.round(uncertainty.mean_prediction * 100)}%</span>
        </div>

        <div className="bg-sky-50 border border-sky-200/80 rounded-lg p-3">
          <span className="text-[11px] text-sky-800 font-medium">90% Prediction Interval</span>
          <div className="text-2xl font-black text-sky-950 mt-1 font-mono">
            {lowerPct}% – {upperPct}%
          </div>
          <span className="text-[10px] text-sky-600 font-medium">Bounded Confidence Envelope</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <span className="text-[11px] text-slate-500 font-medium">Uncertainty Index</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {uncPct}%
          </div>
          <span className="text-[10px] text-slate-400">Variance: σ² = {uncertainty.variance.toFixed(4)}</span>
        </div>
      </div>

      {/* Visual Prediction Interval Range Slider */}
      <div>
        <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
          <span>0% (Safe)</span>
          <span className="font-bold text-slate-800">
            Interval: [{lowerPct}% to {upperPct}%]
          </span>
          <span>100% (Terminal Failure)</span>
        </div>

        <div className="relative w-full h-7 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
          {/* Shaded Prediction Interval Range Band */}
          <div
            className="absolute top-0 bottom-0 bg-sky-200/80 border-x border-sky-400"
            style={{
              left: `${lowerPct}%`,
              width: `${Math.max(4, upperPct - lowerPct)}%`
            }}
          />

          {/* Point Estimate Marker */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-slate-900 shadow-sm"
            style={{ left: `calc(${failPct}% - 3px)` }}
          />

          {/* Threshold Lines */}
          <div className="absolute top-0 bottom-0 left-[40%] border-r border-dashed border-amber-400" />
          <div className="absolute top-0 bottom-0 left-[75%] border-r border-dashed border-red-400" />
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>Normal Baseline</span>
          <span>40% Warning Threshold</span>
          <span>75% Critical Threshold</span>
        </div>
      </div>

      {/* Epistemic vs Aleatoric Uncertainty Breakdown */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            Uncertainty Decomposition
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            Total Variance = {(uncertainty.variance).toFixed(4)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 text-[11px]">Epistemic (Model Disagreement)</div>
            <div className="font-bold text-slate-800 font-mono mt-0.5">
              {(uncertainty.epistemic_uncertainty * 100).toFixed(1)}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Variance across ensemble decision trees.</p>
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 text-[11px]">Aleatoric (Physical Noise)</div>
            <div className="font-bold text-slate-800 font-mono mt-0.5">
              {(uncertainty.aleatoric_uncertainty * 100).toFixed(1)}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Stochastic sensor noise & operational turbulence.</p>
          </div>
        </div>
      </div>

      {/* Research Guidance Banner */}
      <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
        uncertainty.confidence_level === 'LOW'
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
        <div>
          <span className="font-bold">System Guidance: </span>
          <span>{uncertainty.guidance_message}</span>
        </div>
      </div>
    </div>
  );
};
