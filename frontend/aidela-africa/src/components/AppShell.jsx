// Key feature: Provides the shared app layout with header and content regions.
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
    <div className="min-h-screen app-bg">
      <AppHeader />

      <main
        className={`mx-auto w-full ${maxWidth} px-3 pb-14 pt-5 sm:px-5 sm:pt-7 lg:px-6`}
      >
        {hasHeader ? (
          <section className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-5 shadow-sm sm:p-7">

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {eyebrow ? (
                  <p className="inline-flex items-center rounded-full border border-secondary/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
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

        <div className={`${hasHeader ? "mt-5 " : ""}${contentClassName}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
