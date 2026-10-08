import {
  MachineTwin,
  SensorReading,
  PredictionResult,
  UncertaintyResult,
  ExplainabilityResult,
  DocumentItem,
  RetrievedChunk,
  KnowledgeGraphData,
  GraphRAGResult,
  HybridRAGResponse,
  AlertItem,
  ModelMetrics,
  ExperimentComparison
} from '../types';

const API_BASE = '/api';

export const api = {
  async getSystemStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json();
  },

  async getMachines(): Promise<MachineTwin[]> {
    const res = await fetch(`${API_BASE}/machines`);
    if (!res.ok) throw new Error('Failed to fetch machines');
    return res.json();
  },

  async getMachine(id: string): Promise<MachineTwin> {
    const res = await fetch(`${API_BASE}/machines/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch machine ${id}`);
    return res.json();
  },

  async getSensorHistory(id: string, limit: number = 60): Promise<{ latest: SensorReading; history: SensorReading[] }> {
    const res = await fetch(`${API_BASE}/sensors/${id}?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch sensors for ${id}`);
    return res.json();
  },

  async getPrediction(id: string): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/predictions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch prediction');
    return res.json();
  },

  async getUncertainty(id: string): Promise<UncertaintyResult> {
    const res = await fetch(`${API_BASE}/uncertainty/${id}`);
    if (!res.ok) throw new Error('Failed to fetch uncertainty');
    return res.json();
  },

  async getExplainability(id: string): Promise<ExplainabilityResult> {
    const res = await fetch(`${API_BASE}/explainability/${id}`);
    if (!res.ok) throw new Error('Failed to fetch explainability');
    return res.json();
  },

  async injectFault(machineId: string, faultType: string, severity: number): Promise<any> {
    const res = await fetch(`${API_BASE}/simulate/fault`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        machine_id: machineId,
        fault_type: faultType,
        severity: severity,
        duration_steps: 100
      })
    });
    if (!res.ok) throw new Error('Failed to inject fault');
    return res.json();
  },

  async resetSimulation(machineId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/simulate/reset/${machineId}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  async updateSimulationConfig(cfg: any): Promise<any> {
    const res = await fetch(`${API_BASE}/simulate/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
    if (!res.ok) throw new Error('Failed to update config');
    return res.json();
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async searchVectorRAG(query: string, topK: number = 4): Promise<{ query: string; total_results: number; chunks: RetrievedChunk[] }> {
    const res = await fetch(`${API_BASE}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK })
    });
    if (!res.ok) throw new Error('Failed to search vector RAG');
    return res.json();
  },

  async uploadDocument(formData: FormData): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async deleteDocument(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  async getKnowledgeGraphData(): Promise<KnowledgeGraphData> {
    const res = await fetch(`${API_BASE}/graphrag/data`);
    if (!res.ok) throw new Error('Failed to fetch graph data');
    return res.json();
  },

  async queryGraphRAG(entity: string): Promise<GraphRAGResult> {
    const res = await fetch(`${API_BASE}/graphrag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_entity: entity, target_fault: entity })
    });
    if (!res.ok) throw new Error('Failed to query GraphRAG');
    return res.json();
  },

  async executeHybridQuery(machineId: string, query: string): Promise<HybridRAGResponse> {
    const res = await fetch(`${API_BASE}/hybrid/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machine_id: machineId, query })
    });
    if (!res.ok) throw new Error('Failed to execute Hybrid RAG');
    return res.json();
  },

  async getRecommendations(machineId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/recommendations/${machineId}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async getAlerts(): Promise<AlertItem[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/${id}/ack`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to ack alert');
    return res.json();
  },

  async getModelMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${API_BASE}/model/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async getExperiments(): Promise<ExperimentComparison[]> {
    const res = await fetch(`${API_BASE}/experiments`);
    if (!res.ok) throw new Error('Failed to fetch experiments');
    return res.json();
  },

  async getArchitecture(): Promise<any> {
    const res = await fetch(`${API_BASE}/architecture`);
    if (!res.ok) throw new Error('Failed to fetch architecture');
    return res.json();
  }
};
