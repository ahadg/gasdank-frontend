'use client'
import { useState, useEffect } from 'react'
import { Modal, Button, Form, Table, Card, Row, Col, Alert, Spinner } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'
import moment from 'moment'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface ISaleItem {
  _id: string
  transactionitem_id: {
    _id: string
    inventory_id: {
      name: string
      _id: string
    }
    qty: number
    unit: string
    price: number
    sale_price: number
    shipping: number
    measurement: string
  }
}

interface ISale {
  _id: string
  sale_reference_id?: string
  sale_price: number
  total: number
  created_at: string
  items: ISaleItem[]
  status: number
  notes?: string
}

interface IReturnItem {
  item_id: string
  qty: number
  price: number
  sale_price: number
  shipping: number
  unit: string
  measurement: number
  inventory_id: string
  name: string
}

interface ReturnSaleModalProps {
  show: boolean
  onClose: () => void
  buyerId: string
  onReturnComplete?: () => void
}

const ReturnSaleModal: React.FC<ReturnSaleModalProps> = ({
  show,
  onClose,
  buyerId,
  onReturnComplete
}) => {
  const user = useAuthStore((state) => state.user)
  const { showNotification } = useNotificationContext()
  
  // Main states
  const [sales, setSales] = useState<ISale[]>([])
  const [filteredSales, setFilteredSales] = useState<ISale[]>([])
  const [loading, setLoading] = useState(false)
  const [searchReferenceId, setSearchReferenceId] = useState('')
  
  // Selected sale states
  const [selectedSale, setSelectedSale] = useState<ISale | null>(null)
  const [showReturnForm, setShowReturnForm] = useState(false)
  
  // Return form states
  const [returnItems, setReturnItems] = useState<IReturnItem[]>([])
  const [returnNotes, setReturnNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  // Fetch all sales for the buyer
  const fetchSales = async () => {
    if (!user?._id || !buyerId) return
    
    setLoading(true)
    try {
      const response = await api.get(`/api/transaction/sales/${buyerId}`)
      setSales(response.data || [])
      setFilteredSales(response.data || [])
    } catch (error: any) {
      console.error('Error fetching sales:', error)
      showNotification({ 
        message: error?.response?.data?.error || 'Error fetching sales', 
        variant: 'danger' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter sales by reference ID
  useEffect(() => {
    if (!searchReferenceId.trim()) {
      setFilteredSales(sales)
    } else {
      const filtered = sales.filter(sale => 
        sale.sale_reference_id?.toLowerCase().includes(searchReferenceId.toLowerCase())
      )
      setFilteredSales(filtered)
    }
  }, [searchReferenceId, sales])

  // Load sales when modal opens
  useEffect(() => {
    if (show) {
      fetchSales()
    }
  }, [show, user?._id, buyerId])

  // Handle sale selection
  const handleSelectSale = (sale: ISale) => {
    setSelectedSale(sale)
    // Initialize return items with original quantities (auto-fill) and all necessary transaction data
    const initialReturnItems: IReturnItem[] = sale.items.map(item => {
      const txItem = item.transactionitem_id
      return {
        item_id: item._id,
        qty: txItem?.qty || 0, // Auto-fill with original quantity
        price: txItem?.price || 0,
        sale_price: txItem?.sale_price || 0,
        shipping: txItem?.shipping || 0,
        unit: txItem?.unit || '',
        measurement: Number(txItem?.measurement) || 1,
        inventory_id: txItem?.inventory_id?._id || '',
        name: txItem?.inventory_id?.name || 'Unknown Product'
      }
    })
    setReturnItems(initialReturnItems)
    setShowReturnForm(true)
  }

  // Handle return item quantity change - Updated to handle empty strings
  const handleReturnQtyChange = (itemId: string, value: string) => {
    setReturnItems(prev => 
      prev.map(item => 
        item.item_id === itemId 
          ? { 
              ...item, 
              qty: value === '' ? 0 : Math.max(0, parseInt(value) || 0)
            }
          : item
      )
    )
  }

  // Handle price changes
  const handlePriceChange = (itemId: string, field: 'price' | 'sale_price' | 'shipping', value: number) => {
    setReturnItems(prev => 
      prev.map(item => 
        item.item_id === itemId 
          ? { ...item, [field]: Math.max(0, value) }
          : item
      )
    )
  }

  // Calculate totals
  const calculateTotals = () => {
    const validReturnItems = returnItems.filter(item => item.qty > 0)
    
    const totalPrice = validReturnItems.reduce((sum, item) => 
      sum + (item.price * item.qty * item.measurement), 0
    )
    
    const totalShipping = validReturnItems.reduce((sum, item) => 
      sum + (item.shipping * item.qty), 0
    )
    
    const totalSalePrice = validReturnItems.reduce((sum, item) => 
      sum + (item.sale_price * item.qty * item.measurement), 0
    )
    
    const profit = totalSalePrice - (totalPrice + totalShipping)
    
    return { totalPrice, totalShipping, totalSalePrice, profit }
  }

  // Process return transaction
  const handleProcessReturn = async () => {
    if (!selectedSale || !user?._id) return

    // Validate at least one item has quantity > 0
    const validReturnItems = returnItems.filter(item => item.qty > 0)
    if (validReturnItems.length === 0) {
      showNotification({ 
        message: 'Please select at least one item to return with quantity > 0', 
        variant: 'warning' 
      })
      return
    }

    setProcessing(true)
    try {
      const { totalPrice, totalShipping, totalSalePrice, profit } = calculateTotals()

      // Create return transaction payload similar to AddProductModal
      const transactionPayload = {
        user_id: user._id,
        buyer_id: buyerId,
        payment: 0, // Payment may be zero for returns
        notes: returnNotes || `Return from sale: ${selectedSale.sale_reference_id}`,
        price: totalPrice,
        total_shipping: totalShipping,
        sale_price: totalSalePrice,
        profit: profit,
        type: "return",
        original_sale_id: selectedSale._id, // Track which sale this return is from
        items: validReturnItems.map(item => ({
          inventory_id: item.inventory_id,
          qty: item.qty,
          measurement: item.measurement,
          unit: item.unit,
          name: item.name,
          sale_price: item.sale_price,
          shipping: item.shipping,
          price: item.price,
        }))
      }

      // Create the return transaction
      const response = await api.post('/api/transaction', transactionPayload)
      
      console.log('Return transaction created:', response.data)
      
      showNotification({ 
        message: 'Return processed successfully', 
        variant: 'success' 
      })
      
      // Reset form
      setShowReturnForm(false)
      setSelectedSale(null)
      setReturnItems([])
      setReturnNotes('')
      
      // Refresh sales list
      fetchSales()
      
      // Callback to parent to refresh data
      if (onReturnComplete) {
        onReturnComplete()
      }
      
    } catch (error: any) {
      console.error('Error processing return:', error)
      showNotification({ 
        message: error?.response?.data?.error || 'Error processing return', 
        variant: 'danger' 
      })
    } finally {
      setProcessing(false)
    }
  }

  // Reset modal state when closing
  const handleClose = () => {
    setSelectedSale(null)
    setShowReturnForm(false)
    setReturnItems([])
    setReturnNotes('')
    setSearchReferenceId('')
    onClose()
  }

  // Format currency
  const formatCurrency = (value: number) =>
    `$${value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  const { totalPrice, totalShipping, totalSalePrice, profit } = calculateTotals()

  return (
    <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {showReturnForm ? 'Process Return Transaction' : 'Select Sale to Return'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {!showReturnForm ? (
          // Sales List View
          <>
            {/* Search */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Search by Reference ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter reference ID..."
                    value={searchReferenceId}
                    onChange={(e) => setSearchReferenceId(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <div className="text-muted">
                  Found {filteredSales.length} sale(s)
                </div>
              </Col>
            </Row>

            {/* Sales Table */}
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status" />
                <div className="mt-2">Loading sales...</div>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="bg-light">
                    <tr>
                      <th>Reference ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      {/* <th>Status</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => (
                        <tr key={sale._id}>
                          <td>
                            <strong>{sale.sale_reference_id || 'N/A'}</strong>
                          </td>
                          <td>{moment(sale.created_at).format('MM/DD/YYYY HH:mm')}</td>
                          <td>{sale.items?.length || 0} item(s)</td>
                          <td>{formatCurrency(sale.sale_price || sale.total)}</td>
                          {/* <td>
                            <span className={`badge ${sale.status === 1 ? 'bg-success' : 'bg-warning'}`}>
                              {sale.status === 1 ? 'Completed' : 'Pending'}
                            </span>
                          </td> */}
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSelectSale(sale)}
                            >
                              <IconifyIcon icon="tabler:arrow-back" className="me-1" />
                              Return
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          No sales found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        ) : (
          // Return Form View
          selectedSale && (
            <>
              {/* Sale Info */}
              <Card className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <strong>Reference ID:</strong><br />
                      {selectedSale.sale_reference_id || 'N/A'}
                    </Col>
                    <Col md={3}>
                      <strong>Date:</strong><br />
                      {moment(selectedSale.created_at).format('MM/DD/YYYY HH:mm')}
                    </Col>
                    <Col md={3}>
                      <strong>Total Amount:</strong><br />
                      {formatCurrency(selectedSale.sale_price || selectedSale.total)}
                    </Col>
                    <Col md={3}>
                      <strong>Items:</strong><br />
                      {selectedSale.items?.length || 0} item(s)
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Return Items */}
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Select Items to Return & Adjust Prices</h6>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped>
                      <thead className="bg-light">
                        <tr>
                          <th>Product Name</th>
                          <th>Original Qty</th>
                          <th>Unit</th>
                          <th>Return Qty</th>
                          <th>Sale Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSale.items?.map((item, index) => {
                          const returnItem = returnItems.find(ri => ri.item_id === item._id)
                          const txItem = item.transactionitem_id
                          console.log("txItem_txItem",txItem)
                          const itemSubtotal = 
                            (returnItem.qty * returnItem.measurement * returnItem.sale_price)
                          
                          return (
                            <tr key={item._id}>
                              <td>{txItem?.inventory_id?.name || 'Unknown Product'}</td>
                              <td>{txItem?.qty || 0}</td>
                              <td>{txItem?.unit || ''}</td>
                              <td>
                                <Form.Control
                                  type="number"
                                  max={txItem?.qty || 0}
                                  value={returnItem?.qty === 0 ? '' : returnItem?.qty}
                                  onChange={(e) => 
                                    handleReturnQtyChange(item._id, e.target.value)
                                  }
                                  style={{ width: '80px' }}
                                  placeholder="0"
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  value={returnItem?.sale_price}
                                  disabled
                                  onChange={(e) => 
                                    handlePriceChange(item._id, 'sale_price', parseFloat(e.target.value))
                                  }
                                  style={{ width: '80px' }}
                                />
                              </td>
                              <td>{formatCurrency(itemSubtotal)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {/* Return Notes */}
              <Form.Group className="mb-3">
                <Form.Label>Return Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter any additional notes about this return..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                />
              </Form.Group>

              {/* Transaction Summary */}
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Return Transaction Summary</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <strong>Items to return:</strong><br />
                      {returnItems.filter(item => item.qty > 0).length}
                    </Col>
                    <Col md={3}>
                      <strong>Total Sale Price:</strong><br />
                      {formatCurrency(totalSalePrice)}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )
        )}
      </Modal.Body>
      
      <Modal.Footer>
        {!showReturnForm ? (
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        ) : (
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowReturnForm(false)}
              disabled={processing}
            >
              Back to Sales List
            </Button>
            <Button 
              variant="success" 
              onClick={handleProcessReturn}
              disabled={processing || returnItems.filter(item => item.qty > 0).length === 0}
            >
              {processing ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                  Processing Return...
                </>
              ) : (
                <>
                  <IconifyIcon icon="tabler:check" className="me-1" />
                  Process Return Transaction
                </>
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ReturnSaleModal