
"use client"

import { useMemo } from "react"

type UsePaginationProps = {
  currentPage: number
  totalPages: number
  paginationItemsToDisplay: number
}

export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay,
}: UsePaginationProps) {
  const pages = useMemo(() => {
    const pages = []

    if (totalPages <= paginationItemsToDisplay) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const half = Math.floor(paginationItemsToDisplay / 2)
      let start = currentPage - half
      let end = currentPage + half

      if (start <= 0) {
        start = 1
        end = paginationItemsToDisplay
      }

      if (end > totalPages) {
        end = totalPages
        start = totalPages - paginationItemsToDisplay + 1
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }, [currentPage, totalPages, paginationItemsToDisplay])

  const showLeftEllipsis = useMemo(() => {
    return pages[0] > 1
  }, [pages])

  const showRightEllipsis = useMemo(() => {
    return pages[pages.length - 1] < totalPages
  }, [pages, totalPages])

  return {
    pages,
    showLeftEllipsis,
    showRightEllipsis,
  }
}
