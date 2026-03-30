import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import Btn from "./Btn";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "es", label: "ES" },
];

export default function NavBar({ back, backTo }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const lv = user ? { n: user.level || t("common.newcomer") } : { n: t("common.newcomer") };
  const xp = user?.total_xp || 0;

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 0", borderBottom: `1px solid ${T.border}`, marginBottom: 28,
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        onClick={() => navigate(backTo || "/courses")}
      >
        {back && <span style={{ color: T.tm, fontSize: 13 }}>←</span>}
        <span style={{ fontFamily: ft, fontSize: 21, color: T.text, letterSpacing: "-0.01em" }}>
          {t("common.appName")}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <select
          value={i18n.language?.substring(0, 2)}
          onChange={e => i18n.changeLanguage(e.target.value)}
          style={{
            fontFamily: sn, fontSize: 11, fontWeight: 600, color: T.tm,
            background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 4,
            padding: "3px 6px", cursor: "pointer", outline: "none",
          }}
        >
          {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <span style={{
          fontFamily: sn, fontSize: 11, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "0.06em", color: T.ac, background: T.acg2, padding: "4px 10px", borderRadius: 4,
        }}>
          {lv.n}
        </span>
        <span style={{ fontFamily: sn, fontSize: 13, color: T.tm, fontWeight: 500 }}>{xp} {t("common.xp")}</span>
        {user && <Btn onClick={logout} v="ghost">{t("common.logout")}</Btn>}
      </div>
    </div>
  );
}
