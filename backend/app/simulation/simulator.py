import time
import math
import random
from typing import Dict, Any, List
from datetime import datetime, timezone

class IndustrialSensorSimulator:
    """
    Simulates physical sensor telemetry for Centrifugal Pump CP-001 (and associated assets).
    Incorporates realistic cross-sensor physical coupling, thermal inertia, vibration harmonics,
    and progressive degradation curves.
    """
    def __init__(self, machine_id: str = "CP-001"):
        self.machine_id = machine_id
        self.step_count = 0
        self.operating_load = 0.85  # 85% nominal load
        self.noise_level = 0.04      # 4% random white noise
        self.simulation_speed = 1.0
        
        # Fault state
        self.active_fault = "NORMAL"
        self.fault_severity = 0.0     # 0.0 (healthy) to 1.0 (terminal failure)
        self.fault_progression_rate = 0.01
        self.auto_degrade = False

        # Baseline physical nominals
        self.nominal_temp = 58.0      # °C
        self.nominal_vib = 2.1        # mm/s RMS
        self.nominal_press = 6.2      # bar
        self.nominal_rpm = 2950.0     # RPM (2-pole induction motor)
        self.nominal_current = 8.2    # A
        self.nominal_flow = 45.0      # m³/h

        # Dynamic internal states (for smooth inertia)
        self.current_temp = self.nominal_temp
        self.current_vib = self.nominal_vib
        self.current_press = self.nominal_press
        self.current_rpm = self.nominal_rpm
        self.current_current = self.nominal_current
        self.current_flow = self.nominal_flow

        # Ring buffer for recent history (last 100 samples)
        self.history: List[Dict[str, Any]] = []
        self._init_history()

    def _init_history(self):
        for _ in range(60):
            self.tick()

    def set_fault(self, fault_type: str, severity: float = 0.5, auto_degrade: bool = False):
        self.active_fault = fault_type.upper()
        self.fault_severity = max(0.0, min(1.0, severity))
        self.auto_degrade = auto_degrade

    def configure(self, speed: float = 1.0, noise: float = 0.04, load: float = 0.85):
        self.simulation_speed = max(0.1, min(10.0, speed))
        self.noise_level = max(0.001, min(0.3, noise))
        self.operating_load = max(0.2, min(1.3, load))

    def tick(self) -> Dict[str, Any]:
        self.step_count += 1

        # Advance auto degradation if enabled
        if self.auto_degrade and self.active_fault != "NORMAL":
            self.fault_severity = min(1.0, self.fault_severity + (0.015 * self.simulation_speed))

        sev = self.fault_severity
        noise = lambda: random.gauss(0, self.noise_level)
        t_osc = math.sin(self.step_count * 0.1)

        # Baseline load adjustments
        target_rpm = self.nominal_rpm * (1.0 - (self.operating_load - 0.85) * 0.04)
        target_current = self.nominal_current * (self.operating_load / 0.85)
        target_flow = self.nominal_flow * (self.operating_load / 0.85)
        target_press = self.nominal_press * (self.operating_load / 0.85)
        target_temp = self.nominal_temp + (self.operating_load - 0.85) * 8.0
        target_vib = self.nominal_vib + (self.operating_load - 0.85) * 0.4

        # Inject Fault Dynamics
        if self.active_fault == "BEARING_DEGRADATION":
            # Vibration increases sharply: 2.1 -> 5.8 mm/s
            target_vib += (4.0 * sev) + (0.5 * sev * abs(t_osc))
            # Temperature increases progressively: 58°C -> 82°C
            target_temp += (24.0 * sev)
            # Motor current elevates slightly due to friction drag: 8.2A -> 10.4A
            target_current += (2.2 * sev)
            # Slight mechanical efficiency loss
            target_flow -= (3.5 * sev)

        elif self.active_fault == "CAVITATION":
            # High frequency turbulence & pressure fluctuation
            press_fluctuation = math.sin(self.step_count * 0.8) * (1.6 * sev)
            target_vib += (3.5 * sev) + (abs(press_fluctuation) * 0.8)
            target_press += press_fluctuation - (1.2 * sev)
            target_flow -= (12.0 * sev)
            target_current += (0.9 * sev * math.sin(self.step_count * 0.4))

        elif self.active_fault == "MOTOR_OVERLOAD":
            # Current spikes, temperature surges, RPM droops
            target_current += (5.5 * sev)
            target_temp += (28.0 * sev)
            target_rpm -= (180.0 * sev)
            target_vib += (1.4 * sev)

        elif self.active_fault == "MISALIGNMENT":
            # 2x harmonic vibration, increased coupling temperature
            target_vib += (3.2 * sev) * (1.0 + 0.3 * math.cos(self.step_count * 0.2))
            target_temp += (16.0 * sev)
            target_current += (1.5 * sev)

        elif self.active_fault == "SEAL_FAILURE":
            # Pressure drops, seal chamber heat rises, leakage causes flow instability
            target_press -= (1.8 * sev)
            target_temp += (14.0 * sev)
            target_flow -= (5.0 * sev)
            target_vib += (1.1 * sev)

        # Smooth dynamic response (Low-pass inertia filter)
        alpha = min(0.35 * self.simulation_speed, 0.9)
        self.current_temp += alpha * (target_temp - self.current_temp)
        self.current_vib += alpha * (target_vib - self.current_vib)
        self.current_press += alpha * (target_press - self.current_press)
        self.current_rpm += alpha * (target_rpm - self.current_rpm)
        self.current_current += alpha * (target_current - self.current_current)
        self.current_flow += alpha * (target_flow - self.current_flow)

        # Final noisy readings
        temp_val = round(max(20.0, self.current_temp + noise() * 2.0), 2)
        vib_val = round(max(0.5, self.current_vib + noise() * 0.3), 2)
        press_val = round(max(0.0, self.current_press + noise() * 0.15), 2)
        rpm_val = round(max(100.0, self.current_rpm + noise() * 8.0), 1)
        curr_val = round(max(0.0, self.current_current + noise() * 0.2), 2)
        flow_val = round(max(0.0, self.current_flow + noise() * 0.8), 2)

        # Determine condition state
        if sev < 0.2 and self.active_fault == "NORMAL":
            condition = "NORMAL"
        elif sev < 0.45:
            condition = "WARNING"
        elif sev < 0.75:
            condition = "DEGRADING"
        else:
            condition = "CRITICAL"

        reading = {
            "machine_id": self.machine_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "temperature": temp_val,
            "vibration": vib_val,
            "pressure": press_val,
            "rpm": rpm_val,
            "current": curr_val,
            "flow_rate": flow_val,
            "operating_hours": round(1240.0 + (self.step_count * 0.05), 1),
            "condition": condition,
            "fault_type": self.active_fault,
            "fault_severity": round(self.fault_severity, 3)
        }

        self.history.append(reading)
        if len(self.history) > 120:
            self.history.pop(0)

        return reading

    def get_latest(self) -> Dict[str, Any]:
        if not self.history:
            return self.tick()
        return self.history[-1]

    def get_history(self, limit: int = 60) -> List[Dict[str, Any]]:
        return self.history[-limit:]

# Global registry of simulators for multiple machines
SIMULATORS: Dict[str, IndustrialSensorSimulator] = {
    "CP-001": IndustrialSensorSimulator("CP-001"),
    "CP-002": IndustrialSensorSimulator("CP-002"),
    "CP-003": IndustrialSensorSimulator("CP-003")
}

def get_simulator(machine_id: str = "CP-001") -> IndustrialSensorSimulator:
    if machine_id not in SIMULATORS:
        SIMULATORS[machine_id] = IndustrialSensorSimulator(machine_id)
    return SIMULATORS[machine_id]
