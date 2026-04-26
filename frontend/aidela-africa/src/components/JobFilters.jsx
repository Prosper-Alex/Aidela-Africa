import { Filter, RotateCcw, Search } from "lucide-react";

const JOB_TYPE_OPTIONS = [
  { label: "All job types", value: "" },
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Remote", value: "remote" },
];

const JobFilters = ({
  search,
  location,
  jobType,
  locationOptions,
  onSearchChange,
  onLocationChange,
  onJobTypeChange,
  onClear,
}) => {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-accent/15 text-primary-accent">
          <Filter className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Search and filter</h2>
          <p className="text-sm text-slate-500">
            Narrow jobs by title, location, or working arrangement.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Search by title</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="e.g. frontend developer"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Location</span>
          <select
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {locationOptions.map((option) => (
              <option key={option.value || "all-locations"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Job type</span>
          <select
            value={jobType}
            onChange={(event) => onJobTypeChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {JOB_TYPE_OPTIONS.map((option) => (
              <option key={option.value || "all-job-types"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end sm:col-span-2 xl:col-span-1">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-secondary-accent/35 hover:bg-secondary-accent/10 hover:text-primary-accent"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
};

export default JobFilters;
