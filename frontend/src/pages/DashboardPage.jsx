import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { COURSES } from "../constants/courses";
import { MODS } from "../constants/modules";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { apiFetch } from "../services/api";
import NavBar from "../components/NavBar";
import Btn from "../components/Btn";
import ExerciseCard from "../components/ExerciseCard";
import AdPlaceholder from "../components/AdPlaceholder";

export default function DashboardPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress } = useProgress(courseId);
  const { t } = useTranslation();
  const [exercises, setExercises] = useState([]);

  const course = COURSES.find(c => c.id === courseId);

  useEffect(() => {
    apiFetch(`/courses/${courseId}/exercises`)
      .then(setExercises)
      .catch(() => setExercises([]));
  }, [courseId]);

  if (!course) return null;

  const done = progress.completed || {};
  const xp = progress.total_xp || 0;
  const dc = Object.keys(done).length;
  const lv = progress.level || "Newcomer";
  const clr = T[course.color];

  const gmc = (mid) => exercises.filter(e => e.m === mid && done[e.id]).length;
  const unlocked = (mod) => dc >= mod.ur;

  const nx = exercises.find(e => !done[e.id] && unlocked(MODS.find(m => m.id === e.m)));

  const openExercise = (ex) => navigate(`/course/${courseId}/exercise/${ex.id}`);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div data-container style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <NavBar back backTo="/courses" />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 22, color: clr.text }}>{course.icon}</span>
          <span style={{ fontFamily: ft, fontSize: 24, color: T.text }}>{course.title}</span>
        </div>

        <div data-layout="stats" style={{ display: "flex", gap: 28, marginBottom: 36, flexWrap: "wrap" }}>
          {[
            { l: t("dashboard.progress"), v: `${dc}`, s: `/ ${exercises.length}` },
            { l: t("dashboard.totalXp"), v: `${xp}`, c: T.ac },
            { l: t("common.level"), v: lv },
          ].map((s, i) => (
            <div key={i}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.td }}>{s.l}</span>
              <p style={{ fontFamily: ft, fontSize: 28, color: s.c || T.text, margin: "2px 0 0" }}>
                {s.v}{s.s && <span style={{ fontSize: 16, color: T.tm }}> {s.s}</span>}
              </p>
            </div>
          ))}
        </div>

        {nx && (
          <div style={{
            background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 36,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, boxShadow: T.shadow,
          }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.td, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("dashboard.upNext")}</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: T.text, margin: "3px 0 0" }}>{nx.title}</p>
              <p style={{ fontSize: 12, color: T.tm, margin: "1px 0 0" }}>Exercise {nx.id} · {nx.d}</p>
            </div>
            <Btn onClick={() => openExercise(nx)}>{t("dashboard.continue")}</Btn>
          </div>
        )}

        {MODS.map((mod, idx) => {
          const c = T[mod.color];
          const ul = unlocked(mod);
          const me = exercises.filter(e => e.m === mod.id);
          const md = gmc(mod.id);
          if (me.length === 0) return null;
          return (
            <div key={mod.id}>
              <div style={{ marginBottom: 28, opacity: ul ? 1 : 0.4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4 }}>
                    {t("dashboard.module")} {mod.id}
                  </span>
                  <span style={{ fontFamily: ft, fontSize: 20, color: T.text }}>{mod.title}</span>
                  {!ul && <span style={{ fontSize: 11, color: T.td }}>{t("dashboard.unlockHint", { count: mod.ur })}</span>}
                  <span style={{ fontSize: 11, color: T.tm, marginLeft: "auto" }}>{md}/{me.length}</span>
                </div>
                <div data-layout="exercise-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {me.map(ex => (
                    <ExerciseCard key={ex.id} ex={ex} done={done} color={c} unlocked={ul} onClick={openExercise} />
                  ))}
                </div>
              </div>
              {idx === 1 && <AdPlaceholder slot="dashboard-mid" />}
            </div>
          );
        })}
        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
