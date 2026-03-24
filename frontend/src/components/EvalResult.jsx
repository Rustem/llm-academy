import { T, sn } from "../constants/theme";
import StarRating from "./StarRating";
import Btn from "./Btn";

export default function EvalResult({ ev, done, sel, onTryAgain, onNext, nextExercise }) {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 22, boxShadow: T.shadow }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
        <StarRating stars={ev.stars} />
        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, marginLeft: 8 }}>{ev.stars}/5</span>
      </div>
      <p style={{ fontSize: 13, color: T.text, lineHeight: 1.7, marginBottom: 14 }}>{ev.feedback}</p>

      {ev.strengths?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: T.ok, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Strengths
          </p>
          {ev.strengths.map((s, i) => (
            <p key={i} style={{ fontSize: 12, color: T.text, lineHeight: 1.6, margin: "0 0 3px", paddingLeft: 10, borderLeft: "2px solid rgba(52,211,153,0.3)" }}>
              {s}
            </p>
          ))}
        </div>
      )}

      {ev.improvements?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: T.warn, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            To improve
          </p>
          {ev.improvements.map((s, i) => (
            <p key={i} style={{ fontSize: 12, color: T.text, lineHeight: 1.6, margin: "0 0 3px", paddingLeft: 10, borderLeft: "2px solid rgba(251,191,36,0.3)" }}>
              {s}
            </p>
          ))}
        </div>
      )}

      {ev.tip && (
        <div style={{ background: T.acg, borderRadius: 6, padding: 12, marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: T.text, lineHeight: 1.6, margin: 0 }}>
            <span style={{ fontWeight: 700, color: T.ac }}>Pro tip: </span>{ev.tip}
          </p>
        </div>
      )}

      {ev.stars >= 3 && done?.[sel?.id] && (
        <div style={{ background: T.okBg, borderRadius: 6, padding: 10, marginBottom: 14, textAlign: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.ok }}>+{done[sel.id].xp_earned || done[sel.id].xp} XP earned</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn v="ghost" onClick={onTryAgain}>Try again</Btn>
        {nextExercise ? (
          <Btn onClick={onNext}>Next: {nextExercise.title} →</Btn>
        ) : (
          <Btn onClick={onNext}>Dashboard</Btn>
        )}
      </div>
    </div>
  );
}
