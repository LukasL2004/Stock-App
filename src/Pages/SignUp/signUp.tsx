import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import authService from "../../Services/UserService";
import AuthLayout from "../Auth/AuthLayout";
import Field from "../../Components/UI/Field";
import Button from "../../Components/UI/Button";
import FormError from "../../Components/UI/FormError";
import { ApiError, errorMessage } from "../../lib/http";
import { useI18n } from "../../i18n/useI18n";
import type { Key } from "../../i18n/core";

type Form = { firstName: string; lastName: string; email: string; password: string };
type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form, t: (k: Key) => string): Errors {
  const e: Errors = {};
  if (!f.firstName.trim()) e.firstName = t("auth.err.first");
  if (!f.lastName.trim()) e.lastName = t("auth.err.last");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = t("auth.err.email");
  if (f.password.length < 8) e.password = t("auth.err.password");
  return e;
}

function strength(p: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s as 0 | 1 | 2 | 3 | 4;
}

export default function SignUp() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate(form, t);
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      await authService.register({ ...form, email: form.email.trim() });
      navigate("/Login", { replace: true, state: { registered: true } });
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields as Errors);
      setError(err instanceof ApiError && err.status === 409 ? t("auth.signup.exists") : errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const st = strength(form.password);

  return (
    <AuthLayout
      title={t("auth.signup.title")}
      subtitle={t("auth.signup.subtitle")}
      footer={
        <>
          {t("auth.signup.have")} <Link to="/Login">{t("auth.signup.login")}</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <FormError message={error} />
        <div className="auth-row">
          <Field label={t("auth.firstName")} name="given-name" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} required />
          <Field label={t("auth.lastName")} name="family-name" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} required />
        </div>
        <Field label={t("auth.email")} type="email" name="email" autoComplete="email" placeholder={t("auth.emailPlaceholder")} value={form.email} onChange={set("email")} error={errors.email} required />
        <Field
          label={t("auth.password")}
          type="password"
          name="new-password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint={form.password ? t("auth.signup.strength", { label: t(`auth.strength.${st}`) }) : t("auth.signup.hint")}
          required
        />
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          {t("auth.signup.submit")}
        </Button>
        <p className="field-hint">{t("auth.signup.terms")}</p>
      </form>
    </AuthLayout>
  );
}
