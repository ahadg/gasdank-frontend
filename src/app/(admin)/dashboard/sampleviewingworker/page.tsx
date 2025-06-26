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
  status: 'pending' | 'accepted' | 'rejected',
  shippingCost: number,
  sale_price : number
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
  viewingStatus: 'pending' | 'viewed'
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
  const [savingSession, setSavingSession] = useState<string | null>(null)
  console.log("selectedSession",selectedSession)
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

  const updateItemStatus = async (sessionId: string, items: SampleItem[]) => {
    try {
      setSavingSession(sessionId)
      
      const payload = {
        items: items.map(item => ({
          productId: item.productId,
          status: item.status
        }))
      }
      
      const response = await api.patch(`/api/sampleviewingclient/${sessionId}/items`, payload)
      
      // Remove the session from state after successful update
      setSampleSessions(prev => 
        prev.filter(session => session._id !== sessionId)
      )
      
      // showNotification({
      //   message: 'Sample session updated successfully and removed from list',
      //   variant: 'success'
      // })
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Failed to update item statuses',
        variant: 'danger'
      })
    } finally {
      setSavingSession(null)
    }
  }

  const handleStatusChange = (sessionId: string, itemIndex: number, newStatus: string) => {
    setSampleSessions(prev => 
      prev.map(session => {
        if (session._id === sessionId) {
          const updatedItems = [...session.items]
          updatedItems[itemIndex].status = newStatus as 'pending' | 'accepted' | 'rejected'
          return { ...session, items: updatedItems }
        }
        return session
      })
    )
  }

  const handleSaveSession = (session: SampleSession) => {
    updateItemStatus(session._id, session.items)
  }

  const prepareSaleModal = (session: SampleSession) => {
    const acceptedItems = session.items.filter(item => item.status === 'accepted')
    
    if (acceptedItems.length === 0) {
      showNotification({
        message: 'No accepted items to sell in this session',
        variant: 'warning'
      })
      return
    }

    const saleItemsData: SaleItem[] = acceptedItems.map(item => ({
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
      const payload = {
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

      await api.post('/api/transaction', payload)
      
      showNotification({
        message: 'Sale processed successfully',
        variant: 'success'
      })
      
      setShowSaleModal(false)
      setSaleItems([])
      setSaleNotes('')
      setSelectedSession(null)
      fetchSampleSessions()
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error processing sale',
        variant: 'danger'
      })
    } finally {
      setSaleLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'rejected': return 'danger'
      default: return 'secondary'
    }
  }

  const hasChanges = (session: SampleSession) => {
    return session.items.some(item => item.status !== 'pending')
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" />
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Sample Sessions</h3>
        <Button variant="outline-primary" onClick={fetchSampleSessions} disabled={loading}>
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
          {sampleSessions.map((session) => {
            const isChanged = hasChanges(session)
            const acceptedCount = session.items.filter(item => item.status === 'accepted').length
            
            return (
              <Col lg={12} className="mb-4" key={session._id}>
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">
                        {session.buyer_id?.name || `${session.buyer_id?.firstName} ${session.buyer_id?.lastName}`}
                      </h5>
                      <small className="text-muted">
                        {new Date(session.sentAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {session.viewingStatus === 'viewed' && (
                        <Badge bg="success">Viewed</Badge>
                      )}
                      {acceptedCount > 0 && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => prepareSaleModal(session)}
                        >
                          Create Sale ({acceptedCount})
                        </Button>
                      )}
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    {session.notes && (
                      <Alert variant="info" className="mb-3">
                        <strong>Notes:</strong> {session.notes}
                      </Alert>
                    )}
                    
                    <Table striped>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Unit</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {session.items.map((item, index) => (
                          <tr key={item.productId}>
                            <td>{item.name}</td>
                            <td>{item.qty}</td>
                            <td>{item.unit}</td>
                            <td>₹{item?.sale_price?.toFixed(2)}</td>
                            <td>
                              <Badge bg={getStatusBadgeVariant(item.status)}>
                                {item.status}
                              </Badge>
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={item.status}
                                onChange={(e) => handleStatusChange(session._id, index, e.target.value)}
                                style={{ width: '120px' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accept</option>
                                <option value="rejected">Reject</option>
                              </Form.Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    
                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        variant={isChanged ? "primary" : "outline-secondary"}
                        onClick={() => handleSaveSession(session)}
                        disabled={savingSession === session._id}
                        size="sm"
                      >
                        {savingSession === session._id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <IconifyIcon icon="tabler:check" />
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* Sale Modal */}
      <Modal show={showSaleModal} onHide={() => setShowSaleModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Create Sale</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Measurement</th>
                <th>Unit</th>
                <th>Cost Price</th>
                <th>Sale Price</th>
                {/* <th>Shipping</th> */}
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item, index) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>
                    <Form.Control
                      type="number"
                      // min="1"
                      value={item.quantity}
                      onChange={(e) => handleSaleItemChange(index, 'quantity', (e.target.value))}
                      size="sm"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      // min="1"
                      value={item.measurement}
                      onChange={(e) => handleSaleItemChange(index, 'measurement', (e.target.value))}
                      size="sm"
                    />
                  </td>
                  <td>{item.unit}</td>
                  <td>
                    <Form.Control
                      type="number"
                      // min="0"
                      // step="0.01"
                      value={item.price}
                      onChange={(e) => handleSaleItemChange(index, 'price', (e.target.value))}
                      size="sm"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      // min="0"
                      // step="0.01"
                      value={item.sale_price}
                      onChange={(e) => handleSaleItemChange(index, 'sale_price', (e.target.value))}
                      size="sm"
                    />
                  </td>
                  {/* <td>
                    <Form.Control
                      type="number"
                      // min="0"
                      // step="0.01"
                      value={item.shipping}
                      onChange={(e) => handleSaleItemChange(index, 'shipping', (e.target.value))}
                      size="sm"
                    />
                  </td> */}
                </tr>
              ))}
            </tbody>
          </Table>

          <Row className="mt-4">
            <Col md={6}>
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
            <Col md={6}>
              <div className="border rounded p-3">
                <h6>Sale Summary</h6>
                <div className="d-flex justify-content-between">
                  <span>Cost Price:</span>
                  <span>${calculateTotals().orgPrice.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Sale Price:</span>
                  <span>${calculateTotals().totalSalePrice.toFixed(2)}</span>
                </div>
                {/* <div className="d-flex justify-content-between">
                  <span>Shipping:</span>
                  <span>${calculateTotals().totalShipping.toFixed(2)}</span>
                </div> */}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Profit:</strong>
                  <strong className={calculateTotals().profit >= 0 ? 'text-success' : 'text-danger'}>
                    ${calculateTotals().profit.toFixed(2)}
                  </strong>
                </div>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaleModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaleSubmit}
            disabled={saleLoading || saleItems.length === 0}
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