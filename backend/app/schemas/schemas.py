from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Sensor & Reading Schemas ---
class SensorReading(BaseModel):
    machine_id: str
    timestamp: str
    temperature: float = Field(..., description="Operating temperature in °C")
    vibration: float = Field(..., description="RMS Vibration velocity in mm/s")
    pressure: float = Field(..., description="Discharge pressure in bar")
    rpm: float = Field(..., description="Rotational speed in RPM")
    current: float = Field(..., description="Motor load current in Amperes")
    flow_rate: float = Field(..., description="Discharge flow rate in m³/h")
    condition: str = "NORMAL"

class SensorRead(BaseModel):
    id: str
    machine_id: str
    component_id: Optional[str] = None
    name: str
    sensor_type: str
    unit: str
    current_value: float
    min_threshold: float
    warning_threshold: float
    critical_threshold: float
    status: str
    sampling_rate_hz: float

# --- Component & Machine Schemas ---
class ComponentRead(BaseModel):
    id: str
    machine_id: str
    name: str
    component_type: str
    health_score: float
    status: str
    criticality: str
    wear_percentage: float
    operating_hours: float
    last_inspected: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class MachineRead(BaseModel):
    id: str
    name: str
    machine_type: str
    location: Optional[str] = None
    operating_state: str
    health_score: float
    failure_risk: float
    rul_hours: float
    uncertainty_score: float
    confidence_level: str
    operating_hours: float
    last_maintenance: Optional[str] = None
    next_recommended_maintenance: Optional[str] = None
    components: List[ComponentRead] = []
    sensors: List[SensorRead] = []

# --- Simulation & Fault Injection ---
class SimulationConfig(BaseModel):
    machine_id: str = "CP-001"
    simulation_speed: float = 1.0  # multiplier
    noise_level: float = 0.05      # gaussian noise variance
    operating_load: float = 0.85   # 0.0 to 1.0
    active_fault: str = "NORMAL"   # NORMAL, BEARING_DEGRADATION, CAVITATION, MOTOR_OVERLOAD, MISALIGNMENT, SEAL_FAILURE
    fault_severity: float = 0.0    # 0.0 to 1.0

class FaultInjectionRequest(BaseModel):
    machine_id: str = "CP-001"
    fault_type: str  # BEARING_DEGRADATION, CAVITATION, MOTOR_OVERLOAD, MISALIGNMENT, SEAL_FAILURE, NORMAL
    severity: float = Field(..., ge=0.0, le=1.0)
    duration_steps: int = 100

class FaultInjectionResponse(BaseModel):
    status: str
    message: str
    machine_id: str
    fault_type: str
    severity: float
    projected_state: str

# --- Prediction & Machine Learning ---
class PredictionRequest(BaseModel):
    machine_id: str = "CP-001"
    temperature: float
    vibration: float
    pressure: float
    rpm: float
    current: float
    flow_rate: float
    operating_hours: Optional[float] = 1240.0
    load: Optional[float] = 0.85

class PredictionResult(BaseModel):
    machine_id: str
    timestamp: str
    health_score: float
    failure_probability: float
    failure_type: str
    rul_hours: float
    confidence: str
    model_version: str = "Ensemble-RF-GBT-Prototype-v1"
    model_status: str = "Prototype model trained on simulated industrial dataset"

# --- Uncertainty Quantification ---
class UncertaintyResult(BaseModel):
    prediction_id: Optional[str] = None
    machine_id: str
    timestamp: str
    failure_probability: float
    mean_prediction: float
    variance: float
    std_dev: float
    prediction_interval_lower: float
    prediction_interval_upper: float
    confidence_level: str  # HIGH, MEDIUM, LOW
    uncertainty_score: float
    epistemic_uncertainty: float
    aleatoric_uncertainty: float
    reasons: List[str]
    guidance_message: str

# --- Explainability & SHAP ---
class SHAPFeature(BaseModel):
    feature_name: str
    feature_value: float
    shap_value: float
    percentage_contribution: float
    direction: str  # INCREASES_RISK or DECREASES_RISK

class ExplainabilityResult(BaseModel):
    prediction_id: Optional[str] = None
    machine_id: str
    timestamp: str
    top_features: List[SHAPFeature]
    dominant_symptom: str
    base_value: float
    prediction_value: float
    natural_language_explanation: str
    feature_waterfall: List[Dict[str, Any]]
    explanation_type: str = "KernelSHAP Local Additive Attribution"

# --- Vector RAG & Documents ---
class DocumentRead(BaseModel):
    id: str
    title: str
    filename: str
    file_type: str
    file_size_bytes: int
    chunk_count: int
    status: str
    category: str
    uploaded_at: str
    content_summary: Optional[str] = None

class RetrievedChunk(BaseModel):
    document_title: str
    document_category: str
    section: Optional[str] = None
    page_number: Optional[int] = None
    similarity_score: float
    content: str

class VectorSearchQuery(BaseModel):
    query: str
    top_k: int = 4
    filter_category: Optional[str] = None

class VectorSearchResult(BaseModel):
    query: str
    total_results: int
    chunks: List[RetrievedChunk]

# --- GraphRAG ---
class KnowledgeGraphNode(BaseModel):
    id: str
    label: str
    node_type: str
    description: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None

class KnowledgeGraphEdge(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: str
    weight: float = 1.0
    properties: Optional[Dict[str, Any]] = None

class KnowledgeGraphData(BaseModel):
    nodes: List[KnowledgeGraphNode]
    edges: List[KnowledgeGraphEdge]

class GraphRAGQuery(BaseModel):
    start_entity: str
    target_fault: Optional[str] = None
    max_depth: int = 4

class GraphPath(BaseModel):
    path_nodes: List[str]
    path_edges: List[str]
    description: str

class GraphRAGResult(BaseModel):
    query_entity: str
    discovered_faults: List[str]
    causal_chains: List[GraphPath]
    recommended_inspections: List[str]
    relevant_subgraph: KnowledgeGraphData

# --- Hybrid RAG & LLM Reasoning ---
class HybridRAGQuery(BaseModel):
    machine_id: str = "CP-001"
    query: str
    include_sensor_context: bool = True
    include_prediction_context: bool = True

class FusedContext(BaseModel):
    machine_id: str
    machine_state: str
    current_sensors: Dict[str, float]
    ml_prediction: Dict[str, Any]
    uncertainty: Dict[str, Any]
    explainability: Dict[str, Any]
    vector_evidence: List[RetrievedChunk]
    graph_paths: List[GraphPath]

class HybridRAGResponse(BaseModel):
    query: str
    machine_id: str
    fused_context: FusedContext
    llm_explanation: Dict[str, Any]
    recommended_maintenance: Dict[str, Any]
    evidence_ranking: List[Dict[str, Any]]
    confidence_assessment: str
    is_ai_generated: bool = True
    disclaimer: str = "Research prototype advisory: Never present AI-generated recommendations as guaranteed facts."

# --- Maintenance Recommendation ---
class MaintenanceRecommendation(BaseModel):
    id: str
    machine_id: str
    priority: str  # HIGH, MEDIUM, LOW, CRITICAL
    title: str
    reason: str
    recommended_actions: List[str]
    supporting_evidence: str
    estimated_rul_hours: float
    confidence: str
    created_at: str
    status: str = "PENDING"

# --- Alerts ---
class AlertRead(BaseModel):
    id: str
    machine_id: str
    severity: str  # INFO, WARNING, CRITICAL
    alert_type: str
    title: str
    message: str
    sensor_trigger: Optional[str] = None
    threshold_value: Optional[float] = None
    actual_value: Optional[float] = None
    status: str
    created_at: str

# --- Experiments & Model Performance ---
class ModelMetrics(BaseModel):
    classification_accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    rul_mae_hours: float
    rul_rmse_hours: float
    rul_r2_score: float
    calibration_error: float
    prediction_interval_coverage_90: float
    rag_retrieval_mrr: float
    rag_context_precision: float
    evaluation_label: str = "Validated on Simulated Industrial Benchmark Test Set"

class ExperimentComparison(BaseModel):
    id: str
    benchmark_name: str
    configurations: List[Dict[str, Any]]
    findings: str
    chart_data: List[Dict[str, Any]]
