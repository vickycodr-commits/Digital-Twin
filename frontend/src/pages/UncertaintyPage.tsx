import React from 'react';
import { UncertaintyResult, PredictionResult } from '../types';
import { UncertaintyGauge } from '../components/UncertaintyGauge';
import { ShieldAlert, Info, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

interface UncertaintyPageProps {
  uncertainty: UncertaintyResult | null;
  prediction: PredictionResult | null;
}

export const UncertaintyPage: React.FC<UncertaintyPageProps> = ({
  uncertainty,
  prediction
}) => {
  if (!uncertainty || !prediction) {
    return <div className="p-8 text-center text-slate-500">Loading Uncertainty Engine...</div>;
  }

  const potentialReasons = [
    {
      title: 'Limited Historical Anomaly Data',
      desc: 'Infrequent historical occurrences of high-wear bearing degradation spalling at extreme operating loads.',
      active: uncertainty.reasons.some(r => r.toLowerCase().includes('data') || r.toLowerCase().includes('historical'))
    },
    {
      title: 'Stochastic Sensor Telemetry Noise',
      desc: 'High-frequency fluid turbulence and vibration harmonics introducing sensor measurement fluctuations.',
      active: uncertainty.reasons.some(r => r.toLowerCase().includes('noise') || r.toLowerCase().includes('sensor'))
    },
    {
      title: 'Operating Regime Transition',
      desc: 'Pump operating point shifting away from Best Efficiency Point (BEP) due to process load modulation.',
      active: uncertainty.reasons.some(r => r.toLowerCase().includes('operating') || r.toLowerCase().includes('point'))
    },
    {
      title: 'Overlapping Fault Spectral Signatures',
      desc: 'Shared vibration characteristics between early bearing inner raceway wear and mechanical shaft misalignment.',
      active: uncertainty.reasons.some(r => r.toLowerCase().includes('overlapping') || r.toLowerCase().includes('misalignment'))
    },
    {
      title: 'Ensemble Decision Divergence',
      desc: 'Variance across individual estimators in the random forest and extra trees ensemble classifiers.',
      active: uncertainty.reasons.some(r => r.toLowerCase().includes('variance') || r.toLowerCase().includes('disagreement') || r.toLowerCase().includes('tree'))
    }
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-sky-600" />
          Uncertainty-Aware Prediction & Variance Analysis
        </h2>
        <p className="text-xs text-slate-500">
          Core research contribution: Moving beyond uncalibrated point estimates to bounded prediction intervals and variance decomposition.
        </p>
      </div>

      {/* Primary Visual Uncertainty Gauge */}
      <UncertaintyGauge
        uncertainty={uncertainty}
        failureProbability={prediction.failure_probability}
      />

      {/* Why Uncertainty Exists - Research Explanatory Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              Epistemological Attribution: Why Uncertainty Exists
            </h3>
            <p className="text-xs text-slate-500">
              Root causes influencing model variance and prediction interval width in cyber-physical assets
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active Factors: {uncertainty.reasons.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {potentialReasons.map((reason, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                reason.active
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-100 shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold ${reason.active ? 'text-amber-900' : 'text-slate-800'}`}>
                  {reason.title}
                </span>
                <span className={`w-2 h-2 rounded-full ${reason.active ? 'bg-amber-500' : 'bg-slate-300'}`} />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {reason.desc}
              </p>
              <div className="text-[10px] font-mono pt-1">
                {reason.active ? (
                  <strong className="text-amber-700">DETECTED IN CURRENT REGIME</strong>
                ) : (
                  <span className="text-slate-400">Stable Condition</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
