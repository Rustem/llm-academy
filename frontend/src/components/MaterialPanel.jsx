import { useState } from "react";
import { useTranslation } from "react-i18next";
import { T, sn } from "../constants/theme";
import SectionLabel from "./SectionLabel";

export default function MaterialPanel({ material, hint, showHint, showMat, onToggleHint, onToggleMat }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const copyMaterial = () => {
    if (material) {
      navigator.clipboard.writeText(material);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 16 }}>
        <button onClick={onToggleHint} style={{ background: "none", border: "none", fontFamily: sn, fontSize: 12, color: T.tm, cursor: "pointer", padding: "3px 0", textDecoration: "underline", textUnderlineOffset: 3 }}>
          {showHint ? t("exercise.hideHint") : t("exercise.showHint")}
        </button>
        {material && (
          <button onClick={onToggleMat} style={{ background: "none", border: "none", fontFamily: sn, fontSize: 12, color: T.ac, cursor: "pointer", padding: "3px 0", textDecoration: "underline", textUnderlineOffset: 3 }}>
            {showMat ? t("exercise.hideMaterial") : t("exercise.showMaterial")}
          </button>
        )}
      </div>
      {showHint && hint && (
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, marginTop: 6 }}>
          <p style={{ fontSize: 12, color: T.tm, lineHeight: 1.65, margin: 0 }}>{hint}</p>
        </div>
      )}
      {showMat && material && (
        <div style={{ background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, marginTop: 6, position: "relative" }}>
          <button onClick={copyMaterial} style={{
            position: "absolute", top: 12, right: 12,
            background: copied ? T.okBg : T.bgCard, border: `1px solid ${copied ? T.ok : T.border}`,
            borderRadius: 6, padding: "6px 12px", fontFamily: sn, fontSize: 11, fontWeight: 600,
            color: copied ? T.ok : T.tm, cursor: "pointer",
          }}>
            {copied ? t("exercise.copied") : t("exercise.copy")}
          </button>
          <SectionLabel color={T.ac}>{t("exercise.sampleMaterial")}</SectionLabel>
          <pre style={{ fontSize: 12, color: T.text, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", fontFamily: sn, paddingRight: 80 }}>
            {material}
          </pre>
        </div>
      )}
    </>
  );
}
