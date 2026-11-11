const getPageItems = (currentPage, totalPages) => {
  const pages = new Set([1, totalPages]);

  for (let page = Math.max(1, currentPage - 1); page <= Math.min(totalPages, currentPage + 1); page += 1) {
    pages.add(page);
  }

  const sortedPages = [...pages].sort((first, second) => first - second);
  const items = [];
  let previousPage = 0;

  sortedPages.forEach((page) => {
    if (page - previousPage === 2) {
      items.push(previousPage + 1);
    } else if (page - previousPage > 2) {
      items.push('ellipsis');
    }
    items.push(page);
    previousPage = page;
  });

  return items;
};

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;
  const pageItems = getPageItems(page, totalPages);

  return (
    <nav className="pagination-controls" aria-label="Property result pages">
      <button
        type="button"
        className="pagination-direction"
        aria-label="Go to previous page"
        disabled={!hasPrevPage}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <div className="pagination-pages">
        {pageItems.map((item, index) => (
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis" aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`pagination-page${item === page ? ' active' : ''}`}
              aria-label={`Go to page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        ))}
      </div>
      <button
        type="button"
        className="pagination-direction"
        aria-label="Go to next page"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
