'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, Form } from 'react-bootstrap'
import CustomPagination from '@/app/(admin)/e-commerce/products-grid/components/CustomPagination'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import SellMultipleProductsModal from './SellProductPopup'
import HistoryModal from './HistoryModal'
import AddProductModal from './AddProductStockModal'
import { useNotificationContext } from '@/context/useNotificationContext'

export const metadata: Metadata = { title: 'Sales Transactions' }

type ModalType = 'history' | 'sellMultiple' | 'add' | null

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
  const [pageLimit, setPageLimit] = useState<number>(10)
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const { showNotification } = useNotificationContext()
  console.log('Buyer',Buyer)
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
      // Expecting response.data to have: { page, limit, totalProducts, products }
      setBuyer(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch products for the user with pagination
  async function fetchProducts() {
    setLoading(true)
    try {
      // Build query string with pagination and category filter if set
      let query = `/api/products/${user._id}/${buyerId}?page=${currentPage}&limit=${pageLimit}`
      if (filterCategory) {
        query += `&category=${filterCategory}`
      }
      const response = await api.get(query)
      // Expecting response.data to have: { page, limit, totalProducts, products }
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
  },[])
  
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
    <div className="container-fluid">
      <PageTitle title={`Sales Transactions (${Buyer?.firstName} ${Buyer?.lastName})`} subTitle="Transactions" />

      {/* Filter & Search Section */}
      <div className="mt-3">
        <div className="row g-3 align-items-end">
          <div className="col-auto">
            <label htmlFor="categoryFilter" className="form-label fs-15 mb-1">
              Filter by Category:
            </label>
            <div className="input-group">
              <Form.Select
                id="categoryFilter"
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value)
                  setCurrentPage(1) // Reset to page 1 on filter change
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
              <Button type="button" variant="secondary" onClick={() => {
                setFilterCategory('')
                setCurrentPage(1)
              }}>
                CLEAR
              </Button>
            </div>
          </div>
          <div className="col-auto">
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
        <p className="mt-2">To add another item, search and select it.</p>
      </div>

      {/* Sell Selected Button */}
      {selectedProducts.length > 0 && (
        <div className="mt-3">
          <Button variant="primary" onClick={() => setActiveModal('sellMultiple')}>
            SELL SELECTED ({selectedProducts.length})
          </Button>
        </div>
      )}

      {/* Product Table */}
      <Card className="mt-3">
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
                <th>PRODUCT NAME</th>
                <th>CATEGORY</th>
                <th>Available Quantity</th>
                <th>Unit</th>
                <th className="text-center" style={{ width: 200 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">
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
                    <td>{prod.name}</td>
                    <td>{prod.category}</td>
                    <td>{prod.qty}</td>
                    <td>{prod.unit}</td>
                    <td className="text-center">
                      <div className="d-flex gap-3 justify-content-center">
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => {
                            setSelectedProduct(prod)
                            setActiveModal('history')
                          }}
                          className="rounded-pill shadow"
                        >
                          <IconifyIcon icon="tabler:clock" className="fs-4" />
                        </Button>
                        <Button
                          variant="success"
                          size="lg"
                          onClick={() => {
                            setSelectedProduct(prod)
                            setActiveModal('sellMultiple')
                            setSelectedProducts([prod])
                          }}
                          className="rounded-pill shadow"
                        >
                          <IconifyIcon icon="tabler:currency-dollar" className="fs-4" />
                        </Button>
                        <Button
                          variant="info"
                          size="lg"
                          onClick={() => {
                            setSelectedProduct(prod)
                            setActiveModal('add')
                          }}
                          className="rounded-pill shadow"
                        >
                          <IconifyIcon icon="tabler:plus" className="fs-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
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
