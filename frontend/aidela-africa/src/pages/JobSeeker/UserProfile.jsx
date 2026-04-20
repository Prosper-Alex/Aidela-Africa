import { BriefcaseBusiness, ClipboardList, Sparkles, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import { ErrorPanel, SectionLoader } from "../../components/Feedback";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { getMyApplications } from "../../services/applicationService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const jobSeekerNav = [
  { to: "/my-applications", label: "My applications", icon: ClipboardList },
  { to: "/find-jobs", label: "Find jobs", icon: BriefcaseBusiness },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

export const UserProfile = () => {
  const { user } = useAuth();
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

        setApplicationStats({
          total: data.applications.length,
          accepted: data.applications.filter((item) => item.status === "accepted").length,
          pending: data.applications.filter((item) => item.status === "pending").length,
        });
      } catch (requestError) {
        if (isMounted) {
          setError(
            getErrorMessage(requestError, "Unable to load your profile insights."),
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

  return (
    <DashboardShell
      eyebrow="Candidate profile"
      title={user?.name || "Your profile"}
      description="Keep an eye on your candidate activity and understand how your job search is progressing."
      navItems={jobSeekerNav}
    >
      {error ? <ErrorPanel message={error} /> : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
            Account details
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            Candidate identity
          </h2>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="mt-2 font-semibold text-slate-900">{user?.name}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-2 font-semibold text-slate-900">{user?.email}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <dt className="text-slate-500">Role</dt>
              <dd className="mt-2 font-semibold capitalize text-slate-900">
                {user?.role}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          {isLoading ? <SectionLoader label="Loading profile insights..." /> : null}

          {!isLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
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

              <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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
