import test from "node:test";
import assert from "node:assert/strict";
import { initialReports, zones } from "../src/data/venue.mjs";
import {
  answerFanQuestion,
  buildOperationalSnapshot,
  buildOperationsBrief,
  classifyIncident,
  findBestRoute,
  recommendInterventions,
  scoreZoneRisk
} from "../src/core/stadiumOps.mjs";

test("scoreZoneRisk marks crowded and slow zones as high pressure", () => {
  const gateB = zones.find((zone) => zone.id === "gate-b");
  const risk = scoreZoneRisk(gateB);

  assert.ok(["High", "Critical"].includes(risk.level));
  assert.ok(risk.score >= 70);
});

test("classifyIncident detects accessibility requests", () => {
  const result = classifyIncident("Wheelchair fan needs a step-free elevator route to the North Stand");

  assert.equal(result.category, "Accessibility");
  assert.equal(result.urgency, "High");
  assert.match(result.suggestedAction, /accessibility volunteer/);
});

test("classifyIncident prioritizes medical emergencies over generic gate mentions", () => {
  const result = classifyIncident("Medical emergency near Gate A and crowd forming around the access lane");

  assert.equal(result.category, "Medical");
  assert.equal(result.urgency, "Critical");
  assert.match(result.suggestedAction, /medical response/);
});

test("buildOperationalSnapshot derives reusable metrics in one pass boundary", () => {
  const snapshot = buildOperationalSnapshot(zones);

  assert.equal(snapshot.riskZones.length, zones.length);
  assert.ok(snapshot.highRiskZones.length > 0);
  assert.ok(snapshot.averageWait > 0);
  assert.equal(snapshot.fastestTransport.type, "transport");
});

test("recommendInterventions returns operational actions from live signals", () => {
  const actions = recommendInterventions(zones, initialReports);

  assert.ok(actions.length > 0);
  assert.ok(actions.some((action) => action.title.includes("Gate B")));
  assert.ok(actions.some((action) => action.title.includes("accessible")));
});

test("recommendInterventions includes sustainability service-flow actions", () => {
  const actions = recommendInterventions(zones, [
    { id: "R-1", text: "Water bottles are low and waste is blocking Concession 12", source: "Vendor", minute: "19:02" }
  ]);

  assert.ok(actions.some((action) => action.title.includes("sustainability")));
});

test("buildOperationsBrief summarizes high attention areas", () => {
  const brief = buildOperationsBrief(zones, initialReports);

  assert.match(brief.headline, /high-attention/);
  assert.match(brief.summary, /Gate B|East Concourse|Concession 12/);
  assert.ok(brief.nextBestAction.length > 20);
});

test("findBestRoute prefers accessible waypoints when requested", () => {
  const route = findBestRoute(zones, "Metro Plaza", "North Stand", true);

  assert.equal(route.found, true);
  assert.match(route.message, /step-free/);
  assert.ok(route.steps.length >= 2);
});

test("answerFanQuestion handles transport guidance", () => {
  const answer = answerFanQuestion("What is the fastest transport after the match?", zones, "en");

  assert.match(answer, /transport option/);
  assert.match(answer, /minutes/);
});

test("answerFanQuestion returns a language-specific response boundary", () => {
  const answer = answerFanQuestion("Necesito una ruta accessible", zones, "es");

  assert.match(answer, /Respuesta en espanol/);
  assert.match(answer, /step-free|lowest-pressure/);
});
