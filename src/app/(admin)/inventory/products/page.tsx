'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, CardFooter, CardHeader, CardTitle, Row, Col, Form } from 'react-bootstrap'
import Link from 'next/link'
import api from '@/utils/axiosInstance'

import CustomPagination from '@/app/(admin)/e-commerce/products-grid/components/CustomPagination'
import { useAuthStore } from '@/store/authStore'

//export const metadata: Metadata = { title: 'Products' }

const ProductsPage = () => {
  const user = useAuthStore((state) => state.user)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  const [totalPages, setTotalPages] = useState(1)

  // Fetch products for the current user using Axios with pagination
  async function fetchProducts() {
    setLoading(true)
    try {
      const response = await api.get(`/api/inventory/${user?._id}?page=${page}&limit=${limit}`)
      // Expect API to return { products: [...], total: number }
      setProducts(response.data.products)
      setTotalPages(Math.ceil(response.data.totalProducts / limit))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?._id) {
      fetchProducts()
    }
  }, [user?._id, page])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const searchLower = search.toLowerCase()
  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchLower)
  )

  return (
    <>
      <PageTitle title="Products" subTitle="Inventory" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader className="d-flex align-items-center justify-content-between border-bottom border-light">
              <div className="px-3 py-3 d-flex justify-content-start">
                <div className="input-group" style={{ maxWidth: '300px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search"
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <CardTitle as="h4">Manage Products</CardTitle>
              <div>
                <Link href="/inventory/products/add" className="btn btn-success bg-gradient">
                  <IconifyIcon icon="tabler:plus" className="me-1" /> Add Product
                </Link>
              </div>
            </CardHeader>
            <div className="table-responsive">
              <table className="table table-nowrap mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Category</th>
                    <th>Price</th>
                    {/* <th>Shipping Cost</th> */}
                    <th>Notes</th>
                    <th className="text-center" style={{ width: 125 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center">Loading...</td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{item.unit}</td>
                        <td>{item.category?.name}</td>
                        <td>${(item.price + item.shippingCost).toLocaleString(2)}</td>
                        {/* <td>${item.shippingCost.toLocaleString()}</td> */}
                        <td>{item.notes}</td>
                        <td className="text-center">
                          <div className="hstack justify-content-center">
                            {/* <Button variant="soft-primary" size="sm" className="btn-icon rounded-circle me-1">
                              <IconifyIcon icon="tabler:eye" />
                            </Button> */}
                            <Link href={`/inventory/products/edit/${item._id}`}>
                              <Button variant="soft-success" size="sm" className="btn-icon rounded-circle">
                                <IconifyIcon icon="tabler:edit" className="fs-16" />
                              </Button>
                            </Link>
                            {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle">
                              <IconifyIcon icon="tabler:trash" />
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center">No products found</td>
                    </tr>
                  )}
                </tbody>
                {/* Optionally, you can add a footer here */}
              </table>
            </div>
            <CardFooter>
              <div className="d-flex justify-content-end">
                <CustomPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p: number) => setPage(p)}
                />
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ProductsPage
