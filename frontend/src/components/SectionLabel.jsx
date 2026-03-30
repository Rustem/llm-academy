import { T } from "../constants/theme";

export default function SectionLabel({ children, color, style }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: color || T.td, margin: "0 0 8px", ...style,
    }}>
      {children}
    </p>
  );
}
