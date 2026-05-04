// Key feature: Renders sign-in with password visibility and forgot-password access.
import { ArrowRight, BriefcaseBusiness, Lock, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { ErrorPanel } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = await login(form);
      toast.success("Welcome back.");
      const nextPath =
        location.state?.from ||
        (data.user.role === "recruiter" ? "/employer-dashboard" : "/find-jobs");
      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to log you in."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen app-bg">
      <AppHeader />
      <main className="auth-main mx-auto grid min-h-[calc(100dvh-88px)] max-w-6xl items-center gap-6 px-3 py-7 sm:px-5 sm:py-9 lg:grid-cols-[0.95fr_1.05fr] lg:px-6">
        <section className="hero-gradient rounded-xl border border-slate-100 p-6 text-slate-950 shadow-sm sm:p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Sign in
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Continue your hiring or job search flow.
          </h1>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Access recruiter dashboards, candidate profiles, and applications
            with one secure sign-in experience.
          </p>
        </section>

        <section className="auth-form-panel rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue where you left off.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error ? <ErrorPanel message={error} /> : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-secondary hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="shrink-0 text-slate-400 transition hover:text-primary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-secondary hover:text-secondary">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
