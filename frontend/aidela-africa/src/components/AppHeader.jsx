import {
  BriefcaseBusiness,
  LayoutDashboard,
  LogIn,
  LogOut,
  PlusCircle,
  UserCircle2,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const linkClassName = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-sky-100 text-sky-800"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }`;

const AppHeader = () => {
  const { isAuthenticated, isJobSeeker, isRecruiter, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    navigate("/");
  };

  const dashboardPath = isRecruiter ? "/employer-dashboard" : "/find-jobs";
  const profilePath = isRecruiter ? "/company-profile" : "/profile";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950">Aidela Africa</p>
              <p className="text-xs text-slate-500">Careers and hiring platform</p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={linkClassName}>
            Home
          </NavLink>
          <NavLink to="/find-jobs" className={linkClassName}>
            Find jobs
          </NavLink>

          {isJobSeeker ? (
            <NavLink to="/my-applications" className={linkClassName}>
              My applications
            </NavLink>
          ) : null}

          {isRecruiter ? (
            <>
              <NavLink to="/post-job" className={linkClassName}>
                Post a job
              </NavLink>
              <NavLink to="/manage-jobs" className={linkClassName}>
                Manage jobs
              </NavLink>
              <NavLink to="/applicants" className={linkClassName}>
                Applicants
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:block">
                Signed in as{" "}
                <span className="font-semibold text-slate-900">{user?.name}</span>
              </span>
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to={profilePath}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
              >
                <UserCircle2 className="h-4 w-4" />
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <PlusCircle className="h-4 w-4" />
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
