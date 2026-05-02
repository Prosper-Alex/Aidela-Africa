// Key feature: Lets recruiters review applications across their jobs.
import { ClipboardList, PlusCircle, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import ApplicantsPanel from "../../components/ApplicantsPanel";
import DashboardShell from "../../components/DashboardShell";
import {
  EmptyState,
  ErrorPanel,
  SectionLoader,
} from "../../components/Feedback";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import {
  getApplicantsForJob,
  updateApplicationStatus,
} from "../../services/applicationService";
import { getRecruiterJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const ApplicationViewer = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(
    searchParams.get("jobId") || "",
  );
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsJobsLoading(true);
      setJobsError("");

      try {
        const data = await getRecruiterJobs(user?._id, { limit: 100 });
        const nextJobs = Array.isArray(data?.jobs) ? data.jobs : [];

        if (!isMounted) {
          return;
        }

        setJobs(nextJobs);

        if (nextJobs.length === 0) {
          setSelectedJobId("");
          setSearchParams({});
          return;
        }

        const hasSelectedJob = nextJobs.some(
          (job) => job._id === selectedJobId,
        );
        const nextSelectedJobId = hasSelectedJob
          ? selectedJobId
          : nextJobs[0]._id;

        setSelectedJobId(nextSelectedJobId);
        if (selectedJobId !== nextSelectedJobId) {
          setSearchParams({ jobId: nextSelectedJobId });
        }
      } catch (requestError) {
        if (isMounted) {
          setJobsError(
            getErrorMessage(
              requestError,
              "Unable to load your jobs for review.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsJobsLoading(false);
        }
      }
    };

    if (user?._id) {
      loadJobs();
    }

    return () => {
      isMounted = false;
    };
  }, [user?._id, setSearchParams, selectedJobId]);

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      if (!selectedJobId) {
        setApplications([]);
        setJobDetails(null);
        return;
      }

      setIsApplicationsLoading(true);
      setApplicationsError("");

      try {
        const data = await getApplicantsForJob(selectedJobId, { limit: 100 });
        const fallbackJob =
          jobs.find((job) => job._id === selectedJobId) || null;

        if (!isMounted) {
          return;
        }

        setApplications(
          Array.isArray(data?.applications) ? data.applications : [],
        );
        setJobDetails(data?.job || fallbackJob);
      } catch (requestError) {
        if (isMounted) {
          setApplicationsError(
            getErrorMessage(
              requestError,
              "Unable to load applicants for the selected job.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsApplicationsLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, [jobs, refreshCount, selectedJobId]);

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    setSearchParams(jobId ? { jobId } : {});
  };

  const handleUpdateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);

    try {
      const data = await updateApplicationStatus(applicationId, status);
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application._id === applicationId
            ? { ...application, ...data.application }
            : application,
        ),
      );
      toast.success(`Application ${status}.`);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to update status."));
    } finally {
      setUpdatingId("");
    }
  };

  const selectedJob =
    jobs.find((job) => job._id === selectedJobId) || jobDetails;

  return (
    <DashboardShell
      eyebrow="Applicant review"
      title="Review applicants by job"
      description="Move between roles quickly, keep applicant cards readable, and update status without a cluttered dashboard layout."
      actions={
        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
          <PlusCircle className="h-4 w-4" />
          Post a job
        </Link>
      }>
      {jobsError ? <ErrorPanel message={jobsError} /> : null}
      {isJobsLoading ? <SectionLoader label="Loading your jobs..." /> : null}

      {!isJobsLoading && jobs.length === 0 ? (
        <EmptyState
          title="No jobs available for review"
          description="Post a role first, then applicant review will appear here."
          action={
            <Link
              to="/post-job"
              className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
              Create a job
            </Link>
          }
        />
      ) : null}

      {!isJobsLoading && jobs.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Open jobs"
              value={jobs.length}
              note="Roles ready for recruiter review"
              icon={ClipboardList}
            />
            <StatCard
              label="Applicants loaded"
              value={applications.length}
              note="Candidates visible for the selected role"
              icon={Users2}
            />
            <StatCard
              label="Selected role"
              value={selectedJob ? "Active" : "None"}
              note={
                selectedJob?.title || "Choose a job to inspect applications"
              }
              icon={ClipboardList}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
            <section className="rounded-4xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Your jobs
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Select a role to inspect applicants and update statuses.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {jobs.map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    onClick={() => handleSelectJob(job._id)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                      selectedJobId === job._id
                        ? "border-primary/35 bg-secondary-accent/10"
                        : "border-slate-200 bg-white hover:border-secondary-accent/35 hover:bg-slate-50"
                    }`}>
                    <p className="font-semibold text-slate-950">{job.title}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {job.company} • {job.location}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {job.applicationsCount || 0} applicants
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="min-w-0">
              {applicationsError ? (
                <ErrorPanel message={applicationsError} />
              ) : null}
              <ApplicantsPanel
                job={selectedJob}
                applications={applications}
                isLoading={isApplicationsLoading}
                error={applicationsError}
                onRetry={() => setRefreshCount((count) => count + 1)}
                onUpdateStatus={handleUpdateStatus}
                updatingId={updatingId}
              />
            </section>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
};
