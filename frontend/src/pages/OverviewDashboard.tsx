import React, { useState, useEffect, useRef } from 'react';
import { 
  MachineTwin, 
  PredictionResult, 
  UncertaintyResult, 
  ExplainabilityResult, 
  AlertItem, 
  SensorReading 
} from '../types';
import { api } from '../services/api';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Flame, 
  ArrowUpRight, 
  Wrench, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  RotateCcw,
  Gauge,
  ChevronDown,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface OverviewDashboardProps {
  machineTwin: MachineTwin | null;
  prediction: PredictionResult | null;
  uncertainty: UncertaintyResult | null;
  explainability: ExplainabilityResult | null;
  alerts: AlertItem[];
  sensorHistory: SensorReading[];
  onNavigate: (view: string) => void;
  onQuickDemo: () => void;
  onResetDemo?: () => void;
  onSelectMachine?: (id: string) => void;
}

interface LiveTelemetryPoint {
  index: number;
  time: string;
  vibration: number;
  temperature: number;
  health: number;
  nominalBaseline: number;
}

// Circular progress ring gauge component matching reference design
const CircularGauge: React.FC<{ value: number; label: string; color?: string }> = ({ 
  value, 
  label, 
  color = "#0284c7" 
}) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="4.5"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={color}
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>
      <div className="text-right pl-3">
        <span className="text-[11px] font-medium text-slate-500 block truncate">{label}</span>
        <span className="text-xl font-bold font-mono text-slate-900">{value}%</span>
      </div>
    </div>
  );
};

const generateInitialTelemetry = (isFault: boolean): LiveTelemetryPoint[] => {
  const points: LiveTelemetryPoint[] = [];
  const now = Date.now();
  const baseVib = isFault ? 5.2 : 2.1;
  const baseTemp = isFault ? 76.0 : 58.0;
  const baseHealth = isFault ? 24 : 88;

  for (let i = 59; i >= 0; i--) {
    const timestamp = new Date(now - i * 1200);
    const timeStr = timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const waveVib = Math.sin((60 - i) * 0.15) * 0.08 + (Math.random() - 0.5) * 0.08;
    const waveTemp = Math.cos((60 - i) * 0.12) * 0.4 + (Math.random() - 0.5) * 0.3;
    const waveHealth = Math.sin((60 - i) * 0.2) * 2;

    points.push({
      index: 60 - i,
      time: timeStr,
      vibration: Number(Math.max(1.6, baseVib + waveVib).toFixed(2)),
      temperature: Number(Math.max(52.0, baseTemp + waveTemp).toFixed(1)),
      health: Number(Math.max(10, Math.min(99, baseHealth + waveHealth)).toFixed(0)),
      nominalBaseline: 85
    });
  }
  return points;
};

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  machineTwin,
  prediction,
  uncertainty,
  explainability,
  alerts,
  sensorHistory,
  onNavigate,
  onQuickDemo,
  onResetDemo,
  onSelectMachine
}) => {
  const [fleetMachines, setFleetMachines] = useState<MachineTwin[]>([]);
  const [timeHorizon, setTimeHorizon] = useState<string>('Last 60s');

  useEffect(() => {
    api.getMachines().then(setFleetMachines).catch(console.error);
  }, [machineTwin?.id, machineTwin?.operating_state]);

  const isFault = Boolean(
    machineTwin && (
      machineTwin.operating_state === 'DEGRADING' || 
      machineTwin.operating_state === 'CRITICAL' ||
      (Boolean(machineTwin.active_fault) && machineTwin.active_fault !== 'NORMAL')
    )
  );

  const [telemetryStream, setTelemetryStream] = useState<LiveTelemetryPoint[]>(() => generateInitialTelemetry(isFault));
  const currentVibRef = useRef<number>(isFault ? 5.2 : 2.1);
  const currentTempRef = useRef<number>(isFault ? 76.0 : 58.0);
  const counterRef = useRef<number>(60);

  // Live rolling telemetry streaming effect (updates smoothly every 1.2s)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeFault = Boolean(
        machineTwin && (
          machineTwin.operating_state === 'DEGRADING' || 
          machineTwin.operating_state === 'CRITICAL' ||
          (Boolean(machineTwin.active_fault) && machineTwin.active_fault !== 'NORMAL')
        )
      );

      if (activeFault) {
        if (currentVibRef.current < 5.5) {
          currentVibRef.current = Math.min(5.5, currentVibRef.current + 0.75);
        }
        if (currentTempRef.current < 79.0) {
          currentTempRef.current = Math.min(79.0, currentTempRef.current + 4.8);
        }
      } else {
        if (currentVibRef.current > 2.15) {
          currentVibRef.current = Math.max(2.1, currentVibRef.current - 0.7);
        }
        if (currentTempRef.current > 58.2) {
          currentTempRef.current = Math.max(58.0, currentTempRef.current - 4.5);
        }
      }

      const noiseVib = (Math.random() - 0.5) * 0.12 + Math.sin(counterRef.current * 0.2) * 0.05;
      const noiseTemp = (Math.random() - 0.5) * 0.35 + Math.cos(counterRef.current * 0.15) * 0.15;

      const nextVib = Number(Math.max(1.5, currentVibRef.current + noiseVib).toFixed(2));
      const nextTemp = Number(Math.max(45.0, currentTempRef.current + noiseTemp).toFixed(1));

      // Target health based on vibration
      const targetHealth = activeFault 
        ? Math.max(15, Math.round(92 - (currentVibRef.current * 14))) 
        : 88;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      counterRef.current += 1;

      const newPoint: LiveTelemetryPoint = {
        index: counterRef.current,
        time: timeStr,
        vibration: nextVib,
        temperature: nextTemp,
        health: targetHealth,
        nominalBaseline: 85
      };

      setTelemetryStream(prev => [...prev.slice(1), newPoint]);
    }, 1200);

    return () => clearInterval(interval);
  }, [machineTwin?.operating_state, machineTwin?.active_fault, machineTwin?.id]);

  if (!machineTwin) {
    return <div className="p-8 text-center text-slate-500">Loading digital twin state...</div>;
  }

  const latestPoint = telemetryStream[telemetryStream.length - 1] || {
    vibration: currentVibRef.current,
    temperature: currentTempRef.current,
    health: 88,
    nominalBaseline: 85,
    time: 'Now'
  };

  const healthScore = prediction ? prediction.health_score : latestPoint.health;
  const failPct = prediction ? Math.round(prediction.failure_probability * 100) : (isFault ? 84 : 12);
  const rulHours = prediction ? prediction.rul_hours : machineTwin.rul_hours;

  // Component stress metrics for the paired bar chart (Card 2)
  const stressMultiplier = isFault ? 2.4 : 1.0;
  const componentMetrics = [
    { name: 'M1', component: 'Impeller', nominal: 18, dynamic: Math.min(48, Math.round(18 * (isFault ? 1.6 : 1.0))) },
    { name: 'M2', component: 'Bearings', nominal: 22, dynamic: Math.min(48, Math.round(22 * stressMultiplier)) },
    { name: 'M3', component: 'Mech Seal', nominal: 20, dynamic: Math.min(48, Math.round(20 * (isFault ? 2.1 : 1.0))) },
    { name: 'M4', component: 'Motor Winding', nominal: 25, dynamic: Math.min(48, Math.round(25 * (isFault ? 1.8 : 1.0))) },
    { name: 'M5', component: 'Shaft', nominal: 19, dynamic: Math.min(48, Math.round(19 * (isFault ? 1.7 : 1.0))) },
    { name: 'M6', component: 'Casing', nominal: 17, dynamic: Math.min(48, Math.round(17 * (isFault ? 1.3 : 1.0))) },
    { name: 'M7', component: 'Coupling', nominal: 21, dynamic: Math.min(48, Math.round(21 * (isFault ? 1.9 : 1.0))) },
    { name: 'M8', component: 'Discharge', nominal: 24, dynamic: Math.min(48, Math.round(24 * (isFault ? 1.4 : 1.0))) },
  ];

  // Fleet assets list (Card 4)
  const fleetList = [
    {
      id: 'CP-001',
      name: 'Centrifugal Pump CP-001',
      subtitle: 'Primary Slurry Drive',
      health: healthScore,
      state: machineTwin.operating_state,
      power: '37 kW',
      location: 'Circuit A-01',
      isActive: machineTwin.id === 'CP-001'
    },
    {
      id: 'CP-002',
      name: 'Booster Pump CP-002',
      subtitle: 'High-Pressure Injection',
      health: 92,
      state: 'NORMAL',
      power: '45 kW',
      location: 'Header B-04',
      isActive: machineTwin.id === 'CP-002'
    },
    {
      id: 'CP-003',
      name: 'Chemical Pump CP-003',
      subtitle: 'Acidic Leaching Circuit',
      health: 89,
      state: 'NORMAL',
      power: '30 kW',
      location: 'Reactor C-02',
      isActive: machineTwin.id === 'CP-003'
    },
    {
      id: 'CP-004',
      name: 'Slurry Feed CP-004',
      subtitle: 'Extraction Feed Sump',
      health: 96,
      state: 'NORMAL',
      power: '55 kW',
      location: 'Pit D-01',
      isActive: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER SECTION (Matching the reference design layout) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-950 via-[#07192f] to-[#041224] border border-slate-800 shadow-xl min-h-[300px] flex items-center">
        {/* Dynamic Industrial Digital Twin Imagery (Right Side with Fade Mask) */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[58%] pointer-events-none select-none overflow-hidden">
          <img 
            src="/industrial_twin_hero.jpg" 
            alt="Centrifugal Pump Cyber-Physical Digital Twin" 
            className="w-full h-full object-cover object-center opacity-80 md:opacity-90 transform scale-105"
          />
          {/* Gradient fade to seamlessly blend with dark hero content */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-[#07192f]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
        </div>

        {/* Hero Content (Left Side) */}
        <div className="relative z-10 p-7 md:p-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full">
              Industrial AI Platform
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-full">
              Digital Twin v2.4
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
            Better Intelligence.<br />
            Stronger Twins.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Track real-time machine telemetry, monitor cyber-physical twin degradation, and eliminate unplanned downtime with uncertainty-calibrated Hybrid RAG.
          </p>

          <div className="flex items-center flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('hybrid-rag')}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-teal-500/20 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Launch Hybrid RAG</span>
            </button>

            <button
              onClick={onQuickDemo}
              className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all border flex items-center gap-2 ${
                isFault
                  ? 'bg-orange-600/90 text-white border-orange-500 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>{isFault ? 'Fault Active (Degrading)' : 'Simulate Fault Demo'}</span>
            </button>

            {onResetDemo && (
              <button
                onClick={onResetDemo}
                className="px-3.5 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition-colors border border-slate-700/80 flex items-center gap-1.5"
                title="Reset simulation back to healthy baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. THREE-COLUMN DASHBOARD GRID (Exact Layout from Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* CARD 1 (Left, ~50% width): Telemetry & Asset Health Trend */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Team Performance Trend
              </h3>
              
              <div className="relative">
                <button 
                  onClick={() => setTimeHorizon(timeHorizon === 'Last 60s' ? 'Last 15m' : 'Last 60s')}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span>{timeHorizon}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Avg. Asset Health Score</span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-4xl font-black font-mono text-slate-900">
                  {healthScore}%
                </span>
                <span className={`text-xs font-bold ${
                  healthScore > 75 ? 'text-emerald-600' : healthScore > 45 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  ↑ {healthScore > 75 ? '+12%' : '-46%'} vs previous
                </span>
              </div>
            </div>
          </div>

          {/* Area Chart matching reference aesthetic */}
          <div className="h-56 w-full pt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryStream} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.03}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={11} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" stroke="#94a3b8" />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Health Score']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="health" 
                  stroke="#0284c7" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#healthGrad)" 
                  name="Health Score" 
                  isAnimationActive={true}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Floating marker badge matching the 78% marker from screenshot */}
            <div className="absolute right-8 top-12 bg-slate-900 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <span>{latestPoint.health}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600" /> Live Stream: {latestPoint.vibration} mm/s RMS
            </span>
            <button 
              onClick={() => onNavigate('live-monitoring')}
              className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              <span>Live Telemetry</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2 (Middle, ~30% width): Goals & Shots -> Operating Loads & Stress */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Operating Loads & Stress
              </h3>
              
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-sky-200 inline-block" /> Nominal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block" /> Live
                </span>
              </div>
            </div>

            {/* KPI Callouts */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Vibration RMS</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {latestPoint.vibration}
                  </span>
                  <span className="text-[10px] text-slate-500">mm/s</span>
                </div>
                <span className={`text-[10px] font-bold ${latestPoint.vibration > 4.0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ↑ {latestPoint.vibration > 4.0 ? '+150% Alert' : 'ISO Zone A'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Operating Temp</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {latestPoint.temperature}°
                  </span>
                  <span className="text-[10px] text-slate-500">C</span>
                </div>
                <span className={`text-[10px] font-bold ${latestPoint.temperature > 70 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ↑ {latestPoint.temperature > 70 ? '+32% Hot' : 'Within Limits'}
                </span>
              </div>
            </div>
          </div>

          {/* Paired Bar Chart with M1 to M8 Columns */}
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentMetrics} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis domain={[0, 50]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <Tooltip 
                  formatter={(val: any, name?: any) => [`${val} stress index`, String(name) === 'nominal' ? 'Nominal Baseline' : 'Live Dynamic Load']}
                />
                <Bar dataKey="nominal" fill="#bae6fd" radius={[2, 2, 0, 0]} />
                <Bar dataKey="dynamic" fill="#0284c7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 font-mono text-center pt-2 border-t border-slate-100">
            Components: M1 Impeller | M2 Bearings | M3 Seal | M4 Motor
          </div>
        </div>

        {/* CARD 3 (Right, ~20% width): Diagnostic Reliability (Circular Progress Gauges) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Diagnostic Reliability
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
              Verified
            </span>
          </div>

          {/* 3 Circular Gauges matching the screenshot */}
          <div className="space-y-1.5 py-1">
            <CircularGauge 
              value={uncertainty?.confidence_level === 'HIGH' ? 92 : 46} 
              label="Model Confidence" 
              color="#0284c7" 
            />
            <CircularGauge 
              value={90} 
              label="Interval Coverage (PICP)" 
              color="#0284c7" 
            />
            <CircularGauge 
              value={88} 
              label="RAG Context Precision" 
              color="#0284c7" 
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('model-performance')}
              className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <span>View Calibration Report</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: MONITORED FLEET ASSETS (Matching Player Stats Card Row from Reference) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Monitored Fleet Assets
            </h3>
            <p className="text-xs text-slate-500">
              Synchronized cyber-physical twin assets across processing trains
            </p>
          </div>

          <button 
            onClick={() => onNavigate('digital-twin')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-sky-600 transition-colors border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100"
          >
            <span>Top Performers</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid of 4 Asset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {fleetList.map((asset) => (
            <div 
              key={asset.id}
              onClick={() => {
                if (onSelectMachine) onSelectMachine(asset.id);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                asset.isActive
                  ? 'bg-sky-50/60 border-sky-400 ring-2 ring-sky-200 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {asset.isActive && (
                <span className="absolute top-3 right-3 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-sky-600 text-white uppercase tracking-wider">
                  Active Asset
                </span>
              )}

              {/* Asset Icon Avatar */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  asset.state === 'CRITICAL' ? 'bg-red-100 border-red-300 text-red-700' :
                  asset.state === 'DEGRADING' ? 'bg-orange-100 border-orange-300 text-orange-700' :
                  'bg-white border-slate-200 text-sky-600'
                }`}>
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {asset.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 block">
                    {asset.subtitle}
                  </span>
                </div>
              </div>

              {/* Asset Metrics */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Health</span>
                  <span className="font-bold font-mono text-slate-900">{asset.health}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Rating</span>
                  <span className="font-bold text-slate-700">{asset.power}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Condition</span>
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    asset.state === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    asset.state === 'DEGRADING' ? 'bg-orange-100 text-orange-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {asset.state}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
