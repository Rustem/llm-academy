import { useState } from "react";
import { T, sn } from "../constants/theme";

export default function Btn({ children, onClick, disabled: dis, v = "primary", style: s = {} }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const b = {
    fontFamily: sn, fontSize: 13, fontWeight: 600, border: "none", borderRadius: 8,
    cursor: dis ? "not-allowed" : "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", outline: "none", ...s,
  };

  const vs = {
    primary: {
      ...b, background: dis ? T.td : active ? T.acd : hover ? "#0077ed" : T.ac,
      color: "#fff", padding: "10px 20px",
      boxShadow: dis ? "none" : T.shadow, transform: active ? "scale(0.98)" : "scale(1)",
    },
    secondary: {
      ...b, background: hover ? (active ? "rgba(10,132,255,0.15)" : T.acg) : "transparent",
      color: T.ac, padding: "10px 20px", border: `1.5px solid ${T.ac}`, opacity: dis ? 0.4 : 1,
    },
    ghost: {
      ...b, background: hover ? (active ? "rgba(139,152,176,0.15)" : "rgba(139,152,176,0.08)") : "transparent",
      color: T.tm, padding: "8px 14px",
    },
  };

  return (
    <button
      style={vs[v]}
      onClick={onClick}
      disabled={dis}
      onMouseEnter={() => !dis && setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => !dis && setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {children}
    </button>
  );
}
