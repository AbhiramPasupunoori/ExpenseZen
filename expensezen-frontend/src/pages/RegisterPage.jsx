import { useState } from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
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
    "Registration failed. Please check your details."
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    currency: "INR",
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

    if (formData.password.length < 8) {
      setErrorMessage(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        currency: formData.currency,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card register-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <WalletCards size={27} />
          </span>

          <span>ExpenseZen</span>
        </Link>

        <div className="auth-heading">
          <h1>Create your account</h1>
          <p>Start tracking your finances securely.</p>
        </div>

        {errorMessage && (
          <div className="form-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-field">
            <span>Full name</span>

            <input
              className="standard-input"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              minLength="2"
              required
            />
          </label>

          <label className="form-field">
            <span>Email address</span>

            <input
              className="standard-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="form-field">
            <span>Currency</span>

            <select
              className="standard-input"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </label>

          <label className="form-field">
            <span>Password</span>

            <div className="input-wrapper no-leading-icon">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength="8"
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

          <label className="form-field">
            <span>Confirm password</span>

            <input
              className="standard-input"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Enter the password again"
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <LoaderCircle className="spin" size={19} />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;