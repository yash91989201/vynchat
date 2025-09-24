import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type PaginationWindowProps = {
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  basePath: string; // e.g. '/dashboard/exams'
  search?: Record<string, string | boolean | undefined>;
  maxItems?: number; // default 5
};

/**
 * Reusable pagination window component that shows up to `maxItems` page buttons,
 * centering the current page when possible. Uses the project's Pagination UI.
 */
export const PaginationWindow: FC<PaginationWindowProps> = ({
  page,
  limit,
  totalPages,
  basePath,
  maxItems = 5,
  // keeping next/prev flags to allow callers to control button disabled state
  hasNextPage = true,
  hasPreviousPage = true,
  search,
}) => {
  const pages: number[] = [];

  if (totalPages <= maxItems) {
    for (let p = 1; p <= totalPages; p++) pages.push(p);
  } else {
    const half = Math.floor(maxItems / 2);
    let start = Math.max(1, page - half);
    let end = start + maxItems - 1;

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxItems + 1;
    }

    for (let p = start; p <= end; p++) pages.push(p);
  }

  const showLeftEllipsis = pages.length && pages[0] > 1;
  const showRightEllipsis = pages.length && pages.at(-1) < totalPages;

  return (
    <Pagination className="mx-0 w-fit justify-end">
      <PaginationContent>
        <PaginationItem>
          <Link
            aria-disabled={!hasPreviousPage}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              !hasPreviousPage && "pointer-events-none opacity-50"
            )}
            search={{ page: Math.max(1, page - 1), limit, ...search }}
            tabIndex={hasPreviousPage ? 0 : -1}
            to={basePath}
          >
            ‹
          </Link>
        </PaginationItem>

        {showLeftEllipsis && (
          <>
            <PaginationItem key="first">
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" })
                )}
                search={{ page: 1, limit, ...search }}
                to={basePath}
              >
                1
              </Link>
            </PaginationItem>
            <PaginationEllipsis />
          </>
        )}

        {pages.map((pageNum) => (
          <PaginationItem key={pageNum}>
            <Link
              aria-current={page === pageNum ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                page === pageNum &&
                  "bg-accent font-bold text-accent-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              search={{ page: pageNum, limit, ...search }}
              to={basePath}
            >
              {pageNum}
            </Link>
          </PaginationItem>
        ))}

        {showRightEllipsis && (
          <>
            <PaginationEllipsis />
            <PaginationItem key="last">
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" })
                )}
                search={{ page: totalPages, limit, ...search }}
                to={basePath}
              >
                {totalPages}
              </Link>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <Link
            aria-disabled={!hasNextPage}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              !hasNextPage && "pointer-events-none opacity-50"
            )}
            search={{ page: Math.min(totalPages, page + 1), limit, ...search }}
            tabIndex={hasNextPage ? 0 : -1}
            to={basePath}
          >
            ›
          </Link>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
