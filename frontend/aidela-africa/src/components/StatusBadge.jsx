// Key feature: Renders status labels with consistent colors and sizing.
const variantClasses = {
  pending: "bg-amber-100 text-amber-800",
  reviewed: "bg-slate-200 text-slate-700",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  "full-time": "bg-secondary-accent/15 text-primary-accent",
  "part-time": "bg-fuchsia-100 text-fuchsia-800",
  contract: "bg-violet-100 text-violet-800",
  remote: "bg-primary/10 text-primary-accent",
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-200 text-slate-700",
  closed: "bg-rose-100 text-rose-800",
  recruiter: "bg-emerald-100 text-emerald-800",
  jobseeker: "bg-slate-200 text-slate-700",
};

const StatusBadge = ({ value }) => {
  if (!value) {
    return null;
  }

  const normalizedValue = `${value}`.toLowerCase();
  const label = normalizedValue.replaceAll("-", " ");
  const className = variantClasses[normalizedValue] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
