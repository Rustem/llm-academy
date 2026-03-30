import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { MODS } from "../constants/modules";
import { useAuth } from "../hooks/useAuth";
import Btn from "../components/Btn";
import AdPlaceholder from "../components/AdPlaceholder";

export default function LandingPage() {
  const [fi, setFi] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => { requestAnimationFrame(() => setFi(true)); }, []);

  const mc = (mod) => T[mod.color];
  const go = () => navigate(user ? "/courses" : "/register");

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn, opacity: fi ? 1 : 0, transition: "opacity 0.5s" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}>
          <span style={{ fontFamily: ft, fontSize: 23, color: T.text }}>{t("common.appName")}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {!user && <Btn onClick={() => navigate("/login")} v="ghost">{t("common.login")}</Btn>}
            <Btn onClick={go}>{user ? t("landing.continue") : t("landing.getStarted")}</Btn>
          </div>
        </div>
        <div style={{ padding: "72px 0 56px", maxWidth: 580 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ac, marginBottom: 14 }}>
            {t("landing.tagline")}
          </p>
          <h1 style={{ fontFamily: ft, fontSize: "clamp(36px,5.5vw,52px)", fontWeight: 400, lineHeight: 1.12, color: T.text, margin: "0 0 18px", letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>
            {t("landing.headline")}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: T.tm, margin: "0 0 32px" }}>
            {t("landing.description")}
          </p>
          <Btn onClick={go} style={{ padding: "13px 30px", fontSize: 14 }}>{t("landing.cta")}</Btn>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, padding: "44px 0" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.td, marginBottom: 28 }}>
            {t("landing.theMethod")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 24 }}>
            {[
              { n: "01", t: t("landing.step1Title"), d: t("landing.step1Desc") },
              { n: "02", t: t("landing.step2Title"), d: t("landing.step2Desc") },
              { n: "03", t: t("landing.step3Title"), d: t("landing.step3Desc") },
              { n: "04", t: t("landing.step4Title"), d: t("landing.step4Desc") },
            ].map((s, i) => (
              <div key={i}>
                <span style={{ fontFamily: ft, fontSize: 28, color: T.ac }}>{s.n}</span>
                <h3 style={{ fontFamily: sn, fontSize: 14, fontWeight: 600, color: T.text, margin: "6px 0 4px" }}>{s.t}</h3>
                <p style={{ fontSize: 12, color: T.tm, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, padding: "44px 0 72px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.td, marginBottom: 20 }}>
            {t("landing.coursesModules")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {MODS.map(mod => {
              const c = mc(mod);
              return (
                <div key={mod.id} style={{ background: c.bg, borderRadius: 8, padding: 20, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: c.text }}>
                    {t("dashboard.module")} {mod.id}
                  </span>
                  <h3 style={{ fontFamily: ft, fontSize: 20, color: T.text, margin: "4px 0 2px", fontWeight: 400 }}>{mod.title}</h3>
                  <p style={{ fontSize: 12, color: T.tm, margin: 0 }}>{mod.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        <AdPlaceholder slot="landing-bottom" height={120} />

        <div style={{ borderTop: `1px solid ${T.border}`, padding: "24px 0", textAlign: "center" }}>
          <button
            onClick={() => navigate("/privacy")}
            style={{ background: "none", border: "none", color: T.tm, fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: sn }}
          >
            {t("landing.privacyPolicy")}
          </button>
        </div>
      </div>
    </div>
  );
}
