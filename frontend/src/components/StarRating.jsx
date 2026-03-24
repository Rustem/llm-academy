import { T } from "../constants/theme";

export default function StarRating({ stars, max = 5, size = 20 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ fontSize: size, color: i < stars ? T.warn : T.td }}>★</span>
      ))}
    </div>
  );
}
