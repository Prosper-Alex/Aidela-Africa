import {
  BriefcaseBusiness,
  ClipboardList,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import { ErrorPanel, SectionLoader } from "../../components/Feedback";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { getMyApplications } from "../../services/applicationService";
import { updateCurrentUser } from "../../services/authService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const getCandidateForm = (user) => ({
  name: user?.name || "",
  headline: user?.candidateProfile?.headline || "",
  bio: user?.candidateProfile?.bio || "",
  techStack: Array.isArray(user?.candidateProfile?.techStack)
    ? user.candidateProfile.techStack.join(", ")
    : "",
  yearsOfExperience:
    user?.candidateProfile?.yearsOfExperience ?? "",
  portfolioUrl: user?.candidateProfile?.portfolioUrl || "",
  linkedinUrl: user?.candidateProfile?.linkedinUrl || "",
  location: user?.candidateProfile?.location || "",
  availability: user?.candidateProfile?.availability || "",
});

export const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(() => getCandidateForm(user));
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(getCandidateForm(user));
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getMyApplications({ limit: 50 });

        if (!isMounted) {
          return;
        }

        const applications = Array.isArray(data?.applications)
          ? data.applications
          : [];

        setApplicationStats({
          total: applications.length,
          accepted: applications.filter((item) => item.status === "accepted").length,
          pending: applications.filter((item) => item.status === "pending").length,
        });
      } catch (requestError) {
        if (isMounted) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load your profile insights.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

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
        candidateProfile: {
          headline: form.headline,
          bio: form.bio,
          techStack: form.techStack,
          yearsOfExperience: form.yearsOfExperience,
          portfolioUrl: form.portfolioUrl,
          linkedinUrl: form.linkedinUrl,
          location: form.location,
          availability: form.availability,
        },
      });

      updateUser(data.user);
      toast.success("Candidate profile updated.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update your profile."));
    } finally {
      setIsSaving(false);
    }
  };

  const verification = user?.verification || { completed: 0, total: 6, missing: [] };
  const isVerified = Boolean(verification.isVerified);

  return (
    <DashboardShell
      eyebrow="Candidate profile"
      title={user?.name || "Your profile"}
      description="Build a richer candidate identity with a bio, tech stack, links, and a blue verification tick once the key profile fields are complete."
      actions={
        <Link
          to="/my-applications"
          className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent"
        >
          View applications
        </Link>
      }
    >
      {error ? <ErrorPanel message={error} /> : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Candidate identity
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {user?.name || "Your profile"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                isVerified
                  ? "bg-secondary-accent/15 text-primary-accent"
                  : "bg-slate-100 text-slate-600"
              }`}>
              <ShieldCheck className="h-4 w-4" />
              {isVerified ? "Verified" : `${verification.completed}/${verification.total}`}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-secondary-accent/25 bg-secondary-accent/10 px-4 py-4 text-sm leading-6 text-slate-700">
            Complete the highlighted fields to activate the blue tick. Missing:
            {" "}
            {verification.missing?.length ? verification.missing.join(", ") : "none"}.
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Professional headline</span>
              <input
                value={form.headline}
                onChange={(event) => handleChange("headline", event.target.value)}
                placeholder="Frontend engineer building fintech products"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Bio</span>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(event) => handleChange("bio", event.target.value)}
                placeholder="Short story, strengths, industries, and what you want next."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Tech stack</span>
                <input
                  value={form.techStack}
                  onChange={(event) => handleChange("techStack", event.target.value)}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Years of experience</span>
                <input
                  type="number"
                  min="0"
                  value={form.yearsOfExperience}
                  onChange={(event) => handleChange("yearsOfExperience", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Portfolio URL</span>
                <input
                  value={form.portfolioUrl}
                  onChange={(event) => handleChange("portfolioUrl", event.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">LinkedIn URL</span>
                <input
                  value={form.linkedinUrl}
                  onChange={(event) => handleChange("linkedinUrl", event.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Location</span>
                <input
                  value={form.location}
                  onChange={(event) => handleChange("location", event.target.value)}
                  placeholder="Lagos, Nigeria"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Availability</span>
                <input
                  value={form.availability}
                  onChange={(event) => handleChange("availability", event.target.value)}
                  placeholder="Immediate, 2 weeks, contract only"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accent disabled:cursor-not-allowed disabled:opacity-60">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          {isLoading ? <SectionLoader label="Loading profile insights..." /> : null}

          {!isLoading ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  label="Applications"
                  value={applicationStats.total}
                  note="All submitted roles"
                  icon={ClipboardList}
                />
                <StatCard
                  label="Pending"
                  value={applicationStats.pending}
                  note="Still under review"
                  icon={Sparkles}
                />
                <StatCard
                  label="Accepted"
                  value={applicationStats.accepted}
                  note="Positive outcomes"
                  icon={BriefcaseBusiness}
                />
              </div>

              <article className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <h3 className="text-xl font-semibold text-slate-950">
                  Candidate experience tips
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  <li>Keep applying to roles that closely match your profile.</li>
                  <li>Review pending applications regularly and follow up when needed.</li>
                  <li>Use clear, tailored resumes when applying to new opportunities.</li>
                </ul>
              </article>
            </>
          ) : null}
        </section>
      </div>
    </DashboardShell>
  );
};
