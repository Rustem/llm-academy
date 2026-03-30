import { T, sn } from "../constants/theme";

const baseStyle = {
  width: "100%", fontFamily: sn, fontSize: 13, color: T.text,
  background: T.bgIn, border: `1px solid ${T.border}`, borderRadius: 6,
  padding: "10px 12px", outline: "none", boxSizing: "border-box",
};

export default function FormInput({ as = "input", label, style, ...props }) {
  const Tag = as;
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <label style={{ fontSize: 12, color: T.tm, display: "block", marginBottom: 6 }}>{label}</label>}
      <Tag style={{ ...baseStyle, ...(as === "textarea" ? { resize: "vertical" } : {}), ...style }} {...props} />
    </div>
  );
}
