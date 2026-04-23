import { ArrowRight, Building2, MapPin, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { useAuth } from "../context/AuthContext";
import { formatSalary } from "../utils/formatSalary";

const JobCard = ({ job }) => {
  const { isAuthenticated, isJobSeeker } = useAuth();

  return (
    <article className="group flex h-full flex-col rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <StatusBadge value={job.jobType} />
        <span className="text-xs font-medium text-slate-400">
          {new Date(job.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="text-xl font-semibold text-slate-950">{job.title}</h3>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-sky-600" />
            <span className="truncate">{job.company || "Aidela Africa"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-sky-600" />
            <span>{job.location || "Remote"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 shrink-0 text-sky-600" />
            <span>{formatSalary(job.salary)}</span>
          </div>
        </div>

        <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
          {job.description}
        </p>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <span className="text-xs font-medium text-slate-400">
          Posted by {job.createdBy?.name || "Aidela Africa"}
        </span>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          {isAuthenticated ? (
            isJobSeeker ? (
              <Link
                to={`/job/${job._id}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800">
                Apply
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400">
                Recruiter account
              </button>
            )
          ) : (
            <Link
              to="/login"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800">
              Sign in to apply
            </Link>
          )}

          <Link
            to={`/job/${job._id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default JobCard;
