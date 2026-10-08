import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Flame, 
  Cpu, 
  Layers,
  Sparkles
} from 'lucide-react';
import { MachineTwin, AlertItem } from '../types';

interface HeaderProps {
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
  machineTwin: MachineTwin | null;
  alerts: AlertItem[];
  onQuickDemo: () => void;
  onResetDemo: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMachineId,
  onSelectMachine,
  machineTwin,
  alerts,
  onQuickDemo,
  onResetDemo,
  activeView,
  setActiveView
}) => {
  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const isDegrading = machineTwin?.operating_state === 'DEGRADING' || machineTwin?.operating_state === 'CRITICAL';

  const navItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'digital-twin', label: 'Digital Twin' },
    { id: 'live-monitoring', label: 'Live Telemetry' },
    { id: 'predictive-maintenance', label: 'Predictive ML' },
    { id: 'hybrid-rag', label: 'Hybrid RAG' },
    { id: 'recommendations', label: 'Directives' },
    { id: 'model-performance', label: 'Analysis' }
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div 
          className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-2xs"
          title="TWIN-RAG Industrial Cyber-Physical Platform"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6.5H20" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 6.5V17.5" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="4" cy="6.5" r="2.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="20" cy="6.5" r="2.5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="12" cy="17.5" r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              TWIN-RAG AI
            </h1>
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded">
              Research Prototype
            </span>
          </div>
        </div>
      </div>

      {/* Center: Top Pill Navigation Bar (Matching Reference Image) */}
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-white/15 text-white border border-white/20 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Machine Selector, State Pill, Alerts, Demo Buttons */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Machine Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-500 font-medium">Asset:</span>
          <select
            value={selectedMachineId}
            onChange={(e) => onSelectMachine(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="CP-001" className="bg-slate-900 text-white">CP-001 Centrifugal</option>
            <option value="CP-002" className="bg-slate-900 text-white">CP-002 Booster</option>
            <option value="CP-003" className="bg-slate-900 text-white">CP-003 Slurry</option>
          </select>
        </div>

        {/* Operating State Pill */}
        {machineTwin && (
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
            machineTwin.operating_state === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
            machineTwin.operating_state === 'DEGRADING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
            machineTwin.operating_state === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              machineTwin.operating_state === 'CRITICAL' ? 'bg-red-400 animate-ping' :
              machineTwin.operating_state === 'DEGRADING' ? 'bg-orange-400' :
              machineTwin.operating_state === 'WARNING' ? 'bg-amber-400' :
              'bg-emerald-400'
            }`} />
            <span>{machineTwin.operating_state}</span>
          </div>
        )}

        {/* Active Alerts Button */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
            activeAlertsCount > 0
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title={`${activeAlertsCount} Active Alarms`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${activeAlertsCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>{activeAlertsCount}</span>
        </button>

        {/* Simulate Fault Trigger */}
        <button
          onClick={onQuickDemo}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all shadow-xs ${
            isDegrading
              ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950'
          }`}
          title="Inject Bearing Degradation fault into CP-001"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{isDegrading ? 'Fault Active' : 'Simulate Fault'}</span>
        </button>

        {/* Reset Simulation Button */}
        <button
          onClick={onResetDemo}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          title="Reset simulated machine state to Healthy Normal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
