import { CheckCircle2, Lock, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { ErrorPanel } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

const roleOptions = [
  {
    value: "jobseeker",
    label: "Job seeker",
    description: "Search jobs, apply quickly, and track your application status.",
  },
  {
    value: "recruiter",
    label: "Recruiter",
    description: "Post roles, review applicants, and move candidates through your pipeline.",
  },
];

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
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
      const data = await signup(form);
      toast.success("Your account is ready.");
      navigate(data.user.role === "recruiter" ? "/employer-dashboard" : "/find-jobs", {
        replace: true,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to create your account."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen app-bg">
      <AppHeader />
      <main className="auth-main mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="auth-form-panel rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-accent/15 text-primary-accent">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Create account
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  Join Aidela Africa
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error ? <ErrorPanel message={error} /> : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Prosper Alex"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    required
                    value={form.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="At least 6 characters"
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

              <div className="space-y-3">
                <span className="text-sm font-medium text-slate-700">Choose your role</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-3xl border p-4 transition ${
                        form.role === option.value
                          ? "border-primary bg-secondary-accent/10"
                          : "border-slate-200 bg-white hover:border-secondary-accent/35 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={form.role === option.value}
                        onChange={(event) => handleChange("role", event.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            form.role === option.value
                              ? "text-primary-accent"
                              : "text-slate-300"
                          }`}
                        />
                        {option.label}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {option.description}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary-accent hover:text-primary-accent">
                Sign in
              </Link>
            </p>
          </section>

          <section className="rounded-[2.5rem] border border-slate-200 brand-dark-bg p-8 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-accent">
              Why join
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              One product for candidates and recruiters.
            </h2>
            <div className="mt-8 space-y-4">
              {[
                "Structured dashboards tailored to your role",
                "Clear job search and application tracking",
                "Fast recruiter workflow for status updates and review",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary-accent" />
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
