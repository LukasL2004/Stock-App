import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import authService from "../../Services/UserService";
import AuthLayout from "../Auth/AuthLayout";
import Field from "../../Components/UI/Field";
import Button from "../../Components/UI/Button";
import FormError from "../../Components/UI/FormError";
import { errorMessage } from "../../lib/http";

export default function ForgotPassword() {
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
    if (!email.trim()) return setError("Enter the email you signed up with.");
    setLoading(true);
    try {
      const res = await authService.ForgotPassword({ email: email.trim() });
      setStatus(res || "We sent a 6-digit code to your email. It expires in 5 minutes.");
      setStep(2);
    } catch (err) {
      setError(errorMessage(err) === "User not found" ? "No account matches that email." : errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.trim().length !== 6) return setError("The code has 6 digits.");
    if (password.length < 8) return setError("Use at least 8 characters for the new password.");
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
      title={step === 3 ? "Password updated" : "Reset your password"}
      subtitle={step === 1 ? "We will email you a one-time code." : step === 2 ? `Enter the code we sent to ${email.trim()}.` : "You can log in with your new password."}
      footer={
        <>
          Remembered it? <Link to="/Login">Back to log in</Link>
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
          <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" variant="primary" size="lg" block loading={loading}>
            Send code
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="auth-form" onSubmit={reset} noValidate>
          <FormError message={status} ok />
          <FormError message={error} />
          <Field
            className="code-input"
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
          />
          <Field label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters." required />
          <Button type="submit" variant="primary" size="lg" block loading={loading}>
            Set new password
          </Button>
          <Button variant="ghost" block onClick={() => { setStep(1); setStatus(null); setError(null); }}>
            Use a different email
          </Button>
        </form>
      )}

      {step === 3 && (
        <div className="auth-form">
          <FormError message="Your password has been changed. A confirmation email is on its way." ok />
          <Button variant="primary" size="lg" block onClick={() => navigate("/Login")}>
            Go to log in
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
