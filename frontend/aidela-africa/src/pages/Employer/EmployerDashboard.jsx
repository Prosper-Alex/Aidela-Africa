// Key feature: Renders recruiter dashboard stats and next actions.
import {
  BriefcaseBusiness,
  ClipboardList,
  MapPin,
  PlusCircle,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import {
  EmptyState,
  ErrorPanel,
  SectionLoader,
} from "../../components/Feedback";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { getRecruiterJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatSalary } from "../../utils/formatSalary";

export const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getRecruiterJobs(user?._id, { limit: 100 });

        if (isMounted) {
          setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load your recruiter dashboard.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user?._id) {
      loadJobs();
    }

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  const latestJob = jobs[0];
  const applicationsTotal = jobs.reduce(
    (total, job) => total + (job?.applicationsCount || 0),
    0,
  );
  const uniqueLocations = new Set(
    jobs.map((job) => job?.location).filter(Boolean),
  ).size;

  return (
    <DashboardShell
      eyebrow="Recruiter workspace"
      title="Run your hiring pipeline with clarity"
      description="Keep your dashboards, job listings, and applicant review flow visually aligned in one recruiter workspace."
      actions={
        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
        >
          <PlusCircle className="h-4 w-4" />
          Post a job
        </Link>
      }
    >
      {error ? <ErrorPanel message={error} /> : null}
      {isLoading ? <SectionLoader label="Loading recruiter overview..." /> : null}

      {!isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Published jobs"
              value={jobs.length}
              note="Roles currently managed in your workspace"
              icon={BriefcaseBusiness}
            />
            <StatCard
              label="Applicants"
              value={applicationsTotal}
              note="Candidates flowing through your pipeline"
              icon={Users2}
            />
            <StatCard
              label="Locations"
              value={uniqueLocations}
              note="Cities or regions represented by your roles"
              icon={MapPin}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    Recent jobs
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Your latest listings
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Review recent roles, jump into applicants, or refine a listing without leaving the dashboard.
                  </p>
                </div>
                <Link
                  to="/manage-jobs"
                  className="text-sm font-semibold text-primary-accent hover:text-primary-accent"
                >
                  Manage all jobs
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="No jobs posted yet"
                    description="Create your first listing to start building your candidate pipeline."
                    action={
                      <Link
                        to="/post-job"
                        className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
                      >
                        Create first job
                      </Link>
                    }
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {jobs.slice(0, 4).map((job) => (
                    <article
                      key={job._id}
                      className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <StatusBadge value={job.jobType} />
                        <span className="text-xs font-semibold text-slate-400">
                          {job.applicationsCount || 0} applicants
                        </span>
                      </div>

                      <div className="mt-4 flex-1">
                        <h3 className="text-lg font-semibold text-slate-950">
                          {job.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {job.company} • {job.location}
                        </p>
                        <p className="mt-3 text-sm font-medium text-slate-700">
                          {formatSalary(job.salary)}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link
                          to={`/applicants?jobId=${job._id}`}
                          className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-secondary-accent/35 hover:bg-secondary-accent/10 hover:text-primary-accent"
                        >
                          View applicants
                        </Link>
                        <Link
                          to={`/post-job?jobId=${job._id}`}
                          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
                        >
                          Edit job
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="space-y-6">
              <section className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Focus
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Next best action
                </h2>

                {latestJob ? (
                  <>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      Your latest role is <strong>{latestJob.title}</strong>. Review incoming applicants or tighten the listing copy before the next hiring round.
                    </p>

                    <div className="mt-6 space-y-3">
                      <Link
                        to={`/applicants?jobId=${latestJob._id}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
                      >
                        Review applicants
                      </Link>
                      <Link
                        to={`/post-job?jobId=${latestJob._id}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-secondary-accent/35 hover:bg-secondary-accent/10 hover:text-primary-accent"
                      >
                        Refine latest listing
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Publish a role first. Once applications start arriving, this workspace becomes the fastest route back into your pipeline.
                  </p>
                )}
              </section>

              <section className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Quick links
                </p>
                <div className="mt-5 grid gap-3">
                  <Link
                    to="/manage-jobs"
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-secondary-accent/35 hover:bg-secondary-accent/10 hover:text-primary-accent"
                  >
                    Manage jobs
                  </Link>
                  <Link
                    to="/applicants"
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-secondary-accent/35 hover:bg-secondary-accent/10 hover:text-primary-accent"
                  >
                    Review applicants
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
};
