// Key feature: Renders the landing page hero and primary calls to action.
import { motion as Motion } from "framer-motion";
import { ArrowRight, Building2, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const newLocal =
  "hero-gradient mx-auto max-w-7xl px-3 mb-12 pb-12 pt-8 sm:px-5 sm:pt-12 lg:px-6";
export const Hero = () => {
  return (
    <section className={newLocal}>
      <div className="hero-gradient relative overflow-hidden rounded-xl py-10 text-slate-950 shadow-xs sm:px-8 sm:py-14">
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <Motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Modern hiring for Africa
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Discover better jobs and hire with clarity.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Aidela Africa brings job seekers and recruiters into one clear,
              fast experience for search, applications, and hiring decisions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/find-jobs"
                className="btn btn-primary rounded-full inline-flex items-center justify-center gap-2 text-sm">
                Find jobs
                <Search className="h-4 w-4" />
              </Link>
              <Link
                to="/signup"
                className="btn btn-secondary rounded-full inline-flex items-center justify-center gap-2 text-sm">
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
                  className="rounded-lg border border-slate-100 bg-white px-4 py-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-white p-5 text-slate-950 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    Featured opportunity
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    Senior Frontend Engineer
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
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
                  className="btn btn-primary flex-1 inline-flex items-center justify-center rounded-full text-sm">
                  Browse jobs
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-secondary inline-flex items-center justify-center rounded-full text-sm">
                  Join now
                </Link>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};
