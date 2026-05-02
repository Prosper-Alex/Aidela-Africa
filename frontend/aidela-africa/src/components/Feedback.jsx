// Key feature: Provides reusable empty, loading, and error feedback components.
import { AlertCircle, BriefcaseBusiness, LoaderCircle } from "lucide-react";

export const FullPageLoader = ({ label = "Loading..." }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-slate-600 shadow-sm">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
};

export const SectionLoader = ({ label = "Loading data..." }) => {
  return (
    <div className="flex items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-slate-600">
      <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
};

export const CardSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-8 flex gap-3">
            <div className="h-10 flex-1 rounded-xl bg-slate-200" />
            <div className="h-10 w-28 rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const EmptyState = ({
  title,
  description,
  action,
  icon: Icon = BriefcaseBusiness,
}) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
};

export const ErrorPanel = ({ message, action }) => {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-3">
          <p>{message}</p>
          {action ? <div>{action}</div> : null}
        </div>
      </div>
    </div>
  );
};
