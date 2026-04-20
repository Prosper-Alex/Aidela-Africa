import AppHeader from "./AppHeader";

const PageShell = ({ title, description, actions, children }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_100%)]">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {title ? (
          <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
                  Aidela Africa
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
        ) : null}
        {children}
      </main>
    </div>
  );
};

export default PageShell;
