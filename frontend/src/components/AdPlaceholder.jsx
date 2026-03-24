import { T } from "../constants/theme";

export default function AdPlaceholder({ slot, height = 90 }) {
  return (
    <div
      className="ad-container"
      data-ad-slot={slot}
      style={{
        background: T.bgEl, border: `1px dashed ${T.border}`, borderRadius: 8,
        padding: 16, marginBottom: 24, minHeight: height,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 11, color: T.td, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Advertisement
      </span>
    </div>
  );
}
