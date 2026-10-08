import datetime
from typing import Dict, Any, List
from backend.app.simulation.simulator import get_simulator
from backend.app.ml.engine import get_ml_engine

class DigitalTwinManager:
    """
    Manages the Digital Twin state for industrial machines.
    Computes component-level sub-system health, telemetry integration, and maintenance tracking.
    """
    def __init__(self):
        self.machines = {
            "CP-001": {
                "id": "CP-001",
                "name": "Centrifugal Slurry Pump – CP-001",
                "machine_type": "Centrifugal Pump (Single Stage Overhung)",
                "location": "Pumping Station Bay #3, Sector B",
                "last_maintenance": "2026-08-15T09:30:00Z",
                "next_recommended_maintenance": "2026-10-25T14:00:00Z",
                "operating_hours": 1240.5
            },
            "CP-002": {
                "id": "CP-002",
                "name": "High-Pressure Booster Pump – CP-002",
                "machine_type": "Multi-stage Centrifugal Pump",
                "location": "Cooling Circuit Station #1",
                "last_maintenance": "2026-09-02T11:00:00Z",
                "next_recommended_maintenance": "2026-11-10T10:00:00Z",
                "operating_hours": 890.2
            },
            "CP-003": {
                "id": "CP-003",
                "name": "Chemical Injection Pump – CP-003",
                "machine_type": "Variable Frequency Centrifugal Pump",
                "location": "Process Reagent Unit #4",
                "last_maintenance": "2026-07-20T08:00:00Z",
                "next_recommended_maintenance": "2026-10-18T16:00:00Z",
                "operating_hours": 2150.8
            }
        }

    def get_machine_twin(self, machine_id: str = "CP-001") -> Dict[str, Any]:
        if machine_id not in self.machines:
            machine_id = "CP-001"
            
        base_meta = self.machines[machine_id]
        simulator = get_simulator(machine_id)
        latest_sensor = simulator.get_latest()
        ml_engine = get_ml_engine()

        # Run ML inference
        pred = ml_engine.predict(latest_sensor)
        unc = ml_engine.estimate_uncertainty(latest_sensor, pred)

        temp = latest_sensor["temperature"]
        vib = latest_sensor["vibration"]
        press = latest_sensor["pressure"]
        curr = latest_sensor["current"]
        flow = latest_sensor["flow_rate"]
        rpm = latest_sensor["rpm"]

        # Calculate Component-Specific Health and Wear
        # 1. Bearing: heavily affected by vibration and temperature
        bearing_wear = min(98.0, max(4.0, (vib / 6.0) * 60.0 + ((temp - 50) / 40.0) * 35.0))
        bearing_health = max(5.0, round(100.0 - bearing_wear, 1))

        # 2. Motor: current and temperature
        motor_wear = min(98.0, max(3.0, ((curr - 7.5) / 5.0) * 55.0 + ((temp - 55) / 35.0) * 40.0))
        motor_health = max(10.0, round(100.0 - motor_wear, 1))

        # 3. Impeller & Pump Casing: affected by cavitation (pressure drop + vibration)
        impeller_wear = min(95.0, max(2.0, ((6.2 - press) / 3.0) * 45.0 + (vib / 6.0) * 40.0))
        impeller_health = max(12.0, round(100.0 - impeller_wear, 1))

        # 4. Shaft & Coupling: vibration and alignment
        shaft_wear = min(90.0, max(3.0, (vib / 5.5) * 50.0 + ((temp - 55) / 30.0) * 25.0))
        shaft_health = max(15.0, round(100.0 - shaft_wear, 1))

        # 5. Mechanical Seal: pressure, temperature, flow leakage
        seal_wear = min(92.0, max(4.0, ((temp - 55) / 30.0) * 40.0 + ((6.2 - press) / 2.5) * 45.0))
        seal_health = max(10.0, round(100.0 - seal_wear, 1))

        # 6. Pressure System
        press_wear = min(88.0, max(2.0, abs(6.2 - press) * 18.0))
        press_health = max(20.0, round(100.0 - press_wear, 1))

        components = [
            {
                "id": f"{machine_id}-COMP-BRG",
                "machine_id": machine_id,
                "name": "Drive End & Non-Drive End Bearings",
                "component_type": "Bearing Assembly",
                "health_score": bearing_health,
                "status": "CRITICAL" if bearing_health < 40 else "WARNING" if bearing_health < 75 else "NORMAL",
                "criticality": "HIGH",
                "wear_percentage": round(bearing_wear, 1),
                "operating_hours": round(base_meta["operating_hours"], 1),
                "last_inspected": "2026-09-12",
                "details": {
                    "bearing_model": "SKF 22212-E Spherical Roller",
                    "lubricant_type": "Mobil SHC Polyrex 462",
                    "vibration_rms": vib,
                    "bearing_temp_c": temp
                }
            },
            {
                "id": f"{machine_id}-COMP-MTR",
                "machine_id": machine_id,
                "name": "Three-Phase Induction Motor (37 kW)",
                "component_type": "Electric Motor",
                "health_score": motor_health,
                "status": "CRITICAL" if motor_health < 40 else "WARNING" if motor_health < 75 else "NORMAL",
                "criticality": "HIGH",
                "wear_percentage": round(motor_wear, 1),
                "operating_hours": round(base_meta["operating_hours"], 1),
                "last_inspected": "2026-08-20",
                "details": {
                    "stator_current_a": curr,
                    "winding_temp_c": temp + 4.5,
                    "rated_power_kw": 37.0,
                    "poles": 2
                }
            },
            {
                "id": f"{machine_id}-COMP-IMP",
                "machine_id": machine_id,
                "name": "Closed Radial Impeller",
                "component_type": "Hydraulic Impeller",
                "health_score": impeller_health,
                "status": "CRITICAL" if impeller_health < 40 else "WARNING" if impeller_health < 75 else "NORMAL",
                "criticality": "HIGH",
                "wear_percentage": round(impeller_wear, 1),
                "operating_hours": round(base_meta["operating_hours"], 1),
                "last_inspected": "2026-07-15",
                "details": {
                    "material": "Duplex Stainless Steel 2205",
                    "diameter_mm": 280,
                    "flow_rate_m3h": flow,
                    "discharge_press_bar": press
                }
            },
            {
                "id": f"{machine_id}-COMP-SFT",
                "machine_id": machine_id,
                "name": "Precision Drive Shaft & Coupling",
                "component_type": "Shaft & Coupling",
                "health_score": shaft_health,
                "status": "CRITICAL" if shaft_health < 40 else "WARNING" if shaft_health < 75 else "NORMAL",
                "criticality": "MEDIUM",
                "wear_percentage": round(shaft_wear, 1),
                "operating_hours": round(base_meta["operating_hours"], 1),
                "last_inspected": "2026-08-30",
                "details": {
                    "coupling_type": "Flexible Jaw Coupling N-EUPEX",
                    "rpm": rpm,
                    "angular_misalignment_deg": round(vib * 0.12, 2)
                }
            },
            {
                "id": f"{machine_id}-COMP-SEL",
                "machine_id": machine_id,
                "name": "Cartridge Mechanical Seal",
                "component_type": "Mechanical Seal",
                "health_score": seal_health,
                "status": "CRITICAL" if seal_health < 40 else "WARNING" if seal_health < 75 else "NORMAL",
                "criticality": "HIGH",
                "wear_percentage": round(seal_wear, 1),
                "operating_hours": round(base_meta["operating_hours"], 1),
                "last_inspected": "2026-08-10",
                "details": {
                    "seal_model": "John Crane 5610 Single Cartridge",
                    "face_materials": "Silicon Carbide vs Carbon",
                    "barrier_pressure_bar": press * 0.8
                }
            },
            {
                "id": f"{machine_id}-COMP-PRS",
                "machine_id": machine_id,
                "name": "Hydraulic Suction & Discharge Pressure System",
                "component_type": "Pressure Piping & Valves",
                "health_score": press_health,
                "status": "CRITICAL" if press_health < 40 else "WARNING" if press_health < 75 else "NORMAL",
                "criticality": "MEDIUM",
                "wear_percentage": round(press_wear, 1),
                "operating_hours": round(base_meta["operating_hours"], 1),
                "last_inspected": "2026-09-01",
                "details": {
                    "suction_pressure_bar": 1.4,
                    "discharge_pressure_bar": press,
                    "differential_head_m": round(press * 10.2, 1)
                }
            }
        ]

        # Connected Sensors
        sensors = [
            {
                "id": f"{machine_id}-SENS-TEMP",
                "machine_id": machine_id,
                "component_id": f"{machine_id}-COMP-BRG",
                "name": "Bearing Temperature Sensor (PT100 RTD)",
                "sensor_type": "Temperature",
                "unit": "°C",
                "current_value": temp,
                "min_threshold": 30.0,
                "warning_threshold": 68.0,
                "critical_threshold": 78.0,
                "status": "CRITICAL" if temp >= 78.0 else "WARNING" if temp >= 68.0 else "NORMAL",
                "sampling_rate_hz": 1.0
            },
            {
                "id": f"{machine_id}-SENS-VIB",
                "machine_id": machine_id,
                "component_id": f"{machine_id}-COMP-BRG",
                "name": "Tri-axial Vibration Accelerometer",
                "sensor_type": "Vibration",
                "unit": "mm/s",
                "current_value": vib,
                "min_threshold": 0.5,
                "warning_threshold": 3.5,
                "critical_threshold": 5.0,
                "status": "CRITICAL" if vib >= 5.0 else "WARNING" if vib >= 3.5 else "NORMAL",
                "sampling_rate_hz": 10.0
            },
            {
                "id": f"{machine_id}-SENS-PRS",
                "machine_id": machine_id,
                "component_id": f"{machine_id}-COMP-PRS",
                "name": "Discharge Piezoresistive Pressure Sensor",
                "sensor_type": "Pressure",
                "unit": "bar",
                "current_value": press,
                "min_threshold": 3.8,
                "warning_threshold": 5.2,
                "critical_threshold": 7.5,
                "status": "WARNING" if press < 4.8 or press > 7.0 else "NORMAL",
                "sampling_rate_hz": 5.0
            },
            {
                "id": f"{machine_id}-SENS-RPM",
                "machine_id": machine_id,
                "component_id": f"{machine_id}-COMP-SFT",
                "name": "Shaft Optical Tachometer",
                "sensor_type": "Rotational Speed",
                "unit": "RPM",
                "current_value": rpm,
                "min_threshold": 2700.0,
                "warning_threshold": 2880.0,
                "critical_threshold": 3050.0,
                "status": "NORMAL",
                "sampling_rate_hz": 1.0
            },
            {
                "id": f"{machine_id}-SENS-CURR",
                "machine_id": machine_id,
                "component_id": f"{machine_id}-COMP-MTR",
                "name": "Motor Current Transducer (Hall Effect)",
                "sensor_type": "Current",
                "unit": "A",
                "current_value": curr,
                "min_threshold": 4.0,
                "warning_threshold": 9.5,
                "critical_threshold": 11.0,
                "status": "CRITICAL" if curr >= 11.0 else "WARNING" if curr >= 9.5 else "NORMAL",
                "sampling_rate_hz": 2.0
            },
            {
                "id": f"{machine_id}-SENS-FLOW",
                "machine_id": machine_id,
                "component_id": f"{machine_id}-COMP-IMP",
                "name": "Electromagnetic Flowmeter",
                "sensor_type": "Flow Rate",
                "unit": "m³/h",
                "current_value": flow,
                "min_threshold": 20.0,
                "warning_threshold": 35.0,
                "critical_threshold": 55.0,
                "status": "WARNING" if flow < 35.0 else "NORMAL",
                "sampling_rate_hz": 1.0
            }
        ]

        overall_state = latest_sensor["condition"]

        return {
            "id": machine_id,
            "name": base_meta["name"],
            "machine_type": base_meta["machine_type"],
            "location": base_meta["location"],
            "operating_state": overall_state,
            "health_score": pred["health_score"],
            "failure_risk": pred["failure_probability"],
            "rul_hours": pred["rul_hours"],
            "uncertainty_score": unc["uncertainty_score"],
            "confidence_level": unc["confidence_level"],
            "operating_hours": round(base_meta["operating_hours"] + (simulator.step_count * 0.05), 1),
            "last_maintenance": base_meta["last_maintenance"],
            "next_recommended_maintenance": base_meta["next_recommended_maintenance"],
            "components": components,
            "sensors": sensors,
            "latest_reading": latest_sensor,
            "active_fault": simulator.active_fault,
            "fault_severity": simulator.fault_severity
        }

    def list_all_machines(self) -> List[Dict[str, Any]]:
        return [self.get_machine_twin(m_id) for m_id in self.machines.keys()]

# Global Digital Twin instance
TWIN_MANAGER = DigitalTwinManager()

def get_twin_manager() -> DigitalTwinManager:
    return TWIN_MANAGER
