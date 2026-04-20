import { motion } from "framer-motion";
import { ArrowRight, Building2, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:pt-12">
      <div className="relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-slate-950 px-6 py-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 sm:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.24),transparent_30%)]" />

        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Modern hiring for Africa
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover better jobs and hire with clarity.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Aidela Africa brings job seekers and recruiters into one clear,
              fast experience for search, applications, and hiring decisions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/find-jobs"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                Find jobs
                <Search className="h-4 w-4" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Hire talent
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Curated roles", value: "Search-first UX" },
                { label: "Application flow", value: "Clear feedback" },
                { label: "Recruiter tools", value: "Actionable dashboards" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
            <div className="rounded-[1.75rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                    Featured opportunity
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    Senior Frontend Engineer
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Company</span>
                  <span className="font-semibold text-slate-900">
                    Aidela Africa
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="font-semibold text-slate-900">
                    Lagos / Remote
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Type</span>
                  <span className="font-semibold text-slate-900">
                    Full-time
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                Build a polished candidate experience and shape recruiter
                tooling for high-clarity hiring workflows.
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/find-jobs"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                  Browse jobs
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800">
                  Join now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
