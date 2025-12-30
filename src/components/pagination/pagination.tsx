import  { useCallback } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {  PaginationMeta } from "../../types/pagination";

interface PaginationProps{
  meta: PaginationMeta;
  setPage: (page: number) => void;
  isLoading?: boolean;
  itemLabel?: string; // e.g., "enquiries", "courses"
}

const Pagination = ({
  meta,
  setPage,
  isLoading = false,
  
}: PaginationProps) => {
  // Generate page numbers (e.g., show 5 pages at a time)
  const generatePageNumbers = useCallback(() => {
    if (!meta) return [];

    const { current_page, last_page } = meta;
    const pages = [];
    const showPages = 5;

    let start = Math.max(1, current_page - Math.floor(showPages / 2));
    const end = Math.min(last_page, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [meta]);

  // Handle page change with smooth scrolling
  const handlePageChange = useCallback(
  (newPage: number) => {
    if (meta && newPage >= 1 && newPage <= Number(meta.last_page)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  [meta, setPage]
);

  // Handle previous page
  const handlePrevPage = useCallback(() => {
    if (meta && meta.current_page > 1) {
      setPage(meta.current_page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [meta, setPage]);

  // Handle next page
  const handleNextPage = useCallback(() => {
    if (meta && meta.current_page < meta.last_page) {
      setPage(meta.current_page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [meta, setPage]);

  // Don't render pagination if there's only one page
 if (!meta || Number(meta.last_page) <= 1) {
  return null;
}


const showPrevious = Number(meta.current_page) > 1;
const showNext = Number(meta.current_page) < Number(meta.last_page);
console.log('Pagination meta:', meta);
console.log('showPrevious:', showPrevious);
console.log('showNext:', showNext);
console.log('Meta object:', meta);
console.log('Current page:', meta?.current_page);
console.log('Last page:', meta?.last_page);
console.log('Total:', meta?.total);
console.log('Should show pagination:', meta && Number(meta.last_page) > 1);
    return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        
      </div>
      <div className="flex items-center gap-2">
        {showPrevious && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
        )}
        <div className="flex gap-1">
          {generatePageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === meta.current_page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              disabled={isLoading}
            >
              {pageNum}
            </Button>
          ))}
        </div>
        {showNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Pagination;
