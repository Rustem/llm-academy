import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { T, ft, sn } from "../constants/theme";
import { EX } from "../constants/exercises";
import { MODS } from "../constants/modules";
import { MODELS } from "../constants/models";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { testPrompt, evaluatePrompt } from "../services/llm";
import materialsData from "../materials.json";
import NavBar from "../components/NavBar";
import Btn from "../components/Btn";
import AdPlaceholder from "../components/AdPlaceholder";
import EvalResult from "../components/EvalResult";

export default function ExercisePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { progress, complete } = useProgress();

  const sel = EX.find(e => e.id === parseInt(id));
  const [prompt, setPrompt] = useState("");
  const [resp, setResp] = useState("");
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaling, setEvaling] = useState(false);
  const [hint, setHint] = useState(false);
  const [showMat, setShowMat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState(MODELS[0].id);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!sel) return null;

  const done = progress.completed || {};
  const mod = MODS.find(m => m.id === sel.m);
  const c = T[mod.color];
  const me = EX.filter(e => e.m === sel.m);
  const idx = me.findIndex(e => e.id === sel.id);
  const nx = me[idx + 1] || EX.find(e => !done[e.id] && e.id > sel.id);

  const test = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setResp(""); setEv(null);
    try {
      const content = await testPrompt(
        "You are a helpful AI assistant. Respond naturally and concisely (under 300 words). Follow any format specified.",
        prompt, model
      );
      setResp(content);
    } catch {
      setResp("Error. Try again.");
    }
    setLoading(false);
  };

  const evaluate = async () => {
    if (!resp || !sel) return;
    setEvaling(true);
    try {
      const result = await evaluatePrompt(sel.id, prompt, resp, model);
      setEv(result);
      if (result.stars >= 3 && !done[sel.id]) {
        const xe = result.stars >= 4 ? sel.xp : Math.floor(sel.xp * 0.7);
        await complete(sel.id, result.stars, xe, prompt);
        await refreshUser();
      }
    } catch {
      setEv({ stars: 0, feedback: "Evaluation failed.", strengths: [], improvements: [], tip: "" });
    }
    setEvaling(false);
  };

  const copyMaterial = () => {
    const mat = materialsData[sel.id];
    if (mat) {
      navigator.clipboard.writeText(mat);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <NavBar back backTo="/dashboard" />

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4 }}>
              Module {mod.id}
            </span>
            <span style={{ fontSize: 11, color: T.td }}>{sel.d}</span>
            <span style={{ fontSize: 11, color: c.text, fontWeight: 600 }}>+{sel.xp} XP</span>
          </div>
          <h2 style={{ fontFamily: ft, fontSize: 28, color: T.text, fontWeight: 400, margin: 0 }}>
            {sel.id}. {sel.title}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Left column */}
          <div>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 22, marginBottom: 12, boxShadow: T.shadow }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.td, margin: "0 0 8px" }}>Scenario</p>
              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{sel.sc}</p>
            </div>
            <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 22, marginBottom: 12, boxShadow: T.shadow }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: c.text, margin: "0 0 8px" }}>Your task</p>
              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.75, margin: 0 }}>{sel.task}</p>
            </div>
            <AdPlaceholder slot="exercise-left" height={100} />
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => setHint(!hint)} style={{ background: "none", border: "none", fontFamily: sn, fontSize: 12, color: T.tm, cursor: "pointer", padding: "3px 0", textDecoration: "underline", textUnderlineOffset: 3 }}>
                {hint ? "Hide hint" : "Show hint"}
              </button>
              {materialsData[sel.id] && (
                <button onClick={() => setShowMat(!showMat)} style={{ background: "none", border: "none", fontFamily: sn, fontSize: 12, color: T.ac, cursor: "pointer", padding: "3px 0", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {showMat ? "Hide material" : "Show sample material"}
                </button>
              )}
            </div>
            {hint && (
              <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, marginTop: 6 }}>
                <p style={{ fontSize: 12, color: T.tm, lineHeight: 1.65, margin: 0 }}>{sel.hint}</p>
              </div>
            )}
            {showMat && materialsData[sel.id] && (
              <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, marginTop: 6, position: "relative" }}>
                <button onClick={copyMaterial} style={{
                  position: "absolute", top: 12, right: 12,
                  background: copied ? T.okBg : T.bgCard, border: `1px solid ${copied ? T.ok : T.border}`,
                  borderRadius: 6, padding: "6px 12px", fontFamily: sn, fontSize: 11, fontWeight: 600,
                  color: copied ? T.ok : T.tm, cursor: "pointer",
                }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.ac, margin: "0 0 8px" }}>
                  Sample Material
                </p>
                <pre style={{ fontSize: 12, color: T.text, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", fontFamily: sn, paddingRight: 80 }}>
                  {materialsData[sel.id]}
                </pre>
              </div>
            )}
          </div>

          {/* Right column */}
          <div>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 22, marginBottom: 12, boxShadow: T.shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.td, margin: 0 }}>Your prompt</p>
                <select value={model} onChange={e => setModel(e.target.value)} style={{
                  fontFamily: sn, fontSize: 11, color: T.text, background: T.bgEl,
                  border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", outline: "none", cursor: "pointer",
                }}>
                  {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <textarea
                value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="Write your prompt here..." rows={8}
                style={{
                  width: "100%", fontFamily: sn, fontSize: 13, lineHeight: 1.7, color: T.text,
                  border: `1px solid ${T.border}`, borderRadius: 6, padding: 12, resize: "vertical",
                  background: T.bgIn, outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = T.ac}
                onBlur={e => e.target.style.borderColor = T.border}
              />
              <div style={{ marginTop: 10 }}>
                <Btn onClick={test} disabled={!prompt.trim() || loading}>
                  {loading ? "Running..." : "Test my prompt"}
                </Btn>
              </div>
            </div>

            {(resp || loading) && (
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 22, marginBottom: 12, boxShadow: T.shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.td, margin: 0 }}>AI response</p>
                  <span style={{ fontSize: 10, color: T.td, fontFamily: sn }}>{MODELS.find(m => m.id === model)?.name}</span>
                </div>
                {loading ? (
                  <p style={{ fontSize: 13, color: T.tm, fontStyle: "italic" }}>Generating...</p>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: T.text, lineHeight: 1.75, whiteSpace: "pre-wrap", maxHeight: 280, overflowY: "auto" }}>{resp}</div>
                    <div style={{ marginTop: 12 }}>
                      <Btn onClick={evaluate} disabled={evaling} v="secondary">
                        {evaling ? "Evaluating..." : "Evaluate & score"}
                      </Btn>
                    </div>
                  </>
                )}
              </div>
            )}

            {ev && (
              <EvalResult
                ev={ev} done={done} sel={sel}
                onTryAgain={() => { setResp(""); setEv(null); setPrompt(""); }}
                onNext={() => nx ? navigate(`/exercise/${nx.id}`) : navigate("/dashboard")}
                nextExercise={nx}
              />
            )}
          </div>
        </div>
        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
