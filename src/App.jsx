import { useState, useEffect, useCallback } from "react";

const COLORS = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "#30363d",
  borderLight: "#21262d",
  text: "#e6edf3",
  textMuted: "#8b949e",
  textDim: "#484f58",
  accent: "#388bfd",
  accentGlow: "#1f6feb",
  green: "#3fb950",
  yellow: "#d29922",
  red: "#f85149",
  orange: "#db6d28",
  purple: "#bc8cff",
};

const badge = (label, color, bg) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: 600,
  color,
  background: bg,
  border: `1px solid ${color}33`,
  whiteSpace: "nowrap",
});

const daysSince = (dateStr) => {
  if (!dateStr) return 9999;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Never";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric"
  });
};

const healthScore = (repo) => {
  let score = 100;
  const days = daysSince(repo.pushed_at);
  if (days > 365) score -= 40;
  else if (days > 180) score -= 25;
  else if (days > 90) score -= 10;
  if (!repo.description) score -= 10;
  if (repo.open_issues_count > 20) score -= 15;
  else if (repo.open_issues_count > 10) score -= 8;
  if (!repo.license) score -= 10;
  if (repo.archived) score -= 50;
  return Math.max(0, score);
};

const HealthBar = ({ score }) => {
  const color = score >= 70 ? COLORS.green : score >= 40 ? COLORS.yellow : COLORS.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: COLORS.borderLight, borderRadius: 2 }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 700, width: 28, textAlign: "right" }}>{score}</span>
    </div>
  );
};

const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  }}>
    <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: color || COLORS.text, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: COLORS.textDim }}>{sub}</div>}
  </div>
);

const Tab = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{
    background: "none",
    border: "none",
    borderBottom: `2px solid ${active ? COLORS.accent : "transparent"}`,
    color: active ? COLORS.text : COLORS.textMuted,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "color 0.15s",
  }}>
    {label}
    {count !== undefined && (
      <span style={{
        background: active ? COLORS.accentGlow : COLORS.borderLight,
        color: active ? "#fff" : COLORS.textMuted,
        borderRadius: 10,
        padding: "1px 6px",
        fontSize: 10,
        fontWeight: 700,
      }}>{count}</span>
    )}
  </button>
);

const RepoRow = ({ repo, onSelect, selected }) => {
  const days = daysSince(repo.pushed_at);
  const score = healthScore(repo);
  const stale = days > 180;
  const veryStale = days > 365;

  return (
    <div onClick={() => onSelect(repo)} style={{
      padding: "12px 20px",
      borderBottom: `1px solid ${COLORS.borderLight}`,
      cursor: "pointer",
      background: selected ? `${COLORS.accentGlow}11` : "transparent",
      borderLeft: selected ? `3px solid ${COLORS.accent}` : "3px solid transparent",
      transition: "background 0.15s",
      display: "grid",
      gridTemplateColumns: "1fr 90px 80px 80px 100px",
      alignItems: "center",
      gap: 12,
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>{repo.name}</span>
          {repo.archived && <span style={badge("Archived", COLORS.textDim, COLORS.borderLight)}>Archived</span>}
          {veryStale && !repo.archived && <span style={badge("Stale 1y+", COLORS.red, `${COLORS.red}15`)}>Stale 1y+</span>}
          {stale && !veryStale && <span style={badge("Stale 6m+", COLORS.orange, `${COLORS.orange}15`)}>Stale 6m+</span>}
          {repo.open_issues_count > 0 && <span style={badge(`${repo.open_issues_count} issues`, COLORS.yellow, `${COLORS.yellow}15`)}>{repo.open_issues_count} issues</span>}
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {repo.description || <span style={{ color: COLORS.textDim, fontStyle: "italic" }}>No description</span>}
        </div>
      </div>
      <div style={{ fontSize: 11, color: veryStale ? COLORS.red : stale ? COLORS.orange : COLORS.textMuted, textAlign: "right" }}>
        {days === 9999 ? "Never" : `${days}d ago`}
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, textAlign: "right" }}>
        ★ {repo.stargazers_count}
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, textAlign: "right" }}>
        🍴 {repo.forks_count}
      </div>
      <div>
        <HealthBar score={score} />
      </div>
    </div>
  );
};

const RepoDetail = ({ repo, onClose, token }) => {
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const score = healthScore(repo);

  useEffect(() => {
    if (repo && token) {
      fetch(`https://api.github.com/repos/${repo.full_name}/issues?state=open&per_page=5`, {
        headers: { Authorization: `token ${token}` }
      }).then(r => r.json()).then(data => {
        if (Array.isArray(data)) setIssues(data);
      }).catch(() => {});
    }
  }, [repo, token]);

  const generateAISummary = async () => {
    setAiLoading(true);
    setAiSummary("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a DevRel community manager reviewing a GitHub repository. Analyse this repo data and give a brief, practical community health summary in 3 short bullet points. Be direct and actionable.

Repo: ${repo.full_name}
Description: ${repo.description || "None"}
Last pushed: ${formatDate(repo.pushed_at)} (${daysSince(repo.pushed_at)} days ago)
Stars: ${repo.stargazers_count}
Forks: ${repo.forks_count}
Open issues: ${repo.open_issues_count}
License: ${repo.license?.name || "None"}
Topics: ${repo.topics?.join(", ") || "None"}
Archived: ${repo.archived}
Health score: ${score}/100

Open issues titles: ${issues.slice(0, 3).map(i => i.title).join("; ") || "None fetched"}

Format your response as exactly 3 bullet points starting with • covering: (1) overall health assessment, (2) what needs immediate attention, (3) one concrete action to improve this repo's community presence.`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "Could not generate summary.";
      setAiSummary(text);
    } catch (e) {
      setAiSummary("Error generating summary. Check your connection.");
    }
    setAiLoading(false);
  };

  const score_color = score >= 70 ? COLORS.green : score >= 40 ? COLORS.yellow : COLORS.red;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000a", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
    }}>
      <div style={{
        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: 12, width: "100%", maxWidth: 580, maxHeight: "85vh",
        overflow: "auto", padding: 28,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent }}>{repo.name}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{repo.full_name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>
          {repo.description || <span style={{ fontStyle: "italic", color: COLORS.textDim }}>No description — this should be fixed.</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            ["Health", `${score}/100`, score_color],
            ["Last Push", `${daysSince(repo.pushed_at)}d ago`, daysSince(repo.pushed_at) > 180 ? COLORS.red : COLORS.text],
            ["Stars", repo.stargazers_count, COLORS.text],
            ["Forks", repo.forks_count, COLORS.text],
            ["Open Issues", repo.open_issues_count, repo.open_issues_count > 10 ? COLORS.red : COLORS.text],
            ["License", repo.license?.name || "None", repo.license ? COLORS.green : COLORS.red],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: COLORS.bg, borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        {issues.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent Open Issues</div>
            {issues.slice(0, 4).map(issue => (
              <div key={issue.id} style={{ padding: "7px 0", borderBottom: `1px solid ${COLORS.borderLight}`, fontSize: 12, color: COLORS.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{issue.title}</span>
                <span style={{ color: COLORS.textDim, fontSize: 11, marginLeft: 8, whiteSpace: "nowrap" }}>{daysSince(issue.created_at)}d ago</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            AI Community Health Summary
          </div>
          {!aiSummary && !aiLoading && (
            <button onClick={generateAISummary} style={{
              background: COLORS.accentGlow, color: "#fff", border: "none",
              borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", width: "100%",
            }}>
              Generate AI Summary
            </button>
          )}
          {aiLoading && (
            <div style={{ color: COLORS.textMuted, fontSize: 13, padding: "10px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
              Analysing repository...
            </div>
          )}
          {aiSummary && (
            <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {aiSummary}
            </div>
          )}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <a href={repo.html_url} target="_blank" rel="noreferrer" style={{
            flex: 1, textAlign: "center", background: COLORS.bg,
            color: COLORS.text, border: `1px solid ${COLORS.border}`,
            borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}>Open on GitHub ↗</a>
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noreferrer" style={{
              flex: 1, textAlign: "center", background: COLORS.bg,
              color: COLORS.text, border: `1px solid ${COLORS.border}`,
              borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}>Homepage ↗</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState("");
  const [org, setOrg] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [orgInput, setOrgInput] = useState("f5devcentral");
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 100;

  const fetchRepos = useCallback(async (tok, accountName) => {
    setLoading(true);
    setError("");
    setRepos([]);
    setPage(1);
    let all = [];
    let p = 1;
    try {
      // First detect if this is a user or an org
      const accountRes = await fetch(
        `https://api.github.com/users/${accountName}`,
        { headers: { Authorization: `token ${tok}`, Accept: "application/vnd.github.v3+json" } }
      );
      if (!accountRes.ok) {
        const err = await accountRes.json();
        throw new Error(err.message || `Account not found: ${accountName}`);
      }
      const accountData = await accountRes.json();
      const isOrg = accountData.type === "Organization";
      const baseUrl = isOrg
        ? `https://api.github.com/orgs/${accountName}/repos?per_page=100&type=all&sort=pushed`
        : `https://api.github.com/users/${accountName}/repos?per_page=100&type=all&sort=pushed`;

      while (true) {
        const res = await fetch(
          `${baseUrl}&page=${p}`,
          { headers: { Authorization: `token ${tok}`, Accept: "application/vnd.github.v3+json" } }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;
        all = [...all, ...data];
        if (data.length < 100) break;
        p++;
        if (p > 6) break; // max 600 repos
      }
      setRepos(all);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  const handleConnect = () => {
    if (!tokenInput.trim() || !orgInput.trim()) return;
    setToken(tokenInput.trim());
    setOrg(orgInput.trim());
    fetchRepos(tokenInput.trim(), orgInput.trim());
  };

  const filtered = repos.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (tab === "stale") return daysSince(r.pushed_at) > 180 && !r.archived;
    if (tab === "issues") return r.open_issues_count > 0;
    if (tab === "archived") return r.archived;
    if (tab === "healthy") return healthScore(r) >= 70 && !r.archived;
    return true;
  });

  const stats = {
    total: repos.length,
    stale: repos.filter(r => daysSince(r.pushed_at) > 180 && !r.archived).length,
    withIssues: repos.filter(r => r.open_issues_count > 0).length,
    archived: repos.filter(r => r.archived).length,
    healthy: repos.filter(r => healthScore(r) >= 70 && !r.archived).length,
    avgHealth: repos.length ? Math.round(repos.reduce((a, r) => a + healthScore(r), 0) / repos.length) : 0,
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}>
      <style>{`* { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${COLORS.bg}; } ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }`}</style>

      {/* Header */}
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, boxShadow: `0 0 8px ${COLORS.accent}` }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, letterSpacing: "0.02em" }}>GitHub Org Health</span>
        </div>
        {org && <span style={{ fontSize: 12, color: COLORS.textMuted }}>/ {org}</span>}
        {repos.length > 0 && <span style={badge(`${repos.length} repos`, COLORS.accent, `${COLORS.accent}15`)}>{repos.length} repos</span>}
      </div>

      {/* Connect Panel */}
      {repos.length === 0 && !loading && (
        <div style={{ maxWidth: 520, margin: "80px auto", padding: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: COLORS.text }}>Connect your GitHub Account</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 28, lineHeight: 1.6 }}>
            Enter a GitHub Personal Access Token with <code style={{ background: COLORS.borderLight, padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>repo</code> scope, and a GitHub username or organisation name. Works with both personal accounts and orgs.
          </div>

          {error && (
            <div style={{ background: `${COLORS.red}15`, border: `1px solid ${COLORS.red}44`, borderRadius: 6, padding: "10px 14px", fontSize: 13, color: COLORS.red, marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: COLORS.textMuted, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>GitHub Username or Organisation</label>
              <input
                value={orgInput}
                onChange={e => setOrgInput(e.target.value)}
                placeholder="e.g. Tansikarus or f5devcentral"
                style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "9px 12px", color: COLORS.text, fontSize: 13, outline: "none" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: COLORS.textMuted, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Personal Access Token</label>
              <input
                type="password"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleConnect()}
                placeholder="ghp_xxxxxxxxxxxx"
                style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "9px 12px", color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "monospace" }}
              />
              <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>
                Token stays in your browser. Never sent anywhere except GitHub's API.
              </div>
            </div>
            <button onClick={handleConnect} style={{
              background: COLORS.accentGlow, color: "#fff", border: "none",
              borderRadius: 6, padding: "10px 20px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", marginTop: 4,
            }}>
              Analyse Organisation →
            </button>
          </div>

          <div style={{ marginTop: 28, padding: 16, background: COLORS.surface, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>What this dashboard shows</div>
            {["Stale repos inactive for 6+ months", "Open issues with no response", "Per-repo health scores", "AI-generated community action summary per repo"].map(f => (
              <div key={f} style={{ fontSize: 12, color: COLORS.textMuted, padding: "3px 0", display: "flex", gap: 8 }}>
                <span style={{ color: COLORS.green }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Fetching repositories from {orgInput}…</div>
        </div>
      )}

      {/* Dashboard */}
      {repos.length > 0 && !loading && (
        <div style={{ padding: "20px 24px" }}>
          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 20 }}>
            <StatCard label="Total Repos" value={stats.total} />
            <StatCard label="Stale 6m+" value={stats.stale} color={stats.stale > 0 ? COLORS.orange : COLORS.green} sub="inactive repos" />
            <StatCard label="With Issues" value={stats.withIssues} color={stats.withIssues > 0 ? COLORS.yellow : COLORS.green} sub="open issues" />
            <StatCard label="Archived" value={stats.archived} color={COLORS.textMuted} />
            <StatCard label="Healthy" value={stats.healthy} color={COLORS.green} sub="score ≥ 70" />
            <StatCard label="Avg Health" value={stats.avgHealth} color={stats.avgHealth >= 70 ? COLORS.green : stats.avgHealth >= 40 ? COLORS.yellow : COLORS.red} sub="out of 100" />
          </div>

          {/* Tabs + Search */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 0 }}>
            <div style={{ display: "flex" }}>
              <Tab label="All" active={tab === "all"} onClick={() => setTab("all")} count={repos.length} />
              <Tab label="Stale" active={tab === "stale"} onClick={() => setTab("stale")} count={stats.stale} />
              <Tab label="Has Issues" active={tab === "issues"} onClick={() => setTab("issues")} count={stats.withIssues} />
              <Tab label="Healthy" active={tab === "healthy"} onClick={() => setTab("healthy")} count={stats.healthy} />
              <Tab label="Archived" active={tab === "archived"} onClick={() => setTab("archived")} count={stats.archived} />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search repos…"
              style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "6px 12px", color: COLORS.text, fontSize: 12, outline: "none", width: 200 }}
            />
          </div>

          {/* Table Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 90px 80px 80px 100px",
            padding: "8px 20px", gap: 12,
            fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em",
            borderBottom: `1px solid ${COLORS.border}`,
          }}>
            <div>Repository</div>
            <div style={{ textAlign: "right" }}>Last Push</div>
            <div style={{ textAlign: "right" }}>Stars</div>
            <div style={{ textAlign: "right" }}>Forks</div>
            <div>Health</div>
          </div>

          {/* Repo List */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderTop: "none" }}>
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
                No repositories match this filter.
              </div>
            )}
            {filtered.slice(0, 50).map(repo => (
              <RepoRow key={repo.id} repo={repo} onSelect={setSelected} selected={selected?.id === repo.id} />
            ))}
            {filtered.length > 50 && (
              <div style={{ padding: "12px 20px", fontSize: 12, color: COLORS.textMuted, borderTop: `1px solid ${COLORS.borderLight}` }}>
                Showing 50 of {filtered.length} repos. Use search to filter further.
              </div>
            )}
          </div>

          {/* Change org link */}
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <button onClick={() => { setRepos([]); setToken(""); setOrg(""); setSelected(null); }} style={{
              background: "none", border: "none", color: COLORS.textMuted, fontSize: 12, cursor: "pointer", textDecoration: "underline"
            }}>
              Switch organisation
            </button>
          </div>
        </div>
      )}

      {/* Repo Detail Modal */}
      {selected && <RepoDetail repo={selected} onClose={() => setSelected(null)} token={token} />}
    </div>
  );
}
