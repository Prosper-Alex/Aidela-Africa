import AppHeader from "./AppHeader";

const AppShell = ({
  eyebrow = "Aidela Africa",
  title,
  description,
  actions,
  children,
  maxWidth = "max-w-6xl",
  contentClassName = "space-y-6",
}) => {
  const hasHeader = Boolean(title || description || actions);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]">
      <AppHeader />

      <main className={`mx-auto w-full ${maxWidth} px-4 pb-16 pt-6 sm:pt-8`}>
        {hasHeader ? (
          <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.06),transparent_38%)]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {eyebrow ? (
                  <p className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                    {eyebrow}
                  </p>
                ) : null}

                {title ? (
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {title}
                  </h1>
                ) : null}

                {description ? (
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    {description}
                  </p>
                ) : null}
              </div>

              {actions ? <div className="shrink-0 self-start lg:self-auto">{actions}</div> : null}
            </div>
          </section>
        ) : null}

        <div className={`${hasHeader ? "mt-6 " : ""}${contentClassName}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
