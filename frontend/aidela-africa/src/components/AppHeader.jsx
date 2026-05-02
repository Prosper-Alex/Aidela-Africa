// Key feature: Renders the responsive navigation header and account menus.
import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  UserCircle2,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const matchesPath = (pathname, matcher) => {
  if (typeof matcher === "function") {
    return matcher(pathname);
  }

  return pathname === matcher;
};

const desktopLinkClass = (isActive) =>
  `relative inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-slate-50 text-secondary ring-1 ring-slate-200"
      : "text-slate-600 hover:bg-slate-50 hover:text-secondary"
  }`;

const mobileLinkClass = (isActive) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? "bg-secondary text-white"
      : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
  }`;

const AppHeader = () => {
  const { isAuthenticated, isRecruiter, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const mobileOpenRef = useRef(false);
  const profileOpenRef = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Keep refs in sync with state so the navigation effect can read latest values
  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    profileOpenRef.current = profileOpen;
  }, [profileOpen]);

  // Close menus when the route changes. Read current open state from refs
  // and defer setState to avoid synchronous updates inside the effect.
  useEffect(() => {
    if (!mobileOpenRef.current && !profileOpenRef.current) return;

    const id = setTimeout(() => {
      setMobileOpen(false);
      setProfileOpen(false);
    }, 0);

    return () => clearTimeout(id);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    navigate("/");
  };

  const primaryLinks = isAuthenticated
    ? isRecruiter
      ? [
          {
            to: "/employer-dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            match: "/employer-dashboard",
          },
          {
            to: "/post-job",
            label: "Post Job",
            icon: PlusCircle,
            match: "/post-job",
          },
        ]
      : [
          {
            to: "/find-jobs",
            label: "Jobs",
            icon: BriefcaseBusiness,
            match: (pathname) =>
              pathname === "/find-jobs" || pathname.startsWith("/job/"),
          },
          {
            to: "/my-applications",
            label: "Applications",
            icon: ClipboardList,
            match: (pathname) =>
              pathname === "/my-applications" || pathname === "/saved-jobs",
          },
        ]
    : [
        {
          to: "/find-jobs",
          label: "Jobs",
          icon: BriefcaseBusiness,
          match: (pathname) =>
            pathname === "/find-jobs" || pathname.startsWith("/job/"),
        },
      ];

  const profileMenuItems = isAuthenticated
    ? isRecruiter
      ? [
          {
            to: "/company-profile",
            label: "Profile",
            icon: UserCircle2,
            match: "/company-profile",
          },
          {
            to: "/manage-jobs",
            label: "Manage Jobs",
            icon: Settings,
            match: "/manage-jobs",
          },
          {
            to: "/applicants",
            label: "Applicants",
            icon: ClipboardList,
            match: "/applicants",
          },
        ]
      : [
          {
            to: "/profile",
            label: "Profile",
            icon: UserCircle2,
            match: "/profile",
          },
        ]
    : [];

  const secondaryMenuItems = profileMenuItems.filter(
    (item) => !primaryLinks.some((link) => link.to === item.to),
  );

  const renderLink = (link, mobile = false) => {
    const Icon = link.icon;
    const isActive = matchesPath(location.pathname, link.match);

    return (
      <Link
        key={link.to}
        to={link.to}
        className={
          mobile ? mobileLinkClass(isActive) : desktopLinkClass(isActive)
        }>
        {mobile && Icon ? <Icon className="h-4 w-4" /> : null}
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm md:h-15 md:w-15 md:rounded-[1.45rem] md:p-2">
            <img
              src="/favicon.jpeg"
              alt="Aidela Africa"
              className="h-full w-full rounded-xl object-cover md:rounded-2xl"
            />
          </div>
          <div>
            <p className="text-base font-bold text-slate-950 sm:text-lg">
              Aidela Africa
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Careers and hiring platform
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <nav className="hidden md:block" aria-label="Primary navigation">
            <ul className="flex list-none items-center gap-1 rounded-full border border-slate-200 bg-white p-1 pl-0">
              {primaryLinks.map((link) => (
                <li key={link.to}>{renderLink(link)}</li>
              ))}
            </ul>
          </nav>

          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-secondary hover:bg-secondary/5 hover:text-secondary">
                <UserCircle2 className="h-5 w-5" />
                <span className="hidden md:block">
                  {user?.name?.split(" ")[0] || "Profile"}
                </span>
              </button>

              {profileOpen ? (
                <div className="absolute right-0 z-60 mt-3 w-60 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-950">
                      {user?.name || "Account"}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {user?.role || "member"}
                    </p>
                  </div>

                  <div className="p-2">
                    {secondaryMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = matchesPath(
                        location.pathname,
                        item.match,
                      );

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setProfileOpen(false)}
                          className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                            isActive
                              ? "bg-secondary text-white"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}>
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <ul className="flex list-none items-center gap-1 rounded-full border border-slate-200 bg-white p-1 pl-0">
                <li>
                  <Link
                    to="/login"
                    className={desktopLinkClass(
                      location.pathname === "/login",
                    )}>
                    Login
                  </Link>
                </li>
              </ul>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-accent">
                <UserPlus className="h-4 w-4" />
                Signup
              </Link>
            </div>
          )}

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-secondary hover:bg-secondary/5 hover:text-secondary md:hidden"
              aria-label="Login">
              <LogIn className="h-4 w-4" />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-secondary hover:bg-secondary/5 hover:text-secondary md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu">
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`grid border-t border-slate-200/70 transition-[grid-template-rows,opacity] duration-200 ease-out md:hidden ${
          mobileOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}>
        <div className="overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 pb-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-sm">
              {isAuthenticated ? (
                <div className="border-b border-slate-100 px-3 pb-3 pt-1">
                  <p className="text-sm font-semibold text-slate-950">
                    {user?.name || "Signed in"}
                  </p>
                  <p className="text-xs capitalize text-slate-500">
                    {user?.role || "member"}
                  </p>
                </div>
              ) : null}

              <ul className="mt-2 list-none space-y-1 rounded-[1.35rem] bg-slate-50 p-1 pl-0">
                {primaryLinks.map((link) => (
                  <li key={link.to}>{renderLink(link, true)}</li>
                ))}

                {(isAuthenticated
                  ? secondaryMenuItems
                  : [
                      {
                        to: "/login",
                        label: "Login",
                        icon: LogIn,
                        match: "/login",
                      },
                      {
                        to: "/signup",
                        label: "Signup",
                        icon: UserPlus,
                        match: "/signup",
                      },
                    ]
                ).map((item) => (
                  <li key={item.to}>{renderLink(item, true)}</li>
                ))}
              </ul>

              {isAuthenticated ? (
                <div className="mt-2 border-t border-slate-100 px-1 pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
