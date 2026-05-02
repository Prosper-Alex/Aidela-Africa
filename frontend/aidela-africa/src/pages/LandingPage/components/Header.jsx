// Key feature: Renders the landing page header navigation.
import React from "react";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const isAuthenticated = true;
  const user = { fullName: "Alex", role: "employer" };
  const employerPath =
    isAuthenticated && user.role === "employer"
      ? "/employer-dashboard"
      : "/login";
  const dashboardPath =
    user.role === "employer" ? "/employer-dashboard" : "/find-jobs";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 py-4 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6">
          <Link to="/" className="flex items-center gap-3 self-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 sm:text-xl">
              Aidela Africa
            </span>
          </Link>

          <nav className="hidden items-center justify-center gap-8 text-sm font-medium md:flex">
            <Link
              to="/find-jobs"
              className="text-gray-600 transition-colors hover:text-gray-900">
              Find Jobs
            </Link>
            <Link
              to={employerPath}
              className="text-gray-600 transition-colors hover:text-gray-900">
              For Employers
            </Link>
          </nav>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:justify-self-end">
            {isAuthenticated ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:gap-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user.fullName}
                </span>
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-accent">
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-accent">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
