'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, CardFooter, CardHeader, CardTitle, Row, Col, Form } from 'react-bootstrap'
import Link from 'next/link'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'

//export const metadata: Metadata = { title: 'Out of Stock Products' }

export default function OutOfStockProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotificationContext()

  // Load out-of-stock products from API
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const response = await api.get('/api/inventory/outOfStock')
        // Assuming the API returns an array of products.
        setProducts(response.data)
      } catch (error) {
        showNotification({ message: error?.response?.data?.error || 'Error fetching out-of-stock products', variant: 'danger' })
        console.error("Error fetching out-of-stock products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const searchLower = search.toLowerCase()
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchLower)
  )

  return (
    <>
      <PageTitle title="Out of Stock Products" subTitle="Inventory" />

      <Row>
        <Col xs={12}>
          <Card>
            {/* <CardHeader className="d-flex align-items-center justify-content-between border-bottom border-light">
              <CardTitle as="h4" className="mb-0">
                Out of Stock Products
              </CardTitle>
              <Link href={"/inventory/products/add"}>
                <Button variant="success" className="bg-gradient">
                  <IconifyIcon icon="tabler:plus" className="me-1" />
                  ADD NEW
                </Button>
              </Link>
            </CardHeader> */}

            {/* Search Bar */}
            <div className="px-3 py-3 d-flex justify-content-start">
              <div className="input-group" style={{ maxWidth: '200px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-nowrap mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>STOCK</th>
                    <th>PRICE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center">Loading...</td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product, idx) => (
                      <tr key={idx}>
                        <td>{product.name}</td>
                        <td>{product.category?.name}</td>
                        <td>{product.qty}</td>
                        <td>${product.price?.toFixed(2)}</td>
                        <td>
                          <Link href={`/inventory/products/edit/${product._id}`}>
                            <Button
                              variant="soft-success"
                              size="sm"
                              className="btn-icon rounded-circle me-1"
                            >
                              <IconifyIcon icon="tabler:edit" className="fs-16" />
                            </Button>
                          </Link>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            className="btn-icon rounded-circle"
                          >
                            <IconifyIcon icon="tabler:trash" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">No out-of-stock products found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with pagination info */}
            <CardFooter>
              <div className="d-flex justify-content-between">
                <div>{`Showing ${filteredProducts.length} of ${products.length} entries`}</div>
                {/* Optionally add pagination component here */}
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}
