function Pagination({
  products,
  pageSize,
  currentPage,
  setCurrentPage,
  pagination,
  onPageChange,
}) {
  const totalPage =
    pagination?.total_pages || Math.ceil(products.length / pageSize) || 0;
  const PageList = [];
  for (let i = 1; i <= totalPage; i++) {
    PageList.push(i);
  }
  return (
    <div>
      <nav>
        <ul className="pagination justify-content-center">
          {PageList.map((page) => (
            <li
              key={page}
              className={"page-item " + (page === currentPage ? "active" : "")}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => {
                  if (page !== currentPage) {
                    setCurrentPage(page);
                    if (onPageChange) {
                      onPageChange(page);
                    }
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                  }
                }}
              >
                {page}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Pagination;
