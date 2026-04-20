const StatCard = ({ label, value, note, icon: Icon }) => {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default StatCard;
