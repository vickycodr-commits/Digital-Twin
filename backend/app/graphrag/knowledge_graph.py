import networkx as nx
from typing import Dict, Any, List, Optional
from backend.app.schemas.schemas import (
    KnowledgeGraphNode,
    KnowledgeGraphEdge,
    KnowledgeGraphData,
    GraphPath,
    GraphRAGResult
)

class IndustrialKnowledgeGraph:
    """
    Industrial Knowledge Graph and GraphRAG Engine built on NetworkX.
    Neo4j-compatible ontology representing industrial assets, failure modes,
    symptoms, root causes, maintenance actions, and OEM documentation.
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_ontology()

    def _build_ontology(self):
        # 1. MACHINES
        self.add_node("M_CP001", "Centrifugal Pump CP-001", "MACHINE", "Single-stage overhung industrial slurry pump")
        self.add_node("M_CP002", "Booster Pump CP-002", "MACHINE", "High-pressure multistage cooling pump")

        # 2. COMPONENTS
        self.add_node("C_BEARING", "Roller Bearing Assembly", "COMPONENT", "Drive-end and non-drive end spherical roller bearings")
        self.add_node("C_MOTOR", "3-Phase AC Induction Motor", "COMPONENT", "37 kW continuous duty electric drive unit")
        self.add_node("C_IMPELLER", "Closed Radial Impeller", "COMPONENT", "Duplex stainless steel hydraulic impeller")
        self.add_node("C_SHAFT", "Drive Shaft & Coupling", "COMPONENT", "High-tensile alloy shaft with flexible jaw coupling")
        self.add_node("C_SEAL", "Cartridge Mechanical Seal", "COMPONENT", "API 682 Plan 11 single cartridge face seal")
        self.add_node("C_CASING", "Pump Volute Casing", "COMPONENT", "Heavy-wall cast iron hydraulic pressure containment")

        # 3. SENSORS
        self.add_node("S_VIB", "Vibration Accelerometer", "SENSOR", "Tri-axial piezoelectric accelerometer (10 kHz)")
        self.add_node("S_TEMP", "Bearing PT100 RTD", "SENSOR", "Resistance temperature detector in bearing housing")
        self.add_node("S_CURR", "Hall Effect Current CT", "SENSOR", "Stator current transducer on motor phase L1")
        self.add_node("S_PRESS", "Discharge Pressure Sensor", "SENSOR", "Piezoresistive pressure transmitter (0-16 bar)")
        self.add_node("S_FLOW", "Magnetic Flowmeter", "SENSOR", "Inline electromagnetic volumetric flow sensor")
        self.add_node("S_RPM", "Optical Tachometer", "SENSOR", "Non-contact laser shaft rotational speed pickup")

        # 4. SYMPTOMS
        self.add_node("SYM_HIGH_VIB", "Elevated Vibration (>4.5 mm/s)", "SYMPTOM", "RMS velocity exceeds ISO 10816 Zone C/D threshold")
        self.add_node("SYM_HIGH_TEMP", "Bearing Overheating (>72°C)", "SYMPTOM", "Thermal expansion beyond nominal steady-state")
        self.add_node("SYM_CURR_SURGE", "Motor Current Surge (>9.8A)", "SYMPTOM", "Excessive electrical draw indicative of mechanical drag")
        self.add_node("SYM_PRESS_OSC", "Discharge Pressure Fluctuations", "SYMPTOM", "Periodic delta P ripple > 1.2 bar")
        self.add_node("SYM_FLOW_DROP", "Flow Delivery Drop (<38 m³/h)", "SYMPTOM", "Hydraulic output below expected pump affinity curve")
        self.add_node("SYM_2X_HARMONIC", "2x RPM Harmonic Peak", "SYMPTOM", "Dominant second-harmonic frequency peak on spectrum")

        # 5. FAULTS
        self.add_node("F_BEARING_FAIL", "Bearing Failure", "FAULT", "Severe fatigue flaking, race spalling or cage disintegration")
        self.add_node("F_CAVITATION", "Pump Cavitation", "FAULT", "Vapor bubble collapse causing shockwaves and impeller erosion")
        self.add_node("F_MOTOR_OVERHEAT", "Motor Overheating", "FAULT", "Stator thermal degradation and winding insulation breakdown")
        self.add_node("F_MISALIGNMENT", "Shaft Misalignment", "FAULT", "Angular or offset angular displacement between pump and driver")
        self.add_node("F_SEAL_FAIL", "Mechanical Seal Failure", "FAULT", "Seal face thermal distortion, scoring, or leakage")

        # 6. CAUSES
        self.add_node("CAU_LUB_DEG", "Lubrication Breakdown", "CAUSE", "Grease oxidation, viscosity shear, or insufficient relubrication")
        self.add_node("CAU_PARTICLE_INGRESS", "Abrasive Contamination", "CAUSE", "Particulate ingress past lip seals into raceway")
        self.add_node("CAU_LOW_NPSH", "Inadequate NPSH Available", "CAUSE", "Suction line restriction or low tank head below NPSHr")
        self.add_node("CAU_THERMAL_EXP", "Thermal Growth Misalignment", "CAUSE", "Differential thermal expansion during warm-up cycle")
        self.add_node("CAU_DRY_RUN", "Dry Running of Seal Faces", "CAUSE", "Loss of barrier flush fluid creating friction heat")

        # 7. MAINTENANCE ACTIONS
        self.add_node("ACT_INSPECT_BRG", "Inspect Bearing & Relubricate", "MAINTENANCE_ACTION", "Inspect raceways, check grease color/swarf, replenish synthetic grease")
        self.add_node("ACT_REPLACE_BRG", "Schedule Bearing Replacement", "MAINTENANCE_ACTION", "Rig pump, pull bearing cartridge, install new spherical roller bearing")
        self.add_node("ACT_CLEAR_SUCTION", "Inspect Suction Strainer", "MAINTENANCE_ACTION", "Backwash suction strainer and verify NPSH margin")
        self.add_node("ACT_LASER_ALIGN", "Perform Laser Alignment", "MAINTENANCE_ACTION", "Correct angular offset and parallel misalignment to <0.05 mm")
        self.add_node("ACT_REPLACE_SEAL", "Overhaul Mechanical Seal", "MAINTENANCE_ACTION", "Install replacement API 682 cartridge seal with fresh O-rings")
        self.add_node("ACT_TEST_WINDING", "Megger Insulation Test", "MAINTENANCE_ACTION", "Test stator winding insulation resistance and check ventilation")

        # 8. SPARE PARTS
        self.add_node("PRT_SKF_22212", "SKF 22212-E Spherical Bearing", "SPARE_PART", "OEM certified spherical roller bearing with brass cage")
        self.add_node("PRT_SEAL_JC5610", "John Crane 5610 Cartridge Seal", "SPARE_PART", "Silicon carbide face cartridge seal with Viton secondary seals")
        self.add_node("PRT_GREASE_POLY", "Mobil SHC Polyrex 462 Grease", "SPARE_PART", "Synthetic polyurea high-temperature bearing lubricant")
        self.add_node("PRT_COUPLING_SPIDER", "Flexible Coupling Insert N-EUPEX", "SPARE_PART", "Polyurethane elastomer damping spider insert")

        # 9. DOCUMENTS
        self.add_node("DOC_MANUAL", "CP-001 OEM Pump Manual", "DOCUMENT", "Official maintenance and operating handbook")
        self.add_node("DOC_SKF_GUIDE", "SKF Bearing Diagnostics Guide", "DOCUMENT", "Vibration analysis criteria and defect frequency reference")

        # --- RELATIONSHIPS / EDGES ---
        # Machine to Component
        self.add_edge("M_CP001", "C_BEARING", "HAS_COMPONENT")
        self.add_edge("M_CP001", "C_MOTOR", "HAS_COMPONENT")
        self.add_edge("M_CP001", "C_IMPELLER", "HAS_COMPONENT")
        self.add_edge("M_CP001", "C_SHAFT", "HAS_COMPONENT")
        self.add_edge("M_CP001", "C_SEAL", "HAS_COMPONENT")
        self.add_edge("M_CP001", "C_CASING", "HAS_COMPONENT")

        # Component to Sensor
        self.add_edge("C_BEARING", "S_VIB", "HAS_SENSOR")
        self.add_edge("C_BEARING", "S_TEMP", "HAS_SENSOR")
        self.add_edge("C_MOTOR", "S_CURR", "HAS_SENSOR")
        self.add_edge("C_CASING", "S_PRESS", "HAS_SENSOR")
        self.add_edge("C_IMPELLER", "S_FLOW", "HAS_SENSOR")
        self.add_edge("C_SHAFT", "S_RPM", "HAS_SENSOR")

        # Sensor to Symptom
        self.add_edge("S_VIB", "SYM_HIGH_VIB", "GENERATES_SYMPTOM")
        self.add_edge("S_VIB", "SYM_2X_HARMONIC", "GENERATES_SYMPTOM")
        self.add_edge("S_TEMP", "SYM_HIGH_TEMP", "GENERATES_SYMPTOM")
        self.add_edge("S_CURR", "SYM_CURR_SURGE", "GENERATES_SYMPTOM")
        self.add_edge("S_PRESS", "SYM_PRESS_OSC", "GENERATES_SYMPTOM")
        self.add_edge("S_FLOW", "SYM_FLOW_DROP", "GENERATES_SYMPTOM")

        # Symptom indicates Fault
        self.add_edge("SYM_HIGH_VIB", "F_BEARING_FAIL", "INDICATES", weight=0.92)
        self.add_edge("SYM_HIGH_TEMP", "F_BEARING_FAIL", "INDICATES", weight=0.88)
        self.add_edge("SYM_HIGH_TEMP", "F_MOTOR_OVERHEAT", "INDICATES", weight=0.85)
        self.add_edge("SYM_CURR_SURGE", "F_MOTOR_OVERHEAT", "INDICATES", weight=0.90)
        self.add_edge("SYM_PRESS_OSC", "F_CAVITATION", "INDICATES", weight=0.94)
        self.add_edge("SYM_FLOW_DROP", "F_CAVITATION", "INDICATES", weight=0.89)
        self.add_edge("SYM_2X_HARMONIC", "F_MISALIGNMENT", "INDICATES", weight=0.95)
        self.add_edge("SYM_HIGH_VIB", "F_MISALIGNMENT", "INDICATES", weight=0.78)

        # Fault caused by Root Cause
        self.add_edge("F_BEARING_FAIL", "CAU_LUB_DEG", "CAUSED_BY")
        self.add_edge("F_BEARING_FAIL", "CAU_PARTICLE_INGRESS", "CAUSED_BY")
        self.add_edge("F_CAVITATION", "CAU_LOW_NPSH", "CAUSED_BY")
        self.add_edge("F_MISALIGNMENT", "CAU_THERMAL_EXP", "CAUSED_BY")
        self.add_edge("F_SEAL_FAIL", "CAU_DRY_RUN", "CAUSED_BY")

        # Progression
        self.add_edge("F_MISALIGNMENT", "F_BEARING_FAIL", "MAY_LEAD_TO")
        self.add_edge("F_CAVITATION", "F_BEARING_FAIL", "MAY_LEAD_TO")

        # Fault requires Action
        self.add_edge("F_BEARING_FAIL", "ACT_INSPECT_BRG", "REQUIRES_ACTION")
        self.add_edge("F_BEARING_FAIL", "ACT_REPLACE_BRG", "REQUIRES_ACTION")
        self.add_edge("F_CAVITATION", "ACT_CLEAR_SUCTION", "REQUIRES_ACTION")
        self.add_edge("F_MISALIGNMENT", "ACT_LASER_ALIGN", "REQUIRES_ACTION")
        self.add_edge("F_SEAL_FAIL", "ACT_REPLACE_SEAL", "REQUIRES_ACTION")
        self.add_edge("F_MOTOR_OVERHEAT", "ACT_TEST_WINDING", "REQUIRES_ACTION")

        # Action requires Part
        self.add_edge("ACT_REPLACE_BRG", "PRT_SKF_22212", "REQUIRES_PART")
        self.add_edge("ACT_INSPECT_BRG", "PRT_GREASE_POLY", "REQUIRES_PART")
        self.add_edge("ACT_REPLACE_SEAL", "PRT_SEAL_JC5610", "REQUIRES_PART")
        self.add_edge("ACT_LASER_ALIGN", "PRT_COUPLING_SPIDER", "REQUIRES_PART")

        # Supported by Document
        self.add_edge("ACT_INSPECT_BRG", "DOC_SKF_GUIDE", "SUPPORTED_BY")
        self.add_edge("ACT_REPLACE_BRG", "DOC_MANUAL", "SUPPORTED_BY")
        self.add_edge("ACT_CLEAR_SUCTION", "DOC_MANUAL", "SUPPORTED_BY")
        self.add_edge("ACT_LASER_ALIGN", "DOC_MANUAL", "SUPPORTED_BY")

    def add_node(self, node_id: str, label: str, node_type: str, description: str):
        self.graph.add_node(node_id, label=label, node_type=node_type, description=description)

    def add_edge(self, source: str, target: str, relation: str, weight: float = 1.0):
        self.graph.add_edge(source, target, relation_type=relation, weight=weight)

    def get_full_graph_data(self) -> KnowledgeGraphData:
        nodes = []
        for n, data in self.graph.nodes(data=True):
            nodes.append(KnowledgeGraphNode(
                id=n,
                label=data.get("label", n),
                node_type=data.get("node_type", "UNKNOWN"),
                description=data.get("description", ""),
                properties=data
            ))
        edges = []
        for u, v, data in self.graph.edges(data=True):
            edges.append(KnowledgeGraphEdge(
                id=f"{u}->{v}",
                source_id=u,
                target_id=v,
                relation_type=data.get("relation_type", "RELATED_TO"),
                weight=data.get("weight", 1.0)
            ))
        return KnowledgeGraphData(nodes=nodes, edges=edges)

    def query_graph_for_fault(self, fault_label: str) -> GraphRAGResult:
        """
        Retrieves causal paths, symptoms, causes, required actions, and spare parts for a predicted fault.
        """
        # Map human-readable prediction to fault node ID
        fault_mapping = {
            "bearing failure": "F_BEARING_FAIL",
            "pump cavitation": "F_CAVITATION",
            "motor overheating": "F_MOTOR_OVERHEAT",
            "shaft misalignment": "F_MISALIGNMENT",
            "seal failure": "F_SEAL_FAIL",
            "normal operation": "M_CP001"
        }

        target_node = fault_mapping.get(fault_label.lower(), "F_BEARING_FAIL")
        discovered_faults = [self.graph.nodes.get(target_node, {}).get("label", fault_label)]
        
        causal_chains: List[GraphPath] = []
        actions = []
        subgraph_nodes = set([target_node])

        # Find incoming symptoms and components
        pred_nodes = list(self.graph.predecessors(target_node))
        for p in pred_nodes:
            subgraph_nodes.add(p)
            rel = self.graph.get_edge_data(p, target_node, {}).get("relation_type", "INDICATES")
            p_label = self.graph.nodes[p].get("label", p)
            # Find origin sensor
            sensors = list(self.graph.predecessors(p))
            if sensors:
                s_id = sensors[0]
                subgraph_nodes.add(s_id)
                s_label = self.graph.nodes[s_id].get("label", s_id)
                # Find origin component
                comps = list(self.graph.predecessors(s_id))
                c_label = self.graph.nodes[comps[0]].get("label", comps[0]) if comps else "Machine"
                if comps:
                    subgraph_nodes.add(comps[0])
                chain_desc = f"{c_label} -> {s_label} -> {p_label} -({rel})-> {discovered_faults[0]}"
                causal_chains.append(GraphPath(
                    path_nodes=[comps[0] if comps else "M_CP001", s_id, p, target_node],
                    path_edges=["HAS_SENSOR", "GENERATES_SYMPTOM", rel],
                    description=chain_desc
                ))

        # Find outgoing causes, actions, parts
        succ_nodes = list(self.graph.successors(target_node))
        for s in succ_nodes:
            subgraph_nodes.add(s)
            s_label = self.graph.nodes[s].get("label", s)
            rel = self.graph.get_edge_data(target_node, s, {}).get("relation_type", "REQUIRES")
            if "ACTION" in rel:
                actions.append(s_label)
                # Check required parts
                parts = list(self.graph.successors(s))
                for prt in parts:
                    subgraph_nodes.add(prt)
                    prt_label = self.graph.nodes[prt].get("label", prt)
                    actions.append(f"Requires: {prt_label}")

        # Build clean relevant subgraph
        sub_nodes = []
        for n_id in subgraph_nodes:
            n_data = self.graph.nodes.get(n_id, {})
            sub_nodes.append(KnowledgeGraphNode(
                id=n_id,
                label=n_data.get("label", n_id),
                node_type=n_data.get("node_type", "NODE"),
                description=n_data.get("description", "")
            ))

        sub_edges = []
        for u in subgraph_nodes:
            for v in subgraph_nodes:
                if self.graph.has_edge(u, v):
                    e_data = self.graph.get_edge_data(u, v)
                    sub_edges.append(KnowledgeGraphEdge(
                        id=f"{u}->{v}",
                        source_id=u,
                        target_id=v,
                        relation_type=e_data.get("relation_type", "RELATED_TO"),
                        weight=e_data.get("weight", 1.0)
                    ))

        return GraphRAGResult(
            query_entity=fault_label,
            discovered_faults=discovered_faults,
            causal_chains=causal_chains,
            recommended_inspections=actions,
            relevant_subgraph=KnowledgeGraphData(nodes=sub_nodes, edges=sub_edges)
        )

# Global Knowledge Graph instance
KNOWLEDGE_GRAPH = IndustrialKnowledgeGraph()

def get_knowledge_graph() -> IndustrialKnowledgeGraph:
    return KNOWLEDGE_GRAPH
