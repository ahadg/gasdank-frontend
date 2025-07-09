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
import RestockModal from './edit/components/Restockmodal'
import { useNotificationContext } from '@/context/useNotificationContext'

//export const metadata: Metadata = { title: 'Products' }

const ProductsPage = () => {
  const user = useAuthStore((state) => state.user)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const limit = 100
  const [totalPages, setTotalPages] = useState(1)
  const { showNotification } = useNotificationContext()
  
  // Restock modal state
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // Fetch user-specific categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get(`/api/categories/${user?._id}`)
        setCategories(response.data)
      } catch (error) {
        showNotification({ message: error?.response?.data?.error || 'Error fetching categories', variant: 'danger' })
        console.error('Error fetching categories:', error)
      }
    }
    if (user?._id) {
      fetchCategories()
    }
  }, [user?._id])

  // Fetch products for the current user using Axios with pagination and category filter
  async function fetchProducts() {
    setLoading(true)
    try {
      let query = `/api/inventory/${user?._id}?page=${page}&limit=${limit}`
      if (filterCategory) {
        query += `&category=${filterCategory}`
      }
      const response = await api.get(query)
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
  }, [user?._id, page, filterCategory])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const handleRestockClick = (product: any) => {
    setSelectedProduct(product)
    setShowRestockModal(true)
  }

  const handleRestockModalClose = () => {
    setShowRestockModal(false)
    setSelectedProduct(null)
    // Refresh products after restocking
    //fetchProducts()
  }
  const onRestockComplete = () => {
    fetchProducts()
  }

  const searchLower = search.toLowerCase()
  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchLower)
  )

  // Mobile card component for products
  const MobileProductCard = ({ item }: { item: any }) => (
    <Card className="mb-3 border-0 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1 fw-semibold">{item.name}</h6>
            <small className="text-muted">ID: {item.product_id}</small>
          </div>
          <div className="text-end">
            <span className="badge bg-light text-dark">${(item.price + item?.shippingCost).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="row g-2 mb-3">
          <div className="col-6">
            <small className="text-muted d-block">Quantity</small>
            <span className="fw-medium">{item.qty} {item.unit}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Category</small>
            <span className="fw-medium">{item.category?.name || 'N/A'}</span>
          </div>
        </div>
        
        {item.reference_number && (
          <div className="mb-2">
            <small className="text-muted d-block">Reference</small>
            <span className="fw-medium">{item.reference_number}</span>
          </div>
        )}
        
        {item.notes && (
          <div className="mb-3">
            <small className="text-muted d-block">Notes</small>
            <small className="text-truncate d-block" style={{ maxWidth: '100%' }}>{item.notes}</small>
          </div>
        )}
        
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="flex-fill"
            onClick={() => handleRestockClick(item)}
          >
            <IconifyIcon icon="tabler:package" className="me-1" />
            Restock
          </Button>
          <Link href={`/inventory/products/edit/${item._id}`} className="flex-fill">
            <Button variant="outline-success" size="sm" className="w-100">
              <IconifyIcon icon="tabler:edit" className="me-1" />
              Edit
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  )

  return (
    <>
      <PageTitle title="Products" subTitle="Inventory" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader className="border-bottom border-light">
              <div className="px-3 py-3">
                
                {/* Title - Always at top on mobile */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <CardTitle as="h4" className="mb-0">
                    Manage Products
                  </CardTitle>
                  {/* Add Product Button - Right side on mobile */}
                  <div className="d-block d-md-none">
                    <Link href="/inventory/products/add" className="btn btn-success bg-gradient btn-sm">
                      <IconifyIcon icon="tabler:plus" className="me-1" /> Add
                    </Link>
                  </div>
                </div>

                {/* Main Content Row */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
                  
                  {/* Left Section: Search + Category Filter */}
                  <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1">
                    {/* Search Input */}
                    <div className="flex-grow-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search products..."
                        value={search}
                        onChange={handleSearchChange}
                      />
                    </div>
                    
                    {/* Category Filter + Clear */}
                    <div className="d-flex gap-2" style={{ minWidth: '200px' }}>
                      <Form.Select
                        value={filterCategory}
                        onChange={(e) => {
                          setFilterCategory(e.target.value)
                          setPage(1)
                        }}
                        className="flex-grow-1"
                        style={{ minWidth: '120px' }}
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button 
                        type="button" 
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setFilterCategory('')
                          setPage(1)
                        }}
                        style={{ minWidth: '60px' }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Right: Add Product Button (Desktop only) */}
                  <div className="d-none d-md-block flex-shrink-0">
                    <Link href="/inventory/products/add" className="btn btn-success bg-gradient">
                      <IconifyIcon icon="tabler:plus" className="me-1" /> Add Product
                    </Link>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Desktop Table View */}
            <div className="table-responsive d-none d-lg-block">
              <table className="table table-nowrap mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Prod Id</th>
                    <th>Ref No</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Category</th>
                    <th>Price</th>
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
                        <td>{item.product_id}</td>
                        <td>{item.reference_number}</td>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{item.unit}</td>
                        <td>{item.category?.name}</td>
                        <td>${(item.price + item?.shippingCost).toLocaleString()}</td>
                        <td>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                            {item.notes}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="hstack justify-content-center">
                            <Button 
                              variant="soft-primary" 
                              size="sm" 
                              className="btn-icon rounded-circle me-1"
                              onClick={() => handleRestockClick(item)}
                              title="Restock Product"
                            >
                              <IconifyIcon icon="tabler:package" />
                            </Button>
                            <Link href={`/inventory/products/edit/${item._id}`}>
                              <Button variant="soft-success" size="sm" className="btn-icon rounded-circle">
                                <IconifyIcon icon="tabler:edit" className="fs-16" />
                              </Button>
                            </Link>
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
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="d-block d-lg-none">
              <div className="p-3">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading products...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((item, idx) => (
                    <MobileProductCard key={idx} item={item} />
                  ))
                ) : (
                  <div className="text-center py-5">
                    <IconifyIcon icon="tabler:package-off" className="fs-1 text-muted mb-3" />
                    <p className="text-muted">No products found</p>
                  </div>
                )}
              </div>
            </div>

            <CardFooter>
              <div className="d-flex justify-content-center justify-content-md-end">
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

      {/* Restock Modal */}
      <RestockModal
        show={showRestockModal}
        onHide={handleRestockModalClose}
        product={selectedProduct}
        onRestockComplete={onRestockComplete}
      />
    </>
  )
}

export default ProductsPage