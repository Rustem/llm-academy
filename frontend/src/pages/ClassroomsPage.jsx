import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { COURSES } from "../constants/courses";
import { apiFetch } from "../services/api";
import NavBar from "../components/NavBar";
import Btn from "../components/Btn";

export default function ClassroomsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [classrooms, setClassrooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [courseId, setCourseId] = useState("general");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/classrooms").then(setClassrooms).catch(() => {});
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const c = await apiFetch("/classrooms", { method: "POST", body: JSON.stringify({ name, description: desc || null, course_id: courseId }) });
      setClassrooms(prev => [...prev, c]);
      setShowCreate(false);
      setName(""); setDesc("");
    } catch {}
    setLoading(false);
  };

  const join = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const c = await apiFetch("/classrooms/join", { method: "POST", body: JSON.stringify({ join_code: joinCode }) });
      setClassrooms(prev => {
        if (prev.find(x => x.id === c.id)) return prev;
        return [...prev, c];
      });
      setShowJoin(false);
      setJoinCode("");
    } catch {}
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", fontFamily: sn, fontSize: 13, color: T.text,
    background: T.bgIn, border: `1px solid ${T.border}`, borderRadius: 6,
    padding: "10px 12px", outline: "none", boxSizing: "border-box", marginBottom: 10,
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div data-container style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>
        <NavBar />

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ac, marginBottom: 8 }}>
          {t("classroom.tagline")}
        </p>
        <h2 style={{ fontFamily: ft, fontSize: 28, color: T.text, fontWeight: 400, margin: "0 0 20px" }}>
          {t("classroom.title")}
        </h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <Btn onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}>{t("classroom.create")}</Btn>
          <Btn v="ghost" onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}>{t("classroom.join")}</Btn>
        </div>

        {showCreate && (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: T.shadow }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t("classroom.name")} style={inputStyle} />
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder={t("classroom.description")} style={inputStyle} />
            <select value={courseId} onChange={e => setCourseId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <Btn onClick={create} disabled={loading || !name.trim()}>
              {loading ? t("classroom.creating") : t("classroom.create")}
            </Btn>
          </div>
        )}

        {showJoin && (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: T.shadow }}>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder={t("classroom.joinCode")} style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, fontSize: 18, textAlign: "center" }} maxLength={6} />
            <Btn onClick={join} disabled={loading || joinCode.length < 6}>
              {loading ? t("classroom.joining") : t("classroom.joinBtn")}
            </Btn>
          </div>
        )}

        {classrooms.length === 0 ? (
          <p style={{ fontSize: 13, color: T.tm, textAlign: "center", marginTop: 32 }}>{t("classroom.noClassrooms")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {classrooms.map(c => {
              const course = COURSES.find(x => x.id === c.course_id);
              const clr = course ? T[course.color] : T.coral;
              return (
                <div key={c.id} onClick={() => navigate(`/classroom/${c.id}`)} style={{
                  background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "18px 20px", cursor: "pointer", boxShadow: T.shadow,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = clr.text; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontFamily: ft, fontSize: 18, color: T.text }}>{c.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: clr.text, background: clr.bg, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                      {course?.title || c.course_id}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: T.tm }}>
                    <span>{c.student_count} {t("classroom.students")}</span>
                    <span>{c.assignment_count} {t("classroom.assignments")}</span>
                    <span>{c.custom_exercise_count} {t("classroom.customExercises")}</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.td, marginTop: 6 }}>
                    {t("classroom.shareCode")}: <span style={{ fontWeight: 700, color: T.ac, letterSpacing: "0.1em" }}>{c.join_code}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
