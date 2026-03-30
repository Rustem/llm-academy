import { useState, useEffect } from "react";
import { T, ft, sn } from "../constants/theme";
import { apiFetch } from "../services/api";
import NavBar from "../components/NavBar";

export default function AdminPage() {
  const [usage, setUsage] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/admin/openrouter/usage").catch(e => ({ _error: e.message })),
      apiFetch("/admin/stats").catch(e => ({ _error: e.message })),
    ]).then(([u, s]) => {
      if (u._error) setError(u._error); else setUsage(u);
      if (s._error && !error) setError(s._error); else setStats(s);
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (v) => v != null ? `$${v.toFixed(4)}` : "—";
  const pct = (used, limit) => limit ? `${((used / limit) * 100).toFixed(1)}%` : "—";

  const card = (title, children) => (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 14, boxShadow: T.shadow }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.td, margin: "0 0 12px" }}>{title}</p>
      {children}
    </div>
  );

  const stat = (label, value, color) => (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: ft, fontSize: 24, color: color || T.text, margin: "0 0 2px" }}>{value}</p>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.td }}>{label}</span>
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div data-container style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        <NavBar />

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ff453a", marginBottom: 8 }}>
          Admin
        </p>
        <h2 style={{ fontFamily: ft, fontSize: 28, color: T.text, fontWeight: 400, margin: "0 0 24px" }}>
          Dashboard
        </h2>

        {error && (
          <div style={{ background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.25)", borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#ff8a80", margin: 0 }}>{error}</p>
          </div>
        )}

        {loading ? (
          <p style={{ color: T.tm }}>Loading...</p>
        ) : (
          <>
            {/* OpenRouter API Usage */}
            {usage && card("OpenRouter API Usage", (
              <>
                <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                  {stat("Total Usage", fmt(usage.key.usage), T.ac)}
                  {stat("Daily", fmt(usage.key.usage_daily))}
                  {stat("Weekly", fmt(usage.key.usage_weekly))}
                  {stat("Monthly", fmt(usage.key.usage_monthly), T.warn)}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4,
                    background: usage.key.is_free_tier ? "rgba(255,214,10,0.12)" : "rgba(48,209,88,0.12)",
                    color: usage.key.is_free_tier ? T.warn : T.ok,
                  }}>
                    {usage.key.is_free_tier ? "Free Tier" : "Paid"}
                  </span>
                  {usage.key.limit && (
                    <span style={{ fontSize: 11, color: T.tm }}>
                      Limit: {fmt(usage.key.limit)} · Remaining: {fmt(usage.key.limit_remaining)} ({pct(usage.key.usage, usage.key.limit)} used)
                    </span>
                  )}
                  {usage.key.limit_reset && (
                    <span style={{ fontSize: 11, color: T.td }}>
                      Resets: {new Date(usage.key.limit_reset).toLocaleString()}
                    </span>
                  )}
                </div>

                {usage.key.label && (
                  <p style={{ fontSize: 11, color: T.td, margin: 0 }}>Key: {usage.key.label}</p>
                )}
              </>
            ))}

            {/* Generation Stats */}
            {usage?.generation_stats?.length > 0 && card("Recent Generations by Model", (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Model", "Requests", "Tokens", "Cost"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 10px", borderBottom: `1px solid ${T.border}`, color: T.td, fontWeight: 600, fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usage.generation_stats.map((g, i) => (
                      <tr key={i}>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}`, color: T.text, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {(g.model || g.id || "").split("/").pop()}
                        </td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}`, color: T.tm }}>{g.num_requests ?? g.count ?? "—"}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}`, color: T.tm }}>{g.tokens_prompt != null ? `${g.tokens_prompt}+${g.tokens_completion}` : "—"}</td>
                        <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}`, color: T.ac }}>{g.total_cost != null ? `$${g.total_cost.toFixed(4)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Available Models */}
            {usage?.models?.length > 0 && card("Available Models", (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Model", "Context", "Max Output", "Prompt $/1M", "Completion $/1M", "Tier"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.td, fontWeight: 600, fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usage.models.map((m, i) => (
                      <tr key={i}>
                        <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.text, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.name}
                        </td>
                        <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.tm }}>
                          {m.context_length ? `${(m.context_length / 1000).toFixed(0)}k` : "—"}
                        </td>
                        <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.tm }}>
                          {m.max_output ? `${(m.max_output / 1000).toFixed(0)}k` : "—"}
                        </td>
                        <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.tm }}>
                          {m.is_free ? "Free" : `$${(parseFloat(m.price_prompt) * 1000000).toFixed(2)}`}
                        </td>
                        <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}`, color: T.tm }}>
                          {m.is_free ? "Free" : `$${(parseFloat(m.price_completion) * 1000000).toFixed(2)}`}
                        </td>
                        <td style={{ padding: "6px 8px", borderBottom: `1px solid ${T.border}` }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3,
                            background: m.is_free ? "rgba(255,214,10,0.12)" : "rgba(10,132,255,0.12)",
                            color: m.is_free ? T.warn : T.ac,
                          }}>
                            {m.is_free ? "FREE" : "PAID"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Platform Stats */}
            {stats && card("Platform Stats", (
              <>
                <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                  {stat("Users", stats.users, T.ac)}
                  {stat("Completions", stats.completions)}
                  {stat("Total XP", stats.total_xp.toLocaleString(), T.warn)}
                </div>
                {stats.courses.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {stats.courses.map(c => (
                      <div key={c.course_id} style={{
                        display: "flex", justifyContent: "space-between", padding: "6px 0",
                        borderBottom: `1px solid ${T.border}`, fontSize: 12,
                      }}>
                        <span style={{ color: T.text }}>{c.course_id}</span>
                        <span style={{ color: T.tm }}>{c.completions} completions · {c.xp} XP</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ))}
          </>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
