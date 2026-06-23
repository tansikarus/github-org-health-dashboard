# GitHub Org Health Dashboard

A browser-based dashboard for community managers and DevRel professionals to monitor the health of any GitHub organisation's repositories — built with React, Vite, and the GitHub REST API.

![Dashboard Preview](https://img.shields.io/badge/status-active-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Why This Exists

Large developer communities often manage hundreds of GitHub repositories — code samples, labs, integrations, SDKs, and automation tools. Over time, repos go stale, issues pile up unanswered, and documentation drifts. This dashboard gives community managers a single view to:

- **Spot stale repositories** inactive for 6+ months
- **Track open issues** with no response
- **Score repo health** across key signals
- **Generate AI action summaries** per repo using Claude

This tool was built as a portfolio piece demonstrating AI-native community tooling — connecting GitHub's API with Claude (Anthropic) to give community managers actionable intelligence, not just raw data.

---

## Features

| Feature | Description |
|---|---|
| 📊 **Health Scoring** | Every repo scored 0–100 based on activity, issues, license, description, and archived status |
| 🕰️ **Stale Detection** | Flags repos inactive for 6+ and 12+ months |
| 🐛 **Issue Tracking** | Surfaces repos with unresponded open issues |
| 🤖 **AI Summaries** | Claude generates 3-bullet community action plans per repo |
| 🔍 **Search & Filter** | Filter by All / Stale / Has Issues / Healthy / Archived |
| 🔐 **Private & Secure** | Token never leaves your browser — direct GitHub API calls only |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A GitHub Personal Access Token with `repo` and `read:org` scopes

### Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/github-org-health-dashboard.git
cd github-org-health-dashboard
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the project and pushes to the `gh-pages` branch automatically.

---

## How to Use

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) and generate a Personal Access Token with `repo` and `read:org` scopes
2. Enter the GitHub organisation name (e.g. `f5devcentral`, `nginx`, `cloudflare`)
3. Click **Analyse Organisation**
4. Click any repo to see detailed health metrics and generate an AI summary

---

## Health Score Calculation

Each repo is scored out of 100:

| Signal | Deduction |
|---|---|
| No commits in 12+ months | −40 |
| No commits in 6–12 months | −25 |
| No commits in 3–6 months | −10 |
| No description | −10 |
| No license | −10 |
| 10–20 open issues | −8 |
| 20+ open issues | −15 |
| Archived | −50 |

---

## Tech Stack

- **React 18** — UI
- **Vite 5** — Build tool
- **GitHub REST API** — Repository data
- **Anthropic Claude API** — AI-generated repo summaries
- **GitHub Pages** — Hosting

---

## Background

Built by [Tanmay Kapoor](https://www.linkedin.com/in/tanmaykapoor/) — community and developer relations professional with 18 years of experience across Microsoft, Freshworks, Cloudflare, and others. This dashboard is part of a broader exploration into MCP-enabled community tooling, connecting Discourse forums, GitHub repos, and AI models to give community teams real-time, actionable intelligence.

Related project: [Chlorophyll Club](https://chloroclub.discourse.group) — a Discourse community with a live MCP server and Telegram bot integration, built entirely on mobile.

---

## License

MIT — use freely, attribution appreciated.
