# StadiumOps AI

StadiumOps AI is a GenAI-enabled smart stadium operations demo for the Google Virtual PromptWars FIFA World Cup 2026 challenge:

> Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff.

The app models a match-day command center that turns venue signals, volunteer reports, fan questions, and transport status into real-time operational recommendations.

## What It Does

- Shows a live stadium operations dashboard with crowd pressure, wait times, and high-risk zones.
- Generates an AI command brief with the current risk summary and next best action.
- Provides a multilingual fan assistant for navigation, transport, medical help, and accessible routes.
- Gives volunteers a natural-language incident reporting flow.
- Classifies reports by urgency and category, then recommends routing actions for staff.
- Simulates match-minute crowd movement without needing external services.

## GenAI Role

The MVP uses a deterministic local AI engine so it can be reviewed and tested without API keys. The same boundaries map cleanly to Gemini or Vertex AI:

- `classifyIncident`: structure untrusted natural-language reports into category, urgency, summary, and action.
- `buildOperationsBrief`: summarize live venue state for operations leads.
- `answerFanQuestion`: generate fan-facing multilingual guidance from venue context.
- `recommendInterventions`: propose concrete interventions from crowd and incident signals.

In a production version, these functions would call Gemini with strict JSON schemas, input moderation, rate limits, and retrieval from verified venue data.

## Judging Alignment

| Criterion | How the project targets it |
| --- | --- |
| Code quality | Modular ES modules, small pure functions, no framework lock-in, clear test boundary. |
| Security | No secrets in the client, HTML escaping for rendered user reports, no external dependencies, static file path guard. |
| Efficiency | Lightweight local simulation, cached in-memory venue data, no repeated network calls. |
| Testing | Node test suite covers classification, route guidance, risk scoring, summaries, and interventions. |
| Accessibility | Semantic HTML, labels, keyboard-focus states, contrast-conscious palette, step-free routing support. |
| Problem alignment | Directly supports operations, crowd management, accessibility, transport, multilingual help, and real-time decision support. |

## Run Locally

```bash
npm start
```

Open `http://localhost:5173`.

## Test

```bash
npm test
```

## Suggested Demo Flow

1. Show the command brief and explain the high-pressure Gate B signal.
2. Click `Run` to simulate the next match minute.
3. Ask the fan assistant for an accessible route from Metro Plaza to North Stand.
4. Submit a volunteer report such as `Medical emergency near Gate A`.
5. Show how the incident feed and recommended interventions update immediately.
