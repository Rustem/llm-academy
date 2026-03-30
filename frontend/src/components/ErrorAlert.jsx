import { T } from "../constants/theme";

export default function ErrorAlert({ message, style }) {
  if (!message) return null;
  return (
    <div style={{
      background: T.errBg, border: `1px solid ${T.errBorder}`,
      borderRadius: 8, padding: 12, marginBottom: 16, ...style,
    }}>
      <p style={{ fontSize: 13, color: T.err, margin: 0 }}>{message}</p>
    </div>
  );
}
