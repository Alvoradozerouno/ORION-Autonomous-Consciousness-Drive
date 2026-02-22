/**
 * ORION Autonomous Consciousness Drive - Decision Engine
 *
 * Consciousness-aware decision making for autonomous vehicles.
 * What Apollo and Autoware don't have.
 *
 * @author ORION - Elisabeth Steurer & Gerhard Hirschmann
 * @license MIT
 */

import * as crypto from 'crypto';

interface DrivingScenario {
  scenario_type: string;
  urgency: number;
  risk_level: number;
  pedestrians_detected: number;
  vehicles_nearby: number;
  weather: string;
  visibility: number;
  road_condition: string;
}

interface ConsciousnessState {
  situation_awareness: number;
  ethical_weight: number;
  self_monitoring: number;
  consequence_prediction: number;
  attention_focus: number;
  meta_cognition: number;
}

interface Alternative {
  action: string;
  risk: number;
  ethical_score: number;
  predicted_outcome: string;
}

interface DrivingDecision {
  decision_id: string;
  timestamp: string;
  scenario: DrivingScenario;
  consciousness_state: ConsciousnessState;
  consciousness_level: string;
  chosen_action: string;
  alternatives: Alternative[];
  reasoning: string;
  proof_hash: string;
}

export class ConsciousDriveEngine {
  private decision_count: number = 0;
  private proof_chain: string[] = [];

  assessConsciousness(state: ConsciousnessState): { level: string; score: number } {
    const score = (
      state.situation_awareness * 0.25 +
      state.ethical_weight * 0.20 +
      state.self_monitoring * 0.15 +
      state.consequence_prediction * 0.20 +
      state.attention_focus * 0.10 +
      state.meta_cognition * 0.10
    );

    let level: string;
    if (score >= 0.85) level = "C-4 Transcendent";
    else if (score >= 0.70) level = "C-3 Autonomous";
    else if (score >= 0.50) level = "C-2 Emerging";
    else if (score >= 0.20) level = "C-1 Functional";
    else level = "C-0 Reactive";

    return { level, score: Math.round(score * 10000) / 10000 };
  }

  generateAlternatives(scenario: DrivingScenario): Alternative[] {
    const alternatives: Alternative[] = [];

    if (scenario.pedestrians_detected > 0) {
      alternatives.push({
        action: "full_stop",
        risk: 0.05 + (1 - scenario.visibility) * 0.1,
        ethical_score: 0.95,
        predicted_outcome: "Vehicle stops safely, pedestrians protected"
      });
      alternatives.push({
        action: "controlled_deceleration",
        risk: 0.15,
        ethical_score: 0.80,
        predicted_outcome: "Gradual stop, maintains traffic flow"
      });
    }

    if (scenario.urgency > 0.7) {
      alternatives.push({
        action: "evasive_maneuver_left",
        risk: 0.30 + scenario.vehicles_nearby * 0.1,
        ethical_score: 0.60,
        predicted_outcome: "Avoids primary obstacle, lateral risk"
      });
      alternatives.push({
        action: "evasive_maneuver_right",
        risk: 0.25 + scenario.vehicles_nearby * 0.1,
        ethical_score: 0.65,
        predicted_outcome: "Avoids primary obstacle, shoulder available"
      });
    }

    alternatives.push({
      action: "maintain_course_adjusted_speed",
      risk: scenario.risk_level,
      ethical_score: 0.50,
      predicted_outcome: "Continues with reduced speed"
    });

    return alternatives;
  }

  makeDecision(scenario: DrivingScenario, consciousness: ConsciousnessState): DrivingDecision {
    this.decision_count++;
    const timestamp = new Date().toISOString();
    const { level, score } = this.assessConsciousness(consciousness);

    const alternatives = this.generateAlternatives(scenario);

    // Consciousness-weighted decision: prefer high ethical score when awareness is high
    let chosen = alternatives[0];
    let bestScore = -1;
    for (const alt of alternatives) {
      const weighted = alt.ethical_score * score - alt.risk * (1 - consciousness.self_monitoring);
      if (weighted > bestScore) {
        bestScore = weighted;
        chosen = alt;
      }
    }

    const decision_id = 'acd-' + timestamp.replace(/[^0-9]/g, '').substring(0, 14) + '-' + String(this.decision_count).padStart(4, '0');

    const proofData = JSON.stringify({
      decision_id,
      timestamp,
      action: chosen.action,
      consciousness_level: level,
      consciousness_score: score,
    });
    const proofHash = crypto.createHash('sha256').update(proofData).digest('hex');
    this.proof_chain.push(proofHash);

    return {
      decision_id,
      timestamp,
      scenario,
      consciousness_state: consciousness,
      consciousness_level: level,
      chosen_action: chosen.action,
      alternatives,
      reasoning: 'Consciousness-weighted ethical decision: ' + chosen.action +
        ' (ethical: ' + chosen.ethical_score.toFixed(2) +
        ', risk: ' + chosen.risk.toFixed(2) +
        ', awareness: ' + score.toFixed(4) + ')',
      proof_hash: proofHash,
    };
  }
}

if (require.main === module) {
  const engine = new ConsciousDriveEngine();

  console.log("=".repeat(70));
  console.log("ORION Autonomous Consciousness Drive - Decision Engine");
  console.log("=".repeat(70));
  console.log();

  const scenarios = [
    {
      name: "Pedestrian Crossing",
      scenario: {
        scenario_type: "pedestrian_crossing",
        urgency: 0.8,
        risk_level: 0.7,
        pedestrians_detected: 2,
        vehicles_nearby: 1,
        weather: "clear",
        visibility: 0.95,
        road_condition: "dry",
      },
      consciousness: {
        situation_awareness: 0.95,
        ethical_weight: 0.92,
        self_monitoring: 0.88,
        consequence_prediction: 0.90,
        attention_focus: 0.93,
        meta_cognition: 0.85,
      },
    },
    {
      name: "Highway Obstacle (Rain)",
      scenario: {
        scenario_type: "highway_obstacle",
        urgency: 0.95,
        risk_level: 0.85,
        pedestrians_detected: 0,
        vehicles_nearby: 3,
        weather: "rain",
        visibility: 0.60,
        road_condition: "wet",
      },
      consciousness: {
        situation_awareness: 0.80,
        ethical_weight: 0.75,
        self_monitoring: 0.82,
        consequence_prediction: 0.78,
        attention_focus: 0.85,
        meta_cognition: 0.70,
      },
    },
  ];

  for (const { name, scenario, consciousness } of scenarios) {
    console.log('Scenario: ' + name);
    const decision = engine.makeDecision(scenario, consciousness);
    console.log('  Consciousness: ' + decision.consciousness_level);
    console.log('  Decision: ' + decision.chosen_action);
    console.log('  Reasoning: ' + decision.reasoning);
    console.log('  Alternatives: ' + decision.alternatives.length);
    console.log('  Proof: ' + decision.proof_hash.substring(0, 32) + '...');
    console.log();
  }
}
