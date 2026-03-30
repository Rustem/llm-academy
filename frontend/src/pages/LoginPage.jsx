import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, ft, sn } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import Btn from "../components/Btn";
import ErrorAlert from "../components/ErrorAlert";
import FormInput from "../components/FormInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.profession ? "/courses" : "/onboarding");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: sn }}>
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ fontFamily: ft, fontSize: 32, color: T.text, fontWeight: 400, margin: "0 0 6px", textAlign: "center" }}>
          {t("auth.welcomeBack")}
        </h2>
        <p style={{ fontSize: 14, color: T.tm, margin: "0 0 30px", textAlign: "center" }}>
          {t("auth.loginSubtitle")}
        </p>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit}>
          <FormInput type="email" value={email} onChange={e => setEmail(e.target.value)} required label={t("auth.email")} />
          <FormInput type="password" value={password} onChange={e => setPassword(e.target.value)} required label={t("auth.password")} />
          <Btn disabled={loading} style={{ width: "100%", padding: "12px 20px" }}>
            {loading ? t("auth.loggingIn") : t("common.login")}
          </Btn>
        </form>

        <p style={{ fontSize: 13, color: T.tm, textAlign: "center", marginTop: 24 }}>
          {t("auth.noAccount")}{" "}
          <Link to="/register" style={{ color: T.ac, textDecoration: "none" }}>{t("common.register")}</Link>
        </p>
      </div>
    </div>
  );
}
