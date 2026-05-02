// Key feature: Lets recruiters manage existing job listings.
import {
  ClipboardList,
  PencilLine,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import {
  EmptyState,
  ErrorPanel,
  SectionLoader,
} from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import { deleteJob, getRecruiterJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatSalary } from "../../utils/formatSalary";

export const ManageJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

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
          setError(getErrorMessage(requestError, "Unable to load your jobs."));
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

  const handleDelete = async (jobId) => {
    setDeletingId(jobId);

    try {
      await deleteJob(jobId);
      setJobs((currentJobs) => currentJobs.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully.");
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to delete this job."));
    } finally {
      setDeletingId("");
    }
  };

  return (
    <DashboardShell
      eyebrow="Recruiter workflow"
      title="Manage published jobs"
      description="Keep every listing current, balanced, and easy to act on across tablet and desktop card grids."
      actions={
        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
        >
          <PlusCircle className="h-4 w-4" />
          New job
        </Link>
      }
    >
      {error ? <ErrorPanel message={error} /> : null}
      {isLoading ? <SectionLoader label="Loading your jobs..." /> : null}

      {!isLoading && jobs.length === 0 ? (
        <EmptyState
          title="No jobs to manage yet"
          description="Your published roles will appear here once you create them."
          action={
            <Link
              to="/post-job"
              className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
            >
              Create your first job
            </Link>
          }
        />
      ) : null}

      {!isLoading && jobs.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <article
              key={job._id}
              className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <StatusBadge value={job.jobType} />
                <span className="text-xs font-semibold text-slate-400">
                  {job.applicationsCount || 0} applicants
                </span>
              </div>

              <div className="mt-5 flex-1">
                <h2 className="text-xl font-semibold text-slate-950">
                  {job.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {job.company} • {job.location}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {formatSalary(job.salary)}
                </p>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                  {job.description}
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                <Link
                  to={`/post-job?jobId=${job._id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-secondary/30 hover:bg-secondary/5 hover:text-secondary"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit listing
                </Link>
                <Link
                  to={`/applicants?jobId=${job._id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
                >
                  <ClipboardList className="h-4 w-4" />
                  Review applicants
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(job._id)}
                  disabled={deletingId === job._id}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === job._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </DashboardShell>
  );
};
