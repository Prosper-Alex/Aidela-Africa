import { BriefcaseBusiness, ClipboardList, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import { EmptyState, ErrorPanel, SectionLoader } from "../../components/Feedback";
import { getMyApplications } from "../../services/applicationService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const jobSeekerNav = [
  { to: "/my-applications", label: "My applications", icon: ClipboardList },
  { to: "/find-jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

export const SavedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getMyApplications({ limit: 50 });

        if (isMounted) {
          setApplications(data.applications);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load your applications right now.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardShell
      eyebrow="Job seeker"
      title="Track your applications"
      description="Stay on top of submitted applications and see where each opportunity stands."
      navItems={jobSeekerNav}
      actions={
        <Link
          to="/find-jobs"
          className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Explore jobs
        </Link>
      }
    >
      {isLoading ? <SectionLoader label="Loading your applications..." /> : null}
      {!isLoading && error ? <ErrorPanel message={error} /> : null}

      {!isLoading && !error && applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Once you apply to a role, it will appear here with its current review status."
          action={
            <Link
              to="/find-jobs"
              className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Browse jobs
            </Link>
          }
        />
      ) : null}

      {!isLoading && !error && applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((application) => (
            <article
              key={application._id}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {application.job?.title || "Role removed"}
                    </h2>
                    <StatusBadge value={application.status} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {application.job?.company || "Aidela Africa"} •{" "}
                    {application.job?.location || "Location unavailable"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {application.job?._id ? (
                  <Link
                    to={`/job/${application.job._id}`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                  >
                    View role
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </DashboardShell>
  );
};
