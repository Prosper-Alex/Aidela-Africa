import { Building2, Clock3, MapPin, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import StatusBadge from "../../components/StatusBadge";
import { EmptyState, ErrorPanel, SectionLoader } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import { applyToJob } from "../../services/applicationService";
import { getJobById } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const JobDetails = () => {
  const { jobId } = useParams();
  const { isAuthenticated, isJobSeeker } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadJob = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getJobById(jobId);

        if (isMounted) {
          setJob(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError, "Unable to load the job details."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const handleApply = async () => {
    if (!job) {
      return;
    }

    setIsApplying(true);

    try {
      await applyToJob({ job: job._id });
      setHasApplied(true);
      toast.success("Application submitted successfully.");
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to submit application."));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <PageShell
      title={job?.title || "Job details"}
      description="Review the role, understand what the employer needs, and apply once you are ready."
      actions={
        <Link
          to="/find-jobs"
          className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
        >
          Back to jobs
        </Link>
      }
    >
      {isLoading ? <SectionLoader label="Loading job details..." /> : null}

      {!isLoading && error ? <ErrorPanel message={error} /> : null}

      {!isLoading && !error && !job ? (
        <EmptyState
          title="Job not found"
          description="The job may have been removed or the link may be invalid."
        />
      ) : null}

      {!isLoading && !error && job ? (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge value={job.jobType} />
              <span className="text-sm text-slate-500">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Company", value: job.company, icon: Building2 },
                { label: "Location", value: job.location, icon: MapPin },
                {
                  label: "Salary",
                  value: job.salary || "Not specified",
                  icon: Wallet,
                },
                {
                  label: "Posted by",
                  value: job.createdBy?.name || "Aidela Africa",
                  icon: Clock3,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-slate-50 px-4 py-4 text-sm"
                  >
                    <div className="flex items-center gap-2 text-slate-500">
                      <Icon className="h-4 w-4 text-sky-600" />
                      {item.label}
                    </div>
                    <p className="mt-2 font-semibold text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-950">About this role</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {job.description}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-950">Requirements</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {job.requirements?.length ? (
                  job.requirements.map((requirement) => (
                    <span
                      key={requirement}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      {requirement}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No specific requirements listed for this role.
                  </p>
                )}
              </div>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Take the next step</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Submit your application if this role matches your background and
              goals.
            </p>

            {isJobSeeker ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying || hasApplied}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {hasApplied ? "Application submitted" : isApplying ? "Applying..." : "Apply now"}
              </button>
            ) : null}

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Sign in to apply
              </Link>
            ) : null}

            {isAuthenticated && !isJobSeeker ? (
              <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                Recruiter accounts cannot apply to jobs. Switch to a job seeker
                account to submit applications.
              </p>
            ) : null}
          </aside>
        </div>
      ) : null}
    </PageShell>
  );
};
