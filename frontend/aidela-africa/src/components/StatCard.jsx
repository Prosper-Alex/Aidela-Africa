const StatCard = ({ label, value, note, icon: Icon }) => {
  return (
    <article className="relative h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(41,171,226,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(237,30,121,0.08),transparent_34%)]" />
      <div className="flex items-start justify-between gap-4">
        <div className="relative">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
        </div>
        {Icon ? (
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-accent/15 text-primary-accent">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default StatCard;
