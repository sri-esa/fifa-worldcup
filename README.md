# StadiumOps AI

StadiumOps AI is a GenAI-enabled smart stadium command center for the Google Virtual PromptWars FIFA World Cup 2026 challenge:

> Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff.

Live demo: https://radiant-monstera-3e83fb.netlify.app

Repository: https://github.com/sri-esa/fifa-worldcup

## Submission Checklist

| Requirement | Status |
| --- | --- |
| Public GitHub repository | Repository link included above. |
| Single branch | Project is maintained on `main`. |
| Repository size under 10 MB | Current repository size is well under the 10 MB limit. |
| Complete project code | App, core logic, tests, deployment config, and README are included. |
| README explains vertical, approach, logic, and assumptions | Covered in the sections below. |
| Deployed demo | Netlify demo link included above. |

## Chosen Vertical

**Challenge 4: Smart Stadiums and Tournament Operations**

The selected persona is a FIFA World Cup 2026 match-day operations team that must support four groups at once:

- **Fans** who need quick guidance for gates, seats, transport, medical help, and accessible routes.
- **Volunteers** who need a simple way to report field issues without learning a complex system.
- **Venue staff** who need prioritized operational actions instead of raw reports.
- **Organizers** who need live summaries of crowd pressure and service disruptions.

## Problem Statement Alignment

Large tournament venues need to make fast decisions from noisy, fragmented signals: crowd pressure, volunteer reports, fan navigation requests, transport status, accessibility needs, and service disruptions. StadiumOps AI turns those signals into real-time guidance for fans, volunteers, and operations staff.

The solution directly targets Challenge 4: Smart Stadiums and Tournament Operations by supporting:

- Stadium operations and real-time decision support.
- Crowd management and queue-risk detection.
- Accessible route guidance for fans with mobility needs.
- Multilingual fan assistance.
- Volunteer incident triage.
- Transportation guidance after match events.
- Sustainability-adjacent operations such as water, waste, and cleanup signals.

### Challenge Coverage Matrix

| Challenge need | Where it appears in the solution |
| --- | --- |
| Navigation | Fan assistant answers route questions and the route engine selects lower-pressure paths between venue zones. |
| Crowd management | Zone pressure scores combine capacity load and wait time to surface high-attention areas. |
| Accessibility | Accessible zones, step-free routing, and accessibility incident triage are first-class parts of the data model and assistant flow. |
| Transportation | Transport nodes such as Metro Plaza, Bus Loop, and Tram Stop are modeled with wait times and fan guidance. |
| Sustainability | Water, waste, cleanup, and spill reports are classified as sustainability/service-flow signals. |
| Multilingual assistance | The assistant supports selectable language modes for fan-facing guidance. |
| Operational intelligence | The command brief summarizes the busiest zone, open report mix, and next best action. |
| Real-time decision support | Volunteers can submit new reports and the dashboard immediately updates recommendations. |

## Approach and Logic

The project is designed around a practical match-day loop:

1. **Observe:** Venue zones expose current occupancy, capacity, wait time, transport status, and accessibility metadata.
2. **Understand:** The AI logic scores risk, classifies natural-language reports, and identifies the strongest current operational signals.
3. **Decide:** The command brief and intervention engine recommend concrete next actions for staff.
4. **Assist:** Fans receive contextual guidance, including transport and step-free route help.
5. **Update:** The simulation advances match-minute pressure so the interface demonstrates dynamic decision making.

The logic intentionally separates UI rendering from decision logic:

- `src/data/venue.mjs` contains the venue model and demo signals.
- `src/core/stadiumOps.mjs` contains the AI-style reasoning functions.
- `src/app.js` connects the browser UI, forms, and simulation state.
- `tests/stadiumOps.test.mjs` validates the core behavior without depending on the browser.

## Core Experience

- **Operations dashboard:** Shows high-risk zones, wait times, accessible zone coverage, transport status, and an AI command brief.
- **Venue pressure map:** Simulates live stadium areas such as gates, concourses, seating, medical points, concessions, and transport nodes.
- **Fan assistant:** Answers natural-language questions about gates, seats, transport, medical help, and step-free routes.
- **Volunteer copilot:** Accepts natural-language field reports and classifies them by category, urgency, summary, and suggested action.
- **Decision support:** Recommends operational interventions such as opening relief lanes, dispatching volunteers, rerouting fans, and protecting accessible journeys.

## GenAI Design

This MVP uses a deterministic local AI engine so judges can run, inspect, and test the project without API keys or external services. The code is intentionally structured around GenAI-ready boundaries that can be replaced with Gemini or Vertex AI calls in production.

| Function | Current role | Production GenAI equivalent |
| --- | --- | --- |
| `classifyIncident` | Converts volunteer reports into category, urgency, summary, and action. | Gemini structured JSON extraction with schema validation. |
| `buildOperationsBrief` | Produces an operations summary from live venue state. | Gemini summarization grounded in verified venue telemetry. |
| `answerFanQuestion` | Generates fan guidance for navigation, transport, medical, and accessibility needs. | Gemini multilingual assistant with retrieval from official venue data. |
| `recommendInterventions` | Converts risks and reports into operational actions. | Gemini decision-support suggestions with policy guardrails. |

Production safeguards would include strict JSON schemas, prompt-injection filtering, source-grounded retrieval, moderation, rate limiting, audit logs, and human approval for critical safety decisions.

## Assumptions

- The MVP uses simulated venue data because real FIFA World Cup 2026 operational feeds are not publicly available.
- The venue layout is a representative demo model, not an official stadium map.
- The local GenAI engine is deterministic for reliable judging, repeatable tests, and no API-key requirement.
- Critical actions such as medical dispatch or gate closure would require human approval in production.
- Multilingual output is represented as a demo boundary; production deployment would use verified translations or a grounded Gemini workflow.
- The Netlify deployment is used for public judging access because the active Google Cloud project had billing disabled during Cloud Run deployment.

## Architecture

```text
.
|-- index.html                  # App shell and semantic UI structure
|-- src/
|   |-- app.js                  # Browser state, rendering, forms, simulation
|   |-- styles.css              # Responsive accessible interface styling
|   |-- core/
|   |   `-- stadiumOps.mjs      # Testable AI and operations logic
|   `-- data/
|       `-- venue.mjs           # Demo venue zones, reports, and languages
|-- tests/
|   `-- stadiumOps.test.mjs     # Node test suite for core behavior
|-- server.js                   # Small static server for local/Cloud Run use
|-- Dockerfile                  # Cloud Run-ready container definition
|-- netlify.toml                # Netlify static deployment config
`-- package.json
```

The core logic is isolated from the UI so it can be unit tested, reviewed, and later connected to real APIs or Gemini without rewriting the application.

## Judging Criteria Mapping

| Criterion | Impact | What this submission does |
| --- | --- | --- |
| Code quality | High | Uses small ES modules, pure functions for business logic, clear file boundaries, no framework complexity, readable naming, and focused state management. |
| Problem statement alignment | High | Directly addresses stadium operations, fan experience, volunteer support, crowd management, accessibility, transport, multilingual help, and real-time decision support for FIFA World Cup 2026. |
| Security | Medium | Avoids client-side secrets, uses no third-party runtime dependencies, escapes user-generated report text before rendering, keeps deployment config minimal, and avoids unsafe dynamic code execution. |
| Efficiency | Medium | Runs as a lightweight static app, uses in-memory venue data, avoids repeated network calls, computes risk scores with simple linear passes, and can deploy cheaply on Netlify or Cloud Run. |
| Testing | Low | Includes Node tests for risk scoring, incident classification, operations summaries, route guidance, transport answers, and recommended interventions. |
| Accessibility | Low | Uses semantic HTML, visible labels, keyboard focus states, responsive layouts, high-contrast status colors, and step-free route support for mobility-aware fan guidance. |

## Security Notes

- No API keys or tokens are stored in the repository.
- The browser app does not call external services.
- User-entered reports and questions are escaped before being inserted into the DOM.
- The local server prevents path traversal by resolving requests inside the project root.
- Production GenAI integration should keep model calls on a backend and validate all model outputs before rendering or acting on them.

## Efficiency Notes

- The app has no install-time dependencies for normal runtime.
- The simulation updates local state only.
- Risk scoring and intervention generation operate over the small active venue dataset.
- Static hosting avoids unnecessary server cost for the MVP.
- Core operations use simple linear scans over venue zones and reports, which keeps runtime predictable as the demo state changes.
- The app avoids client-server round trips during simulation, so UI updates remain fast even on constrained networks.
- Static deployment means the public demo has no always-on backend and no idle compute cost.

## Testing

Run:

```bash
npm test
```

Current tests cover:

- High-pressure zone scoring.
- Accessibility incident classification.
- Operational intervention generation.
- AI command brief generation.
- Step-free route guidance.
- Transport guidance.

## Run Locally

```bash
npm start
```

Open:

```text
http://localhost:5173
```

## Deployment

The project is deployed on Netlify as a static site:

```text
https://radiant-monstera-3e83fb.netlify.app
```

It is also Cloud Run-ready through the included `Dockerfile`. Cloud Run deployment was prepared, but the active Google Cloud project had billing disabled during deployment.

## Suggested Demo Flow

1. Open the live Netlify site.
2. Show the AI command brief and explain the high-pressure Gate B signal.
3. Click `Run` to simulate the next match minute.
4. Ask the fan assistant: `I need an accessible route from Metro Plaza to my seat`.
5. Submit a volunteer report: `Medical emergency near Gate A and crowd forming around the access lane`.
6. Show how the incident feed and recommended interventions update immediately.

## Future Enhancements

- Connect live telemetry from turnstiles, queue sensors, transport APIs, and staff radios.
- Replace deterministic GenAI boundaries with Gemini structured-output calls.
- Add role-based views for fans, volunteers, and command-center staff.
- Add authenticated incident history and audit logs.
- Add verified stadium maps and multilingual venue content retrieval.
