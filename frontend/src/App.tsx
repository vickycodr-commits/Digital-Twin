import React, { useState, useEffect, useRef } from 'react';
import { api } from './services/api';
import { 
  MachineTwin, 
  PredictionResult, 
  UncertaintyResult, 
  ExplainabilityResult,
  AlertItem, 
  SensorReading, 
  DocumentItem, 
  KnowledgeGraphData, 
  HybridRAGResponse 
} from './types';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { UncertaintyPage } from './pages/UncertaintyPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { VectorRAGPage } from './pages/VectorRAGPage';
import { GraphRAGPage } from './pages/GraphRAGPage';
import { HybridRAGPage } from './pages/HybridRAGPage';
import { MaintenanceRecommendationsPage } from './pages/MaintenanceRecommendationsPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { SimulationFaultPage } from './pages/SimulationFaultPage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';
import { SettingsExperimentPage } from './pages/SettingsExperimentPage';

export function App() {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('CP-001');
  const [activeView, setActiveView] = useState<string>('dashboard');

  const [machineTwin, setMachineTwin] = useState<MachineTwin | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [uncertainty, setUncertainty] = useState<UncertaintyResult | null>(null);
  const [explainability, setExplainability] = useState<ExplainabilityResult | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [sensorHistory, setSensorHistory] = useState<SensorReading[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [hybridData, setHybridData] = useState<HybridRAGResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHybridLoading, setIsHybridLoading] = useState<boolean>(false);

  const fetchCoreData = async (mId: string) => {
    try {
      const [twin, pred, unc, exp, altList, sensorData] = await Promise.all([
        api.getMachine(mId),
        api.getPrediction(mId),
        api.getUncertainty(mId),
        api.getExplainability(mId),
        api.getAlerts(),
        api.getSensorHistory(mId, 60)
      ]);

      setMachineTwin(twin);
      setPrediction(pred);
      setUncertainty(unc);
      setExplainability(exp);
      setAlerts(altList);
      setSensorHistory(sensorData.history);
    } catch (err) {
      console.error('Failed to fetch machine data', err);
    }
  };

  const fetchGlobalResources = async () => {
    try {
      const [docs, kg] = await Promise.all([
        api.getDocuments(),
        api.getKnowledgeGraphData()
      ]);
      setDocuments(docs);
      setGraphData(kg);
    } catch (err) {
      console.error('Failed to fetch documents or graph', err);
    }
  };

  const executeHybridRAG = async (query: string) => {
    setIsHybridLoading(true);
    try {
      const res = await api.executeHybridQuery(selectedMachineId, query);
      setHybridData(res);
    } catch (err) {
      console.error('Failed to execute Hybrid RAG', err);
    } finally {
      setIsHybridLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchCoreData(selectedMachineId);
    fetchGlobalResources();
    executeHybridRAG(`Why is ${selectedMachineId} predicted to fail?`);
  }, [selectedMachineId]);

  // Periodic Telemetry Streaming Interval (2.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCoreData(selectedMachineId);
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedMachineId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick Demo: Inject Bearing Degradation Fault
  const handleQuickDemo = async () => {
    try {
      await api.injectFault(selectedMachineId, 'BEARING_DEGRADATION', 0.8);
      await fetchCoreData(selectedMachineId);
      await executeHybridRAG(`Why is ${selectedMachineId} predicted to fail?`);
      showToast(`Fault Injected! Bearing Degradation at 80% severity. Observing Digital Twin & Hybrid RAG.`);
    } catch (err: any) {
      showToast(`Demo fault error: ${err.message}`);
    }
  };

  // Quick Reset Simulation
  const handleResetDemo = async () => {
    try {
      await api.resetSimulation(selectedMachineId);
      await fetchCoreData(selectedMachineId);
      await executeHybridRAG(`Why is ${selectedMachineId} predicted to fail?`);
      showToast(`Simulation reset. ${selectedMachineId} restored to Nominal Baseline.`);
    } catch (err: any) {
      showToast(`Reset error: ${err.message}`);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <OverviewDashboard
            machineTwin={machineTwin}
            prediction={prediction}
            uncertainty={uncertainty}
            explainability={explainability}
            alerts={alerts}
            sensorHistory={sensorHistory}
            onNavigate={setActiveView}
            onQuickDemo={handleQuickDemo}
            onResetDemo={handleResetDemo}
            onSelectMachine={setSelectedMachineId}
          />
        );
      case 'digital-twin':
        return (
          <DigitalTwinPage
            machineTwin={machineTwin}
            onRefresh={() => fetchCoreData(selectedMachineId)}
          />
        );
      case 'live-monitoring':
        return (
          <LiveMonitoringPage
            machineTwin={machineTwin}
            sensorHistory={sensorHistory}
          />
        );
      case 'predictive-maintenance':
        return (
          <PredictiveMaintenancePage
            machineTwin={machineTwin}
            prediction={prediction}
            uncertainty={uncertainty}
          />
        );
      case 'uncertainty':
        return (
          <UncertaintyPage
            uncertainty={uncertainty}
            prediction={prediction}
          />
        );
      case 'explainability':
        return (
          <ExplainabilityPage
            explainability={explainability}
          />
        );
      case 'vector-rag':
        return (
          <VectorRAGPage
            documents={documents}
            defaultQuery="bearing degradation abnormal vibration"
          />
        );
      case 'graphrag':
        return (
          <GraphRAGPage
            graphData={graphData}
            prediction={prediction}
          />
        );
      case 'hybrid-rag':
        return (
          <HybridRAGPage
            machineTwin={machineTwin}
            hybridData={hybridData}
            onRefreshHybrid={executeHybridRAG}
            isLoading={isHybridLoading}
          />
        );
      case 'recommendations':
        return (
          <MaintenanceRecommendationsPage
            machineTwin={machineTwin}
            hybridData={hybridData}
          />
        );
      case 'documents':
        return (
          <KnowledgeBasePage
            documents={documents}
            onRefresh={fetchGlobalResources}
          />
        );
      case 'model-performance':
        return <ModelPerformancePage />;
      case 'simulation':
        return (
          <SimulationFaultPage
            machineTwin={machineTwin}
            onRefreshTwin={() => fetchCoreData(selectedMachineId)}
          />
        );
      case 'architecture':
        return <SystemArchitecturePage />;
      case 'experiments':
      case 'settings':
        return <SettingsExperimentPage />;
      default:
        return (
          <OverviewDashboard
            machineTwin={machineTwin}
            prediction={prediction}
            uncertainty={uncertainty}
            explainability={explainability}
            alerts={alerts}
            sensorHistory={sensorHistory}
            onNavigate={setActiveView}
            onQuickDemo={handleQuickDemo}
            onResetDemo={handleResetDemo}
            onSelectMachine={setSelectedMachineId}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        selectedMachineId={selectedMachineId}
        onSelectMachine={setSelectedMachineId}
        machineTwin={machineTwin}
        alerts={alerts}
        onQuickDemo={handleQuickDemo}
        onResetDemo={handleResetDemo}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Layout: Sidebar + Dynamic Page Content */}
      <div className="flex flex-1">
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          isFaultActive={machineTwin?.operating_state === 'DEGRADING' || machineTwin?.operating_state === 'CRITICAL'}
        />

        <main className="flex-1 p-6 md:p-8 max-w-[1600px] overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
