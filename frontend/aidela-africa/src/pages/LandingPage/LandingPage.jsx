import { BriefcaseBusiness, ShieldCheck, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { Hero } from "./components/Hero";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_100%)]">
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
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
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

        <section className="rounded-[2.5rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
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
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-50"
              >
                Explore jobs
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
