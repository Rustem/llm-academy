import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { COURSES } from "../constants/courses";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../services/api";
import NavBar from "../components/NavBar";
import Btn from "../components/Btn";

export default function ClassroomDetailPage() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [customExercises, setCustomExercises] = useState([]);
  const [tab, setTab] = useState("progress");

  // Assign form
  const [exId, setExId] = useState("");
  const [exCourse, setExCourse] = useState("general");
  const [dueDate, setDueDate] = useState("");

  // Custom exercise form
  const [showBuilder, setShowBuilder] = useState(false);
  const [ceTitle, setCeTitle] = useState("");
  const [ceScenario, setCeScenario] = useState("");
  const [ceTask, setCeTask] = useState("");
  const [ceHint, setCeHint] = useState("");
  const [ceCriteria, setCeCriteria] = useState("");
  const [ceDifficulty, setCeDifficulty] = useState("Intermediate");
  const [ceXp, setCeXp] = useState(100);

  useEffect(() => {
    apiFetch(`/classrooms/${classroomId}`).then(setClassroom).catch(() => navigate("/classrooms"));
    apiFetch(`/classrooms/${classroomId}/assignments`).then(setAssignments).catch(() => {});
    apiFetch(`/classrooms/${classroomId}/progress`).then(setProgress).catch(() => {});
    apiFetch(`/classrooms/${classroomId}/exercises`).then(setCustomExercises).catch(() => {});
  }, [classroomId]);

  if (!classroom) return null;

  const isTeacher = user && classroom.teacher_id === user.id;
  const course = COURSES.find(c => c.id === classroom.course_id);
  const clr = course ? T[course.color] : T.coral;

  const assignExercise = async () => {
    if (!exId) return;
    try {
      const a = await apiFetch(`/classrooms/${classroomId}/assignments`, {
        method: "POST",
        body: JSON.stringify({ exercise_id: parseInt(exId), course_id: exCourse, due_date: dueDate || null }),
      });
      setAssignments(prev => [...prev, a]);
      setExId(""); setDueDate("");
    } catch {}
  };

  const createExercise = async () => {
    if (!ceTitle.trim() || !ceScenario.trim() || !ceTask.trim()) return;
    try {
      const ex = await apiFetch(`/classrooms/${classroomId}/exercises`, {
        method: "POST",
        body: JSON.stringify({
          title: ceTitle, scenario: ceScenario, task: ceTask,
          hint: ceHint || null, criteria: ceCriteria || null,
          difficulty: ceDifficulty, xp: ceXp,
        }),
      });
      setCustomExercises(prev => [...prev, ex]);
      setShowBuilder(false);
      setCeTitle(""); setCeScenario(""); setCeTask(""); setCeHint(""); setCeCriteria("");
    } catch {}
  };

  const inputStyle = {
    width: "100%", fontFamily: sn, fontSize: 13, color: T.text,
    background: T.bgIn, border: `1px solid ${T.border}`, borderRadius: 6,
    padding: "10px 12px", outline: "none", boxSizing: "border-box", marginBottom: 8,
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      background: tab === id ? T.acg2 : "none", border: `1px solid ${tab === id ? T.ac : T.border}`,
      borderRadius: 6, padding: "6px 14px", fontFamily: sn, fontSize: 12, fontWeight: 600,
      color: tab === id ? T.ac : T.tm, cursor: "pointer",
    }}>{label}</button>
  );

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div data-container style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        <NavBar back backTo="/classrooms" />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: clr.text, background: clr.bg, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>
            {course?.title}
          </span>
          <span style={{ fontSize: 10, color: T.td }}>
            {t("classroom.shareCode")}: <span style={{ fontWeight: 700, color: T.ac }}>{classroom.join_code}</span>
          </span>
        </div>
        <h2 style={{ fontFamily: ft, fontSize: 26, color: T.text, fontWeight: 400, margin: "0 0 20px" }}>
          {classroom.name}
        </h2>

        <div style={{ display: "flex", gap: 20, marginBottom: 24, fontSize: 12, color: T.tm }}>
          <span>{classroom.student_count} {t("classroom.students")}</span>
          <span>{assignments.length} {t("classroom.assignments")}</span>
          <span>{customExercises.length} {t("classroom.customExercises")}</span>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {tabBtn("progress", t("classroom.studentProgress"))}
          {isTeacher && tabBtn("assign", t("classroom.assignExercise"))}
          {isTeacher && tabBtn("builder", t("classroom.customBuilder"))}
        </div>

        {/* Student Progress Tab */}
        {tab === "progress" && progress && (
          <div>
            {progress.students.length === 0 ? (
              <p style={{ fontSize: 13, color: T.tm }}>{t("classroom.noClassrooms")}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {progress.students.map((s, i) => (
                  <div key={s.user_id} style={{
                    background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8,
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <span style={{ fontFamily: ft, fontSize: 18, color: T.td, minWidth: 24 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: T.text, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
                        onClick={() => navigate(`/profile/${s.username}`)}
                      >{s.username}</span>
                      <div style={{ fontSize: 11, color: T.tm }}>
                        {s.level} · {s.exercises_completed} exercises · {s.assignments_completed}/{s.assignments_total} {t("classroom.assignmentsDone")}
                      </div>
                    </div>
                    <span style={{ fontFamily: ft, fontSize: 16, color: T.ac }}>{s.total_xp} {t("common.xp")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assign Exercise Tab */}
        {tab === "assign" && isTeacher && (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, boxShadow: T.shadow }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={exId} onChange={e => setExId(e.target.value)} placeholder={t("classroom.exerciseId")} type="number" min="1" max="23" style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
              <select value={exCourse} onChange={e => setExCourse(e.target.value)} style={{ ...inputStyle, flex: 1, marginBottom: 0, cursor: "pointer" }}>
                {COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" placeholder={t("classroom.dueDate")} style={inputStyle} />
            <Btn onClick={assignExercise} disabled={!exId}>{t("classroom.assign")}</Btn>

            {assignments.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.td, textTransform: "uppercase", marginBottom: 8 }}>{t("classroom.assignments")}</p>
                {assignments.map(a => (
                  <div key={a.id} style={{ fontSize: 12, color: T.tm, padding: "4px 0", borderBottom: `1px solid ${T.border}` }}>
                    Exercise #{a.exercise_id} ({a.course_id}){a.due_date && ` · Due: ${a.due_date}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custom Exercise Builder Tab */}
        {tab === "builder" && isTeacher && (
          <div>
            {!showBuilder ? (
              <div>
                <Btn onClick={() => setShowBuilder(true)}>{t("classroom.createExercise")}</Btn>
                {customExercises.length > 0 && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {customExercises.map(ex => (
                      <div key={ex.id} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{ex.title}</span>
                          <span style={{ fontSize: 11, color: clr.text }}>+{ex.xp} {t("common.xp")}</span>
                        </div>
                        <span style={{ fontSize: 11, color: T.td }}>{ex.difficulty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, boxShadow: T.shadow }}>
                <input value={ceTitle} onChange={e => setCeTitle(e.target.value)} placeholder={t("classroom.exerciseTitle")} style={inputStyle} />
                <textarea value={ceScenario} onChange={e => setCeScenario(e.target.value)} placeholder={t("classroom.scenario")} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                <textarea value={ceTask} onChange={e => setCeTask(e.target.value)} placeholder={t("classroom.task")} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                <input value={ceHint} onChange={e => setCeHint(e.target.value)} placeholder={t("classroom.hint")} style={inputStyle} />
                <input value={ceCriteria} onChange={e => setCeCriteria(e.target.value)} placeholder={t("classroom.criteria")} style={inputStyle} />
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <select value={ceDifficulty} onChange={e => setCeDifficulty(e.target.value)} style={{ ...inputStyle, flex: 1, marginBottom: 0, cursor: "pointer" }}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <input value={ceXp} onChange={e => setCeXp(parseInt(e.target.value) || 0)} type="number" min="50" max="500" placeholder={t("classroom.xpValue")} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={createExercise} disabled={!ceTitle.trim() || !ceScenario.trim() || !ceTask.trim()}>
                    {t("classroom.createExercise")}
                  </Btn>
                  <Btn v="ghost" onClick={() => setShowBuilder(false)}>{t("eval.dashboard")}</Btn>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
