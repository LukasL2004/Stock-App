import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import authService from "../../Services/UserService";
import AuthLayout from "../Auth/AuthLayout";
import Field from "../../Components/UI/Field";
import Button from "../../Components/UI/Button";
import FormError from "../../Components/UI/FormError";
import { setSession } from "../../lib/auth";
import { errorMessage, MOCK_MODE } from "../../lib/http";
import { useI18n } from "../../i18n/useI18n";

export default function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(MOCK_MODE ? "demo@wealthgrow.app" : "");
  const [password, setPassword] = useState(MOCK_MODE ? "demo1234" : "");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(params.get("expired") ? t("auth.login.expired") : null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(t("auth.login.missing"));
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login({ email: email.trim(), password });
      setSession(res.token, email, remember);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err) === "User not found" ? t("auth.login.noMatch") : errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <>
          {t("auth.login.new")} <Link to="/SignUp">{t("auth.login.create")}</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <FormError message={error} />
        <Field label={t("auth.email")} type="email" name="email" autoComplete="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field
          label={t("auth.password")}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          labelAside={<Link to="/ForgotPassword">{t("auth.forgot")}</Link>}
        />
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          {t("auth.remember")}
        </label>
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          {t("auth.login.submit")}
        </Button>
      </form>
      {MOCK_MODE && (
        <p className="field-hint" style={{ marginTop: 14 }}>
          {t("auth.login.demo")}
        </p>
      )}
    </AuthLayout>
  );
}
