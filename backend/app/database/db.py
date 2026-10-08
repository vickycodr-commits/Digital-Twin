import sqlite3
import os
import json
from typing import Any, Dict, List, Optional
from datetime import datetime

DB_PATH = os.environ.get("DATABASE_URL", "twin_rag.db")
if DB_PATH.startswith("sqlite:///"):
    DB_PATH = DB_PATH.replace("sqlite:///", "")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Machines
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS machines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        machine_type TEXT NOT NULL,
        location TEXT,
        operating_state TEXT DEFAULT 'NORMAL',
        health_score REAL DEFAULT 100.0,
        failure_risk REAL DEFAULT 0.0,
        rul_hours REAL DEFAULT 500.0,
        uncertainty_score REAL DEFAULT 0.05,
        confidence_level TEXT DEFAULT 'HIGH',
        operating_hours REAL DEFAULT 1240.5,
        last_maintenance TEXT,
        next_recommended_maintenance TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Components
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS components (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        name TEXT NOT NULL,
        component_type TEXT NOT NULL,
        health_score REAL DEFAULT 100.0,
        status TEXT DEFAULT 'NORMAL',
        criticality TEXT DEFAULT 'MEDIUM',
        wear_percentage REAL DEFAULT 5.0,
        operating_hours REAL DEFAULT 1240.5,
        last_inspected TEXT,
        details TEXT,
        FOREIGN KEY (machine_id) REFERENCES machines(id)
    );
    """)

    # 3. Sensors
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensors (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        component_id TEXT,
        name TEXT NOT NULL,
        sensor_type TEXT NOT NULL,
        unit TEXT NOT NULL,
        current_value REAL DEFAULT 0.0,
        min_threshold REAL DEFAULT 0.0,
        warning_threshold REAL DEFAULT 0.0,
        critical_threshold REAL DEFAULT 0.0,
        status TEXT DEFAULT 'NORMAL',
        sampling_rate_hz REAL DEFAULT 1.0,
        FOREIGN KEY (machine_id) REFERENCES machines(id)
    );
    """)

    # 4. Sensor Readings (Time-series)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        temperature REAL,
        vibration REAL,
        pressure REAL,
        rpm REAL,
        current REAL,
        flow_rate REAL,
        condition TEXT DEFAULT 'NORMAL',
        FOREIGN KEY (machine_id) REFERENCES machines(id)
    );
    """)

    # 5. Predictions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        health_score REAL NOT NULL,
        failure_probability REAL NOT NULL,
        failure_type TEXT NOT NULL,
        rul_hours REAL NOT NULL,
        confidence TEXT NOT NULL,
        model_version TEXT DEFAULT 'ensemble-rf-gbt-v1.0',
        metadata TEXT,
        FOREIGN KEY (machine_id) REFERENCES machines(id)
    );
    """)

    # 6. Uncertainty Results
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS uncertainty_results (
        id TEXT PRIMARY KEY,
        prediction_id TEXT NOT NULL,
        machine_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        mean_prediction REAL NOT NULL,
        variance REAL NOT NULL,
        std_dev REAL NOT NULL,
        lower_bound REAL NOT NULL,
        upper_bound REAL NOT NULL,
        confidence_level TEXT NOT NULL,
        uncertainty_percent REAL NOT NULL,
        reasons TEXT,
        FOREIGN KEY (prediction_id) REFERENCES predictions(id),
        FOREIGN KEY (machine_id) REFERENCES machines(id)
    );
    """)

    # 7. Explanations (SHAP & Local Importance)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS explanations (
        id TEXT PRIMARY KEY,
        prediction_id TEXT NOT NULL,
        machine_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        feature_importance TEXT NOT NULL,
        top_feature TEXT NOT NULL,
        top_contribution REAL NOT NULL,
        natural_language_explanation TEXT NOT NULL,
        summary_text TEXT,
        FOREIGN KEY (prediction_id) REFERENCES predictions(id)
    );
    """)

    # 8. Maintenance Records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maintenance_records (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        component_id TEXT,
        maintenance_type TEXT NOT NULL,
        description TEXT NOT NULL,
        technician TEXT,
        cost REAL DEFAULT 0.0,
        performed_at TEXT NOT NULL,
        operating_hours_at_maintenance REAL DEFAULT 0.0,
        status TEXT DEFAULT 'COMPLETED',
        FOREIGN KEY (machine_id) REFERENCES machines(id)
    );
    """)

    # 9. Documents (Knowledge Base for RAG)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size_bytes INTEGER DEFAULT 0,
        chunk_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'INDEXED',
        category TEXT DEFAULT 'MANUAL',
        uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        content_summary TEXT
    );
    """)

    # 10. Document Chunks (Vector RAG)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        section TEXT,
        page_number INTEGER,
        token_count INTEGER DEFAULT 0,
        embedding TEXT,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    """)

    # 11. Knowledge Nodes (GraphRAG)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_nodes (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        node_type TEXT NOT NULL,
        description TEXT,
        properties TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 12. Knowledge Edges (GraphRAG)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_edges (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        weight REAL DEFAULT 1.0,
        properties TEXT,
        FOREIGN KEY (source_id) REFERENCES knowledge_nodes(id),
        FOREIGN KEY (target_id) REFERENCES knowledge_nodes(id)
    );
    """)

    # 13. Recommendations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        prediction_id TEXT,
        priority TEXT NOT NULL,
        title TEXT NOT NULL,
        reason TEXT NOT NULL,
        recommended_actions TEXT NOT NULL,
        supporting_evidence TEXT,
        estimated_rul_hours REAL,
        confidence TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (machine_id) REFERENCES machines(id)
    );
    """)

    # 14. Alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        machine_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        sensor_trigger TEXT,
        threshold_value REAL,
        actual_value REAL,
        status TEXT DEFAULT 'ACTIVE',
        acknowledged INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (machine_id) REFERENCES machines(id)
    );
    """)

    # 15. Research Experiments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        benchmark_name TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        models_compared TEXT NOT NULL,
        metrics TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'COMPLETED'
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
