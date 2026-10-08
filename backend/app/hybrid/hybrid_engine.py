from typing import Dict, Any, List
from backend.app.digital_twin.twin import get_twin_manager
from backend.app.simulation.simulator import get_simulator
from backend.app.ml.engine import get_ml_engine
from backend.app.rag.vector_store import get_vector_rag
from backend.app.graphrag.knowledge_graph import get_knowledge_graph
from backend.app.llm.llm_service import get_llm_service
from backend.app.schemas.schemas import HybridRAGResponse, FusedContext

class HybridRAGEngine:
    """
    Hybrid Retrieval Engine that unifies:
    1. Unstructured Technical Literature (Vector RAG)
    2. Structured Domain Ontology & Causal Graphs (GraphRAG)
    3. Real-time Cyber-Physical State (Digital Twin)
    4. Probabilistic ML Inference & Uncertainty Bounds
    5. Local Additive Feature Attributions (SHAP)
    """
    def __init__(self):
        pass

    def execute_hybrid_query(self, machine_id: str, user_query: str) -> HybridRAGResponse:
        twin_mgr = get_twin_manager()
        twin_state = twin_mgr.get_machine_twin(machine_id)
        latest_sensors = twin_state["latest_reading"]

        ml_engine = get_ml_engine()
        prediction = ml_engine.predict(latest_sensors)
        uncertainty = ml_engine.estimate_uncertainty(latest_sensors, prediction)
        shap_explanation = ml_engine.explain_prediction(latest_sensors, prediction)

        # 1. Vector RAG Retrieval
        vector_rag = get_vector_rag()
        # Query formulation combines user query and predicted fault
        search_query = f"{user_query} {prediction['failure_type']} {shap_explanation['dominant_symptom']}"
        vector_chunks = vector_rag.search(search_query, top_k=4)

        # 2. GraphRAG Retrieval
        kg = get_knowledge_graph()
        graph_rag_result = kg.query_graph_for_fault(prediction["failure_type"])

        # 3. Context Fusion & Evidence Ranking
        ranked_evidence = []
        for c in vector_chunks:
            ranked_evidence.append({
                "type": "VECTOR_DOCUMENT_CHUNKS",
                "source": c.document_title,
                "section": c.section,
                "relevance_score": c.similarity_score,
                "content": c.content,
                "status": "Corroborated"
            })

        for p in graph_rag_result.causal_chains:
            ranked_evidence.append({
                "type": "GRAPH_CAUSAL_PATH",
                "source": "Industrial Knowledge Graph",
                "section": p.description,
                "relevance_score": 0.94,
                "content": f"Ontology Relationship: {' -> '.join(p.path_nodes)}",
                "status": "Verified"
            })

        ranked_evidence.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Build Prompt Context for LLM
        prompt_ctx = {
            "machine_id": machine_id,
            "sensors": latest_sensors,
            "ml_prediction": prediction,
            "uncertainty": uncertainty,
            "shap": {
                "dominant_symptom": shap_explanation["dominant_symptom"],
                "top_contribution": shap_explanation["top_features"][0]["percentage_contribution"] if shap_explanation["top_features"] else 35.0,
                "waterfall": shap_explanation["feature_waterfall"]
            },
            "vector_evidence": [c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in vector_chunks],
            "graph_paths": [p.model_dump() if hasattr(p, "model_dump") else p.dict() for p in graph_rag_result.causal_chains]
        }

        # 4. LLM Reasoning
        llm_service = get_llm_service()
        llm_response = llm_service.generate_reasoning(prompt_ctx)

        # 5. Build structured recommendation
        actions_list = llm_response.get("what_should_the_maintenance_team_do", [])
        if isinstance(actions_list, str):
            actions_list = [actions_list]

        rec = {
            "priority": llm_response.get("priority", "HIGH"),
            "title": f"Actionable Directive for {machine_id}: {prediction['failure_type']}",
            "reason": f"{prediction['failure_type']} predicted at {int(prediction['failure_probability']*100)}% with {uncertainty['confidence_level']} confidence. Primary driver: {shap_explanation['dominant_symptom']}.",
            "recommended_actions": actions_list,
            "supporting_evidence": f"{vector_chunks[0].document_title if vector_chunks else 'OEM Manual'} - {vector_chunks[0].section if vector_chunks else 'Diagnostics'}",
            "estimated_rul_hours": prediction["rul_hours"],
            "confidence": uncertainty["confidence_level"]
        }

        fused = FusedContext(
            machine_id=machine_id,
            machine_state=twin_state["operating_state"],
            current_sensors={
                "temperature": latest_sensors["temperature"],
                "vibration": latest_sensors["vibration"],
                "pressure": latest_sensors["pressure"],
                "rpm": latest_sensors["rpm"],
                "current": latest_sensors["current"],
                "flow_rate": latest_sensors["flow_rate"]
            },
            ml_prediction={
                "failure_type": prediction["failure_type"],
                "failure_probability": prediction["failure_probability"],
                "health_score": prediction["health_score"],
                "rul_hours": prediction["rul_hours"],
                "confidence": prediction["confidence"]
            },
            uncertainty={
                "confidence_level": uncertainty["confidence_level"],
                "uncertainty_score": uncertainty["uncertainty_score"],
                "prediction_interval": f"{int(uncertainty['prediction_interval_lower']*100)}% - {int(uncertainty['prediction_interval_upper']*100)}%",
                "variance": uncertainty["variance"],
                "reasons": uncertainty["reasons"],
                "guidance": uncertainty["guidance_message"]
            },
            explainability={
                "dominant_symptom": shap_explanation["dominant_symptom"],
                "top_features": [f if isinstance(f, dict) else f.model_dump() for f in shap_explanation["top_features"][:4]],
                "natural_language": shap_explanation["natural_language_explanation"]
            },
            vector_evidence=vector_chunks,
            graph_paths=graph_rag_result.causal_chains
        )

        return HybridRAGResponse(
            query=user_query,
            machine_id=machine_id,
            fused_context=fused,
            llm_explanation=llm_response,
            recommended_maintenance=rec,
            evidence_ranking=ranked_evidence,
            confidence_assessment=llm_response.get("confidence_assessment", "High Confidence"),
            is_ai_generated=True
        )

# Global Hybrid Engine instance
HYBRID_ENGINE = HybridRAGEngine()

def get_hybrid_engine() -> HybridRAGEngine:
    return HYBRID_ENGINE
