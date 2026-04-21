import { ArrowRight, Building2, MapPin, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const JobCard = ({ job }) => {
  const formatSalary = (salary) => {
    if (salary === null || salary === undefined) return "Salary not specified";

    if (typeof salary === "string" || typeof salary === "number") {
      return salary;
    }

    if (typeof salary === "object") {
      const { min, max, currency } = salary;
      const fmt = (v) =>
        typeof v === "number" ? new Intl.NumberFormat().format(v) : v;

      if (min && max)
        return `${currency ? currency + " " : ""}${fmt(min)} - ${fmt(max)}`;
      if (min) return `${currency ? currency + " " : ""}${fmt(min)}`;

      return "Salary not specified";
    }

    return String(salary);
  };

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <StatusBadge value={job.jobType} />
        <span className="text-xs font-medium text-slate-400">
          {new Date(job.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-slate-950">{job.title}</h3>

      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-sky-600" />
          <span>{job.company}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-600" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-sky-600" />
          <span>{formatSalary(job.salary)}</span>
        </div>
      </div>

      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
        {job.description}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-slate-400">
          Posted by {job.createdBy?.name || "Aidela Africa"}
        </span>
        <Link
          to={`/job/${job._id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

export default JobCard;
