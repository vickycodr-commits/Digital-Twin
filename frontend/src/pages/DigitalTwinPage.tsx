import React from 'react';
import { MachineTwin } from '../types';
import { DigitalTwinSchematic } from '../components/DigitalTwinSchematic';
import { Cpu, Activity, Clock, Layers, ShieldCheck, Wrench, RefreshCw } from 'lucide-react';

interface DigitalTwinPageProps {
  machineTwin: MachineTwin | null;
  onRefresh: () => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({ machineTwin, onRefresh }) => {
  if (!machineTwin) return <div className="p-8 text-center text-slate-500">Loading Digital Twin...</div>;

  return (
    <div className="space-y-6">
      {/* Title & Info Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-sky-600" />
            Digital Twin Cyber-Physical Engine
          </h2>
          <p className="text-xs text-slate-500">
            Real-time digital model mirroring the physical state, mechanical wear, and operational dynamics of {machineTwin.name}.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Twin</span>
        </button>
      </div>

      {/* Main Interactive CAD / Schematic */}
      <DigitalTwinSchematic machineTwin={machineTwin} />

      {/* Connected Sensor Mapping Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cyber-Physical Sensor Stream Mapping
            </h3>
            <p className="text-xs text-slate-500">
              Direct telemetry channels linked to Digital Twin component parameters
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {machineTwin.sensors.length} Active Channels
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {machineTwin.sensors.map((sensor) => (
            <div 
              key={sensor.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{sensor.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  sensor.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  sensor.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {sensor.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-mono font-black text-slate-900">
                  {sensor.current_value} <span className="text-xs font-normal text-slate-500">{sensor.unit}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {sensor.sampling_rate_hz} Hz
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-1.5">
                <span>Threshold: &lt;{sensor.warning_threshold} {sensor.unit}</span>
                <span className="text-slate-400 font-mono">{sensor.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
