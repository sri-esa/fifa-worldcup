import test from "node:test";
import assert from "node:assert/strict";
import { initialReports, zones } from "../src/data/venue.mjs";
import {
  answerFanQuestion,
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

test("recommendInterventions returns operational actions from live signals", () => {
  const actions = recommendInterventions(zones, initialReports);

  assert.ok(actions.length > 0);
  assert.ok(actions.some((action) => action.title.includes("Gate B")));
  assert.ok(actions.some((action) => action.title.includes("accessible")));
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
