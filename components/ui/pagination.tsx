import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  // Generate page numbers to display
  const generatePagination = () => {
    // Always show first and last page
    const firstPage = 1
    const lastPage = totalPages

    // Calculate range of pages to show around current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage)

    // Determine if we need to show ellipses
    const shouldShowLeftDots = leftSiblingIndex > firstPage + 1
    const shouldShowRightDots = rightSiblingIndex < lastPage - 1

    // Generate the array of page numbers to display
    const pageNumbers = []

    // Always add first page
    if (totalPages > 0) {
      pageNumbers.push(firstPage)
    }

    // Add left ellipsis if needed
    if (shouldShowLeftDots) {
      pageNumbers.push(-1) // Use -1 to represent ellipsis
    }

    // Add pages around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== firstPage && i !== lastPage) {
        pageNumbers.push(i)
      }
    }

    // Add right ellipsis if needed
    if (shouldShowRightDots) {
      pageNumbers.push(-2) // Use -2 to represent ellipsis
    }

    // Always add last page if it's different from first page
    if (lastPage > firstPage) {
      pageNumbers.push(lastPage)
    }

    return pageNumbers
  }

  const pageNumbers = generatePagination()

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Page</span>
      </Button>

      {pageNumbers.map((pageNumber, i) => {
        // Render ellipsis
        if (pageNumber < 0) {
          return (
            <Button
              key={`ellipsis-${i}`}
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More Pages</span>
            </Button>
          )
        }

        // Render page number
        return (
          <Button
            key={pageNumber}
            variant={pageNumber === currentPage ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-8 w-8",
              pageNumber === currentPage
                ? "bg-cyan-500 text-black hover:bg-cyan-600"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white",
            )}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
            <span className="sr-only">Page {pageNumber}</span>
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Page</span>
      </Button>
    </div>
  )
}

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & React.ComponentProps<"a">

const PaginationLink = ({ className, isActive, ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      isActive ? "font-semibold" : "text-muted-foreground",
      "flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&:not(:disabled)]:focus:ring-2 [&:not(:disabled)]:ring-ring [&:not(:disabled)]:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to previous page" className={cn("gap-1.5", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to next page" className={cn("gap-1.5", className)} {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious }

