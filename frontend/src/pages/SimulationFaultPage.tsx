import React, { useState } from 'react';
import { MachineTwin } from '../types';
import { api } from '../services/api';
import { Sliders, Flame, RotateCcw, Activity, ShieldAlert, Cpu, CheckCircle2, Play } from 'lucide-react';

interface SimulationFaultPageProps {
  machineTwin: MachineTwin | null;
  onRefreshTwin: () => void;
}

export const SimulationFaultPage: React.FC<SimulationFaultPageProps> = ({
  machineTwin,
  onRefreshTwin
}) => {
  const [selectedFault, setSelectedFault] = useState<string>('BEARING_DEGRADATION');
  const [severity, setSeverity] = useState<number>(0.75);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [noiseLevel, setNoiseLevel] = useState<number>(0.04);
  const [operatingLoad, setOperatingLoad] = useState<number>(0.85);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const faults = [
    {
      id: 'BEARING_DEGRADATION',
      name: 'Bearing Degradation',
      desc: 'Progressive raceway spalling and cage wear. Drives vibration RMS from 2.1 to 5.6 mm/s and bearing temperature to 79°C.',
      primaryFeature: 'Vibration & Temperature'
    },
    {
      id: 'CAVITATION',
      name: 'Pump Cavitation',
      desc: 'Vapor bubble collapse from inadequate NPSHa. Causes erratic pressure oscillations and sudden volumetric flow suppression.',
      primaryFeature: 'Pressure Ripple & Flow Drop'
    },
    {
      id: 'MOTOR_OVERLOAD',
      name: 'Motor Thermal Overload',
      desc: 'Stator current surge above 10.2A resulting in winding heating, slight RPM droop, and thermal stress on Class F insulation.',
      primaryFeature: 'Current & Stator Heat'
    },
    {
      id: 'MISALIGNMENT',
      name: 'Shaft Misalignment',
      desc: 'Angular or parallel offset between motor and pump driver. Induces pronounced 2x RPM harmonic vibration and coupling heat.',
      primaryFeature: '2x Vibration Harmonic'
    },
    {
      id: 'SEAL_FAILURE',
      name: 'Mechanical Seal Failure',
      desc: 'Cartridge seal face vaporization or dry running. Causes rapid pressure drop in seal chamber and localized heating.',
      primaryFeature: 'Seal Chamber Pressure'
    }
  ];

  const handleInject = async () => {
    if (!machineTwin) return;
    try {
      const res = await api.injectFault(machineTwin.id, selectedFault, severity);
      setStatusMessage(`Injected ${selectedFault} at ${Math.round(severity * 100)}% severity! Observing Digital Twin and ML response.`);
      onRefreshTwin();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleReset = async () => {
    if (!machineTwin) return;
    try {
      await api.resetSimulation(machineTwin.id);
      setStatusMessage(`Reset ${machineTwin.id} to Healthy Normal baseline.`);
      onRefreshTwin();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleUpdateConfig = async () => {
    if (!machineTwin) return;
    try {
      await api.updateSimulationConfig({
        machine_id: machineTwin.id,
        simulation_speed: simSpeed,
        noise_level: noiseLevel,
        operating_load: operatingLoad
      });
      setStatusMessage('Simulation physics parameters updated.');
      onRefreshTwin();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-sky-600" />
          Cyber-Physical Simulation & Fault Injection Console
        </h2>
        <p className="text-xs text-slate-500">
          Inject physical industrial fault dynamics into {machineTwin?.name || 'CP-001'} to validate how Digital Twin, Ensemble ML, and Hybrid RAG respond.
        </p>
      </div>

      {/* Fault Injection Console */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Fault Injection Selector
            </h3>
            <p className="text-xs text-slate-500">
              Select an industrial failure mode and tune severity
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Nominal Baseline</span>
          </button>
        </div>

        {/* Fault Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {faults.map((f) => {
            const isSelected = selectedFault === f.id;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFault(f.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-200 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{f.name}</h4>
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                  {f.desc}
                </p>
                <div className="text-[10px] font-mono text-orange-800 font-semibold bg-orange-100/70 px-2 py-0.5 rounded inline-block">
                  Signature: {f.primaryFeature}
                </div>
              </div>
            );
          })}
        </div>

        {/* Severity Slider & Trigger */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Fault Progression Severity</span>
            <span className="font-mono text-orange-700 text-sm font-bold">
              {Math.round(severity * 100)}% ({severity < 0.4 ? 'Mild Incipient' : severity < 0.75 ? 'Moderate Degrading' : 'Severe Terminal'})
            </span>
          </div>

          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={severity}
            onChange={(e) => setSeverity(parseFloat(e.target.value))}
            className="w-full accent-orange-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>10% (Early Micro-Spall)</span>
            <span>50% (Stage 2 Flaking)</span>
            <span>100% (Stage 4 Catastrophic Clearance Loss)</span>
          </div>

          <div className="pt-2">
            <button
              onClick={handleInject}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Inject Fault Dynamics & Trigger Digital Twin Transition</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Physics & Environment Sliders */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Operating Environment & Noise Parameters
            </h3>
            <p className="text-xs text-slate-500">
              Tune mechanical operational load and stochastic Gaussian noise in sensor telemetry
            </p>
          </div>

          <button
            onClick={handleUpdateConfig}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Apply Config
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Operating Load</span>
              <span className="font-mono font-bold text-slate-800">{Math.round(operatingLoad * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={operatingLoad}
              onChange={(e) => setOperatingLoad(parseFloat(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Sensor Noise Level (σ)</span>
              <span className="font-mono font-bold text-slate-800">{Math.round(noiseLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Simulation Clock Speed</span>
              <span className="font-mono font-bold text-slate-800">{simSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.5"
              value={simSpeed}
              onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
