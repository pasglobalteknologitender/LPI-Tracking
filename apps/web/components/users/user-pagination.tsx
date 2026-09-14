import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

interface Props {
  currentPage: number;
  totalPages: number;
  totalData: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function UserPagination({
  currentPage,
  totalPages,
  totalData,
  pageSize,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground flex-1">
        Page {currentPage} of {totalPages} / Showing{' '}
        {(currentPage - 1) * pageSize + 1} -{' '}
        {Math.min(currentPage * pageSize, totalData)} of {totalData} users
      </p>

      <Pagination className="flex-1 sm:!justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onChange(currentPage - 1);
              }}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onChange(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
