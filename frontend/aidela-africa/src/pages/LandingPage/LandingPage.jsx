// Key feature: Renders the public landing page and platform feature highlights.
import { BriefcaseBusiness, ShieldCheck, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import MotionPopup from "../../components/MotionPopup";
import { Hero } from "./components/Hero";

export const LandingPage = () => {
  const isAuthenticated = true;

  return (
    <div className="min-h-screen app-bg">
      <AppHeader />
      <Hero />

      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16">
        <section className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Curated job discovery",
              description:
                "Search roles by title, location, and work style without losing context across pages.",
              icon: BriefcaseBusiness,
            },
            {
              title: "Fast recruiter workflow",
              description:
                "Post jobs, review applicants, and update candidate status from one streamlined dashboard.",
              icon: Users2,
            },
            {
              title: "Trustworthy experience",
              description:
                "Clear feedback, secure role-based access, and readable layouts across mobile and desktop.",
              icon: ShieldCheck,
            },
          ].map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-accent/15 text-primary-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-950">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="brand-dark-bg rounded-[2.5rem] border border-white/10 px-6 py-8 text-white shadow-xl sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-accent">
                Built for both sides of hiring
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                A cleaner path from application to hiring decision
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                Candidates get a clear job-search flow and application tracking.
                Recruiters get a practical workspace for posting roles and
                handling applicants without friction.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/find-jobs"
                className="btn btn-primary rounded-full text-sm">
                Explore jobs
              </Link>
              {!isAuthenticated ? (
                <Link
                  to="/signup"
                  className="btn btn-secondary rounded-full text-sm">
                  Create account
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="btn btn-primary rounded-full text-sm">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <MotionPopup />
    </div>
  );
};
