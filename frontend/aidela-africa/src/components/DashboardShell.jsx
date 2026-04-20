import { NavLink } from "react-router-dom";
import AppHeader from "./AppHeader";

const DashboardShell = ({
  eyebrow = "Dashboard",
  title,
  description,
  actions,
  navItems = [],
  children,
}) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_100%)]">
      <AppHeader />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start">
        {navItems.length > 0 ? (
          <aside className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur lg:sticky lg:top-24 lg:w-72">
            <nav className="flex gap-3 overflow-x-auto lg:flex-col">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        ) : null}

        <div className="min-w-0 flex-1">
          <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                  {eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                    {description}
                  </p>
                ) : null}
              </div>

              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
          </section>

          <section className="mt-6">{children}</section>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
