// Key feature: Verifies a password reset OTP and creates a temporary reset session.
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { ErrorPanel } from "../../components/Feedback";
import { verifyResetOtp } from "../../services/authService";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const VerifyResetOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await verifyResetOtp({ email, otp: otp.trim() });
      navigate("/reset-password", {
        replace: true,
        state: {
          resetToken: data.resetToken,
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to verify that code."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen app-bg">
      <AppHeader />
      <main className="auth-main page-frame grid min-h-[calc(100dvh-88px)] max-w-5xl items-center">
        <section className="auth-form-panel mx-auto w-full max-w-xl rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mt-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Verify code
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Enter your 6-digit code
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The code expires in 10 minutes. You will use the next step only to
              create a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? <ErrorPanel message={error} /> : null}

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Verification code</span>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <KeyRound className="h-4 w-4 text-slate-400" />
                <input
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full bg-transparent text-center text-xl font-bold tracking-[0.4em] text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="000000"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Verify code"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};
