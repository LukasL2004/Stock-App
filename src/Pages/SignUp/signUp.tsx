import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import authService from "../../Services/UserService";
import AuthLayout from "../Auth/AuthLayout";
import Field from "../../Components/UI/Field";
import Button from "../../Components/UI/Button";
import FormError from "../../Components/UI/FormError";
import { ApiError, errorMessage } from "../../lib/http";

type Form = { firstName: string; lastName: string; email: string; password: string };
type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.firstName.trim()) e.firstName = "Enter your first name.";
  if (!f.lastName.trim()) e.lastName = "Enter your last name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.password.length < 8) e.password = "Use at least 8 characters.";
  return e;
}

function strength(p: string): { score: number; label: string } {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return { score: s, label: ["Too short", "Weak", "Fair", "Good", "Strong"][s] };
}

export default function SignUp() {
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
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      await authService.register({ ...form, email: form.email.trim() });
      navigate("/Login", { replace: true, state: { registered: true } });
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields as Errors);
      setError(err instanceof ApiError && err.status === 409 ? "An account with this email already exists." : errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const st = strength(form.password);

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start with virtual cash and build your first portfolio."
      footer={
        <>
          Already have an account? <Link to="/Login">Log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <FormError message={error} />
        <div className="auth-row">
          <Field label="First name" name="given-name" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} required />
          <Field label="Last name" name="family-name" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} required />
        </div>
        <Field label="Email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set("email")} error={errors.email} required />
        <Field
          label="Password"
          type="password"
          name="new-password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint={form.password ? `Password strength: ${st.label}` : "At least 8 characters."}
          required
        />
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Create account
        </Button>
        <p className="field-hint">
          By continuing you agree to the Terms and Privacy policy.
        </p>
      </form>
    </AuthLayout>
  );
}
