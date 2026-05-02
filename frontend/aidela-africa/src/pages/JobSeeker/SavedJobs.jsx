// Key feature: Shows saved and submitted jobs for job seekers.
import { BriefcaseBusiness, ClipboardList, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";
import {
  EmptyState,
  ErrorPanel,
  SectionLoader,
} from "../../components/Feedback";
import useSafeApi from "../../hooks/useSafeApi";
import { getMyApplications } from "../../services/applicationService";

export const SavedJobs = () => {
  const { data, loading, error } = useSafeApi(
    () => getMyApplications({ limit: 50 }),
    [],
    { defaultData: { applications: [] } },
  );

  const applications = Array.isArray(data?.applications)
    ? data.applications
    : [];
  const pendingCount = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const acceptedCount = applications.filter(
    (application) => application.status === "accepted",
  ).length;

  return (
    <DashboardShell
      eyebrow="Job seeker"
      title="Track your applications"
      description="Stay on top of submitted roles, check status updates, and jump back into the jobs flow without losing your place."
      actions={
        <Link
          to="/find-jobs"
          className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
          Explore jobs
        </Link>
      }>
      {loading ? <SectionLoader label="Loading your applications..." /> : null}
      {!loading && error ? <ErrorPanel message={error} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Applications"
              value={applications.length}
              note="All roles you have submitted so far"
              icon={ClipboardList}
            />
            <StatCard
              label="Pending"
              value={pendingCount}
              note="Still moving through recruiter review"
              icon={Sparkles}
            />
            <StatCard
              label="Accepted"
              value={acceptedCount}
              note="Positive outcomes in your pipeline"
              icon={BriefcaseBusiness}
            />
          </div>

          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Once you apply to a role, it will appear here with its current review status."
              action={
                <Link
                  to="/find-jobs"
                  className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
                  Browse jobs
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {applications.map((application) => (
                <article
                  key={application._id}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <StatusBadge value={application.status} />
                    <p className="text-xs font-medium text-slate-400">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-5 flex-1">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {application.job?.title || "Role removed"}
                    </h2>
                    <p className="mt-3 text-sm text-slate-600">
                      {application.job?.company || "Aidela Africa"} •{" "}
                      {application.job?.location || "Location unavailable"}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Applied on{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {application.job?._id ? (
                    <Link
                      to={`/job/${application.job._id}`}
                      className="mt-6 inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-secondary/30 hover:bg-secondary/5 hover:text-secondary">
                      View role
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </>
      ) : null}
    </DashboardShell>
  );
};
