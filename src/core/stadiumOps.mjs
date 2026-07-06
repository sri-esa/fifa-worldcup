const CATEGORY_RULES = [
  {
    category: "Crowd",
    urgency: "High",
    terms: ["crowd", "queue", "packed", "blocked", "congestion", "line", "gate"],
    action: "Redirect arrivals, deploy queue marshals, and consider opening a relief entry point."
  },
  {
    category: "Accessibility",
    urgency: "High",
    terms: ["wheelchair", "accessible", "step-free", "elevator", "mobility", "disabled"],
    action: "Assign an accessibility volunteer and provide the shortest step-free route."
  },
  {
    category: "Medical",
    urgency: "Critical",
    terms: ["medical", "injury", "faint", "chest", "ambulance", "sick", "emergency"],
    action: "Dispatch medical response and keep the nearest access lane clear."
  },
  {
    category: "Sustainability",
    urgency: "Medium",
    terms: ["waste", "recycle", "water", "bottle", "cleanup", "spill"],
    action: "Dispatch cleaning or supply staff and reduce blockage around the affected area."
  },
  {
    category: "Transport",
    urgency: "Medium",
    terms: ["metro", "bus", "tram", "parking", "pickup", "ride", "transport"],
    action: "Update fan guidance and rebalance traffic toward lower-wait transport nodes."
  }
];

const DEFAULT_ACTION = "Send a nearby volunteer to verify the report and update operations with status.";
const HIGH_RISK_LEVELS = new Set(["Critical", "High"]);
const URGENCY_WEIGHT = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

export function scoreZoneRisk(zone) {
  const load = zone.occupancy / zone.capacity;
  const waitPressure = Math.min(zone.waitMinutes / 30, 1);
  const score = Math.round((load * 0.7 + waitPressure * 0.3) * 100);

  if (score >= 85) {
    return { score, level: "Critical" };
  }

  if (score >= 70) {
    return { score, level: "High" };
  }

  if (score >= 50) {
    return { score, level: "Moderate" };
  }

  return { score, level: "Normal" };
}

export function buildOperationalSnapshot(zones) {
  const riskZones = zones
    .map((zone) => ({ ...zone, risk: scoreZoneRisk(zone) }))
    .sort((a, b) => b.risk.score - a.risk.score);

  const fastestTransport = zones
    .filter((zone) => zone.type === "transport")
    .reduce((best, zone) => (best == null || zone.waitMinutes < best.waitMinutes ? zone : best), null);

  return {
    riskZones,
    busiestZone: riskZones[0],
    highRiskZones: riskZones.filter((zone) => HIGH_RISK_LEVELS.has(zone.risk.level)),
    averageWait: Math.round(zones.reduce((sum, zone) => sum + zone.waitMinutes, 0) / zones.length),
    accessibleZones: zones.filter((zone) => zone.accessible).length,
    fastestTransport
  };
}

export function classifyIncident(text) {
  const normalized = normalizeText(text);
  const matchedRule = CATEGORY_RULES
    .map((rule) => ({
      ...rule,
      matches: rule.terms.filter((term) => normalized.includes(term)).length
    }))
    .filter((rule) => rule.matches > 0)
    .sort((a, b) => b.matches - a.matches || URGENCY_WEIGHT[b.urgency] - URGENCY_WEIGHT[a.urgency])[0];

  const rule = matchedRule || {
    category: "Operations",
    urgency: "Low",
    action: DEFAULT_ACTION
  };

  return {
    category: rule.category,
    urgency: rule.urgency,
    suggestedAction: rule.action,
    summary: summarizeReport(text, rule.category)
  };
}

export function summarizeReport(text, category = "Operations") {
  const cleaned = text.trim().replace(/\s+/g, " ");
  const clipped = cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
  return `${category} signal: ${clipped}`;
}

export function recommendInterventions(zones, reports) {
  const snapshot = buildOperationalSnapshot(zones);
  const reportSignals = reports.map((report) => ({
    ...report,
    ai: classifyIncident(report.text)
  })).sort((a, b) => URGENCY_WEIGHT[b.ai.urgency] - URGENCY_WEIGHT[a.ai.urgency]);

  const interventions = [];
  const topZone = snapshot.busiestZone;

  const criticalReport = reportSignals.find((report) => report.ai.urgency === "Critical");
  if (criticalReport) {
    interventions.push({
      title: `Immediate ${criticalReport.ai.category.toLowerCase()} response`,
      priority: "Critical",
      detail: criticalReport.ai.summary,
      action: criticalReport.ai.suggestedAction
    });
  }

  if (HIGH_RISK_LEVELS.has(topZone.risk.level)) {
    interventions.push({
      title: `Reduce pressure at ${topZone.label}`,
      priority: topZone.risk.level,
      detail: `Current load is ${Math.round((topZone.occupancy / topZone.capacity) * 100)}% with an estimated ${topZone.waitMinutes} minute wait.`,
      action: topZone.type === "entry"
        ? "Open a secondary screening lane and route late arrivals to the nearest lower-risk gate."
        : "Send volunteers to split queues and keep emergency routes unobstructed."
    });
  }

  const accessibilityReport = reportSignals.find((report) => report.ai.category === "Accessibility");
  if (accessibilityReport) {
    interventions.push({
      title: "Protect accessible journey",
      priority: "High",
      detail: accessibilityReport.ai.summary,
      action: accessibilityReport.ai.suggestedAction
    });
  }

  const sustainabilityReport = reportSignals.find((report) => report.ai.category === "Sustainability");
  if (sustainabilityReport) {
    interventions.push({
      title: "Protect service flow and sustainability goals",
      priority: sustainabilityReport.ai.urgency,
      detail: sustainabilityReport.ai.summary,
      action: sustainabilityReport.ai.suggestedAction
    });
  }

  const transportZone = snapshot.riskZones.find((zone) => zone.type === "transport" && zone.risk.score >= 65);
  if (transportZone) {
    interventions.push({
      title: `Rebalance transport load at ${transportZone.label}`,
      priority: transportZone.risk.level,
      detail: `${transportZone.label} is trending toward post-match congestion.`,
      action: "Promote the lower-wait tram option in fan guidance and notify transport coordinators."
    });
  }

  return interventions.slice(0, 4);
}

export function buildOperationsBrief(zones, reports) {
  const snapshot = buildOperationalSnapshot(zones);
  const incidentMix = reports.reduce((mix, report) => {
    const category = classifyIncident(report.text).category;
    mix[category] = (mix[category] || 0) + 1;
    return mix;
  }, {});

  const categories = Object.entries(incidentMix)
    .map(([category, count]) => `${count} ${category.toLowerCase()}`)
    .join(", ");

  return {
    headline: `${snapshot.highRiskZones.length} high-attention zone${snapshot.highRiskZones.length === 1 ? "" : "s"} detected`,
    summary: `${snapshot.busiestZone.label} has the highest operating pressure at ${snapshot.busiestZone.risk.score}/100. Current reports include ${categories || "no unresolved signals"}.`,
    nextBestAction: recommendInterventions(zones, reports)[0]?.action || DEFAULT_ACTION
  };
}

export function findBestRoute(zones, fromText, toText, needsAccessible = false) {
  const from = findZone(zones, fromText);
  const to = findZone(zones, toText);

  if (!from || !to) {
    return {
      found: false,
      steps: ["Ask a volunteer for the nearest visible landmark so the route can be confirmed."],
      message: "I could not confidently match that route."
    };
  }

  const candidates = zones.filter((zone) => zone.id !== from.id && zone.id !== to.id);
  const filtered = needsAccessible ? candidates.filter((zone) => zone.accessible) : candidates;
  const midpoint = filtered
    .filter((zone) => from.nearby.includes(zone.id) || to.nearby.includes(zone.id))
    .sort((a, b) => scoreZoneRisk(a).score - scoreZoneRisk(b).score)[0];

  const steps = midpoint
    ? [`Start at ${from.label}`, `Continue via ${midpoint.label}`, `Arrive at ${to.label}`]
    : [`Start at ${from.label}`, `Follow staff signage to ${to.label}`];

  return {
    found: true,
    from,
    to,
    steps,
    message: needsAccessible
      ? `Use the step-free route from ${from.label} to ${to.label}.`
      : `Use the lowest-pressure route from ${from.label} to ${to.label}.`
  };
}

export function answerFanQuestion(question, zones, language = "en") {
  const normalized = normalizeText(question);
  const needsAccessible = /wheelchair|accessible|step-free|elevator|mobility/.test(normalized);
  const wantsTransport = /metro|bus|tram|transport|parking|ride/.test(normalized);
  const wantsMedical = /medical|first aid|injury|sick|emergency/.test(normalized);
  const from = extractKnownZone(normalized, zones) || "gate a";

  if (wantsMedical) {
    return localize(
      "Nearest medical support is Medical Point 1 near the North Stand. If this is urgent, alert the closest steward immediately.",
      language
    );
  }

  if (wantsTransport) {
    const bestTransport = buildOperationalSnapshot(zones).fastestTransport;
    return localize(
      `${bestTransport.label} is currently the fastest transport option with about ${bestTransport.waitMinutes} minutes of waiting.`,
      language
    );
  }

  const destination = needsAccessible ? "north stand" : inferDestination(normalized);
  const route = findBestRoute(zones, from, destination, needsAccessible);
  return localize(`${route.message} ${route.steps.join(" > ")}.`, language);
}

export function localize(text, language) {
  if (language === "es") {
    return `Respuesta en espanol: ${text}`;
  }

  if (language === "fr") {
    return `Reponse en francais: ${text}`;
  }

  if (language === "hi") {
    return `Hindi response: ${text}`;
  }

  return text;
}

function findZone(zones, text) {
  const normalized = normalizeText(text);
  return zones.find((zone) =>
    zone.id.toLowerCase() === normalized ||
    zone.label.toLowerCase() === normalized ||
    normalized.includes(zone.label.toLowerCase())
  );
}

function extractKnownZone(text, zones) {
  const found = zones.find((zone) => text.includes(zone.label.toLowerCase()));
  return found?.label;
}

function normalizeText(text) {
  return String(text).toLowerCase().trim().replace(/\s+/g, " ");
}

function inferDestination(text) {
  if (text.includes("gate b")) return "gate b";
  if (text.includes("gate c")) return "gate c";
  if (text.includes("food") || text.includes("water")) return "concession 12";
  if (text.includes("family")) return "family zone";
  if (text.includes("seat") || text.includes("north")) return "north stand";
  if (text.includes("south")) return "south stand";
  return "north stand";
}
