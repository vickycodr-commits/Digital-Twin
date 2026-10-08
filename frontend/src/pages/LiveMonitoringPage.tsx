import React, { useState } from 'react';
import { SensorReading, MachineTwin } from '../types';
import { Activity, Clock, Sliders, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface LiveMonitoringPageProps {
  machineTwin: MachineTwin | null;
  sensorHistory: SensorReading[];
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({
  machineTwin,
  sensorHistory
}) => {
  const [timeWindow, setTimeWindow] = useState<string>('15m');

  const latest = machineTwin?.latest_reading;
  const timeWindows = ['5m', '15m', '1h', '6h', '24h'];

  const chartData = sensorHistory.map((s, idx) => ({
    time: `${idx * 2}s`,
    vibration: s.vibration,
    temperature: s.temperature,
    pressure: s.pressure,
    rpm: s.rpm,
    current: s.current,
    flow_rate: s.flow_rate
  }));

  const sensorsConfig = [
    {
      key: 'vibration',
      name: 'Vibration RMS Velocity',
      unit: 'mm/s',
      color: '#0284c7',
      warnThreshold: 3.5,
      critThreshold: 4.8,
      value: latest?.vibration ?? 2.1,
      domain: [0, 8]
    },
    {
      key: 'temperature',
      name: 'Bearing Temperature (RTD)',
      unit: '°C',
      color: '#f59e0b',
      warnThreshold: 68.0,
      critThreshold: 78.0,
      value: latest?.temperature ?? 58.0,
      domain: [40, 95]
    },
    {
      key: 'current',
      name: 'Motor Current Load',
      unit: 'A',
      color: '#8b5cf6',
      warnThreshold: 9.5,
      critThreshold: 11.0,
      value: latest?.current ?? 8.2,
      domain: [5, 14]
    },
    {
      key: 'pressure',
      name: 'Discharge Pressure',
      unit: 'bar',
      color: '#10b981',
      warnThreshold: 5.2,
      critThreshold: 7.5,
      value: latest?.pressure ?? 6.2,
      domain: [2, 10]
    },
    {
      key: 'flow_rate',
      name: 'Volumetric Flow Rate',
      unit: 'm³/h',
      color: '#06b6d4',
      warnThreshold: 35.0,
      critThreshold: 55.0,
      value: latest?.flow_rate ?? 45.0,
      domain: [15, 60]
    },
    {
      key: 'rpm',
      name: 'Shaft Speed (Optical)',
      unit: 'RPM',
      color: '#64748b',
      warnThreshold: 2880,
      critThreshold: 3050,
      value: latest?.rpm ?? 2950,
      domain: [2600, 3100]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Window Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-600" />
            Live Industrial Sensor Telemetry
          </h2>
          <p className="text-xs text-slate-500">
            Real-time streaming metrics with threshold bands based on ISO 10816 standards
          </p>
        </div>

        {/* Time Window Selectors */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {timeWindows.map((tw) => (
            <button
              key={tw}
              onClick={() => setTimeWindow(tw)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeWindow === tw
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tw}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 6 Real-time Sensor Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sensorsConfig.map((sc) => {
          const isCrit = sc.value >= sc.critThreshold;
          const isWarn = !isCrit && sc.value >= sc.warnThreshold;

          return (
            <div
              key={sc.key}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Telemetry Stream
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">
                    {sc.name}
                  </h3>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isCrit ? 'bg-red-100 text-red-800' :
                  isWarn ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {isCrit ? 'CRITICAL' : isWarn ? 'WARNING' : 'NORMAL'}
                </span>
              </div>

              {/* Latest Metric Number */}
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black font-mono text-slate-900">
                  {sc.value} <span className="text-xs font-medium text-slate-500">{sc.unit}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Warn: {sc.warnThreshold} {sc.unit}
                </div>
              </div>

              {/* Real-time Line Chart */}
              <div className="h-36 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                    <YAxis domain={sc.domain} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <ReferenceLine y={sc.warnThreshold} stroke="#f59e0b" strokeDasharray="3 3" />
                    <ReferenceLine y={sc.critThreshold} stroke="#ef4444" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey={sc.key}
                      stroke={sc.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
