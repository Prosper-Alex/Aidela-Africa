import { BriefcaseBusiness, ClipboardList, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JobFilters from "../../components/JobFilters";
import JobCard from "../../components/JobCard";
import PageShell from "../../components/PageShell";
import PaginationControls from "../../components/PaginationControls";
import StatCard from "../../components/StatCard";
import {
  CardSkeletonGrid,
  EmptyState,
  ErrorPanel,
} from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { getJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const DEFAULT_FILTERS = {
  search: "",
  location: "",
  jobType: "",
};

const FALLBACK_LOCATION_OPTIONS = [
  "",
  "Lagos",
  "Abuja",
  "Accra",
  "Nairobi",
  "Johannesburg",
  "Remote",
];

export const JobSeekerDashboard = () => {
  const { isAuthenticated, isRecruiter } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const debouncedSearch = useDebouncedValue(filters.search, 450);

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getJobs({
          search: debouncedSearch || undefined,
          location: filters.location || undefined,
          jobType: filters.jobType || undefined,
          page: currentPage,
          limit: 9,
        });

        if (!isMounted) {
          return;
        }

        setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        setPagination(
          data?.pagination || {
            page: 1,
            limit: 9,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        );
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          getErrorMessage(
            requestError,
            "Unable to load jobs right now. Please try again.",
          ),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [
    currentPage,
    debouncedSearch,
    filters.location,
    filters.jobType,
    refreshCount,
  ]);

  const handleFilterChange = (field, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const locationOptions = Array.from(
    new Set([
      ...FALLBACK_LOCATION_OPTIONS,
      ...jobs.map((job) => job?.location).filter(Boolean),
      filters.location,
    ]),
  )
    .filter((value) => value !== undefined)
    .map((value) => ({
      value,
      label: value || "All locations",
    }));

  const uniqueVisibleLocations = new Set(
    jobs.map((job) => job?.location).filter(Boolean),
  ).size;
  const uniqueJobTypes = new Set(
    jobs.map((job) => `${job?.jobType || ""}`.toLowerCase()).filter(Boolean),
  ).size;

  const headerAction = !isAuthenticated ? (
    <Link
      to="/signup"
      className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
      Join as a candidate
    </Link>
  ) : isRecruiter ? (
    <Link
      to="/employer-dashboard"
      className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
      Recruiter dashboard
    </Link>
  ) : (
    <Link
      to="/my-applications"
      className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
      View applications
    </Link>
  );

  return (
    <PageShell
      title="Find jobs across Africa"
      description="Search by title, refine by location or job type, and browse opportunities in a clean, responsive flow."
      actions={headerAction}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Open roles"
          value={pagination?.total || 0}
          note="Matches available for your current filters"
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Locations"
          value={uniqueVisibleLocations}
          note="Cities or remote hubs in this view"
          icon={MapPin}
        />
        <StatCard
          label="Application hub"
          value={isAuthenticated ? "Ready" : "Login"}
          note={
            isAuthenticated
              ? "Open a role and apply without losing context"
              : "Sign in to track applications and profile activity"
          }
          icon={ClipboardList}
        />
      </div>

      <JobFilters
        search={filters.search}
        location={filters.location}
        jobType={filters.jobType}
        locationOptions={locationOptions}
        onSearchChange={(value) => handleFilterChange("search", value)}
        onLocationChange={(value) => handleFilterChange("location", value)}
        onJobTypeChange={(value) => handleFilterChange("jobType", value)}
        onClear={handleClearFilters}
      />

      <section className="rounded-4xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Job listings
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Browse open roles
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Responsive cards keep titles, salary, and actions balanced across
              mobile and desktop.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">{jobs.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {pagination?.total || 0}
            </span>{" "}
            jobs across{" "}
            <span className="font-semibold text-slate-900">
              {uniqueJobTypes || 0}
            </span>{" "}
            work styles
          </p>
        </div>

        <div className="mt-6">
          {isLoading ? <CardSkeletonGrid count={6} /> : null}

          {!isLoading && error ? (
            <ErrorPanel
              message={error}
              action={
                <button
                  type="button"
                  onClick={() => setRefreshCount((count) => count + 1)}
                  className="rounded-full border border-rose-200 px-4 py-2 font-semibold text-rose-700 transition hover:bg-white">
                  Try again
                </button>
              }
            />
          ) : null}

          {!isLoading && !error && jobs.length === 0 ? (
            <EmptyState
              title="No jobs match your filters"
              description="Try a different title, remove one of the filters, or browse all recent opportunities again."
              action={
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
                  Reset filters
                </button>
              }
            />
          ) : null}

          {!isLoading && !error && jobs.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {!isLoading && !error && jobs.length > 0 && pagination?.totalPages > 1 ? (
        <PaginationControls
          pagination={pagination}
          onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
        />
      ) : null}
    </PageShell>
  );
};
