'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React from 'react'
import { Pagination } from 'react-bootstrap'

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomPagination = ({ currentPage, totalPages, onPageChange }: CustomPaginationProps) => {
  return (
    <Pagination className="mb-0 justify-content-center">
      <Pagination.Item 
        className={currentPage === 1 ? "disabled" : ""}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <IconifyIcon icon="tabler:chevrons-left" />
      </Pagination.Item>
      {[...Array(totalPages)].map((_, idx) => (
        <Pagination.Item
          key={idx + 1}
          className={currentPage === idx + 1 ? "active" : ""}
          onClick={() => onPageChange(idx + 1)}
        >
          {idx + 1}
        </Pagination.Item>
      ))}
      <Pagination.Item
        className={currentPage === totalPages ? "disabled" : ""}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <IconifyIcon icon="tabler:chevrons-right" />
      </Pagination.Item>
    </Pagination>
  )
}

export default CustomPagination