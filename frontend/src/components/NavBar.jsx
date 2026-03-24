import { useNavigate } from "react-router-dom";
import { T, ft, sn } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import Btn from "./Btn";

export default function NavBar({ back, backTo }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const lv = user ? { n: user.level || "Newcomer" } : { n: "Newcomer" };
  const xp = user?.total_xp || 0;

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 0", borderBottom: `1px solid ${T.border}`, marginBottom: 28,
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        onClick={() => navigate(backTo || "/dashboard")}
      >
        {back && <span style={{ color: T.tm, fontSize: 13 }}>←</span>}
        <span style={{ fontFamily: ft, fontSize: 21, color: T.text, letterSpacing: "-0.01em" }}>
          LLM Academy
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontFamily: sn, fontSize: 11, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "0.06em", color: T.ac, background: T.acg2, padding: "4px 10px", borderRadius: 4,
        }}>
          {lv.n}
        </span>
        <span style={{ fontFamily: sn, fontSize: 13, color: T.tm, fontWeight: 500 }}>{xp} XP</span>
        {user && <Btn onClick={logout} v="ghost">Logout</Btn>}
      </div>
    </div>
  );
}
