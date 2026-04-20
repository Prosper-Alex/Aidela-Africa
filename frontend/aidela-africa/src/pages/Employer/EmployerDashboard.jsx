import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import { EmptyState, ErrorPanel, SectionLoader } from "../../components/Feedback";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { getRecruiterJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const recruiterNav = [
  { to: "/employer-dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/post-job", label: "Post a job", icon: PlusCircle },
  { to: "/manage-jobs", label: "Manage jobs", icon: BriefcaseBusiness },
  { to: "/applicants", label: "Applicants", icon: ClipboardList },
];

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
          setJobs(data.jobs);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            getErrorMessage(requestError, "Unable to load your recruiter dashboard."),
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
  const remoteCount = jobs.filter((job) => job.jobType === "remote").length;
  const uniqueLocations = new Set(jobs.map((job) => job.location)).size;

  return (
    <DashboardShell
      eyebrow="Recruiter workspace"
      title="Run your hiring pipeline with clarity"
      description="Monitor open roles, keep track of active listings, and move to applicants or job management in one step."
      navItems={recruiterNav}
      actions={
        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
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
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Published jobs"
              value={jobs.length}
              note="Roles currently managed here"
              icon={BriefcaseBusiness}
            />
            <StatCard
              label="Remote roles"
              value={remoteCount}
              note="Flexible and distributed opportunities"
              icon={Users2}
            />
            <StatCard
              label="Hiring locations"
              value={uniqueLocations}
              note="Cities or regions represented"
              icon={MapPin}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Recent jobs</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Quick access to your latest published opportunities.
                  </p>
                </div>
                <Link
                  to="/manage-jobs"
                  className="text-sm font-semibold text-sky-700 hover:text-sky-800"
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
                        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                      >
                        Create first job
                      </Link>
                    }
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {jobs.slice(0, 4).map((job) => (
                    <article
                      key={job._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">
                            {job.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            {job.company} • {job.location}
                          </p>
                        </div>
                        <Link
                          to={`/applicants?jobId=${job._id}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-white hover:text-sky-800"
                        >
                          View applicants
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Next best action</h2>
              {latestJob ? (
                <>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Your latest role is <strong>{latestJob.title}</strong>. Review
                    applicants or refine the listing from job management.
                  </p>
                  <div className="mt-6 space-y-3">
                    <Link
                      to={`/applicants?jobId=${latestJob._id}`}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      Review applicants
                    </Link>
                    <Link
                      to={`/post-job?jobId=${latestJob._id}`}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                    >
                      Edit latest job
                    </Link>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Start by publishing a role, then applicants and status updates
                  will flow into this dashboard.
                </p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
};
