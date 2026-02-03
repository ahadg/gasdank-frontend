'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, CardFooter, CardHeader, CardTitle, Row, Col, Form, Collapse, Badge } from 'react-bootstrap'
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
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [lowStockLoading, setLowStockLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [priceSort, setPriceSort] = useState<string>('') // '' | 'asc' | 'desc'
  const [page, setPage] = useState(1)
  const limit = 100
  const [totalPages, setTotalPages] = useState(1)
  const { showNotification } = useNotificationContext()

  // Restock modal state
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // Low stock section state
  const [showLowStock, setShowLowStock] = useState(false)

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
      let query = `/api/inventory/${user?._id}?page=${page}&qty=gt0&limit=${limit}`
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

  // Fetch low stock products
  async function fetchLowStockProducts() {
    setLowStockLoading(true)
    try {
      const response = await api.get('/api/inventory/outOfStock')
      // Assuming the API returns an array of products.
      setLowStockProducts(response.data)
    } catch (error) {
      showNotification({ message: error?.response?.data?.error || 'Error fetching out-of-stock products', variant: 'danger' })
      console.error("Error fetching out-of-stock products:", error)
    } finally {
      setLowStockLoading(false)
    }
  }

  useEffect(() => {
    if (user?._id) {
      fetchProducts()
    }
  }, [user?._id, page, filterCategory])

  // Fetch low stock products when the section is opened for the first time
  useEffect(() => {
    if (showLowStock && lowStockProducts.length === 0 && user?._id) {
      fetchLowStockProducts()
    }
  }, [showLowStock, user?._id])

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
  }

  const onRestockComplete = () => {
    fetchProducts()
    // Also refresh low stock products if the section is open
    if (showLowStock) {
      fetchLowStockProducts()
    }
  }

  const toggleLowStockSection = () => {
    setShowLowStock(!showLowStock)
  }

  // Helper function to get total price (price + shipping cost)
  const getTotalPrice = (item: any) => {
    return item.price + (item?.shippingCost || 0)
  }

  // Sort products by price
  const sortProductsByPrice = (productsToSort: any[]) => {
    if (!priceSort) return productsToSort

    return [...productsToSort].sort((a, b) => {
      const priceA = getTotalPrice(a)
      const priceB = getTotalPrice(b)

      if (priceSort === 'asc') {
        return priceA - priceB // Lowest to highest
      } else {
        return priceB - priceA // Highest to lowest
      }
    })
  }

  const searchLower = search.toLowerCase()
  let filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchLower)
  )

  // Apply price sorting to filtered products
  filteredProducts = sortProductsByPrice(filteredProducts)

  // Also apply sorting to low stock products for consistency
  const sortedLowStockProducts = sortProductsByPrice(lowStockProducts)

  // Clear all filters function
  const clearAllFilters = () => {
    setFilterCategory('')
    setPriceSort('')
    setSearch('')
    setPage(1)
  }

  // Mobile card component for products
  const MobileProductCard = ({ item, isLowStock = false }: { item: any, isLowStock?: boolean }) => (
    <Card className={`mb-3 border-0 shadow-sm ${isLowStock ? 'border-start border-warning border-3' : ''}`}>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1 fw-semibold">
              {item.name}
              {isLowStock && <Badge bg="warning" className="ms-2 text-dark">Low Stock</Badge>}
            </h6>
            <small className="text-muted">ID: {item.product_id}</small>
          </div>
          <div className="text-end">
            <span className="badge bg-light text-dark">${getTotalPrice(item).toLocaleString()}</span>
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-6">
            <small className="text-muted d-block">Quantity</small>
            <span className={`fw-medium ${isLowStock ? 'text-warning' : ''}`}>{item.qty} {item.unit}</span>
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
            variant={isLowStock ? "warning" : "outline-primary"}
            size="sm"
            className="flex-fill"
            onClick={() => handleRestockClick(item)}
          >
            <IconifyIcon icon="tabler:package" className="me-1" />
            {isLowStock ? 'Urgent Restock' : 'Restock'}
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
      {/* Low Stock Alert Section */}
      <div className="mb-4">
        <div className="w-full">
          <div className="border border-yellow-200 rounded-lg overflow-hidden shadow-xs">
            <div
              className="border-b border-yellow-200 bg-yellow-50 cursor-pointer p-3 hover:bg-yellow-100 transition-colors"
              onClick={toggleLowStockSection}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <IconifyIcon
                    icon="tabler:alert-triangle"
                    className="text-yellow-600 text-base"
                  />
                  <h5 className="text-sm font-semibold text-yellow-800 flex items-center">
                    Low Stock
                    {lowStockProducts.length > 0 && (
                      <span className="ml-2 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full text-xs font-medium">
                        {lowStockProducts.length}
                      </span>
                    )}
                  </h5>
                </div>
                <IconifyIcon
                  icon={showLowStock ? "tabler:chevron-up" : "tabler:chevron-down"}
                  className="text-yellow-600 text-base"
                />
              </div>
            </div>

            <div className={`transition-all duration-200 ease-in-out overflow-hidden ${showLowStock ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
              }`}>
              {showLowStock && (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto text-xs">
                    <table className="w-full divide-y divide-yellow-100">
                      <thead className="bg-yellow-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-yellow-700">Product</th>
                          <th className="px-3 py-2 text-left font-medium text-yellow-700">ID/Ref</th>
                          <th className="px-3 py-2 text-left font-medium text-yellow-700">Stock</th>
                          <th className="px-3 py-2 text-left font-medium text-yellow-700">Category</th>
                          {/* <th className="px-3 py-2 text-left font-medium text-yellow-700">Value</th>
                    <th className="px-3 py-2 text-center font-medium text-yellow-700 w-28">Actions</th> */}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-yellow-50">
                        {lowStockLoading ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center">
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                              </div>
                            </td>
                          </tr>
                        ) : sortedLowStockProducts.length > 0 ? (
                          sortedLowStockProducts.map((item, idx) => (
                            <tr key={idx} className="hover:bg-yellow-50">
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="font-medium text-gray-800">{item.name}</div>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                <div>{item.product_id}</div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${item.qty <= 5 ? 'bg-red-500' : 'bg-yellow-500'} mr-1`}></span>
                                  <span className="font-medium text-yellow-700">{item.qty} {item.unit}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className="text-gray-600">{item.category?.name || '-'}</span>
                              </td>
                              {/* <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                          ${getTotalPrice(item).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => handleRestockClick(item)}
                              className="p-1 text-yellow-700 hover:bg-yellow-100 rounded"
                              title="Restock"
                            >
                              <IconifyIcon icon="tabler:package" className="text-sm" />
                            </button>
                            <Link href={`/inventory/products/edit/${item._id}`}>
                              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                <IconifyIcon icon="tabler:edit" className="text-sm" />
                              </button>
                            </Link>
                          </div>
                        </td> */}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                              All products well stocked
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block lg:hidden p-2">
                    {lowStockLoading ? (
                      <div className="flex justify-center p-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                      </div>
                    ) : sortedLowStockProducts.length > 0 ? (
                      <div className="space-y-2">
                        {sortedLowStockProducts.map((item, idx) => (
                          <div key={idx} className="bg-white p-2 rounded border border-yellow-100 text-xs">
                            <div className="flex justify-between">
                              <div className="font-medium truncate max-w-[120px]">{item.name}</div>
                              <span className="font-medium text-yellow-700">{item.qty} {item.unit}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-gray-500">
                              <span>{item.product_id}</span>
                              <span>${getTotalPrice(item).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-end space-x-1 mt-1">
                              <button
                                onClick={() => handleRestockClick(item)}
                                className="p-1 text-yellow-700 hover:bg-yellow-100 rounded"
                                title="Restock"
                              >
                                <IconifyIcon icon="tabler:package" className="text-xs" />
                              </button>
                              <Link href={`/inventory/products/edit/${item._id}`}>
                                <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                  <IconifyIcon icon="tabler:edit" className="text-xs" />
                                </button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-2 text-gray-500 text-xs">
                        All products well stocked
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Products Section */}
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

                  {/* Left Section: Search + Filters */}
                  <div className="d-flex flex-column flex-lg-row gap-2 flex-grow-1">
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

                    {/* Filters Row */}
                    <div className="d-flex flex-column flex-sm-row gap-2" style={{ minWidth: '300px' }}>
                      {/* Category Filter */}
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

                      {/* Price Sort Filter */}
                      <Form.Select
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                        className="flex-grow-1"
                        style={{ minWidth: '140px' }}
                      >
                        <option value="">Sort by Price</option>
                        <option value="asc">Price: Low to High</option>
                        <option value="desc">Price: High to Low</option>
                      </Form.Select>

                      {/* Clear All Button */}
                      <Button
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearAllFilters}
                        style={{ minWidth: '70px' }}
                        title="Clear all filters"
                      >
                        <IconifyIcon icon="tabler:x" className="me-1" />
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

                {/* Active filters indicator - show when filters are applied */}
                {(filterCategory || priceSort || search) && (
                  <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
                    <small className="text-muted">Active filters:</small>
                    {search && (
                      <Badge bg="primary" className="d-flex align-items-center gap-1">
                        Search: "{search}"
                        <IconifyIcon
                          icon="tabler:x"
                          className="cursor-pointer"
                          onClick={() => setSearch('')}
                          style={{ cursor: 'pointer' }}
                        />
                      </Badge>
                    )}
                    {filterCategory && (
                      <Badge bg="info" className="d-flex align-items-center gap-1">
                        Category: {categories.find(cat => cat._id === filterCategory)?.name}
                        <IconifyIcon
                          icon="tabler:x"
                          className="cursor-pointer"
                          onClick={() => setFilterCategory('')}
                          style={{ cursor: 'pointer' }}
                        />
                      </Badge>
                    )}
                    {priceSort && (
                      <Badge bg="success" className="d-flex align-items-center gap-1">
                        Price: {priceSort === 'asc' ? 'Low to High' : 'High to Low'}
                        <IconifyIcon
                          icon="tabler:x"
                          className="cursor-pointer"
                          onClick={() => setPriceSort('')}
                          style={{ cursor: 'pointer' }}
                        />
                      </Badge>
                    )}
                  </div>
                )}
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
                    <th className="cursor-pointer" onClick={() => {
                      if (priceSort === '') setPriceSort('asc')
                      else if (priceSort === 'asc') setPriceSort('desc')
                      else setPriceSort('')
                    }}
                      style={{ cursor: 'pointer' }}
                      title="Click to sort by price"
                    >
                      Price
                      {priceSort && (
                        <IconifyIcon
                          icon={priceSort === 'asc' ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                          className="ms-1"
                        />
                      )}
                    </th>
                    <th>Product Type</th>
                    <th>Notes</th>
                    <th className="text-center" style={{ width: 125 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center">Loading...</td>
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
                        <td>${getTotalPrice(item).toLocaleString()}</td>
                        <td>{item.product_type?.name}</td>
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
                      <td colSpan={10} className="text-center">No products found</td>
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