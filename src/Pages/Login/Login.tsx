import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import authService from "../../Services/UserService";
import AuthLayout from "../Auth/AuthLayout";
import Field from "../../Components/UI/Field";
import Button from "../../Components/UI/Button";
import FormError from "../../Components/UI/FormError";
import { setSession } from "../../lib/auth";
import { errorMessage, MOCK_MODE } from "../../lib/http";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(MOCK_MODE ? "demo@wealthgrow.app" : "");
  const [password, setPassword] = useState(MOCK_MODE ? "demo1234" : "");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(params.get("expired") ? "Your session expired. Please log in again." : null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login({ email: email.trim(), password });
      setSession(res.token, email, remember);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err) === "User not found" ? "No account matches that email." : errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Your portfolio is waiting."
      footer={
        <>
          New to WealthGrow? <Link to="/SignUp">Create an account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <FormError message={error} />
        <Field label="Email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          labelAside={<Link to="/ForgotPassword">Forgot password?</Link>}
        />
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Keep me logged in on this device
        </label>
        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Log in
        </Button>
      </form>

      {MOCK_MODE && (
        <p className="field-hint" style={{ marginTop: 14 }}>
          Demo mode: credentials are prefilled.
        </p>
      )}
    </AuthLayout>
  );
}
