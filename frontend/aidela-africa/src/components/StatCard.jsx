// Key feature: Displays dashboard metrics in a compact reusable card.
const StatCard = ({ label, value, note, icon: Icon }) => {
  return (
    <article className="relative h-full overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="relative">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
        </div>
        {Icon ? (
          <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default StatCard;
