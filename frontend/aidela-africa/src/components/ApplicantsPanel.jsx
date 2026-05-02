// Key feature: Displays applicants for a selected job and recruiter review actions.
import { ExternalLink, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { EmptyState, ErrorPanel, SectionLoader } from "./Feedback";
import StatusBadge from "./StatusBadge";

const ApplicantsPanel = ({
  job,
  applications,
  isLoading,
  error,
  onRetry,
  onUpdateStatus,
  updatingId,
}) => {
  if (!job) {
    return (
      <EmptyState
        icon={Users}
        title="Select a job to review applicants"
        description="Choose one of your published jobs and the submitted applications will appear here."
      />
    );
  }

  if (isLoading) {
    return <SectionLoader label="Loading applicants..." />;
  }

  if (error) {
    return (
      <ErrorPanel
        message={error}
        action={
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
        }
      />
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No applications yet"
        description={`No candidates have applied to ${job.title} yet.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const applicant = application.applicant || application.user;
        const isPending = application.status === "pending";
        const resumeValue = application.resume?.trim();
        const resumeLabel = resumeValue?.startsWith("data:application/pdf")
          ? "Download resume (PDF)"
          : resumeValue?.startsWith("data:text/plain")
            ? "Open resume (TXT)"
            : "View resume";

        return (
          <article
            key={application._id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {applicant?.name || "Applicant"}
                  </h3>
                  {applicant?.verification?.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary-accent/15 px-3 py-1 text-xs font-semibold text-primary-accent">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  ) : null}
                  <StatusBadge value={application.status} />
                </div>
                <p className="text-sm text-slate-600">{applicant?.email || "No email available"}</p>
                {applicant?.candidateProfile?.headline ? (
                  <p className="text-sm font-medium text-slate-700">
                    {applicant.candidateProfile.headline}
                  </p>
                ) : null}
                <p className="text-sm text-slate-500">
                  Applied on {new Date(application.createdAt).toLocaleString()}
                </p>
                {application.skillsMatch ? (
                  <p className="rounded-2xl bg-secondary-accent/10 px-4 py-3 text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">Skills match: </span>
                    {application.skillsMatch}
                  </p>
                ) : null}
                {application.standoutAnswer ? (
                  <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">Why they fit: </span>
                    {application.standoutAnswer}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  {application.availability ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {application.availability}
                    </span>
                  ) : null}
                  {application.expectedSalary ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {application.expectedSalary}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  {[application.portfolioUrl, application.linkedinUrl]
                    .filter(Boolean)
                    .map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-accent hover:text-primary-accent">
                        {url.includes("linkedin") ? "LinkedIn" : "Portfolio"}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                </div>
                {resumeValue ? (
                  resumeValue.startsWith("http") || resumeValue.startsWith("data:") ? (
                    <a
                      href={resumeValue}
                      target="_blank"
                      rel="noreferrer"
                      download={resumeValue.startsWith("data:") ? "resume" : undefined}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary-accent hover:text-primary-accent"
                    >
                      {resumeLabel}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                      {resumeValue}
                    </p>
                  )
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateStatus(application._id, "accepted")}
                  disabled={!isPending || updatingId === application._id}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(application._id, "rejected")}
                  disabled={!isPending || updatingId === application._id}
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ApplicantsPanel;
