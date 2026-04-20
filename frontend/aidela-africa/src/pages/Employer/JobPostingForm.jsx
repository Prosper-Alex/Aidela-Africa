import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import { ErrorPanel, SectionLoader } from "../../components/Feedback";
import { createJob, getJobById, updateJob } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const recruiterNav = [
  { to: "/employer-dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/post-job", label: "Post a job", icon: PlusCircle },
  { to: "/manage-jobs", label: "Manage jobs", icon: BriefcaseBusiness },
  { to: "/applicants", label: "Applicants", icon: ClipboardList },
];

const initialForm = {
  title: "",
  company: "",
  location: "",
  salary: "",
  jobType: "full-time",
  description: "",
  requirements: "",
};

export const JobPostingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get("jobId");
  const isEditMode = Boolean(jobId);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadJob = async () => {
      if (!jobId) {
        setIsLoading(false);
        return;
      }

      try {
        const job = await getJobById(jobId);

        if (!isMounted) {
          return;
        }

        setForm({
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
          salary: job.salary || "",
          jobType: job.jobType || "full-time",
          description: job.description || "",
          requirements: job.requirements?.join("\n") || "",
        });
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError, "Unable to load the selected job."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const payload = {
      ...form,
      requirements: form.requirements
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (isEditMode) {
        await updateJob(jobId, payload);
        toast.success("Job updated successfully.");
      } else {
        await createJob(payload);
        toast.success("Job created successfully.");
      }

      navigate("/manage-jobs");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to save the job."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell
      eyebrow={isEditMode ? "Edit listing" : "Create listing"}
      title={isEditMode ? "Refine your job post" : "Publish a new opportunity"}
      description="Use a structured form so candidates can quickly understand the role and recruiters can maintain a consistent standard."
      navItems={recruiterNav}
    >
      {isLoading ? <SectionLoader label="Loading job editor..." /> : null}

      {!isLoading ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {error ? <div className="mb-5"><ErrorPanel message={error} /></div> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Job title</span>
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Company</span>
              <input
                type="text"
                required
                value={form.company}
                onChange={(event) => handleChange("company", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Location</span>
              <input
                type="text"
                required
                value={form.location}
                onChange={(event) => handleChange("location", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Salary</span>
              <input
                type="text"
                value={form.salary}
                onChange={(event) => handleChange("salary", event.target.value)}
                placeholder="e.g. ₦500,000 monthly"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-[0.4fr_1.6fr]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Job type</span>
              <select
                value={form.jobType}
                onChange={(event) => handleChange("jobType", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="remote">Remote</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Requirements</span>
              <textarea
                rows={5}
                value={form.requirements}
                onChange={(event) => handleChange("requirements", event.target.value)}
                placeholder="One requirement per line"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              rows={8}
              required
              value={form.description}
              onChange={(event) => handleChange("description", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Publishing..."
                : isEditMode
                  ? "Update job"
                  : "Publish job"}
            </button>
          </div>
        </form>
      ) : null}
    </DashboardShell>
  );
};
