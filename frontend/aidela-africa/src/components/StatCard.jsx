const StatCard = ({ label, value, note, icon: Icon }) => {
  return (
    <article className="relative h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_30%)]" />
      <div className="flex items-start justify-between gap-4">
        <div className="relative">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
        </div>
        {Icon ? (
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default StatCard;
