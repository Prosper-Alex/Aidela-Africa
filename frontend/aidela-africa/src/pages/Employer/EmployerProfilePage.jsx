import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  UserCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import { ErrorPanel, SectionLoader } from "../../components/Feedback";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { getRecruiterJobs } from "../../services/jobService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const recruiterNav = [
  { to: "/employer-dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/post-job", label: "Post a job", icon: PlusCircle },
  { to: "/manage-jobs", label: "Manage jobs", icon: BriefcaseBusiness },
  { to: "/applicants", label: "Applicants", icon: ClipboardList },
];

export const EmployerProfilePage = () => {
  const { user } = useAuth();
  const [jobCount, setJobCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadJobCount = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getRecruiterJobs(user?._id, { limit: 100 });

        if (isMounted) {
          setJobCount(data.jobs.length);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            getErrorMessage(requestError, "Unable to load recruiter profile insights."),
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

  return (
    <DashboardShell
      eyebrow="Recruiter profile"
      title={user?.name || "Recruiter profile"}
      description="A concise overview of your recruiter identity and activity across the platform."
      navItems={recruiterNav}
    >
      {error ? <ErrorPanel message={error} /> : null}
      {isLoading ? <SectionLoader label="Loading recruiter profile..." /> : null}

      {!isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Account details</h2>
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
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                label="Published jobs"
                value={jobCount}
                note="Total recruiter-owned roles"
                icon={BriefcaseBusiness}
              />
              <StatCard
                label="Account role"
                value="Recruiter"
                note="Your active workspace mode"
                icon={UserCircle2}
              />
            </div>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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
