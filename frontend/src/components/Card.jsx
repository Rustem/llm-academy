import { T } from "../constants/theme";

export default function Card({ children, style, ...props }) {
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10,
      padding: 22, boxShadow: T.shadow, ...style,
    }} {...props}>
      {children}
    </div>
  );
}
