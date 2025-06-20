'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, Form, Row, Col, CardHeader, Modal, Badge, Alert } from 'react-bootstrap'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'

export default function WholesaleNotificationsPage() {
  const user = useAuthStore((state) => state.user)
  const [accounts, setAccounts] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [activeModal, setActiveModal] = useState<string>()
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [notificationMessage, setNotificationMessage] = useState<string>('')
  const [sendingNotification, setSendingNotification] = useState<boolean>(false)
  const { showNotification } = useNotificationContext()
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]) // Change from selectedProduct to selectedProducts
const [communicationMethod, setCommunicationMethod] = useState<string>('sms') // New state for communication method
// Update the handleProductSelection function (add this new function)
const handleProductSelection = (productId: string) => {
  const product = products.find(p => p._id === productId)
  if (product) {
    setSelectedProducts(prev => 
      prev.find(p => p._id === productId)
        ? prev.filter(p => p._id !== productId)
        : [...prev, product]
    )
  }
}

const selectAllProducts = () => {
  if (selectedProducts.length === products.length) {
    setSelectedProducts([])
  } else {
    setSelectedProducts([...products])
  }
}


  // Fetch buyers and products for the current user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, accountRes] = await Promise.all([
          api.get(`/api/inventory/${user?._id}`),
          api.get(`/api/buyers?user_id=${user._id}`)
        ])
        setProducts(productRes.data.products || [])
        setAccounts(accountRes.data || [])
      } catch (err: any) {
        console.log("error", err)
        showNotification({ message: 'Failed to load data.', variant: 'danger' })
      }
    }

    if (user?._id) {
      fetchData()
    }
  }, [user._id])

  useEffect(() => {
    if(selectedAccount) {
      let newSelectedAccount = accounts.find((item) => item?._id == selectedAccount?._id)
      setSelectedAccount(newSelectedAccount)
    }
  },[accounts])

  // Get accounts with outstanding balances (negative balance means they owe money)
  const accountsWithOutstanding = accounts.filter(acc => acc.currentBalance < 0)

  // Handle buyer selection for notifications
  const handleBuyerSelection = (buyerId: string) => {
    setSelectedBuyers(prev => 
      prev.includes(buyerId) 
        ? prev.filter(id => id !== buyerId)
        : [...prev, buyerId]
    )
  }

  const selectAllBuyers = () => {
    if (selectedBuyers.length === accounts.length) {
      setSelectedBuyers([])
    } else {
      setSelectedBuyers(accounts.map(acc => acc._id))
    }
  }

  const selectOutstandingBuyers = () => {
    setSelectedBuyers(accountsWithOutstanding.map(acc => acc._id))
  }

  // Update the sendNotifications function call for product type
const sendNotifications = async (type: 'outstanding' | 'product') => {
  if (selectedBuyers.length === 0) {
    showNotification({ message: 'Please select at least one buyer', variant: 'warning' })
    return
  }

  if (type === 'product' && selectedProducts.length === 0) { // Changed from selectedProduct to selectedProducts
    showNotification({ message: 'Please select at least one product', variant: 'warning' })
    return
  }

  setSendingNotification(true)
  try {
    const selectedAccountsData = accounts.filter(acc => selectedBuyers.includes(acc._id))
    
    let message = ''
    if (type === 'outstanding') {
      message = notificationMessage || 'Reminder: You have an outstanding balance that needs to be paid.'
    } else {
      const productNames = selectedProducts.map(p => p.name).join(', ')
      message = notificationMessage || `New products available: ${productNames}`
    }

    // API call to send notifications
    await api.post('/api/notification/send', {
      recipients: selectedAccountsData.map(acc => ({
        id: acc._id,
        email: acc.email,
        name: `${acc.firstName} ${acc.lastName}`,
        balance: acc.currentBalance,
        phone: acc?.phone
      })),
      type,
      message,
      products: type === 'product' ? selectedProducts : null, // Changed from product to products
      communicationMethod // Add communication method to API call
    })

    showNotification({ 
      message: `Notifications sent to ${selectedBuyers.length} buyer(s) via ${communicationMethod.toUpperCase()}`, 
      variant: 'success' 
    })
    
    // Reset form
    setSelectedBuyers([])
    setSelectedProducts([]) // Changed from setSelectedProduct(null)
    setNotificationMessage('')
    setCommunicationMethod('sms')
    setActiveModal(null)
    
  } catch (error: any) {
    showNotification({ 
      message: error?.response?.data?.error || 'Failed to send notifications', 
      variant: 'danger' 
    })
  } finally {
    setSendingNotification(false)
  }
}


  return (
    <div className="container-fluid">
      <PageTitle 
        title="Wholesale Notifications" 
        subTitle="Send payment reminders and product announcements to your buyers" 
      />

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="bg-light h-100">
            <Card.Body className="text-center">
              <div className="mb-2">
                <IconifyIcon icon="tabler:users" className="fs-1 text-primary" />
              </div>
              <h5 className="mb-1">{accounts.length}</h5>
              <small className="text-muted">Total Buyers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-light h-100">
            <Card.Body className="text-center">
              <div className="mb-2">
                <IconifyIcon icon="tabler:alert-triangle" className="fs-1 text-warning" />
              </div>
              <h5 className="mb-1">{accountsWithOutstanding.length}</h5>
              <small className="text-muted">Outstanding Balances</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-light h-100">
            <Card.Body className="text-center">
              <div className="mb-2">
                <IconifyIcon icon="tabler:package" className="fs-1 text-info" />
              </div>
              <h5 className="mb-1">{products.length}</h5>
              <small className="text-muted">Available Products</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Action Card */}
      <Card className="shadow-sm">
        <CardHeader className="bg-white border-bottom">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 d-flex align-items-center">
                <IconifyIcon icon="tabler:bell" className="me-2 text-primary" />
                Notification Center
              </h5>
              <small className="text-muted">Send targeted messages to your wholesale buyers</small>
            </Col>
          </Row>
        </CardHeader>
        
        <Card.Body className="p-4">
          {accountsWithOutstanding.length > 0 && (
            <Alert variant="warning" className="mb-4">
              <div className="d-flex align-items-center">
                <IconifyIcon icon="tabler:alert-circle" className="me-2" />
                <div>
                  <strong>Payment Reminders Needed</strong>
                  <div className="small">
                    {accountsWithOutstanding.length} buyer(s) have outstanding balances requiring attention
                  </div>
                </div>
              </div>
            </Alert>
          )}

          <Row className="g-3">
            <Col md={6}>
              <Card className="h-100 border-warning">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <IconifyIcon icon="tabler:credit-card" className="fs-1 text-warning" />
                  </div>
                  <h5 className="mb-2">Payment Reminders</h5>
                  <p className="text-muted mb-3">
                    Send payment reminders to buyers with outstanding balances
                  </p>
                  <Button 
                    variant="warning" 
                    size="lg"
                    onClick={() => setActiveModal('outstanding')}
                    className="w-100"
                  >
                    <IconifyIcon icon="tabler:send" className="me-2" />
                    Send Payment Reminders
                    {accountsWithOutstanding.length > 0 && (
                      <Badge bg="light" text="dark" className="ms-2">
                        {accountsWithOutstanding.length}
                      </Badge>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100 border-info">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <IconifyIcon icon="tabler:shopping-bag" className="fs-1 text-info" />
                  </div>
                  <h5 className="mb-2">Product Announcements</h5>
                  <p className="text-muted mb-3">
                    Notify buyers about new products and special offers
                  </p>
                  <Button 
                    variant="info" 
                    size="lg"
                    onClick={() => setActiveModal('product')}
                    className="w-100"
                  >
                    <IconifyIcon icon="tabler:megaphone" className="me-2" />
                    Send Product Updates
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Outstanding Payment Notification Modal */}
      {activeModal === 'outstanding' && (
        <Modal show={true} onHide={() => setActiveModal(null)} size="lg">
          <Modal.Header closeButton className="bg-warning text-white">
            <Modal.Title>
              <IconifyIcon icon="tabler:alert-circle" className="me-2" />
              Payment Reminder Notifications
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Alert variant="info" className="mb-4">
              <small>
                <IconifyIcon icon="tabler:info-circle" className="me-1" />
                Select buyers to send payment reminders. Only buyers with outstanding balances are highlighted.
              </small>
            </Alert>

            <div className="mb-4">
              <div className="d-flex gap-2 mb-3">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={selectAllBuyers}
                >
                  <IconifyIcon icon="tabler:check-all" className="me-1" />
                  {selectedBuyers.length === accounts.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={selectOutstandingBuyers}
                >
                  <IconifyIcon icon="tabler:alert-triangle" className="me-1" />
                  Outstanding Only ({accountsWithOutstanding.length})
                </Button>
              </div>
              
              <div className="border rounded p-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {accounts.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <IconifyIcon icon="tabler:users-off" className="fs-1 mb-2" />
                    <div>No buyers found</div>
                  </div>
                ) : (
                  accounts.map((acc) => (
                    <div key={acc._id} className={`form-check d-flex justify-content-between align-items-center p-2 mb-2 rounded ${acc.currentBalance < 0 ? 'bg-warning bg-opacity-10' : ''}`}>
                      <div className="d-flex align-items-center">
                        <input
                          className="form-check-input me-3"
                          type="checkbox"
                          checked={selectedBuyers.includes(acc._id)}
                          onChange={() => handleBuyerSelection(acc._id)}
                        />
                        <div>
                          <label className="form-check-label fw-medium">
                            {acc.firstName} {acc.lastName}
                          </label>
                          {acc.email && (
                            <div className="small text-muted">{acc.email}</div>
                          )}
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className={`fw-bold ${acc.currentBalance < 0 ? 'text-danger' : 'text-success'}`}>
                          ${Math.abs(Number(acc.currentBalance)).toLocaleString()}
                        </span>
                        {acc.currentBalance < 0 && (
                          <Badge bg="danger" className="ms-2">Overdue</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">
                <IconifyIcon icon="tabler:message" className="me-1" />
                Custom Message (Optional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter a personalized message or leave blank to use the default payment reminder template..."
                className="form-control-lg"
              />
              <Form.Text className="text-muted">
                Default: "Reminder: You have an outstanding balance that needs to be paid."
              </Form.Text>
            </Form.Group>

            <div className="bg-light p-3 rounded">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium">Selected Recipients:</span>
                <Badge bg="primary" className="fs-6">{selectedBuyers.length}</Badge>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" onClick={() => setActiveModal(null)}>
              <IconifyIcon icon="tabler:x" className="me-1" />
              Cancel
            </Button>
            <Button 
              variant="warning" 
              onClick={() => sendNotifications('outstanding')}
              disabled={sendingNotification || selectedBuyers.length === 0}
              className="px-4"
            >
              {sendingNotification ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  Sending...
                </>
              ) : (
                <>
                  <IconifyIcon icon="tabler:send" className="me-1" />
                  Send Reminders ({selectedBuyers.length})
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Product Notification Modal */}
      // Replace the entire Product Notification Modal JSX with this updated version:
{activeModal === 'product' && (
  <Modal show={true} onHide={() => setActiveModal(null)} size="xl">
    <Modal.Header closeButton className="bg-info text-white">
      <Modal.Title>
        <IconifyIcon icon="tabler:shopping-bag" className="me-2" />
        Product Announcement
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="p-4">
      <Alert variant="info" className="mb-4">
        <small>
          <IconifyIcon icon="tabler:info-circle" className="me-1" />
          Select products and choose which buyers should receive the announcement.
        </small>
      </Alert>

      {/* Communication Method Selection */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-medium">
          <IconifyIcon icon="tabler:message-circle" className="me-1" />
          Communication Method
        </Form.Label>
        <div className="border rounded p-3">
          <Row>
            <Col md={6}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="communicationMethod"
                  id="sms"
                  checked={communicationMethod === 'sms'}
                  onChange={() => setCommunicationMethod('sms')}
                />
                <label className="form-check-label d-flex align-items-center" htmlFor="sms">
                  <IconifyIcon icon="tabler:message" className="me-2 text-success" />
                  <div>
                    <strong>SMS</strong>
                    <div className="small text-muted">Send via text message</div>
                  </div>
                </label>
              </div>
            </Col>
            <Col md={6}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="communicationMethod"
                  id="email"
                  checked={communicationMethod === 'email'}
                  onChange={() => setCommunicationMethod('email')}
                />
                <label className="form-check-label d-flex align-items-center" htmlFor="email">
                  <IconifyIcon icon="tabler:mail" className="me-2 text-primary" />
                  <div>
                    <strong>Email</strong>
                    <div className="small text-muted">Send via email</div>
                  </div>
                </label>
              </div>
            </Col>
          </Row>
          {/* <Row className="mt-3">
            <Col md={4}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="communicationMethod"
                  id="whatsapp"
                  disabled
                />
                <label className="form-check-label d-flex align-items-center opacity-50" htmlFor="whatsapp">
                  <IconifyIcon icon="tabler:brand-whatsapp" className="me-2 text-muted" />
                  <div>
                    <strong>WhatsApp</strong>
                    <div className="small text-muted">Coming soon</div>
                  </div>
                </label>
              </div>
            </Col>
            <Col md={4}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="communicationMethod"
                  id="signal"
                  disabled
                />
                <label className="form-check-label d-flex align-items-center opacity-50" htmlFor="signal">
                  <IconifyIcon icon="tabler:message-circle-2" className="me-2 text-muted" />
                  <div>
                    <strong>Signal</strong>
                    <div className="small text-muted">Coming soon</div>
                  </div>
                </label>
              </div>
            </Col>
            <Col md={4}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="communicationMethod"
                  id="wechat"
                  disabled
                />
                <label className="form-check-label d-flex align-items-center opacity-50" htmlFor="wechat">
                  <IconifyIcon icon="tabler:brand-wechat" className="me-2 text-muted" />
                  <div>
                    <strong>WeChat</strong>
                    <div className="small text-muted">Coming soon</div>
                  </div>
                </label>
              </div>
            </Col>
          </Row> */}
        </div>
      </Form.Group>

      {/* Product Selection */}
      <Form.Group className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Label className="fw-medium">
            <IconifyIcon icon="tabler:package" className="me-1" />
            Select Products
          </Form.Label>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={selectAllProducts}
          >
            <IconifyIcon icon="tabler:check-all" className="me-1" />
            {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        
        <div className="border rounded p-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {products.length === 0 ? (
            <div className="text-center text-muted py-4">
              <IconifyIcon icon="tabler:package-off" className="fs-1 mb-2" />
              <div>No products found</div>
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="form-check d-flex justify-content-between align-items-center p-2 mb-2 rounded border">
                <div className="d-flex align-items-center">
                  <input
                    className="form-check-input me-3"
                    type="checkbox"
                    checked={selectedProducts.some(p => p._id === product._id)}
                    onChange={() => handleProductSelection(product._id)}
                  />
                  <div>
                    <label className="form-check-label fw-medium">
                      {product.name}
                    </label>
                    {product.description && (
                      <div className="small text-muted">{product.description}</div>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <span className="fw-bold text-success">${product.price}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {selectedProducts.length > 0 && (
          <div className="mt-3 p-3 bg-light rounded">
            <div className="fw-medium mb-2">Selected Products ({selectedProducts.length}):</div>
            <div className="d-flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <Badge key={product._id} bg="info" className="p-2">
                  {product.name} - ${product.price}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    style={{ fontSize: '0.6em' }}
                    onClick={() => handleProductSelection(product._id)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Form.Group>

      {/* Buyer Selection */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Label className="fw-medium">
            <IconifyIcon icon="tabler:users" className="me-1" />
            Select Recipients
          </Form.Label>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={selectAllBuyers}
          >
            <IconifyIcon icon="tabler:check-all" className="me-1" />
            {selectedBuyers.length === accounts.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        
        <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {accounts.length === 0 ? (
            <div className="text-center text-muted py-4">
              <IconifyIcon icon="tabler:users-off" className="fs-1 mb-2" />
              <div>No buyers found</div>
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc._id} className="form-check p-2 mb-2">
                <input
                  className="form-check-input me-3"
                  type="checkbox"
                  checked={selectedBuyers.includes(acc._id)}
                  onChange={() => handleBuyerSelection(acc._id)}
                />
                <label className="form-check-label">
                  <div className="fw-medium">{acc.firstName} {acc.lastName}</div>
                  <div className="small text-muted">
                    {communicationMethod === 'email' && acc.email && (
                      <span><IconifyIcon icon="tabler:mail" className="me-1" />{acc.email}</span>
                    )}
                    {communicationMethod === 'sms' && acc.phone && (
                      <span><IconifyIcon icon="tabler:phone" className="me-1" />{acc.phone}</span>
                    )}
                    {communicationMethod === 'email' && !acc.email && (
                      <span className="text-warning">No email available</span>
                    )}
                    {communicationMethod === 'sms' && !acc.phone && (
                      <span className="text-warning">No phone available</span>
                    )}
                  </div>
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom Message */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-medium">
          <IconifyIcon icon="tabler:message" className="me-1" />
          Custom Message (Optional)
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
          placeholder="Add additional details about the products or special offer..."
          className="form-control-lg"
        />
        <Form.Text className="text-muted">
          Default: "New products available: [Product Names]"
        </Form.Text>
      </Form.Group>

      {/* Summary */}
      <div className="bg-light p-3 rounded">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-medium">Selected Recipients:</span>
          <Badge bg="primary" className="fs-6">{selectedBuyers.length}</Badge>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-medium">Selected Products:</span>
          <Badge bg="info" className="fs-6">{selectedProducts.length}</Badge>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-medium">Communication Method:</span>
          <Badge bg="success" className="fs-6">{communicationMethod.toUpperCase()}</Badge>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer className="bg-light">
      <Button variant="outline-secondary" onClick={() => setActiveModal(null)}>
        <IconifyIcon icon="tabler:x" className="me-1" />
        Cancel
      </Button>
      <Button 
        variant="info" 
        onClick={() => sendNotifications('product')}
        disabled={sendingNotification || selectedBuyers.length === 0 || selectedProducts.length === 0}
        className="px-4"
      >
        {sendingNotification ? (
          <>
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Sending...
          </>
        ) : (
          <>
            <IconifyIcon icon="tabler:send" className="me-1" />
            Send via {communicationMethod.toUpperCase()} ({selectedBuyers.length})
          </>
        )}
      </Button>
    </Modal.Footer>
  </Modal>
  )}
    </div>
  )
}