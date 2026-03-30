import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { COURSES } from "../constants/courses";
import { MODS } from "../constants/modules";
import { MODELS, MODEL_GROUPS } from "../constants/models";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { testPrompt, evaluatePrompt } from "../services/llm";
import { fetchExercises, fetchExercise, fetchTemplates } from "../services/courses";
import NavBar from "../components/NavBar";
import Btn from "../components/Btn";
import Card from "../components/Card";
import SectionLabel from "../components/SectionLabel";
import ErrorAlert from "../components/ErrorAlert";
import AdPlaceholder from "../components/AdPlaceholder";
import EvalResult from "../components/EvalResult";
import ResponseSection from "../components/ResponseSection";
import TemplatePanel from "../components/TemplatePanel";
import MaterialPanel from "../components/MaterialPanel";

export default function ExercisePage() {
  const { courseId, id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { t } = useTranslation();
  const { progress, complete } = useProgress(courseId);

  const [exercises, setExercises] = useState([]);
  const [sel, setSel] = useState(null);
  const [material, setMaterial] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [resp, setResp] = useState("");
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaling, setEvaling] = useState(false);
  const [hint, setHint] = useState(false);
  const [showMat, setShowMat] = useState(false);
  const [model, setModel] = useState(MODELS[0].id);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);

  const course = COURSES.find(c => c.id === courseId);

  useEffect(() => { fetchExercises(courseId).then(setExercises).catch(() => {}); }, [courseId]);
  useEffect(() => { fetchExercise(courseId, id).then(d => { setSel(d); setMaterial(d.material || null); }).catch(() => {}); }, [courseId, id]);
  useEffect(() => { fetchTemplates(courseId).then(setTemplates).catch(() => {}); }, [courseId]);
  useEffect(() => {
    window.scrollTo(0, 0);
    setPrompt(""); setResp(""); setEv(null); setError(null);
    setHint(false); setShowMat(false); setShowTemplates(false);
  }, [id]);

  if (!sel || !course) return null;

  const done = progress.completed || {};
  const mod = MODS.find(m => m.id === sel.m);
  const c = T[mod.color];
  const me = exercises.filter(e => e.m === sel.m);
  const idx = me.findIndex(e => e.id === sel.id);
  const nx = me[idx + 1] || exercises.find(e => !done[e.id] && e.id > sel.id);

  const test = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setResp(""); setEv(null); setError(null);
    try {
      setResp(await testPrompt("You are a helpful AI assistant. Respond naturally and concisely (under 300 words). Follow any format specified.", prompt, model));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const evaluate = async () => {
    if (!resp || !sel) return;
    setEvaling(true); setError(null);
    try {
      const result = await evaluatePrompt(sel.id, prompt, resp, model, courseId);
      setEv(result);
      if (result.stars >= 3 && !done[sel.id]) {
        await complete(sel.id, result.stars, result.stars >= 4 ? sel.xp : Math.floor(sel.xp * 0.7), prompt);
        await refreshUser();
      }
    } catch (e) { setError(e.message); }
    setEvaling(false);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div data-container style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <NavBar back backTo={`/course/${courseId}`} />

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4 }}>
              {t("dashboard.module")} {mod.id}
            </span>
            <span style={{ fontSize: 11, color: T.td }}>{sel.d}</span>
            <span style={{ fontSize: 11, color: c.text, fontWeight: 600 }}>+{sel.xp} XP</span>
          </div>
          <h2 style={{ fontFamily: ft, fontSize: 28, color: T.text, fontWeight: 400, margin: 0 }}>
            {sel.id}. {sel.title}
          </h2>
        </div>

        <div data-layout="exercise-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Left column */}
          <div>
            <Card style={{ marginBottom: 12 }}>
              <SectionLabel>{t("exercise.scenario")}</SectionLabel>
              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{sel.sc}</p>
            </Card>
            <Card style={{ marginBottom: 12, background: c.bg, borderColor: c.border }}>
              <SectionLabel color={c.text}>{t("exercise.yourTask")}</SectionLabel>
              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.75, margin: 0 }}>{sel.task}</p>
            </Card>
            <AdPlaceholder slot="exercise-left" height={100} />
            <MaterialPanel material={material} hint={sel.hint} showHint={hint} showMat={showMat} onToggleHint={() => setHint(!hint)} onToggleMat={() => setShowMat(!showMat)} />
          </div>

          {/* Right column */}
          <div>
            <Card style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <SectionLabel style={{ margin: 0 }}>{t("exercise.yourPrompt")}</SectionLabel>
                <select value={model} onChange={e => setModel(e.target.value)} style={{
                  fontFamily: sn, fontSize: 11, color: T.text, background: T.bgEl,
                  border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", outline: "none", cursor: "pointer",
                }}>
                  {MODEL_GROUPS.map(g => (
                    <optgroup key={g.label} label={g.label}>
                      {g.models.map(m => <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <TemplatePanel templates={templates} show={showTemplates} onToggle={() => setShowTemplates(!showTemplates)} onSelect={t => { setPrompt(t); setShowTemplates(false); }} moduleId={sel.m} />
              <textarea
                value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder={t("exercise.placeholder")} rows={8}
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
                  {loading ? t("exercise.running") : t("exercise.testMyPrompt")}
                </Btn>
              </div>
            </Card>

            <ResponseSection resp={resp} loading={loading} model={model} onEvaluate={evaluate} evaling={evaling} />

            {error && (
              <Card style={{ background: T.errBg, borderColor: T.errBorder, marginBottom: 12 }}>
                <SectionLabel color={T.err}>{t("common.error")}</SectionLabel>
                <p style={{ fontSize: 13, color: T.errText, lineHeight: 1.6, margin: 0 }}>{error}</p>
              </Card>
            )}

            {ev && (
              <EvalResult
                ev={ev} done={done} sel={sel}
                prompt={prompt} courseTitle={course?.title}
                onTryAgain={() => { setResp(""); setEv(null); setPrompt(""); }}
                onNext={() => nx ? navigate(`/course/${courseId}/exercise/${nx.id}`) : navigate(`/course/${courseId}`)}
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
