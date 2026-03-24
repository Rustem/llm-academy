import { T, sn } from "../constants/theme";

export default function ExerciseCard({ ex, done, color, unlocked, onClick }) {
  const dn = done?.[ex.id];
  const c = color;

  return (
    <div
      onClick={() => unlocked && onClick(ex)}
      style={{
        background: T.bgCard,
        border: `1.5px solid ${dn ? c.border : T.border}`,
        borderRadius: 10, padding: "16px 18px",
        cursor: unlocked ? "pointer" : "default",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        borderLeft: dn ? `3px solid ${c.ac}` : `1.5px solid ${T.border}`,
        boxShadow: dn ? T.shadow : "none",
      }}
      onMouseEnter={e => {
        if (unlocked) {
          e.currentTarget.style.borderColor = c.ac;
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = T.shadow;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = dn ? c.border : T.border;
        if (dn) e.currentTarget.style.borderLeftColor = c.ac;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = dn ? T.shadow : "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <span style={{ fontSize: 11, color: T.td }}>{ex.id}.</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text, marginLeft: 5 }}>{ex.title}</span>
        </div>
        {dn && (
          <span style={{ fontSize: 12, color: T.warn }}>
            {"★".repeat(dn.stars)}{"☆".repeat(5 - dn.stars)}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <span style={{ fontSize: 11, color: T.td }}>{ex.d}</span>
        <span style={{ fontSize: 11, color: T.td }}>·</span>
        <span style={{ fontSize: 11, color: c.text, fontWeight: 600 }}>+{ex.xp} XP</span>
      </div>
    </div>
  );
}
