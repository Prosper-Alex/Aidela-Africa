import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import ApplicantsPanel from "../../components/ApplicantsPanel";
import DashboardShell from "../../components/DashboardShell";
import { ErrorPanel, SectionLoader } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import {
  getApplicantsForJob,
  updateApplicationStatus,
} from "../../services/applicationService";
import { getRecruiterJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const recruiterNav = [
  { to: "/employer-dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/post-job", label: "Post a job", icon: PlusCircle },
  { to: "/manage-jobs", label: "Manage jobs", icon: BriefcaseBusiness },
  { to: "/applicants", label: "Applicants", icon: ClipboardList },
];

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

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsJobsLoading(true);
      setJobsError("");

      try {
        const data = await getRecruiterJobs(user?._id, { limit: 100 });

        if (!isMounted) {
          return;
        }

        setJobs(data.jobs);

        if (!selectedJobId && data.jobs.length > 0) {
          const firstJobId = data.jobs[0]._id;
          setSelectedJobId(firstJobId);
          setSearchParams({ jobId: firstJobId });
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
  }, [user?._id, selectedJobId, setSearchParams]);

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

        if (!isMounted) {
          return;
        }

        setApplications(data.applications);
        setJobDetails(data.job);
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
  }, [selectedJobId]);

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    setSearchParams(jobId ? { jobId } : {});
  };

  const handleUpdateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);

    try {
      const data = await updateApplicationStatus(applicationId, { status });
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application._id === applicationId ? data.application : application,
        ),
      );
      toast.success(`Application ${status}.`);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to update status."));
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <DashboardShell
      eyebrow="Applicant review"
      title="Review applicants by job"
      description="Pick a role, review who has applied, and keep status updates clear and timely."
      navItems={recruiterNav}>
      {jobsError ? <ErrorPanel message={jobsError} /> : null}
      {isJobsLoading ? <SectionLoader label="Loading your jobs..." /> : null}

      {!isJobsLoading ? (
        <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Your jobs</h2>
            <p className="mt-2 text-sm text-slate-500">
              Select a job to inspect applicants and update statuses.
            </p>

            <div className="mt-5 space-y-3">
              {jobs.map((job) => (
                <button
                  key={job._id}
                  type="button"
                  onClick={() => handleSelectJob(job._id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selectedJobId === job._id
                      ? "border-sky-400 bg-sky-50"
                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                  }`}>
                  <p className="font-semibold text-slate-950">{job.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {job.company} • {job.location}
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
              job={jobDetails}
              applications={applications}
              isLoading={isApplicationsLoading}
              error={applicationsError}
              onRetry={() => handleSelectJob(selectedJobId)}
              onUpdateStatus={handleUpdateStatus}
              updatingId={updatingId}
            />
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
};
