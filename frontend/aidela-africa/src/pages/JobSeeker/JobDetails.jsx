import { Building2, Clock3, MapPin, Sparkles, Wallet } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import StatusBadge from "../../components/StatusBadge";
import {
  EmptyState,
  ErrorPanel,
  SectionLoader,
} from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import { applyToJob } from "../../services/applicationService";
import { getJobById } from "../../services/jobService";
import { formatSalary } from "../../utils/formatSalary";
import { getErrorMessage } from "../../utils/getErrorMessage";
import useSafeApi from "../../hooks/useSafeApi";

const MAX_RESUME_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set(["application/pdf", "text/plain"]);

export const JobDetails = () => {
  const { jobId } = useParams();
  const { isAuthenticated, isJobSeeker } = useAuth();
  const {
    data: job,
    loading,
    error,
    refetch,
  } = useSafeApi(() => getJobById(jobId), [jobId], { defaultData: null });
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [resumeDataUrl, setResumeDataUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [availability, setAvailability] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [skillsMatch, setSkillsMatch] = useState("");
  const [standoutAnswer, setStandoutAnswer] = useState("");

  const handleApply = async () => {
    if (!job) {
      return;
    }
    // show the inline apply form
    setShowApplyForm(true);
  };

  const handleFileChange = (file) => {
    if (!file) {
      setResumeDataUrl("");
      setResumeFileName("");
      return;
    }

    const hasAllowedExtension = /\.(pdf|txt)$/i.test(file.name || "");
    if (!ALLOWED_RESUME_TYPES.has(file.type) && !hasAllowedExtension) {
      toast.error("Upload a PDF or TXT resume.");
      setResumeDataUrl("");
      setResumeFileName("");
      return;
    }

    if (file.size > MAX_RESUME_SIZE_BYTES) {
      toast.error("Resume must be 2MB or smaller.");
      setResumeDataUrl("");
      setResumeFileName("");
      return;
    }

    setResumeFileName(file.name);

    // keep only base64 data URL for sending to backend
    const reader = new FileReader();
    reader.onload = (e) => {
      setResumeDataUrl(String(e.target.result || ""));
    };
    reader.onerror = () => {
      setResumeDataUrl("");
      setResumeFileName("");
      toast.error("Unable to read the selected resume.");
    };
    reader.readAsDataURL(file);
  };

  const submitApplication = async (e) => {
    e?.preventDefault();

    if (!job) return;

    if (!resumeDataUrl) {
      toast.error("Upload your resume before submitting.");
      return;
    }

    setIsApplying(true);

    try {
      const payload = {
        resume: resumeDataUrl || "",
        coverLetter: coverLetter || "",
        portfolioUrl,
        linkedinUrl,
        availability,
        expectedSalary,
        skillsMatch,
        standoutAnswer,
      };

      await applyToJob(job._id, payload);
      setHasApplied(true);
      setShowApplyForm(false);
      setResumeDataUrl("");
      setResumeFileName("");
      setCoverLetter("");
      setPortfolioUrl("");
      setLinkedinUrl("");
      setAvailability("");
      setExpectedSalary("");
      setSkillsMatch("");
      setStandoutAnswer("");
      toast.success("Application submitted successfully.");

      if (typeof refetch === "function") {
        try {
          await refetch();
        } catch (err) {
          console.warn("Refetch failed after apply:", err);
        }
      }
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to submit application."));
    } finally {
      setIsApplying(false);
    }
  };

  const getRequirementsArray = (requirements) => {
    if (!requirements) return [];
    if (Array.isArray(requirements)) return requirements;
    if (typeof requirements === "string")
      return requirements
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    return [];
  };

  return (
    <PageShell
      title={job?.title || "Job details"}
      description="Review the role, understand what the employer needs, and apply once you are ready."
      actions={
        <Link
          to="/find-jobs"
          className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-secondary-accent/35 hover:bg-secondary-accent/10 hover:text-primary-accent">
          Back to jobs
        </Link>
      }>
      {loading ? <SectionLoader label="Loading job details..." /> : null}

      {!loading && error ? <ErrorPanel message={error} /> : null}

      {!loading && !error && !job ? (
        <EmptyState
          title="Job not found"
          description="The job may have been removed or the link may be invalid."
        />
      ) : null}
      {!loading && !error && job ? (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge value={job.jobType} />
              <span className="text-sm text-slate-500">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: "Company",
                  value: job.company || "—",
                  icon: Building2,
                },
                { label: "Location", value: job.location || "—", icon: MapPin },
                {
                  label: "Salary",
                  value: formatSalary(job.salary),
                  icon: Wallet,
                },
                {
                  label: "Posted by",
                  value: job.createdBy?.name || "Aidela Africa",
                  icon: Clock3,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-slate-50 px-4 py-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </div>
                    <p className="mt-2 font-semibold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-950">
                About this role
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {job.description}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-950">
                Requirements
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {getRequirementsArray(job.requirements).length ? (
                  getRequirementsArray(job.requirements).map((requirement) => (
                    <span
                      key={requirement}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                      {requirement}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No specific requirements listed for this role.
                  </p>
                )}
              </div>
            </div>

            {job.additionalInfo ? (
              <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                  Candidate notes
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {job.additionalInfo}
                </p>
              </div>
            ) : null}
          </article>

          <aside className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-xl font-semibold text-slate-950">
              Take the next step
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Submit your application if this role matches your background and
              goals.
            </p>

            {isJobSeeker ? (
              !showApplyForm ? (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isApplying || hasApplied}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60">
                  {hasApplied ? "Application submitted" : "Apply now"}
                </button>
              ) : (
                <form onSubmit={submitApplication} className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-secondary-accent/25 bg-secondary-accent/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-accent">
                      <Sparkles className="h-4 w-4" />
                      Standout application
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Add proof, availability, and a focused fit summary so recruiters can decide faster.
                    </p>
                  </div>

                  <label className="block space-y-2 text-sm text-slate-700">
                    <span className="font-medium">Resume (PDF or TXT)</span>
                  <input
                    type="file"
                    accept=".pdf,.txt" 
                    onChange={(ev) => handleFileChange(ev.target.files?.[0])}
                    disabled={isApplying || hasApplied}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                  </label>
                  {resumeFileName ? (
                    <p className="text-xs text-slate-500">Selected: {resumeFileName}</p>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-2 text-sm text-slate-700">
                      <span className="font-medium">Portfolio URL</span>
                      <input
                        value={portfolioUrl}
                        onChange={(ev) => setPortfolioUrl(ev.target.value)}
                        disabled={isApplying || hasApplied}
                        placeholder="https://..."
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-slate-700">
                      <span className="font-medium">LinkedIn URL</span>
                      <input
                        value={linkedinUrl}
                        onChange={(ev) => setLinkedinUrl(ev.target.value)}
                        disabled={isApplying || hasApplied}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-slate-700">
                      <span className="font-medium">Availability</span>
                      <input
                        value={availability}
                        onChange={(ev) => setAvailability(ev.target.value)}
                        disabled={isApplying || hasApplied}
                        placeholder="Immediate, 2 weeks"
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-slate-700">
                      <span className="font-medium">Expected salary</span>
                      <input
                        value={expectedSalary}
                        onChange={(ev) => setExpectedSalary(ev.target.value)}
                        disabled={isApplying || hasApplied}
                        placeholder="USD 2,000/month"
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2 text-sm text-slate-700">
                    <span className="font-medium">Skills that match this role</span>
                    <input
                      value={skillsMatch}
                      onChange={(ev) => setSkillsMatch(ev.target.value)}
                      disabled={isApplying || hasApplied}
                      placeholder="React, accessibility, API integration"
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="block space-y-2 text-sm text-slate-700">
                    <span className="font-medium">Why you fit the requirements</span>
                    <textarea
                      rows={4}
                      value={standoutAnswer}
                      onChange={(ev) => setStandoutAnswer(ev.target.value)}
                      disabled={isApplying || hasApplied}
                      placeholder="Connect your strongest recent work to the listed requirements."
                      className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <label className="block space-y-2 text-sm text-slate-700">
                    <span className="font-medium">Cover letter (optional)</span>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(ev) => setCoverLetter(ev.target.value)}
                    disabled={isApplying || hasApplied}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isApplying || hasApplied}
                      className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60">
                      {isApplying ? "Applying..." : "Submit application"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      disabled={isApplying}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                </form>
              )
            ) : null}

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent">
                Sign in to apply
              </Link>
            ) : null}

            {isAuthenticated && !isJobSeeker ? (
              <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                Recruiter accounts cannot apply to jobs. Switch to a job seeker
                account to submit applications.
              </p>
            ) : null}
          </aside>
        </div>
      ) : null}
    </PageShell>
  );
};
