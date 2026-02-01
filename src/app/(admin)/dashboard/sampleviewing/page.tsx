'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Col, Form, Row, Spinner, Table, Nav, Tab } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthStore } from '@/store/authStore'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Modal from 'react-bootstrap/Modal'
import SampleViewingAdminComponent from './SampleViewingAdminComponent'

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

  // New state for profit margin functionality
  const [activeTab, setActiveTab] = useState('bulk')
  const [profitMargin, setProfitMargin] = useState<any>(0)
  const [selectedBuyerName, setSelectedBuyerName] = useState('')

  console.log("workers", workers)
  const user = useAuthStore((state) => state.user)
  const unitOptions = useAuthStore(state => state.settings?.units)
  const measurementOptions = [
    { label: 'Full', value: 1 },
    { label: 'Half', value: 0.5 },
    { label: 'Quarter', value: 0.25 },
  ]

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
      console.log("filterCategory", filterCategory)
      if (filterCategory) {
        query += `&category=${filterCategory}`
      }
      query += `&qty=gt0`
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

  // Update selected buyer name when buyer changes
  useEffect(() => {
    if (buyerId) {
      const selectedBuyer = accounts.find(buyer => buyer._id === buyerId)
      setSelectedBuyerName(selectedBuyer?.name || `${selectedBuyer?.firstName} ${selectedBuyer?.lastName}` || '')
    } else {
      setSelectedBuyerName('')
    }
  }, [buyerId, accounts])

  const handleCategoryFilter = (categoryId: string) => {
    setFilterCategory(categoryId)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleAddItem = (product: any) => {
    if (!selectedItems.find(item => item._id === product._id)) {
      const basePrice = (parseFloat(product.price) || 0) + (parseFloat(product.shippingCost) || 0)
      const finalPrice = activeTab === 'bulk' ? basePrice + profitMargin : basePrice

      setSelectedItems([...selectedItems, {
        ...product,
        price: (parseFloat(product.price) || 0).toString(),
        sale_price: finalPrice.toString(),
        qty: 1,
        shippingCost: (parseFloat(product.shippingCost) || 0).toString(),
        appliedProfit: activeTab === 'bulk' ? profitMargin : 0,
        measurement: 1,
        originalUnit: product.unit
      }])
    }
  }

  const handleUnitChange = (index: number, newUnit: string) => {
    const updated = [...selectedItems]
    const item = updated[index]
    const oldUnit = item.unit?.toLowerCase()
    const targetUnit = newUnit?.toLowerCase()

    let qty = parseFloat(item.qty) || 0
    let sale_price = parseFloat(item.sale_price) || 0
    let price = parseFloat(item.price) || 0
    let shippingCost = parseFloat(item.shippingCost) || 0
    let appliedProfit = parseFloat(item.appliedProfit) || 0

    if (oldUnit === 'kg' && targetUnit === 'gram') {
      qty = Number((qty * 1000).toFixed(2))
      sale_price = Number((sale_price / 1000).toFixed(5))
      price = Number((price / 1000).toFixed(5))
      shippingCost = Number((shippingCost / 1000).toFixed(5))
      appliedProfit = Number((appliedProfit / 1000).toFixed(5))
    } else if (oldUnit === 'gram' && targetUnit === 'kg') {
      qty = Number((qty / 1000).toFixed(5))
      sale_price = Number((sale_price * 1000).toFixed(2))
      price = Number((price * 1000).toFixed(2))
      shippingCost = Number((shippingCost * 1000).toFixed(2))
      appliedProfit = Number((appliedProfit * 1000).toFixed(2))
    }

    updated[index] = {
      ...item,
      unit: newUnit,
      qty: qty.toString(),
      sale_price: sale_price.toString(),
      price: price.toString(),
      shippingCost: shippingCost.toString(),
      appliedProfit
    }
    setSelectedItems(updated)
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
    const measurement = parseFloat(item.measurement) || 1
    return price * qty * measurement
  }

  const calculateGrandTotal = () => {
    return selectedItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const applyBulkProfit = () => {
    if (profitMargin <= 0) {
      showNotification({ message: 'Please enter a valid profit amount.', variant: 'danger' })
      return
    }

    const updated = selectedItems.map(item => {
      const basePrice = (parseFloat(item.price) || 0) + (parseFloat(item.shippingCost) || 0)
      const newPrice = basePrice + profitMargin
      return {
        ...item,
        sale_price: newPrice.toString(),
        appliedProfit: profitMargin
      }
    })
    setSelectedItems(updated)
    showNotification({
      message: `Applied $${profitMargin} profit to ${updated.length} items.`,
      variant: 'success'
    })
  }

  const resetPrices = () => {
    const updated = selectedItems.map(item => {
      const basePrice = (parseFloat(item.price) || 0) + (parseFloat(item.shippingCost) || 0)
      return {
        ...item,
        sale_price: basePrice.toString(),
        appliedProfit: 0
      }
    })
    setSelectedItems(updated)
    showNotification({ message: 'Reset all prices to base price.', variant: 'info' })
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
        items: selectedItems.map(item => {
          const originalUnit = item.originalUnit?.toLowerCase()
          const currentUnit = item.unit?.toLowerCase()

          let finalQty = (parseFloat(item.qty) || 0) * (parseFloat(item.measurement) || 1)
          let finalPrice = parseFloat(item.price) || 0
          let finalSalePrice = parseFloat(item.sale_price) || 0
          let finalShipping = parseFloat(item.shippingCost) || 0
          let finalProfit = parseFloat(item.appliedProfit) || 0
          let finalUnit = item.unit

          if (originalUnit && currentUnit && originalUnit !== currentUnit) {
            if (originalUnit === 'kg' && currentUnit === 'gram') {
              finalQty = finalQty / 1000
              finalPrice = finalPrice * 1000
              finalSalePrice = finalSalePrice * 1000
              finalShipping = finalShipping * 1000
              finalProfit = finalProfit * 1000
              finalUnit = item.originalUnit
            } else if (originalUnit === 'gram' && currentUnit === 'kg') {
              finalQty = finalQty * 1000
              finalPrice = finalPrice / 1000
              finalSalePrice = finalSalePrice / 1000
              finalShipping = finalShipping / 1000
              finalProfit = finalProfit / 1000
              finalUnit = item.originalUnit
            }
          }

          return {
            productId: item._id,
            name: item.name,
            unit: finalUnit,
            qty: finalQty,
            price: finalPrice.toString(),
            sale_price: finalSalePrice.toString(),
            shippingCost: finalShipping.toString(),
            appliedProfit: finalProfit || 0,
            measurement: item.measurement
          }
        }),
      }
      console.log("payload", payload)
      await api.post('/api/sampleviewingclient', payload)

      showNotification({ message: 'Sample viewing session created.', variant: 'success' })
      setBuyerId('')
      setWorkerId('')
      setSelectedItems([])
      setProfitMargin(0)
      setSelectedBuyerName('')
    } catch (err: any) {
      console.error('Error submitting session:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to submit sample session.'
      showNotification({ message: errorMessage, variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalProducts / pageLimit)

  return (
    <div className="container py-5">

      <div className="mb-3 text-end">

        {user.role == "admin" && <SampleViewingAdminComponent currentUserId={user._id} />}

        <Button
          className="ml-4 mb-3 text-end"
          style={{ marginLeft: '6px' }}
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

      {/* Profit Margin Tabs */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'individual')}>
            <Nav variant="tabs">
              {/* <Nav.Item>
                <Nav.Link eventKey="individual">
                  <IconifyIcon icon="tabler:user" className="me-2" />
                  Individual Pricing
                </Nav.Link>
              </Nav.Item> */}
              <Nav.Item>
                <Nav.Link eventKey="bulk">
                  <IconifyIcon icon="tabler:cash" className="me-2" />
                  Bulk Profit Margin
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
        </Card.Header>
        <Card.Body>
          <Tab.Container activeKey={activeTab}>
            <Tab.Content>
              <Tab.Pane eventKey="individual">
                <div className="text-muted">
                  <IconifyIcon icon="tabler:info-circle" className="me-2" />
                  In this mode, you can set individual sale prices for each selected product.
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="bulk">
                <Row className="align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Profit Margin ($)
                        {selectedBuyerName && (
                          <small className="text-muted ms-2">for {selectedBuyerName}</small>
                        )}
                      </Form.Label>
                      <Form.Control
                        //type="number"
                        // step="0.01"
                        // min="0"
                        //value={profitMargin}
                        onChange={e => setProfitMargin(parseInt(e.target.value))}
                        placeholder="e.g., 200"
                      />
                      <Form.Text className="text-muted">
                        Amount to add on top of each product's base price
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Button
                      variant="success"
                      onClick={applyBulkProfit}
                      disabled={selectedItems.length === 0 || profitMargin <= 0}
                      className="me-2"
                    >
                      <IconifyIcon icon="tabler:plus" className="me-1" />
                      Apply to All Items ({selectedItems.length})
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button
                      variant="outline-secondary"
                      onClick={resetPrices}
                      disabled={selectedItems.length === 0}
                    >
                      <IconifyIcon icon="tabler:refresh" className="me-1" />
                      Reset Prices
                    </Button>
                  </Col>
                </Row>
                {profitMargin > 0 && selectedItems.length > 0 && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <strong>Preview:</strong> Adding ${profitMargin} to {selectedItems.length} items =
                    <span className="text-success fw-bold"> +${(profitMargin * selectedItems.length).toFixed(2)} total profit</span>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>

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
                {products.map(product => {
                  const basePrice = (parseFloat(product.price || 0) + parseFloat(product.shippingCost || 0))
                  const priceWithProfit = activeTab === 'bulk' && profitMargin > 0 ? basePrice + profitMargin : basePrice
                  const isSelected = selectedItems.find(item => item._id === product._id)

                  return (
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
                              <div className="text-end">
                                {activeTab === 'bulk' && profitMargin > 0 && !isSelected ? (
                                  <>
                                    <div className="text-muted text-decoration-line-through small">
                                      ${basePrice.toFixed(2)}
                                    </div>
                                    <div className="fw-bold text-success fs-6">
                                      ${priceWithProfit.toFixed(2)}
                                    </div>
                                  </>
                                ) : (
                                  <span className="fw-bold text-primary fs-6">
                                    ${basePrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <Button
                            variant={isSelected ? "success" : "primary"}
                            size="sm"
                            className="mt-auto d-flex align-items-center justify-content-center gap-1"
                            onClick={() => handleAddItem(product)}
                            disabled={isSelected}
                          >
                            {isSelected ? (
                              <>
                                <IconifyIcon icon="tabler:check" className="fs-6" />
                                Added
                              </>
                            ) : (
                              <>
                                <IconifyIcon icon="tabler:plus" className="fs-6" />
                                Add
                                {activeTab === 'bulk' && profitMargin > 0 && (
                                  <small className="ms-1">(+${profitMargin})</small>
                                )}
                              </>
                            )}
                          </Button>
                        </Card.Body>
                      </Card>
                    </div>
                  )
                })}
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Selected Items ({selectedItems.length})</h5>
              {activeTab === 'bulk' && (
                <small className="text-muted">
                  Bulk profit mode: ${profitMargin} per item
                </small>
              )}
            </div>
            <Table responsive bordered>
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Measurement</th>
                  <th>Base Price</th>
                  <th>Sale Price</th>
                  <th>Profit</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, index) => {
                  const basePrice = parseFloat(item.price) || 0
                  const salePrice = parseFloat(item.sale_price) || 0
                  const profit = salePrice - basePrice

                  return (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={item.qty}
                          onChange={e => handleUpdateItem(index, 'qty', (e.target.value))}
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <Form.Select
                          value={item.unit}
                          onChange={e => handleUnitChange(index, e.target.value)}
                          style={{ width: '100px' }}
                        >
                          <option value="">Select unit</option>
                          {unitOptions?.filter((u: string) => {
                            const lowerCurrent = item.unit?.toLowerCase();
                            if (['kg', 'gram'].includes(lowerCurrent)) {
                              return ['kg', 'gram'].includes(u.toLowerCase());
                            }
                            return true;
                          }).map((unit: string) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          value={item.measurement || 1}
                          onChange={e => handleUpdateItem(index, 'measurement', e.target.value)}
                          style={{ width: '100px' }}
                        >
                          {measurementOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td className="text-muted">${(parseFloat(item.price) + parseFloat(item.shippingCost)).toFixed(2)}</td>
                      <td>
                        <Form.Control
                          type="number"
                          //step="0.01"
                          value={item.sale_price}
                          onChange={e => handleUpdateItem(index, 'sale_price', (e.target.value))}
                          style={{ width: '120px' }}
                        />
                      </td>
                      <td className={profit > 0 ? 'text-success' : profit < 0 ? 'text-danger' : 'text-muted'}>
                        ${profit.toFixed(2)}
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
                  )
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <div className="d-grid">
        <Button
          onClick={handleSubmit}
          disabled={loading || selectedItems.length === 0}
          size="lg"
        >
          {loading ? <Spinner animation="border" size="sm" /> : `Send Sample List to ${selectedBuyerName || 'Buyer'}`}
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
                  <th>Total Profit</th>
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
                          <span>{item.name} ({item.qty}) {item.unit} {item.measurement < 1 ? `(${item.measurement})` : ''}</span>
                          <span className="small">
                            ${((parseFloat(item.sale_price) || 0) * (parseFloat(item.qty) || 1) * (parseFloat(item.measurement) || 1)).toFixed(2)}
                          </span>
                          <span className={`text-${item.status === 'accepted' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="fw-bold">
                      ${session.items.reduce((total: number, item: any) =>
                        total + ((parseFloat(item.sale_price) || 0) * (parseFloat(item.qty) || 1) * (parseFloat(item.measurement) || 1)), 0
                      ).toFixed(2)}
                    </td>
                    <td className="text-success fw-bold">
                      ${session.items.reduce((totalProfit: number, item: any) => {
                        const costPrice = (parseFloat(item.price) || 0)
                        const shipping = (parseFloat(item.shippingCost) || 0)
                        const salePrice = (parseFloat(item.sale_price) || 0)
                        const qty = (parseFloat(item.qty) || 1)
                        const measurement = (parseFloat(item.measurement) || 1)
                        // If shippingCost is 0 or missing, costPrice might already include shipping (for old records)
                        // But with new records, shipping is separate.
                        const profit = (salePrice - (costPrice + shipping)) * qty * measurement
                        return totalProfit + profit
                      }, 0).toFixed(2)}
                    </td>
                    <td className="text-capitalize">{session.status}</td>
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