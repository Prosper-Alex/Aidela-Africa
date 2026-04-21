import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JobFilters from "../../components/JobFilters";
import JobCard from "../../components/JobCard";
import PageShell from "../../components/PageShell";
import PaginationControls from "../../components/PaginationControls";
import {
  CardSkeletonGrid,
  EmptyState,
  ErrorPanel,
} from "../../components/Feedback";
import { getJobs } from "../../services/jobService";
import useDebouncedValue from "../../hooks/useDebouncedValue";
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

        // Defensive assignment with fallbacks
        const jobsData = Array.isArray(data?.jobs) ? data.jobs : [];
        const paginationData = data?.pagination || {
          page: 1,
          limit: 9,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        };

        console.log("[Dashboard] Jobs loaded:", {
          count: jobsData.length,
          page: paginationData.page,
          total: paginationData.total,
        });

        setJobs(jobsData);
        setPagination(paginationData);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        console.error("[Dashboard] Error loading jobs:", requestError);

        const errorMsg = getErrorMessage(
          requestError,
          "Unable to load jobs right now. Please try again.",
        );

        console.error("[Dashboard] Error message:", errorMsg);
        setError(errorMsg);
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

  const locationOptions = (() => {
    try {
      return Array.from(
        new Set([
          ...FALLBACK_LOCATION_OPTIONS,
          ...(Array.isArray(jobs)
            ? jobs.map((job) => job?.location).filter(Boolean)
            : []),
          filters.location,
        ]),
      )
        .filter((value) => value !== undefined)
        .map((value) => ({
          value,
          label: value || "All locations",
        }));
    } catch (err) {
      console.error("[Dashboard] Error building location options:", err);
      return FALLBACK_LOCATION_OPTIONS.map((value) => ({
        value,
        label: value || "All locations",
      }));
    }
  })();

  return (
    <PageShell
      title="Find jobs across Africa"
      description="Search by title, filter by location or job type, and browse opportunities in a paginated flow that stays fast as listings grow."
      actions={
        <Link
          to="/signup"
          className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
          Join as a candidate
        </Link>
      }>
      <div className="space-y-6">
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

        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Job listings
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Browse open roles
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {Array.isArray(jobs) ? jobs.length : 0}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {pagination?.total || 0}
              </span>{" "}
              matching jobs
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
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                    Reset filters
                  </button>
                }
              />
            ) : null}

            {!isLoading && !error && jobs.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.isArray(jobs) &&
                  jobs.map((job) => <JobCard key={job._id} job={job} />)}
              </div>
            ) : null}
          </div>
        </section>

        {!isLoading &&
        !error &&
        jobs.length > 0 &&
        pagination?.totalPages > 1 ? (
          <PaginationControls
            pagination={pagination}
            onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
          />
        ) : null}
      </div>
    </PageShell>
  );
};
