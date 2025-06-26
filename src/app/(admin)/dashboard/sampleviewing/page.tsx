'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthStore } from '@/store/authStore'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Modal from 'react-bootstrap/Modal'

export default function SampleViewingToolPage() {
  const { showNotification } = useNotificationContext()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filterCategory, setFilterCategory] = useState('')
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [buyerId, setBuyerId] = useState('')
  const [workerId, setWorkerId] = useState('')
  const [workerdata, setworkerdata] = useState('')
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historySessions, setHistorySessions] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageLimit] = useState(10)
  const [totalProducts, setTotalProducts] = useState(0)
  
  console.log("workers", workers)
  const user = useAuthStore((state) => state.user)

  // Fetch user-specific categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get(`/api/categories/${user._id}`)
        setCategories(response.data)
      } catch (error: any) {
        showNotification({ 
          message: error?.response?.data?.error || 'Error fetching categories', 
          variant: 'danger' 
        })
        console.error('Error fetching categories:', error)
      }
    }
    if (user?._id) {
      fetchCategories()
    }
  }, [user._id])

  // Fetch products for the user with pagination and category filter
  const fetchProducts = async () => {
    if (!user?._id) return
    
    setProductsLoading(true)
    try {
      // Build query string with pagination and category filter if set
      let query = `/api/inventory/${user._id}?page=${currentPage}&limit=${pageLimit}`
      console.log("filterCategory",filterCategory)
      if (filterCategory) {
        query += `&category=${filterCategory}`
      }
      const response = await api.get(query)
      // Expecting response.data to have: { page, limit, totalProducts, products }
      setProducts(response.data.products || [])
      setTotalProducts(response.data.totalProducts || 0)
    } catch (error: any) {
      console.error('Error fetching products:', error)
      showNotification({ 
        message: 'Failed to load products.', 
        variant: 'danger' 
      })
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workerRes = await api.get('/api/users')
        setWorkers(workerRes.data || [])
      } catch (err: any) {
        console.log("error", err)
        showNotification({ message: 'Failed to load workers data.', variant: 'danger' })
      }
    }

    const fetchAccounts = async () => {
      try {
        const response = await api.get(`/api/buyers?user_id=${user._id}`)
        setAccounts(response.data)
      } catch (error: any) {
        showNotification({
          message: error?.response?.data?.error || 'Error fetching accounts',
          variant: 'danger'
        })
      }
    }

    if (user?._id) {
      fetchData()
      fetchAccounts()
      fetchProducts()
    }
  }, [user._id])

  // Refetch products when category filter or page changes
  useEffect(() => {
    fetchProducts()
  }, [filterCategory, currentPage])

  const handleCategoryFilter = (categoryId: string) => {
    setFilterCategory(categoryId)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleAddItem = (product: any) => {
    if (!selectedItems.find(item => item._id === product._id)) {
      setSelectedItems([...selectedItems, { 
        ...product, 
        price  : ((parseFloat(product.price) || 0) + (parseFloat(product.shippingCost) || 0)).toString(), 
        sale_price: ((parseFloat(product.price) || 0) + (parseFloat(product.shippingCost) || 0)).toString(), 
        qty: 1,
        shippingCost :  product.shippingCost
      }])
    }
  }

  const handleUpdateItem = (index: number, field: string, value: string | number) => {
    const updated = [...selectedItems]
    updated[index][field] = value
    setSelectedItems(updated)
  }

  const handleRemoveItem = (index: number) => {
    const updated = [...selectedItems]
    updated.splice(index, 1)
    setSelectedItems(updated)
  }

  const calculateItemTotal = (item: any) => {
    const price = parseFloat(item.sale_price) || 0
    const qty = parseFloat(item.qty) || 0
    return price * qty
  }

  const calculateGrandTotal = () => {
    return selectedItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const handleSubmit = async () => {
    if (!buyerId || !workerId || selectedItems.length === 0) {
      showNotification({ message: 'Please fill all fields.', variant: 'danger' })
      return
    }

    try {
      setLoading(true)
      const payload = {
        id: user?._id,
        buyer_id: buyerId,
        user_id: workerId,
        items: selectedItems.map(item => ({
          productId: item._id,
          name: item.name,
          unit: item.unit,
          qty: item.qty,
          price: item.price,
          sale_price : item?.sale_price,
          shippingCost: item.shippingCost
        })),
      }
      console.log("payload", payload)
      await api.post('/api/sampleviewingclient', payload)

      showNotification({ message: 'Sample viewing session created.', variant: 'success' })
      setBuyerId('')
      setWorkerId('')
      setSelectedItems([])
    } catch (err: any) {
      console.error('Error submitting session:', err)
      showNotification({ message: 'Failed to submit sample session.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalProducts / pageLimit)

  return (
    <div className="container py-5">
      <div className="mb-3 text-end">
        <Button
          className="mb-3 text-end"
          variant="outline-primary"
          onClick={async () => {
            try {
              setShowHistory(true)
              const res = await api.get(`/api/sampleviewingclient?user_created_by=${user?._id}`)
              console.log("setHistorySessions", res)
              setHistorySessions(res.data || [])
            } catch {
              showNotification({ message: 'Failed to fetch history.', variant: 'danger' })
            }
          }}
        >
          <IconifyIcon icon='tabler:history' /> View History
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Select Buyer</Form.Label>
            <Form.Select value={buyerId} onChange={e => setBuyerId(e.target.value)}>
              <option value="">Select a buyer</option>
              {accounts.map((buyer: any) => (
                <option key={buyer._id} value={buyer._id}>
                  {buyer.name || `${buyer.firstName} ${buyer.lastName}`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Select Worker</Form.Label>
            <Form.Select value={workerId} onChange={e => setWorkerId(e.target.value)}>
              <option value="">Select a worker</option>
              {workers.map(worker => (
                <option key={worker._id} value={worker._id}>
                  {worker.firstName} {worker.lastName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Category</Form.Label>
            <Form.Select 
              value={filterCategory} 
              onChange={e => handleCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category: any) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Available Products</h5>
            {productsLoading && <Spinner animation="border" size="sm" />}
          </div>
          
          {productsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted">No products found.</p>
          ) : (
            <>
              <div className="row g-3 mb-3">
              {products.map(product => (
                <div key={product._id} className="col-md-4 col-lg-3 mb-3">
                  <Card className="h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                    <Card.Body className="p-3 d-flex flex-column">
                      <div className="mb-3">
                        <h6 className="card-title fw-semibold text-truncate mb-1" title={product.name}>
                          {product.name}
                        </h6>
                        <div className="d-flex justify-content-between align-items-center text-sm">
                          <span className="text-muted">
                            {product.qty} {product.unit}
                          </span>
                          <span className="fw-bold text-primary fs-6">
                            ${(parseFloat(product.price || 0) + parseFloat(product.shippingCost || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant={selectedItems.find(item => item._id === product._id) ? "success" : "primary"}
                        size="sm"
                        className="mt-auto d-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleAddItem(product)}
                        disabled={selectedItems.find(item => item._id === product._id)}
                      >
                        {selectedItems.find(item => item._id === product._id) ? (
                          <>
                            <IconifyIcon icon="tabler:check" className="fs-6" />
                            Added
                          </>
                        ) : (
                          <>
                            <IconifyIcon icon="tabler:plus" className="fs-6" />
                            Add
                          </>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-muted">
                    Page {currentPage} of {totalPages} ({totalProducts} total products)
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {selectedItems.length > 0 && (
        <Card className="shadow-sm rounded-4 mb-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Selected Items ({selectedItems.length})</h5>
            <Table responsive bordered>
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Sale Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, index) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>
                      <Form.Control
                        type="number"
                        // min="1"
                        value={item.qty}
                        onChange={e => handleUpdateItem(index, 'qty', (e.target.value) || 1)}
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>{item.unit}</td>
                    <td>
                      <Form.Control
                        type="number"
                        // step="0.01"
                        // min="0"
                        value={item.sale_price}
                        onChange={e => handleUpdateItem(index, 'sale_price', (e.target.value) || 0)}
                        style={{ width: '120px' }}
                      />
                    </td>
                    <td className="fw-bold text-primary">
                      ${calculateItemTotal(item).toFixed(2)}
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* <tfoot className="table-light">
                <tr>
                  <td colSpan={4} className="text-end fw-bold">Grand Total:</td>
                  <td className="fw-bold text-success fs-5">
                    ${calculateGrandTotal().toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot> */}
            </Table>
          </Card.Body>
        </Card>
      )}

      <div className="d-grid">
        <Button onClick={handleSubmit} disabled={loading || selectedItems.length === 0}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Send Sample List'}
        </Button>
      </div>

      <Modal show={showHistory} onHide={() => setShowHistory(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Sample Viewing History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historySessions.length === 0 ? (
            <p className="text-muted">No sample sessions yet.</p>
          ) : (
            <Table bordered responsive className="small">
              <thead className="table-light">
                <tr>
                  <th>Buyer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historySessions.map((session: any) => (
                  <tr key={session._id}>
                    <td>{session.buyer_id?.firstName || session.buyer_id?.name || 'N/A'}</td>
                    <td>{new Date(session.sentAt).toLocaleString()}</td>
                    <td>
                      {session.items.map((item: any) => (
                        <div key={item.productId} className="d-flex justify-content-between mb-1">
                          <span>{item.name} ({item.qty})</span>
                          <span className="small">
                            ${((parseFloat(item.price) || 0) + (parseFloat(item.shippingCost) || 0)) * (parseFloat(item.qty) || 1)}
                          </span>
                          <span className={`text-${item.status === 'accepted' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="fw-bold">
                      ${session.items.reduce((total: number, item: any) => 
                        total + ((parseFloat(item.sale_price) || 0) + (parseFloat(item.shippingCost) || 0)) * (parseFloat(item.qty) || 1), 0
                      ).toFixed(2)}
                    </td>
                    <td className="text-capitalize">{session.viewingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}