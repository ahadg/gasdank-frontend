'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React from 'react'
import { Pagination } from 'react-bootstrap'

interface PaginationsProps {
  currentPage: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const Paginations: React.FC<PaginationsProps> = ({ currentPage, totalItems, limit, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return (
    <Pagination className="justify-content-center mb-0">
      <Pagination.Item 
        className={currentPage === 1 ? "disabled" : ""}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      >
        <IconifyIcon icon="tabler:chevrons-left" />
      </Pagination.Item>
      
      {[...Array(totalPages)].map((_, index) => (
        <Pagination.Item 
          key={index + 1}
          active={currentPage === index + 1}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </Pagination.Item>
      ))}
      
      <Pagination.Item 
        className={currentPage === totalPages ? "disabled" : ""}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
      >
        <IconifyIcon icon="tabler:chevrons-right" />
      </Pagination.Item>
    </Pagination>
  )
}

export default Paginations