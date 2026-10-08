export interface SensorReading {
  machine_id: string;
  timestamp: string;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  current: number;
  flow_rate: number;
  operating_hours: number;
  condition: 'NORMAL' | 'WARNING' | 'DEGRADING' | 'CRITICAL';
  fault_type?: string;
  fault_severity?: number;
}

export interface SensorItem {
  id: string;
  machine_id: string;
  component_id?: string;
  name: string;
  sensor_type: string;
  unit: string;
  current_value: number;
  min_threshold: number;
  warning_threshold: number;
  critical_threshold: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  sampling_rate_hz: number;
}

export interface ComponentItem {
  id: string;
  machine_id: string;
  name: string;
  component_type: string;
  health_score: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  criticality: 'LOW' | 'MEDIUM' | 'HIGH';
  wear_percentage: number;
  operating_hours: number;
  last_inspected?: string;
  details?: Record<string, any>;
}

export interface MachineTwin {
  id: string;
  name: string;
  machine_type: string;
  location: string;
  operating_state: 'NORMAL' | 'WARNING' | 'DEGRADING' | 'CRITICAL';
  health_score: number;
  failure_risk: number;
  rul_hours: number;
  uncertainty_score: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  operating_hours: number;
  last_maintenance: string;
  next_recommended_maintenance: string;
  components: ComponentItem[];
  sensors: SensorItem[];
  latest_reading: SensorReading;
  active_fault?: string;
  fault_severity?: number;
}

export interface PredictionResult {
  machine_id: string;
  timestamp: string;
  health_score: number;
  failure_probability: number;
  failure_type: string;
  rul_hours: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  model_version: string;
  model_status: string;
}

export interface UncertaintyResult {
  prediction_id?: string;
  machine_id: string;
  timestamp: string;
  failure_probability: number;
  mean_prediction: number;
  variance: number;
  std_dev: number;
  prediction_interval_lower: number;
  prediction_interval_upper: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  uncertainty_score: number;
  epistemic_uncertainty: number;
  aleatoric_uncertainty: number;
  reasons: string[];
  guidance_message: string;
}

export interface SHAPFeature {
  feature_name: string;
  feature_value: number;
  shap_value: number;
  percentage_contribution: number;
  direction: 'INCREASES_RISK' | 'DECREASES_RISK';
}

export interface ExplainabilityResult {
  prediction_id?: string;
  machine_id: string;
  timestamp: string;
  top_features: SHAPFeature[];
  dominant_symptom: string;
  base_value: number;
  prediction_value: number;
  natural_language_explanation: string;
  feature_waterfall: Array<{
    name: string;
    start: number;
    delta: number;
    end: number;
  }>;
  explanation_type: string;
}

export interface RetrievedChunk {
  document_title: string;
  document_category: string;
  section?: string;
  page_number?: number;
  similarity_score: number;
  content: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  chunk_count: number;
  status: string;
  category: string;
  uploaded_at: string;
  content_summary?: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  node_type: string;
  description?: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: string;
  weight: number;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface GraphPath {
  path_nodes: string[];
  path_edges: string[];
  description: string;
}

export interface GraphRAGResult {
  query_entity: string;
  discovered_faults: string[];
  causal_chains: GraphPath[];
  recommended_inspections: string[];
  relevant_subgraph: KnowledgeGraphData;
}

export interface FusedContext {
  machine_id: string;
  machine_state: string;
  current_sensors: Record<string, number>;
  ml_prediction: Record<string, any>;
  uncertainty: Record<string, any>;
  explainability: Record<string, any>;
  vector_evidence: RetrievedChunk[];
  graph_paths: GraphPath[];
}

export interface HybridRAGResponse {
  query: string;
  machine_id: string;
  fused_context: FusedContext;
  llm_explanation: {
    why_this_prediction: string;
    what_evidence_supports_it: string;
    what_is_the_likely_root_cause: string;
    what_should_the_maintenance_team_do: string[];
    how_urgent_is_it: string;
    priority: string;
    confidence_assessment: string;
    what_information_is_missing: string;
    engine_mode?: string;
  };
  recommended_maintenance: {
    priority: string;
    title: string;
    reason: string;
    recommended_actions: string[];
    supporting_evidence: string;
    estimated_rul_hours: number;
    confidence: string;
  };
  evidence_ranking: Array<{
    type: string;
    source: string;
    section: string;
    relevance_score: number;
    content: string;
    status: string;
  }>;
  confidence_assessment: string;
  is_ai_generated: boolean;
  disclaimer: string;
}

export interface AlertItem {
  id: string;
  machine_id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  alert_type: string;
  title: string;
  message: string;
  sensor_trigger?: string;
  threshold_value?: number;
  actual_value?: number;
  status: string;
  created_at: string;
}

export interface ModelMetrics {
  classification_accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  rul_mae_hours: number;
  rul_rmse_hours: number;
  rul_r2_score: number;
  calibration_error: number;
  prediction_interval_coverage_90: number;
  rag_retrieval_mrr: number;
  rag_context_precision: number;
  evaluation_label: string;
}

export interface ExperimentComparison {
  id: string;
  benchmark_name: string;
  configurations: Array<Record<string, any>>;
  findings: string;
  chart_data: Array<Record<string, any>>;
}
