import { useNavigate } from "react-router-dom";
import { T, ft, sn } from "../constants/theme";
import Btn from "../components/Btn";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: `1px solid ${T.border}`, marginBottom: 28 }}>
          <span style={{ fontFamily: ft, fontSize: 21, color: T.text }}>Privacy Policy</span>
          <Btn onClick={() => navigate(-1)} v="ghost">← Back</Btn>
        </div>
        <div style={{ maxWidth: 680 }}>
          <p style={{ fontSize: 14, color: T.tm, lineHeight: 1.75, marginBottom: 24 }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h3 style={{ fontFamily: ft, fontSize: 20, color: T.text, marginTop: 32, marginBottom: 12 }}>Data Collection</h3>
          <p style={{ fontSize: 14, color: T.tm, lineHeight: 1.75 }}>
            LLM Academy stores your progress in a secure database linked to your account. We collect only your email and exercise progress data.
          </p>

          <h3 style={{ fontFamily: ft, fontSize: 20, color: T.text, marginTop: 32, marginBottom: 12 }}>Third-Party Services</h3>
          <p style={{ fontSize: 14, color: T.tm, lineHeight: 1.75 }}>
            This site may display advertisements via Google AdSense. Google may use cookies to serve ads based on your prior visits.
            You can opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" style={{ color: T.ac }}>Ads Settings</a>.
          </p>

          <h3 style={{ fontFamily: ft, fontSize: 20, color: T.text, marginTop: 32, marginBottom: 12 }}>Cookies</h3>
          <p style={{ fontSize: 14, color: T.tm, lineHeight: 1.75 }}>
            We use a JWT token stored in localStorage to maintain your session. No tracking cookies are used.
          </p>

          <h3 style={{ fontFamily: ft, fontSize: 20, color: T.text, marginTop: 32, marginBottom: 12 }}>Contact</h3>
          <p style={{ fontSize: 14, color: T.tm, lineHeight: 1.75 }}>
            For questions about this privacy policy, please contact us via GitHub issues.
          </p>
        </div>
        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
