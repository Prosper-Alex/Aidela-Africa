// Key feature: Renders and updates the recruiter company profile.
import { BriefcaseBusiness, Save, ShieldCheck, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import { ErrorPanel, SectionLoader } from "../../components/Feedback";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { updateCurrentUser } from "../../services/authService";
import { getRecruiterJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const getCompanyForm = (user) => ({
  name: user?.name || "",
  companyName: user?.companyProfile?.companyName || "",
  companyLogo: user?.companyProfile?.companyLogo || "",
  bio: user?.companyProfile?.bio || "",
  employeeCount: user?.companyProfile?.employeeCount ?? "",
  foundedYear: user?.companyProfile?.foundedYear ?? "",
  foundedBy: user?.companyProfile?.foundedBy || "",
  websiteUrl: user?.companyProfile?.websiteUrl || "",
  headquarters: user?.companyProfile?.headquarters || "",
});

export const EmployerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(() => getCompanyForm(user));
  const [jobCount, setJobCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(getCompanyForm(user));
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadJobCount = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getRecruiterJobs(user?._id, { limit: 100 });

        if (isMounted) {
          setJobCount(Array.isArray(data?.jobs) ? data.jobs.length : 0);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load recruiter profile insights.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user?._id) {
      loadJobCount();
    }

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  const handleChange = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const data = await updateCurrentUser({
        name: form.name,
        companyProfile: {
          companyName: form.companyName,
          companyLogo: form.companyLogo,
          bio: form.bio,
          employeeCount: form.employeeCount,
          foundedYear: form.foundedYear,
          foundedBy: form.foundedBy,
          websiteUrl: form.websiteUrl,
          headquarters: form.headquarters,
        },
      });

      updateUser(data.user);
      toast.success("Company profile updated.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update company profile."));
    } finally {
      setIsSaving(false);
    }
  };

  const verification = user?.verification || { completed: 0, total: 6, missing: [] };
  const isVerified = Boolean(verification.isVerified);

  return (
    <DashboardShell
      eyebrow="Recruiter profile"
      title={user?.name || "Recruiter profile"}
      description="Show candidates who is hiring with a richer company profile, logo, founding details, and a blue tick when key details are complete."
      actions={
        <Link
          to="/manage-jobs"
          className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
        >
          Manage jobs
        </Link>
      }
    >
      {error ? <ErrorPanel message={error} /> : null}
      {isLoading ? <SectionLoader label="Loading recruiter profile..." /> : null}

      {!isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {form.companyLogo ? (
                  <img
                    src={form.companyLogo}
                    alt=""
                    className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <BriefcaseBusiness className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">
                    {form.companyName || user?.name || "Company profile"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  isVerified
                    ? "bg-secondary/10 text-secondary"
                    : "bg-slate-100 text-slate-600"
                }`}>
                <ShieldCheck className="h-4 w-4" />
                {isVerified ? "Verified" : `${verification.completed}/${verification.total}`}
              </span>
            </div>

            <div className="mt-6 rounded-lg border border-secondary/20 bg-secondary/5 px-4 py-4 text-sm leading-6 text-slate-700">
              Complete the core company fields to activate the blue tick.
              Missing: {verification.missing?.length ? verification.missing.join(", ") : "none"}.
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Recruiter name</span>
                  <input
                    value={form.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Company name</span>
                  <input
                    value={form.companyName}
                    onChange={(event) => handleChange("companyName", event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Company logo URL</span>
                  <input
                    value={form.companyLogo}
                    onChange={(event) => handleChange("companyLogo", event.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Company bio</span>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(event) => handleChange("bio", event.target.value)}
                    placeholder="What you build, who you serve, and why candidates should care."
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Active employees</span>
                  <input
                    type="number"
                    min="0"
                    value={form.employeeCount}
                    onChange={(event) => handleChange("employeeCount", event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Founded year</span>
                  <input
                    type="number"
                    min="1800"
                    value={form.foundedYear}
                    onChange={(event) => handleChange("foundedYear", event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Founded by</span>
                  <input
                    value={form.foundedBy}
                    onChange={(event) => handleChange("foundedBy", event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Headquarters</span>
                  <input
                    value={form.headquarters}
                    onChange={(event) => handleChange("headquarters", event.target.value)}
                    placeholder="Lagos, Nigeria"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Website URL</span>
                  <input
                    value={form.websiteUrl}
                    onChange={(event) => handleChange("websiteUrl", event.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save company profile"}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Published jobs"
                value={jobCount}
                note="Total recruiter-owned roles"
                icon={BriefcaseBusiness}
              />
              <StatCard
                label="Workspace"
                value="Recruiter"
                note="Your active product mode"
                icon={UserCircle2}
              />
            </div>

            <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">
                Hiring workflow reminders
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>Keep descriptions clear and candidate-facing.</li>
                <li>Review applicants frequently to reduce decision lag.</li>
                <li>Use status updates to keep your pipeline transparent.</li>
              </ul>
            </article>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
};
