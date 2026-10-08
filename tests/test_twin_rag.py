import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.simulation.simulator import get_simulator
from backend.app.ml.engine import get_ml_engine
from backend.app.rag.vector_store import get_vector_rag
from backend.app.graphrag.knowledge_graph import get_knowledge_graph
from backend.app.hybrid.hybrid_engine import get_hybrid_engine

client = TestClient(app)

def test_sensor_simulator():
    sim = get_simulator("CP-001")
    reading = sim.tick()
    assert "temperature" in reading
    assert "vibration" in reading
    assert "pressure" in reading
    assert reading["vibration"] > 0
    assert len(sim.get_history()) > 0

def test_fault_injection_dynamics():
    sim = get_simulator("CP-001")
    sim.set_fault("BEARING_DEGRADATION", severity=0.8)
    for _ in range(10):
        sim.tick()
    latest = sim.get_latest()
    # Vibration should be noticeably higher than baseline nominal 2.1
    assert latest["vibration"] > 3.0
    assert latest["fault_type"] == "BEARING_DEGRADATION"

def test_ml_prediction_and_rul():
    ml = get_ml_engine()
    sensor_sample = {
        "temperature": 78.5,
        "vibration": 5.4,
        "pressure": 6.1,
        "rpm": 2950.0,
        "current": 10.1,
        "flow_rate": 42.0,
        "operating_hours": 1250.0,
        "load": 0.85
    }
    pred = ml.predict(sensor_sample)
    assert pred["health_score"] <= 85.0
    assert pred["failure_probability"] > 0.5
    assert pred["rul_hours"] > 0

def test_uncertainty_quantification():
    ml = get_ml_engine()
    sensor_sample = {
        "temperature": 68.0,
        "vibration": 3.8,
        "pressure": 6.2,
        "rpm": 2950.0,
        "current": 8.9,
        "flow_rate": 44.0
    }
    pred = ml.predict(sensor_sample)
    unc = ml.estimate_uncertainty(sensor_sample, pred)
    assert "variance" in unc
    assert "prediction_interval_lower" in unc
    assert "prediction_interval_upper" in unc
    assert unc["prediction_interval_lower"] <= unc["prediction_interval_upper"]
    assert unc["confidence_level"] in ["HIGH", "MEDIUM", "LOW"]

def test_shap_explanation():
    ml = get_ml_engine()
    sensor_sample = {
        "temperature": 79.0,
        "vibration": 5.6,
        "pressure": 6.2,
        "rpm": 2950.0,
        "current": 10.2,
        "flow_rate": 41.0
    }
    pred = ml.predict(sensor_sample)
    exp = ml.explain_prediction(sensor_sample, pred)
    assert len(exp["top_features"]) > 0
    assert "dominant_symptom" in exp
    assert len(exp["natural_language_explanation"]) > 10

def test_vector_rag_retrieval():
    rag = get_vector_rag()
    results = rag.search("bearing vibration defect and spalling", top_k=2)
    assert len(results) > 0
    assert results[0].similarity_score > 0.5
    assert "bearing" in results[0].content.lower() or "vibration" in results[0].content.lower()

def test_graph_rag_retrieval():
    kg = get_knowledge_graph()
    res = kg.query_graph_for_fault("Bearing Failure")
    assert len(res.causal_chains) > 0
    assert len(res.recommended_inspections) > 0

def test_hybrid_rag_fusion():
    hybrid = get_hybrid_engine()
    res = hybrid.execute_hybrid_query("CP-001", "Why is bearing failure predicted?")
    assert res.fused_context.machine_id == "CP-001"
    assert len(res.fused_context.vector_evidence) > 0
    assert len(res.fused_context.graph_paths) > 0
    assert "why_this_prediction" in res.llm_explanation
    assert res.recommended_maintenance["estimated_rul_hours"] > 0

def test_api_endpoints():
    r_sys = client.get("/api/system/status")
    assert r_sys.status_code == 200
    assert r_sys.json()["status"] == "ONLINE"

    r_machines = client.get("/api/machines")
    assert r_machines.status_code == 200
    assert len(r_machines.json()) >= 1

    r_sensors = client.get("/api/sensors/CP-001")
    assert r_sensors.status_code == 200
    assert "latest" in r_sensors.json()

    r_pred = client.get("/api/predictions/CP-001")
    assert r_pred.status_code == 200
    assert "health_score" in r_pred.json()

    r_unc = client.get("/api/uncertainty/CP-001")
    assert r_unc.status_code == 200
    assert "confidence_level" in r_unc.json()

    r_exp = client.get("/api/explainability/CP-001")
    assert r_exp.status_code == 200
    assert "top_features" in r_exp.json()

    r_docs = client.get("/api/documents")
    assert r_docs.status_code == 200
    assert len(r_docs.json()) >= 4

    r_graph = client.get("/api/graphrag/data")
    assert r_graph.status_code == 200
    assert len(r_graph.json()["nodes"]) > 10

    r_metrics = client.get("/api/model/metrics")
    assert r_metrics.status_code == 200
    assert r_metrics.json()["classification_accuracy"] > 0.75
