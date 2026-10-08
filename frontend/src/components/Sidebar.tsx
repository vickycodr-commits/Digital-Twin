import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Sliders,
  LineChart,
  ShieldAlert,
  Sparkles,
  FileText,
  Share2,
  Layers,
  Wrench,
  BookOpen,
  BarChart3,
  FlaskConical,
  Workflow,
  Settings,
  Flame
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  isFaultActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isFaultActive = false
}) => {
  const navSections: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'OPERATIONS & TWIN',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
        { id: 'live-monitoring', label: 'Live Monitoring', icon: Activity },
        { id: 'simulation', label: 'Simulation & Faults', icon: Sliders, badge: isFaultActive ? 'ACTIVE' : undefined }
      ]
    },
    {
      title: 'AI & UNCERTAINTY',
      items: [
        { id: 'predictive-maintenance', label: 'Predictive Maintenance', icon: LineChart },
        { id: 'uncertainty', label: 'Uncertainty Analysis', icon: ShieldAlert },
        { id: 'explainability', label: 'Explainable AI (SHAP)', icon: Sparkles }
      ]
    },
    {
      title: 'RETRIEVAL & REASONING',
      items: [
        { id: 'vector-rag', label: 'Vector RAG', icon: FileText },
        { id: 'graphrag', label: 'GraphRAG', icon: Share2 },
        { id: 'hybrid-rag', label: 'Hybrid RAG', icon: Layers, highlight: true },
        { id: 'recommendations', label: 'Maintenance Directives', icon: Wrench },
        { id: 'documents', label: 'Knowledge Base', icon: BookOpen }
      ]
    },
    {
      title: 'RESEARCH & EVALUATION',
      items: [
        { id: 'model-performance', label: 'Model Performance', icon: BarChart3 },
        { id: 'experiments', label: 'Experiment Mode', icon: FlaskConical },
        { id: 'architecture', label: 'System Architecture', icon: Workflow },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      <div className="py-4 px-3 space-y-6 flex-1 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-800 font-semibold border border-sky-200/80 shadow-2xs'
                        : item.highlight
                        ? 'text-teal-700 hover:bg-teal-50 hover:text-teal-800'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${
                        isActive
                          ? 'text-sky-600'
                          : item.highlight
                          ? 'text-teal-600'
                          : 'text-slate-400'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.highlight && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-teal-100 text-teal-800 tracking-wide">
                        Core Novelty
                      </span>
                    )}

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-orange-100 text-orange-800 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-700">TWIN-RAG AI</span>
          <span className="font-mono text-[10px] text-slate-400">v1.0.0-rc</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          Academic Research Prototype. Safe Standalone Mode.
        </div>
      </div>
    </aside>
  );
};
