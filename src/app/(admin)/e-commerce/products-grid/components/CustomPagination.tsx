'use client'
import React from 'react'
import { Pagination } from 'react-bootstrap'

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomPagination = ({ currentPage, totalPages, onPageChange }: CustomPaginationProps) => {
  return (
    <Pagination className="mb-0">
      <Pagination.Item 
        className={currentPage === 1 ? "disabled" : ""}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
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
        Next
      </Pagination.Item>
    </Pagination>
  )
}

export default CustomPagination