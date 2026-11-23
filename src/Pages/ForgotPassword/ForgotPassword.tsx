import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import authService from "../../Services/UserService";
import AuthLayout from "../Auth/AuthLayout";
import Field from "../../Components/UI/Field";
import Button from "../../Components/UI/Button";
import FormError from "../../Components/UI/FormError";
import { errorMessage } from "../../lib/http";
import { useI18n } from "../../i18n/useI18n";

export default function ForgotPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError(t("auth.forgot.enterEmail"));
    setLoading(true);
    try {
      const res = await authService.ForgotPassword({ email: email.trim() });
      setStatus(res && !res.startsWith("Check your email") ? res : t("auth.forgot.sent"));
      setStep(2);
    } catch (err) {
      setError(errorMessage(err) === "User not found" ? t("auth.login.noMatch") : errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.trim().length !== 6) return setError(t("auth.forgot.codeLen"));
    if (password.length < 8) return setError(t("auth.forgot.pwdLen"));
    setLoading(true);
    try {
      await authService.ResetPassword({ email: email.trim(), code: code.trim(), password });
      setStep(3);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 3 ? t("auth.forgot.done") : t("auth.forgot.title")}
      subtitle={step === 1 ? t("auth.forgot.sub1") : step === 2 ? t("auth.forgot.sub2", { email: email.trim() }) : t("auth.forgot.sub3")}
      footer={
        <>
          {t("auth.forgot.remembered")} <Link to="/Login">{t("auth.forgot.back")}</Link>
        </>
      }
    >
      <div className="auth-steps" aria-hidden="true">
        <span className="on" />
        <span className={step >= 2 ? "on" : ""} />
        <span className={step >= 3 ? "on" : ""} />
      </div>

      {step === 1 && (
        <form className="auth-form" onSubmit={sendCode} noValidate>
          <FormError message={error} />
          <Field label={t("auth.email")} type="email" autoComplete="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" variant="primary" size="lg" block loading={loading}>
            {t("auth.forgot.send")}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="auth-form" onSubmit={reset} noValidate>
          <FormError message={status} ok />
          <FormError message={error} />
          <Field
            className="code-input"
            label={t("auth.forgot.code")}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
          />
          <Field label={t("auth.forgot.newPassword")} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint={t("auth.signup.hint")} required />
          <Button type="submit" variant="primary" size="lg" block loading={loading}>
            {t("auth.forgot.set")}
          </Button>
          <Button variant="ghost" block onClick={() => { setStep(1); setStatus(null); setError(null); }}>
            {t("auth.forgot.otherEmail")}
          </Button>
        </form>
      )}

      {step === 3 && (
        <div className="auth-form">
          <FormError message={t("auth.forgot.changed")} ok />
          <Button variant="primary" size="lg" block onClick={() => navigate("/Login")}>
            {t("auth.forgot.goLogin")}
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
