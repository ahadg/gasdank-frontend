'use client'
import { useState, useEffect } from 'react'
import PageTitle from "@/components/PageTitle"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import { Card, CardHeader, CardFooter, CardTitle, Row, Col, Button } from "react-bootstrap"
import Link from 'next/link'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

export default function CategoriesPage() {
  // State to hold categories loaded from API and search text
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)

  // Load categories from API on component mount
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true)
      try {
        const response = await api.get(`/api/categories/${user?._id}`)
        // Assuming the API returns an array of categories
        setCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const searchLower = search.toLowerCase()

  // Filter categories by name or status
  const filteredCategories = categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(searchLower) ||
      (category.status && category.status.toLowerCase().includes(searchLower))
    )
  })

  return (
    <>
      {/* Page Title */}
      <PageTitle title="Categories" subTitle="Manage Categories" />

      <Row>
        <Col xs={12}>
          <Card>
            {/* Header with Title and ADD NEW Button */}
            <CardHeader className="d-flex align-items-center justify-content-between border-bottom border-light">
              <CardTitle as="h4" className="mb-0">
                Categories
              </CardTitle>
              <Link href={"/config/categories/add"}>
                <Button variant="success" className="bg-gradient">
                  <IconifyIcon icon="tabler:plus" className="me-1" />
                  ADD NEW
                </Button>
              </Link>
            </CardHeader>

            {/* Search Bar */}
            {/* <div className="px-3 py-3 d-flex justify-content-end">
              <div className="input-group" style={{ maxWidth: '200px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div> */}

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-nowrap mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Name</th>
                    <th>Active</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center">Loading...</td>
                    </tr>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <tr key={index}>
                        <td>{category.name}</td>
                        <td>{category.active == true ? "On" : "OFF"}</td>
                        <td>
                          <Link href={`/config/categories/edit/${category._id}`}>
                            <Button
                              variant="soft-success"
                              size="sm"
                              className="btn-icon rounded-circle me-1"
                            >
                              <IconifyIcon icon="tabler:edit" />
                            </Button>
                          </Link>
                          {/* <Button
                            variant="soft-danger"
                            size="sm"
                            className="btn-icon rounded-circle"
                          >
                            <IconifyIcon icon="tabler:trash" />
                          </Button> */}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center">No categories found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with pagination info */}
            {/* <CardFooter>
              <div className="d-flex justify-content-between">
                <div>
                  {`Showing ${filteredCategories.length} of ${categories.length} entries`}
                </div>
              
              </div>
            </CardFooter> */}
          </Card>
        </Col>
      </Row>
    </>
  )
}
