'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Col, Form, Row, Spinner, Table, Badge, Alert } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthStore } from '@/store/authStore'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Modal from 'react-bootstrap/Modal'

interface SampleItem {
  productId: string
  name: string
  qty: number
  unit: string
  price: number
  shippingCost: number
  sale_price: number
}

interface SampleSession {
  _id: string
  buyer_id: {
    _id: string
    firstName?: string
    lastName?: string
    name?: string
  }
  user_created_by: {
    _id: string
    firstName: string
    lastName: string
  }
  items: SampleItem[]
  status: 'pending' | 'accepted' | 'rejected'
  sentAt: string
  notes?: string
}

interface SaleItem {
  productId: string
  name: string
  quantity: number
  measurement: number
  unit: string
  price: number
  sale_price: number
  shipping: number
}

export default function WorkerSampleManagementPage() {
  const { showNotification } = useNotificationContext()
  const [sampleSessions, setSampleSessions] = useState<SampleSession[]>([])
  const [loading, setLoading] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SampleSession | null>(null)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [saleNotes, setSaleNotes] = useState('')
  const [saleLoading, setSaleLoading] = useState(false)
  const [processingSession, setProcessingSession] = useState<string | null>(null)
  
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    fetchSampleSessions()
  }, [user._id])

  const fetchSampleSessions = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/sampleviewingclient/worker?user_id=${user._id}`)
      setSampleSessions(response.data || [])
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Failed to fetch sample sessions',
        variant: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  const rejectSession = async (session: SampleSession) => {
    try {
      setProcessingSession(session._id)
      
      // Update session status to rejected
      await api.patch(`/api/sampleviewingclient/${session._id}/status`, {
        status: 'rejected'
      })
      
      // Remove the session from state after successful rejection
      setSampleSessions(prev => 
        prev.filter(sessionItem => sessionItem._id !== session._id)
      )
      
      showNotification({
        message: 'Sample session rejected successfully',
        variant: 'success'
      })
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Failed to reject session',
        variant: 'danger'
      })
    } finally {
      setProcessingSession(null)
    }
  }

  const prepareSaleModal = (session: SampleSession) => {
    // Convert all items to sale items
    const saleItemsData: SaleItem[] = session.items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.qty,
      measurement: 1,
      unit: item.unit,
      price: item.price,
      sale_price: item.sale_price,
      shipping: 0
    }))

    setSaleItems(saleItemsData)
    setSelectedSession(session)
    setShowSaleModal(true)
  }

  const handleSaleItemChange = (index: number, field: keyof SaleItem, value: string | number) => {
    setSaleItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const calculateTotals = () => {
    const orgPrice = saleItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.measurement) * Number(item.price),
      0
    )

    const totalSalePrice = saleItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.measurement) * Number(item.sale_price),
      0
    )

    const totalShipping = saleItems.reduce((sum, item) => sum + Number(item.shipping), 0)

    return { orgPrice, totalSalePrice, totalShipping, profit: totalSalePrice - orgPrice }
  }

  const handleSaleSubmit = async () => {
    if (!selectedSession || saleItems.length === 0) return

    try {
      setSaleLoading(true)
    
      // Then create the sale transaction
      const transformedItems = saleItems.map(item => ({
        inventory_id: item.productId,
        qty: Number(item.quantity) * Number(item.measurement),
        measurement: item.measurement,
        name: item.name,
        unit: item.unit,
        price: item.price,
        shipping: item.shipping,
        sale_price: item.sale_price,
      }))

      const { orgPrice, totalSalePrice, totalShipping, profit } = calculateTotals()
      const caltotalShipping = selectedSession?.items?.reduce((sum, item) => sum + Number(item?.shippingCost), 0)
      
      const transactionPayload = {
        worker_id: user._id,
        user_id: user?.created_by,
        buyer_id: selectedSession.buyer_id._id,
        items: transformedItems,
        price: orgPrice,
        sale_price: totalSalePrice,
        profit: profit,
        total_shipping: caltotalShipping,
        notes: saleNotes,
        type: "sale",
      }

      let resp = await api.post('/api/transaction', transactionPayload)
      
      // Remove the session from state after successful sale
      setSampleSessions(prev => 
        prev.filter(sessionItem => sessionItem._id !== selectedSession._id)
      )
      
      showNotification({
        message: 'Sale processed successfully',
        variant: 'success'
      })
      console.log("resp",resp)
      // First, update session status to accepted
      await api.patch(`/api/sampleviewingclient/${selectedSession._id}/status`, {
        status: 'accepted',
        transaction_id : resp?.data?.transaction_id
      })
      
      
      setShowSaleModal(false)
      setSaleItems([])
      setSaleNotes('')
      setSelectedSession(null)
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error processing sale',
        variant: 'danger'
      })
    } finally {
      setSaleLoading(false)
    }
  }

  // Mobile-friendly item card component
  const MobileItemCard = ({ item }: { item: SampleItem }) => (
    <Card className="mb-2">
      <Card.Body className="py-2">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h6 className="mb-1 text-truncate">{item.name}</h6>
            <small className="text-muted">
              {item.qty} {item.unit} • ₹{item?.sale_price?.toFixed(2)}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  )

  // Mobile-friendly sale item component
  const MobileSaleItem = ({ item, index }: { item: SaleItem; index: number }) => (
    <Card className="mb-3">
      <Card.Body>
        <h6 className="mb-3">{item.name}</h6>
        <Row className="g-2">
          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small">Quantity</Form.Label>
              <Form.Control
                type="number"
                value={item.quantity}
                onChange={(e) => handleSaleItemChange(index, 'quantity', e.target.value)}
                size="sm"
              />
            </Form.Group>
          </Col>
          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small">Measurement</Form.Label>
              <Form.Control
                type="number"
                value={item.measurement}
                onChange={(e) => handleSaleItemChange(index, 'measurement', e.target.value)}
                size="sm"
              />
            </Form.Group>
          </Col>
          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small">Unit</Form.Label>
              <Form.Control
                type="text"
                value={item.unit}
                disabled
                size="sm"
              />
            </Form.Group>
          </Col>
          {
            user?.access?.sampleviewingmanagement?.pricesVisible
          &&
          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small">Cost Price</Form.Label>
              <Form.Control
                type="number"
                value={item.price}
                onChange={(e) => handleSaleItemChange(index, 'price', e.target.value)}
                size="sm"
              />
            </Form.Group>
          </Col>
          }
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small">Sale Price</Form.Label>
              <Form.Control
                type="number"
                value={item.sale_price}
                onChange={(e) => handleSaleItemChange(index, 'sale_price', e.target.value)}
                size="sm"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" />
      </div>
    )
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-3">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-2">
        <h3 className="mb-0">Sample Sessions</h3>
        <Button 
          variant="outline-primary" 
          onClick={fetchSampleSessions} 
          disabled={loading}
          className="d-flex align-items-center"
        >
          <IconifyIcon icon="tabler:refresh" className="me-1" />
          Refresh
        </Button>
      </div>

      {sampleSessions.length === 0 ? (
        <Alert variant="info" className="text-center">
          <h5>No Sample Sessions</h5>
          <p className="mb-0">No sample viewing sessions assigned to you yet.</p>
        </Alert>
      ) : (
        <Row>
          {sampleSessions.map((session) => (
            <Col xs={12} className="mb-4" key={session._id}>
              <Card>
                <Card.Header className="p-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
                    <div className="flex-grow-1">
                      <h5 className="mb-1">
                        {session.buyer_id?.name || `${session.buyer_id?.firstName} ${session.buyer_id?.lastName}`}
                      </h5>
                      <small className="text-muted">
                        {new Date(session.sentAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
                      <Badge bg={session.status === 'pending' ? 'warning' : session.status === 'accepted' ? 'success' : 'danger'}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                      {session.status === 'pending' && (
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => prepareSaleModal(session)}
                            disabled={processingSession === session._id}
                          >
                            <IconifyIcon icon="tabler:shopping-cart" className="me-1" />
                            Create Sale ({session.items.length})
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => rejectSession(session)}
                            disabled={processingSession === session._id}
                          >
                            {processingSession === session._id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <IconifyIcon icon="tabler:x" className="me-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body className="p-3">
                  {session.notes && (
                    <Alert variant="info" className="mb-3">
                      <strong>Notes:</strong> {session.notes}
                    </Alert>
                  )}
                  
                  {/* Desktop Table */}
                  <div className="d-none d-md-block">
                    <Table striped responsive>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Unit</th> 
                          {
                          user?.access?.sampleviewingmanagement?.pricesVisible
                          && 
                          <th>Price</th> 
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {session.items.map((item, index) => (
                          <tr key={item.productId}>
                            <td>{item.name}</td>
                            <td>{item.qty}</td>
                            <td>{item.unit}</td>
                            {
                            user?.access?.sampleviewingmanagement?.pricesVisible
                            &&
                            <td>₹{item?.sale_price?.toFixed(2)}</td> 
                            }
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="d-md-none">
                    {session.items.map((item) => (
                      <MobileItemCard key={item.productId} item={item} />
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Sale Modal */}
      <Modal 
        show={showSaleModal} 
        onHide={() => setShowSaleModal(false)} 
        size="xl"
        fullscreen="md-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Sale</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Desktop Table */}
          <div className="d-none d-lg-block">
            <Table striped responsive>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Measurement</th>
                  <th>Unit</th>
                  {
                  user?.access?.sampleviewingmanagement?.pricesVisible
                    &&
                  <th>Cost Price</th> 
                  }
                  {
                  user?.access?.sampleviewingmanagement?.pricesVisible
                    &&
                  <th>Sale Price</th> 
                  }
                </tr>
              </thead>
              <tbody>
                {saleItems.map((item, index) => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleSaleItemChange(index, 'quantity', e.target.value)}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={item.measurement}
                        onChange={(e) => handleSaleItemChange(index, 'measurement', e.target.value)}
                        size="sm"
                      />
                    </td>
                    <td>{item.unit}</td>
                    {
                    user?.access?.sampleviewingmanagement?.pricesVisible
                    &&
                    <td>
                      <Form.Control
                        type="number"
                        value={item.price}
                        onChange={(e) => handleSaleItemChange(index, 'price', e.target.value)}
                        size="sm"
                      />
                    </td>
                    }
                    {
                    user?.access?.sampleviewingmanagement?.pricesVisible
                    &&
                    <td>
                      <Form.Control
                        type="number"
                        value={item.sale_price}
                        onChange={(e) => handleSaleItemChange(index, 'sale_price', e.target.value)}
                        size="sm"
                      />
                    </td>
                    }
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="d-lg-none">
            {saleItems.map((item, index) => (
              <MobileSaleItem key={item.productId} item={item} index={index} />
            ))}
          </div>

          <Row className="mt-4">
            <Col lg={6} className="mb-3">
              <Form.Group>
                <Form.Label>Sale Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="Add notes for this sale..."
                />
              </Form.Group>
            </Col>
            {
            user?.access?.sampleviewingmanagement?.pricesVisible
            &&
            <Col lg={6}>
              <div className="border rounded p-3">
                <h6>Sale Summary</h6>
                <div className="d-flex justify-content-between mb-1">
                  <span>Cost Price:</span>
                  <span>₹{calculateTotals().orgPrice.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Sale Price:</span>
                  <span>₹{calculateTotals().totalSalePrice.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between">
                  <strong>Profit:</strong>
                  <strong className={calculateTotals().profit >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{calculateTotals().profit.toFixed(2)}
                  </strong>
                </div>
              </div>
            </Col> 
            }
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column flex-sm-row gap-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowSaleModal(false)}
            className="w-100 w-sm-auto order-2 order-sm-1"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaleSubmit}
            disabled={saleLoading || saleItems.length === 0}
            className="w-100 w-sm-auto order-1 order-sm-2"
          >
            {saleLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              'Process Sale'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}