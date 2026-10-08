import React, { useState } from 'react';
import { ComponentItem, MachineTwin } from '../types';
import { 
  Cpu, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Info,
  Clock,
  Layers
} from 'lucide-react';

interface DigitalTwinSchematicProps {
  machineTwin: MachineTwin;
}

export const DigitalTwinSchematic: React.FC<DigitalTwinSchematicProps> = ({ machineTwin }) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(
    machineTwin.components[0]?.id || ''
  );

  const selectedComponent = machineTwin.components.find(c => c.id === selectedCompId) || machineTwin.components[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return { fill: '#fecaca', stroke: '#ef4444', text: '#991b1b', badge: 'bg-red-100 text-red-800' };
      case 'WARNING': return { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e', badge: 'bg-amber-100 text-amber-800' };
      default: return { fill: '#dcfce7', stroke: '#10b981', text: '#065f46', badge: 'bg-emerald-100 text-emerald-800' };
    }
  };

  const motorComp = machineTwin.components.find(c => c.component_type.includes('Motor'));
  const bearingComp = machineTwin.components.find(c => c.component_type.includes('Bearing'));
  const shaftComp = machineTwin.components.find(c => c.component_type.includes('Shaft'));
  const sealComp = machineTwin.components.find(c => c.component_type.includes('Seal'));
  const impellerComp = machineTwin.components.find(c => c.component_type.includes('Impeller'));
  const pressComp = machineTwin.components.find(c => c.component_type.includes('Pressure'));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            Cyber-Physical Schematic & Component Hierarchy
          </h2>
          <p className="text-xs text-slate-500">
            Interactive digital representation of {machineTwin.name}. Click on any component to inspect cyber-physical telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal (&gt;75%)
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warning (40-75%)
          </span>
          <span className="flex items-center gap-1 text-red-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical (&lt;40%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Schematic Canvas */}
        <div className="lg:col-span-8 bg-slate-50/70 rounded-xl border border-slate-200 p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
          <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-400 font-medium">
            ASSET TAG: {machineTwin.id} | MODEL: HORIZONTAL OVERHUNG SLURRY
          </div>

          <svg viewBox="0 0 760 300" className="w-full max-w-[720px] h-auto drop-shadow-xs select-none">
            {/* Background Foundation Rail */}
            <rect x="40" y="220" width="680" height="24" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
            <line x1="120" y1="244" x2="120" y2="260" stroke="#64748b" strokeWidth="4" />
            <line x1="380" y1="244" x2="380" y2="260" stroke="#64748b" strokeWidth="4" />
            <line x1="640" y1="244" x2="640" y2="260" stroke="#64748b" strokeWidth="4" />

            {/* 1. MOTOR (Left) */}
            <g 
              onClick={() => motorComp && setSelectedCompId(motorComp.id)}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              {/* Motor Casing */}
              <rect 
                x="60" y="80" width="180" height="135" rx="8" 
                fill={motorComp ? getStatusColor(motorComp.status).fill : '#f1f5f9'}
                stroke={motorComp && motorComp.id === selectedCompId ? '#0284c7' : (motorComp ? getStatusColor(motorComp.status).stroke : '#94a3b8')}
                strokeWidth={motorComp && motorComp.id === selectedCompId ? '3' : '2'}
              />
              {/* Motor Cooling Fins */}
              <line x1="80" y1="80" x2="80" y2="215" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="110" y1="80" x2="110" y2="215" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="140" y1="80" x2="140" y2="215" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="170" y1="80" x2="170" y2="215" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="200" y1="80" x2="200" y2="215" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Fan Cowl */}
              <path d="M 60,105 L 45,120 L 45,175 L 60,190 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
              {/* Motor Label */}
              <text x="150" y="145" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="bold">ELECTRIC MOTOR</text>
              <text x="150" y="162" textAnchor="middle" fill="#64748b" fontSize="10">37 kW Induction</text>
              <text x="150" y="180" textAnchor="middle" fill={motorComp ? getStatusColor(motorComp.status).text : '#334155'} fontSize="11" fontWeight="bold">
                {motorComp?.health_score}% Health
              </text>
            </g>

            {/* 2. SHAFT & COUPLING (Between Motor & Pump) */}
            <g 
              onClick={() => shaftComp && setSelectedCompId(shaftComp.id)}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              {/* Drive Shaft */}
              <rect x="240" y="138" width="80" height="20" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
              {/* Flexible Coupling Guard */}
              <rect 
                x="260" y="115" width="40" height="66" rx="4"
                fill={shaftComp ? getStatusColor(shaftComp.status).fill : '#f1f5f9'}
                stroke={shaftComp && shaftComp.id === selectedCompId ? '#0284c7' : (shaftComp ? getStatusColor(shaftComp.status).stroke : '#94a3b8')}
                strokeWidth={shaftComp && shaftComp.id === selectedCompId ? '3' : '2'}
              />
              <text x="280" y="140" textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="bold">SHAFT &</text>
              <text x="280" y="152" textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="bold">COUPLING</text>
            </g>

            {/* 3. BEARING HOUSING & PEDESTAL */}
            <g 
              onClick={() => bearingComp && setSelectedCompId(bearingComp.id)}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              {/* Pedestal Housing */}
              <path 
                d="M 320,110 L 450,110 L 460,215 L 310,215 Z" 
                fill={bearingComp ? getStatusColor(bearingComp.status).fill : '#f1f5f9'}
                stroke={bearingComp && bearingComp.id === selectedCompId ? '#0284c7' : (bearingComp ? getStatusColor(bearingComp.status).stroke : '#94a3b8')}
                strokeWidth={bearingComp && bearingComp.id === selectedCompId ? '3' : '2'}
              />
              {/* Bearings Left & Right (DE & NDE) */}
              <circle cx="350" cy="148" r="18" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              <circle cx="350" cy="148" r="7" fill="#64748b" />
              <circle cx="420" cy="148" r="18" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
              <circle cx="420" cy="148" r="7" fill="#64748b" />

              <text x="385" y="185" textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="bold">BEARING HOUSING</text>
              <text x="385" y="200" textAnchor="middle" fill={bearingComp ? getStatusColor(bearingComp.status).text : '#334155'} fontSize="11" fontWeight="bold">
                {bearingComp?.health_score}% Health
              </text>
            </g>

            {/* 4. MECHANICAL SEAL */}
            <g 
              onClick={() => sealComp && setSelectedCompId(sealComp.id)}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <rect 
                x="455" y="125" width="30" height="46" rx="3"
                fill={sealComp ? getStatusColor(sealComp.status).fill : '#f1f5f9'}
                stroke={sealComp && sealComp.id === selectedCompId ? '#0284c7' : (sealComp ? getStatusColor(sealComp.status).stroke : '#94a3b8')}
                strokeWidth={sealComp && sealComp.id === selectedCompId ? '3' : '2'}
              />
              <text x="470" y="145" textAnchor="middle" fill="#1e293b" fontSize="8" fontWeight="bold">SEAL</text>
              <text x="470" y="157" textAnchor="middle" fill="#64748b" fontSize="8">API 682</text>
            </g>

            {/* 5. PUMP CASING & VOLUTE (Right) */}
            <g 
              onClick={() => impellerComp && setSelectedCompId(impellerComp.id)}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
            >
              {/* Spiral Volute Casing */}
              <path 
                d="M 485,75 C 560,50 630,85 645,145 C 655,190 620,225 550,220 C 495,215 480,180 485,150 Z" 
                fill={impellerComp ? getStatusColor(impellerComp.status).fill : '#f1f5f9'}
                stroke={impellerComp && impellerComp.id === selectedCompId ? '#0284c7' : (impellerComp ? getStatusColor(impellerComp.status).stroke : '#94a3b8')}
                strokeWidth={impellerComp && impellerComp.id === selectedCompId ? '3' : '2'}
              />
              {/* Internal Impeller Blades */}
              <circle cx="560" cy="148" r="32" fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="8 6" />
              <path d="M 560,116 L 560,180 M 528,148 L 592,148" stroke="#475569" strokeWidth="2" />

              {/* Suction Nozzle (Front Flange) */}
              <rect x="640" y="130" width="40" height="36" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
              <rect x="675" y="122" width="10" height="52" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
              <text x="695" y="152" fill="#475569" fontSize="10" fontWeight="bold">SUCTION</text>

              {/* Discharge Nozzle (Top Flange) */}
              <rect 
                x="542" y="30" width="36" height="50" rx="2" 
                fill={pressComp ? getStatusColor(pressComp.status).fill : '#94a3b8'} 
                stroke={pressComp ? getStatusColor(pressComp.status).stroke : '#64748b'} 
                strokeWidth="1.5" 
                onClick={(e) => { e.stopPropagation(); pressComp && setSelectedCompId(pressComp.id); }}
              />
              <rect x="536" y="24" width="48" height="10" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
              <text x="560" y="16" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">DISCHARGE</text>

              <text x="560" y="195" textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="bold">IMPELLER & PUMP</text>
              <text x="560" y="210" textAnchor="middle" fill={impellerComp ? getStatusColor(impellerComp.status).text : '#334155'} fontSize="11" fontWeight="bold">
                {impellerComp?.health_score}% Health
              </text>
            </g>

            {/* Sensor Tag Callouts */}
            <g className="sensor-callout pointer-events-none">
              <circle cx="350" cy="120" r="5" fill="#0284c7" />
              <line x1="350" y1="120" x2="350" y2="80" stroke="#0284c7" strokeWidth="1.5" />
              <rect x="310" y="60" width="80" height="20" rx="4" fill="#0284c7" />
              <text x="350" y="74" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                VIB: {machineTwin.latest_reading.vibration} mm/s
              </text>
            </g>

            <g className="sensor-callout pointer-events-none">
              <circle cx="420" cy="120" r="5" fill="#f59e0b" />
              <line x1="420" y1="120" x2="420" y2="70" stroke="#f59e0b" strokeWidth="1.5" />
              <rect x="390" y="50" width="80" height="20" rx="4" fill="#f59e0b" />
              <text x="430" y="64" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                TEMP: {machineTwin.latest_reading.temperature}°C
              </text>
            </g>
          </svg>

          <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              Operating Hours: <strong className="text-slate-800">{machineTwin.operating_hours} hrs</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Next Scheduled Maintenance: <strong className="text-slate-800">{machineTwin.next_recommended_maintenance.split('T')[0]}</strong>
            </span>
          </div>
        </div>

        {/* Selected Component Inspection Panel */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                Component Telemetry
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {selectedComponent.name}
              </h3>
            </div>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getStatusColor(selectedComponent.status).badge}`}>
              {selectedComponent.status}
            </span>
          </div>

          {/* Health & Wear Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Health Score</span>
                <span className="font-bold text-slate-900">{selectedComponent.health_score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    selectedComponent.health_score < 40 ? 'bg-red-500' :
                    selectedComponent.health_score < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedComponent.health_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Accumulated Mechanical Wear</span>
                <span className="font-bold text-slate-900">{selectedComponent.wear_percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-slate-600 transition-all duration-500"
                  style={{ width: `${selectedComponent.wear_percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Metadata Specs */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Component Type:</span>
              <span className="font-semibold text-slate-800">{selectedComponent.component_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Criticality Class:</span>
              <span className="font-semibold text-slate-800">{selectedComponent.criticality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Inspection:</span>
              <span className="font-mono text-slate-700">{selectedComponent.last_inspected || '2026-08-15'}</span>
            </div>
            {selectedComponent.details && Object.entries(selectedComponent.details).map(([k, v]) => (
              <div key={k} className="flex justify-between border-t border-slate-100 pt-1">
                <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                <span className="font-mono text-slate-800 font-medium">{String(v)}</span>
              </div>
            ))}
          </div>

          {/* Maintenance Directive Notice */}
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg flex items-start gap-2.5 text-xs text-sky-900">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p>
              Digital Twin cyber-physical state synchronizes every 1 sec. Physical wear curve estimates Remaining Useful Life (RUL) through continuous gradient boosting inference.
            </p>
          </div>
        </div>
      </div>

      {/* Component Quick Selector Cards */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {machineTwin.components.map((comp) => {
          const isSelected = comp.id === selectedCompId;
          const statusStyle = getStatusColor(comp.status);
          return (
            <button
              key={comp.id}
              onClick={() => setSelectedCompId(comp.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">
                  {comp.component_type.split(' ')[0]}
                </span>
                <span className={`w-2 h-2 rounded-full ${comp.status === 'CRITICAL' ? 'bg-red-500' : comp.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </div>
              <div className="text-xs font-bold text-slate-800 truncate mb-1">
                {comp.name}
              </div>
              <div className="text-xs font-mono font-semibold" style={{ color: statusStyle.text }}>
                {comp.health_score}%
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
