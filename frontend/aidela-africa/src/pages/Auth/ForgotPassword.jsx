// Key feature: Renders the safe forgot-password request form.
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { ErrorPanel } from "../../components/Feedback";
import { forgotPassword } from "../../services/authService";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await forgotPassword({ email });
      setSuccessMessage(
        data.message || "If that email exists, a password reset link has been sent.",
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to send reset link."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen app-bg">
      <AppHeader />
      <main className="auth-main mx-auto grid min-h-[calc(100dvh-88px)] max-w-5xl items-center px-4 py-8">
        <section className="auth-form-panel mx-auto w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-accent hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Password help
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Forgot your password?
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter your account email and we will send a reset link if the account exists.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? <ErrorPanel message={error} /> : null}

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending link..." : "Send reset link"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};
