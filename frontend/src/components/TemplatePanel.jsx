import { useTranslation } from "react-i18next";
import { T, sn } from "../constants/theme";

export default function TemplatePanel({ templates, show, onToggle, onSelect, moduleId }) {
  const { t } = useTranslation();

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={onToggle} style={{
          background: show ? T.acg2 : "none", border: `1px solid ${show ? T.ac : T.border}`,
          borderRadius: 6, padding: "5px 10px", fontFamily: sn, fontSize: 11, fontWeight: 600,
          color: show ? T.ac : T.tm, cursor: "pointer", transition: "all 0.15s",
        }}>
          {show ? t("exercise.hideTemplates") : t("exercise.useTemplate")}
        </button>
      </div>
      {show && (
        <div style={{
          background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12,
          marginBottom: 10, maxHeight: 200, overflowY: "auto",
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.td, margin: "0 0 8px" }}>
            {t("exercise.templateHint")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {templates.filter(tp => !moduleId || tp.modules.includes(moduleId)).map(tp => (
              <button
                key={tp.id}
                onClick={() => onSelect(tp.content)}
                style={{
                  background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 6,
                  padding: "8px 12px", cursor: "pointer", textAlign: "left",
                  fontFamily: sn, transition: "all 0.15s", color: T.text,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.ac; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
              >
                <span style={{ fontSize: 12, fontWeight: 600 }}>{tp.name}</span>
                <span style={{ fontSize: 10, color: T.td, marginLeft: 8, textTransform: "uppercase" }}>{tp.technique}</span>
                <p style={{ fontSize: 11, color: T.tm, margin: "2px 0 0", lineHeight: 1.4 }}>{tp.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
