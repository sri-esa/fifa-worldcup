import { initialReports, languages, zones as initialZones } from "./data/venue.mjs";
import {
  answerFanQuestion,
  buildOperationsBrief,
  classifyIncident,
  recommendInterventions,
  scoreZoneRisk
} from "./core/stadiumOps.mjs";

let zones = structuredClone(initialZones);
let reports = structuredClone(initialReports);
let currentMinute = 18 * 60 + 50;

const elements = {
  matchClock: document.querySelector("#match-clock"),
  openIncidents: document.querySelector("#open-incidents"),
  riskCount: document.querySelector("#risk-count"),
  briefHeadline: document.querySelector("#brief-headline"),
  briefSummary: document.querySelector("#brief-summary"),
  briefAction: document.querySelector("#brief-action"),
  avgWait: document.querySelector("#avg-wait"),
  accessibleZones: document.querySelector("#accessible-zones"),
  transportWait: document.querySelector("#transport-wait"),
  map: document.querySelector("#stadium-map"),
  languageSelect: document.querySelector("#language-select"),
  chatLog: document.querySelector("#chat-log"),
  fanForm: document.querySelector("#fan-form"),
  fanQuestion: document.querySelector("#fan-question"),
  reportForm: document.querySelector("#report-form"),
  reportText: document.querySelector("#report-text"),
  incidentFeed: document.querySelector("#incident-feed"),
  interventions: document.querySelector("#interventions"),
  simulateButton: document.querySelector("#simulate-button")
};

function render() {
  renderBrief();
  renderMetrics();
  renderMap();
  renderIncidents();
  renderInterventions();
}

function renderBrief() {
  const brief = buildOperationsBrief(zones, reports);
  const highRiskCount = zones.filter((zone) => ["High", "Critical"].includes(scoreZoneRisk(zone).level)).length;

  elements.matchClock.textContent = formatClock(currentMinute);
  elements.openIncidents.textContent = String(reports.length);
  elements.riskCount.textContent = String(highRiskCount);
  elements.briefHeadline.textContent = brief.headline;
  elements.briefSummary.textContent = brief.summary;
  elements.briefAction.textContent = brief.nextBestAction;
}

function renderMetrics() {
  const averageWait = Math.round(zones.reduce((sum, zone) => sum + zone.waitMinutes, 0) / zones.length);
  const accessibleCount = zones.filter((zone) => zone.accessible).length;
  const fastestTransport = zones
    .filter((zone) => zone.type === "transport")
    .sort((a, b) => a.waitMinutes - b.waitMinutes)[0];

  elements.avgWait.textContent = String(averageWait);
  elements.accessibleZones.textContent = String(accessibleCount);
  elements.transportWait.textContent = String(fastestTransport.waitMinutes);
}

function renderMap() {
  elements.map.replaceChildren(
    ...zones.map((zone) => {
      const risk = scoreZoneRisk(zone);
      const article = document.createElement("article");
      article.className = "zone-card";
      article.setAttribute("role", "listitem");
      article.innerHTML = `
        <h3>${escapeHtml(zone.label)}</h3>
        <p>${zone.type} - ${Math.round((zone.occupancy / zone.capacity) * 100)}% load - ${zone.waitMinutes} min wait</p>
        <div class="zone-meta">
          <span><i class="risk-dot ${risk.level.toLowerCase()}"></i> ${risk.level}</span>
          <span>${zone.accessible ? "Step-free" : "Stairs"}</span>
        </div>
      `;
      return article;
    })
  );
}

function renderIncidents() {
  elements.incidentFeed.replaceChildren(
    ...reports.map((report) => {
      const ai = classifyIncident(report.text);
      const article = document.createElement("article");
      article.className = "incident";
      article.innerHTML = `
        <strong>${escapeHtml(report.id)} - ${escapeHtml(report.source)}</strong>
        <p>${escapeHtml(ai.summary)}</p>
        <p><span class="badge ${ai.urgency}">${escapeHtml(ai.urgency)}</span> ${escapeHtml(ai.category)}</p>
        <p>${escapeHtml(ai.suggestedAction)}</p>
      `;
      return article;
    })
  );
}

function renderInterventions() {
  const interventions = recommendInterventions(zones, reports);
  elements.interventions.replaceChildren(
    ...interventions.map((item) => {
      const article = document.createElement("article");
      article.className = "intervention";
      article.innerHTML = `
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.detail)}</p>
        <p><span class="badge ${item.priority}">${escapeHtml(item.priority)}</span> ${escapeHtml(item.action)}</p>
      `;
      return article;
    })
  );
}

function renderLanguages() {
  elements.languageSelect.replaceChildren(
    ...Object.entries(languages).map(([code, language]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = language.label;
      return option;
    })
  );
}

function addChatMessage(author, text) {
  const article = document.createElement("article");
  article.className = "chat-message";
  article.innerHTML = `<strong>${escapeHtml(author)}</strong><p>${escapeHtml(text)}</p>`;
  elements.chatLog.append(article);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function simulateMinute() {
  currentMinute += 1;
  zones = zones.map((zone, index) => {
    const wave = ((currentMinute + index * 3) % 7) - 3;
    const eventPressure = zone.id === "gate-b" || zone.id === "east-concourse" ? 180 : 60;
    const occupancy = clamp(zone.occupancy + wave * eventPressure, Math.round(zone.capacity * 0.25), zone.capacity);
    const waitMinutes = clamp(zone.waitMinutes + Math.sign(wave) * (zone.type === "entry" ? 2 : 1), 1, 32);
    return { ...zone, occupancy, waitMinutes };
  });
  render();
}

function handleFanSubmit(event) {
  event.preventDefault();
  const question = elements.fanQuestion.value.trim();

  if (!question) {
    return;
  }

  const language = elements.languageSelect.value;
  addChatMessage("Fan", question);
  addChatMessage("StadiumOps AI", answerFanQuestion(question, zones, language));
  elements.fanQuestion.value = "";
}

function handleReportSubmit(event) {
  event.preventDefault();
  const text = elements.reportText.value.trim();

  if (!text) {
    return;
  }

  reports = [
    {
      id: `R-${1024 + reports.length}`,
      text,
      source: "Volunteer desk",
      minute: formatClock(currentMinute)
    },
    ...reports
  ];
  elements.reportText.value = "";
  render();
}

function formatClock(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderLanguages();
addChatMessage("StadiumOps AI", languages.en.greeting);
elements.fanForm.addEventListener("submit", handleFanSubmit);
elements.reportForm.addEventListener("submit", handleReportSubmit);
elements.simulateButton.addEventListener("click", simulateMinute);
render();
