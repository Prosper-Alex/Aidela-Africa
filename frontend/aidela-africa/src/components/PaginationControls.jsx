// Key feature: Renders reusable pagination actions for list pages.
const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const adjustedStart = Math.max(1, endPage - 4);

  return Array.from(
    { length: endPage - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
};

const PaginationControls = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const visiblePages = buildVisiblePages(pagination.page, pagination.totalPages);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-900">{pagination.page}</span> of{" "}
        <span className="font-semibold text-slate-900">{pagination.totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPrevPage}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-secondary/30 hover:bg-secondary/5 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-45"
        >
          Prev
        </button>

        {visiblePages.map((pageNumber) => {
          const isActive = pageNumber === pagination.page;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-secondary text-white"
                  : "border border-slate-200 text-slate-700 hover:border-secondary hover:bg-secondary/5 hover:text-secondary"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-secondary/30 hover:bg-secondary/5 hover:text-secondary disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
