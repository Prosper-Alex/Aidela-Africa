import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { ErrorPanel } from "../../components/Feedback";
import { resetPassword } from "../../services/authService";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, { password, confirmPassword });
      setIsComplete(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to reset password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen app-bg">
      <AppHeader />
      <main className="auth-main mx-auto grid min-h-[calc(100dvh-88px)] max-w-5xl items-center px-4 py-8">
        <section className="auth-form-panel mx-auto w-full max-w-xl rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-accent hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Secure reset
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Create a new password
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use at least 6 characters. After reset, your old login sessions
              are rejected.
            </p>
          </div>

          {isComplete ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Password reset successful. Redirecting to login...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error ? <ErrorPanel message={error} /> : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  New password
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-slate-400 transition hover:text-primary"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }>
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Confirm password
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={6}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="text-slate-400 transition hover:text-primary"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }>
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Resetting password..." : "Reset password"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};
