import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  PencilLine,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import { EmptyState, ErrorPanel, SectionLoader } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import { deleteJob, getRecruiterJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const recruiterNav = [
  { to: "/employer-dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/post-job", label: "Post a job", icon: PlusCircle },
  { to: "/manage-jobs", label: "Manage jobs", icon: BriefcaseBusiness },
  { to: "/applicants", label: "Applicants", icon: ClipboardList },
];

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
          setJobs(data.jobs);
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
      description="Keep every listing clean, current, and easy to review before candidates arrive."
      navItems={recruiterNav}
      actions={
        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
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
        />
      ) : null}

      {!isLoading && jobs.length > 0 ? (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <article
              key={job._id}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {job.title}
                    </h2>
                    <StatusBadge value={job.jobType} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {job.company} • {job.location} • {job.salary || "Salary not specified"}
                  </p>
                  <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-500">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/post-job?jobId=${job._id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit
                  </Link>
                  <Link
                    to={`/applicants?jobId=${job._id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Applicants
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(job._id)}
                    disabled={deletingId === job._id}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === job._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </DashboardShell>
  );
};
