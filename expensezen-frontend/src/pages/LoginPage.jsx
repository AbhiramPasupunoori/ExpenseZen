import { useState } from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  WalletCards,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";
import useAuth from "../hooks/useAuth";

function getErrorMessage(error) {
  const validationErrors =
    error.response?.data?.validationErrors;

  if (validationErrors) {
    const firstError = Object.values(validationErrors)[0];

    if (firstError) {
      return firstError;
    }
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "Login failed. Please check your details."
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const destination =
        location.state?.from?.pathname || "/dashboard";

      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <WalletCards size={27} />
          </span>

          <span>ExpenseZen</span>
        </Link>

        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>Log in to manage your finances.</p>
        </div>

        {errorMessage && (
          <div className="form-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-field">
            <span>Email address</span>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="form-field">
            <span>Password</span>

            <div className="input-wrapper">
              <LockKeyhole size={18} />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle className="spin" size={19} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;