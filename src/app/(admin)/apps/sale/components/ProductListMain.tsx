'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import CustomPagination from '@/app/(admin)/e-commerce/products-grid/components/CustomPagination'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import SellMultipleProductsModal from './SellProductPopup'
import HistoryModal from './HistoryModal'
import AddProductModal from './AddProductStockModal'
import { useNotificationContext } from '@/context/useNotificationContext'
import ReturnSaleModal from './ReturnSaleModal'

export const metadata: Metadata = { title: 'Sales Transactions' }

type ModalType = 'history' | 'sellMultiple' | 'add' | "returnsale" | null

const saleTransactionsPage = () => {
  const { id } = useParams() // buyer id from route parameter
  const buyerId = id
  const router = useRouter()
  const user = useAuthStore((state) => state.user) || { _id: '67cf4bb808facf7a76f9f229' }
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [Buyer, setBuyer] = useState<any>()
  const [pageLimit, setPageLimit] = useState<number>(50)
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const { showNotification } = useNotificationContext()
  console.log('products', products)

  // Fetch user-specific categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get(`/api/categories/${user._id}`)
        setCategories(response.data)
      } catch (error) {
        showNotification({ message: error?.response?.data?.error || 'Error fetching categories', variant: 'danger' })
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [user._id])

  async function fetchBuyer() {
    setLoading(true)
    try {
      const response = await api.get(`/api/buyers/${buyerId}`)
      setBuyer(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      //setLoading(false)
    }
  }

  // Fetch products for the user with pagination
  async function fetchProducts() {
    setLoading(true)
    try {
      let query = `/api/inventory/${user._id}/inventory/${buyerId}?page=${currentPage}&limit=${pageLimit}`
      if (filterCategory) {
        query += `&category=${filterCategory}`
      }
      const response = await api.get(query)
      setProducts(response.data.products)
      setTotalProducts(response.data.totalProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refetch products when user_id, filterCategory or currentPage changes
  useEffect(() => {
    fetchProducts()
  }, [user._id, filterCategory, currentPage])

  useEffect(() => {
    fetchBuyer()
  }, [])

  // Filter products on the front end by search query
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Handle product checkbox toggle
  const handleCheckboxChange = (prod: any, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, prod])
    } else {
      setSelectedProducts((prev) => prev.filter((p) => p._id !== prod._id))
    }
  }

  // Handler for when a new page is selected from the pagination component
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container-fluid px-2 px-md-3">
      <PageTitle title={`Sales Transactions (${Buyer?.firstName} ${Buyer?.lastName})`} subTitle="Transactions" />

      {/* Filter & Search Section */}
      <div className="mt-3">
        <div className="row g-2 g-md-3 align-items-end">
          <div className="col-12 col-md-auto">
            <label htmlFor="categoryFilter" className="form-label fs-15 mb-1">
              Filter by Category:
            </label>
            <div className="input-group">
              <Form.Select
                id="categoryFilter"
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value)
                  setCurrentPage(1)
                }}
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
                variant="secondary"
                className="d-none d-sm-block"
                onClick={() => {
                  setFilterCategory('')
                  setCurrentPage(1)
                }}
              >
                CLEAR
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilterCategory('')
                  setCurrentPage(1)
                }}
                className="d-sm-none"
              >
                <IconifyIcon icon="tabler:x" />
              </Button>
            </div>
          </div>
          <div className="col-12 col-md-auto">
            <label htmlFor="searchInput" className="form-label fs-15 mb-1">
              Search:
            </label>
            <input
              type="text"
              id="searchInput"
              className="form-control"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 small">To add another item, search and select it.</p>
      </div>

      {/* Sell Selected Button */}
      {selectedProducts.length > 0 && (
        <div className="mt-3">
          <Button
            variant="primary"
            onClick={() => setActiveModal('sellMultiple')}
            className=" w-sm-auto"
          >
            SELL SELECTED ({selectedProducts.length})
          </Button>
        </div>
      )}

      {/* Desktop Table View */}
      <Card className="mt-3 d-none d-lg-block">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3" style={{ width: 60 }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={(e) =>
                      e.target.checked ? setSelectedProducts(filteredProducts) : setSelectedProducts([])
                    }
                  />
                </th>
                <th>PRODUCT ID</th>
                <th>REFERENCE ID</th>
                <th>PRODUCT Name</th>
                <th>CATEGORY</th>
                <th>Available Quantity</th>
                {user.role === "admin" && <th>Price</th>}
                <th>Unit</th>
                <th className="text-center" style={{ width: 200 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => (
                  <tr key={prod._id}>
                    <td className="ps-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedProducts.some((p) => p._id === prod._id)}
                        onChange={(e) => handleCheckboxChange(prod, e.target.checked)}
                      />
                    </td>
                    <td>{prod.product_id}</td>
                    <td>{prod.reference_number}</td>
                    <td>{prod.name}</td>
                    <td>{prod?.category?.name}</td>
                    <td>{prod.qty}</td>
                    {user.role === "admin" && <td>${(prod.price + prod?.shippingCost).toLocaleString()}</td>}
                    <td>{prod.unit}</td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`history-tooltip-${prod._id}`}>History</Tooltip>}>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedProduct(prod)
                              setActiveModal('history')
                            }}
                            className="rounded-pill shadow"
                          >
                            <IconifyIcon icon="tabler:clock" className="fs-5" />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={<Tooltip id={`sell-tooltip-${prod._id}`}>Sell</Tooltip>}>
                          <Button
                            variant="success"
                            onClick={() => {
                              setSelectedProduct(prod)
                              setActiveModal('sellMultiple')
                              setSelectedProducts([prod])
                            }}
                            className="rounded-pill shadow"
                          >
                            <IconifyIcon icon="tabler:currency-dollar" className="fs-5" />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={<Tooltip id={`return-tooltip-${prod._id}`}>Return Stock</Tooltip>}>
                          <Button
                            variant="info"
                            onClick={() => {
                              setSelectedProduct(prod)
                              setActiveModal('add')
                            }}
                            className="rounded-pill shadow"
                          >
                            <IconifyIcon icon="tabler:plus" className="fs-5" />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Card.Footer>
          <div className="d-flex justify-content-end">
            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalProducts / pageLimit)}
              onPageChange={handlePageChange}
            />
          </div>
        </Card.Footer>
      </Card>

      {/* Mobile Card View */}
      <div className="d-lg-none mt-3">
        {loading ? (
          <Card className="text-center py-4">
            <Card.Body>Loading...</Card.Body>
          </Card>
        ) : filteredProducts.length > 0 ? (
          <>
            {filteredProducts.map((prod) => (
              <Card key={prod._id} className="mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedProducts.some((p) => p._id === prod._id)}
                        onChange={(e) => handleCheckboxChange(prod, e.target.checked)}
                        id={`check-${prod._id}`}
                      />
                      <label className="form-check-label fw-bold" htmlFor={`check-${prod._id}`}>
                        {prod.name}
                      </label>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted">Product ID:</small>
                      <div className="fw-medium">{prod.product_id}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Category:</small>
                      <div className="fw-medium">{prod?.category?.name}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Available Qty:</small>
                      <div className="fw-medium">{prod.qty}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Unit:</small>
                      <div className="fw-medium">{prod.unit}</div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-center">
                    <OverlayTrigger placement="top" overlay={<Tooltip id={`mob-history-tooltip-${prod._id}`}>History</Tooltip>}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(prod)
                          setActiveModal('history')
                        }}
                        className="flex-fill"
                      >
                        <IconifyIcon icon="tabler:clock" className="me-1" />
                        <span className="d-none d-sm-inline">History</span>
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={<Tooltip id={`mob-sell-tooltip-${prod._id}`}>Sell</Tooltip>}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(prod)
                          setActiveModal('sellMultiple')
                          setSelectedProducts([prod])
                        }}
                        className="flex-fill"
                      >
                        <IconifyIcon icon="tabler:currency-dollar" className="me-1" />
                        <span className="d-none d-sm-inline">Sell</span>
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={<Tooltip id={`mob-return-tooltip-${prod._id}`}>Return Stock</Tooltip>}>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(prod)
                          setActiveModal('add')
                        }}
                        className="flex-fill"
                      >
                        <IconifyIcon icon="tabler:plus" className="me-1" />
                        <span className="d-none d-sm-inline">Return Stock</span>
                      </Button>
                    </OverlayTrigger>
                  </div>
                </Card.Body>
              </Card>
            ))}

            {/* Mobile Pagination */}
            <div className="d-flex justify-content-center mt-3">
              <CustomPagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalProducts / pageLimit)}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <Card className="text-center py-4">
            <Card.Body>No products found</Card.Body>
          </Card>
        )}
      </div>


      {/* Conditionally Render Modals */}
      {activeModal === 'history' && selectedProduct && (
        <HistoryModal selectedProduct={selectedProduct} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'sellMultiple' && selectedProducts.length > 0 && (
        <SellMultipleProductsModal fetchProducts={fetchProducts} selectedProducts={selectedProducts} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'add' && selectedProduct && (
        <AddProductModal fetchProducts={fetchProducts} product={selectedProduct} onClose={() => setActiveModal(null)} />
      )}
    </div>
  )
}

export default saleTransactionsPage