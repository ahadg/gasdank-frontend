import { useState, useEffect } from "react"
import { Button, Card, Col, Row, Modal, Badge, Table } from "react-bootstrap"
import moment from "moment"
import api from "@/utils/axiosInstance"
import { useNotificationContext } from "@/context/useNotificationContext"
import IconifyIcon from "@/components/wrappers/IconifyIcon"

interface ViewTransactionModalProps {
  show: boolean
  onHide: () => void
  transactionId: string | null
}

interface TransactionItem {
  transactionitem_id: {
    _id: string
    inventory_id: {
      _id: string
      name: string
    }
    qty: number
    measurement: number
    sale_price: number
    price: number
    shipping: number
    unit: string
  }
}

interface TransactionPayment {
  _id: string
  payment_method: string
  amount_paid: number
  payment_date: string
  notes?: string
}

interface Sample {
  _id: string
  name: string
  description?: string
  created_at: string
}

interface Transaction {
  _id: string
  user_id: {
    _id: string
    firstName: string
    lastName: string
  }
  buyer_id: {
    _id: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
  }
  worker_id?: {
    _id: string
    firstName: string
    lastName: string
  }
  transactionpayment_id?: TransactionPayment
  sample_id?: Sample
  payment_direction?: string
  payment_method?: string
  type: string
  notes?: string
  price: number
  sale_price: number
  total_shipping: number
  profit: number
  items: TransactionItem[]
  created_at: string
  updated_at: string
  edited: boolean
}

const ViewTransactionModal: React.FC<ViewTransactionModalProps> = ({
  show,
  onHide,
  transactionId
}) => {
  const { showNotification } = useNotificationContext()
  console.log("transactionId_transactionId",transactionId)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTransaction = async (id: string) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/transaction/${id}?populate=items.transactionitem_id.inventory_id,transactionpayment_id,sample_id,user_id,buyer_id,worker_id`)
      const transactionData = res.data
      console.log("Transaction data:", transactionData)
      setTransaction(transactionData)
    } catch (error: any) {
      showNotification({ 
        message: error?.response?.data?.error || 'Error fetching transaction details', 
        variant: 'danger' 
      })
      console.error('Error fetching transaction:', error)
    }
    setLoading(false)
  }

  const calculateItemTotal = (item: TransactionItem) => {
    const basePrice = (item.transactionitem_id.qty || 0) * (item.transactionitem_id.measurement || 1) * (item.transactionitem_id.price || 0)
    const shippingCost = (item.transactionitem_id.qty || 0) * (item.transactionitem_id.shipping || 0)
    return basePrice + shippingCost
  }

  const calculateTotalAmount = () => {
    if (!transaction?.items) return 0
    return transaction.items.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'success'
      case 'payment': return 'primary'
      case 'inventory_addition': return 'info'
      case 'sample_viewing_accepted': return 'warning'
      default: return 'secondary'
    }
  }

  const formatTransactionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleClose = () => {
    setTransaction(null)
    onHide()
  }

  useEffect(() => {
    if (transactionId && show) {
      fetchTransaction(transactionId)
    }
  }, [transactionId, show])

  return (
    <Modal show={show} onHide={handleClose} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon="solar:eye-line-duotone" className="me-2" />
          Transaction Details
          {transaction?.edited && (
            <Badge bg="warning" className="ms-2">Edited</Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading transaction details...</p>
          </div>
        ) : transaction ? (
          <div>
            {/* Transaction Header */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <Row className="align-items-center">
                  <Col>
                    <h5 className="mb-0">Transaction #{transaction._id}</h5>
                  </Col>
                  <Col xs="auto">
                    <Badge bg={getTypeColor(transaction.type)} className="me-2">
                      {formatTransactionType(transaction.type)}
                    </Badge>
                    {transaction.edited && (
                      <Badge bg="warning">Edited</Badge>
                    )}
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6 className="text-muted mb-3">Transaction Information</h6>
                    <p><strong>Created:</strong> {moment(transaction.created_at).format('MMM DD, YYYY HH:mm')}</p>
                    <p><strong>Last Updated:</strong> {moment(transaction.updated_at).format('MMM DD, YYYY HH:mm')}</p>
                    <p><strong>Total Price:</strong> <span className="text-success fw-bold">${(transaction.price || 0).toFixed(2)}</span></p>
                    <p><strong>Sale Price:</strong> <span className="text-info fw-bold">${(transaction.sale_price || 0).toFixed(2)}</span></p>
                    <p><strong>Total Shipping:</strong> ${(transaction.total_shipping || 0).toFixed(2)}</p>
                    <p><strong>Profit:</strong> <span className="text-warning fw-bold">${(transaction.profit || 0).toFixed(2)}</span></p>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted mb-3">People Involved</h6>
                    <p><strong>Customer:</strong> {transaction.buyer_id?.firstName} {transaction.buyer_id?.lastName}</p>
                    {transaction.buyer_id?.email && (
                      <p><strong>Customer Email:</strong> {transaction.buyer_id.email}</p>
                    )}
                    {transaction.buyer_id?.phone && (
                      <p><strong>Customer Phone:</strong> {transaction.buyer_id.phone}</p>
                    )}
                    <p><strong>Created by:</strong> {transaction.user_id?.firstName} {transaction.user_id?.lastName}</p>
                    {/* {transaction.worker_id && (
                      <p><strong>Worker:</strong> {transaction.worker_id.firstName} {transaction.worker_id.lastName}</p>
                    )} */}
                  </Col>
                </Row>
                {transaction.notes && (
                  <div className="mt-3">
                    <h6 className="text-muted">Notes</h6>
                    <div className="border rounded p-3 bg-light">
                      {transaction.notes}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Payment Information */}
            {transaction.transactionpayment_id && (
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <IconifyIcon icon="solar:card-line-duotone" className="me-2" />
                    Payment Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Payment Method:</strong> {transaction.transactionpayment_id.payment_method}</p>
                      <p><strong>Amount Paid:</strong> <span className="text-success fw-bold">${transaction.transactionpayment_id.amount_paid.toFixed(2)}</span></p>
                      <p><strong>Payment Date:</strong> {moment(transaction.transactionpayment_id.payment_date).format('MMM DD, YYYY HH:mm')}</p>
                    </Col>
                    <Col md={6}>
                      {transaction.payment_direction && (
                        <p><strong>Payment Direction:</strong> {transaction.payment_direction}</p>
                      )}
                      {transaction.transactionpayment_id.notes && (
                        <div>
                          <strong>Payment Notes:</strong>
                          <div className="text-muted">{transaction.transactionpayment_id.notes}</div>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Sample Information */}
            {transaction.sample_id && (
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <IconifyIcon icon="solar:test-tube-line-duotone" className="me-2" />
                    Sample Information
                  </h6>
                </Card.Header>
                <Card.Body>
                  <p><strong>Sample Name:</strong> {transaction.sample_id.name}</p>
                  {transaction.sample_id.description && (
                    <p><strong>Description:</strong> {transaction.sample_id.description}</p>
                  )}
                  <p><strong>Sample Created:</strong> {moment(transaction.sample_id.created_at).format('MMM DD, YYYY HH:mm')}</p>
                </Card.Body>
              </Card>
            )}

            {/* Transaction Items */}
            {transaction.items && transaction.items.length > 0 && (
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <IconifyIcon icon="solar:box-line-duotone" className="me-2" />
                    Transaction Items ({transaction.items.length})
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead className="table-dark">
                        <tr>
                          <th>Item Name</th>
                          <th>Quantity</th>
                          <th>Measurement</th>
                          <th>Unit</th>
                          <th>Price</th>
                          <th>Sale Price</th>
                          {/* <th>Shipping</th> */}
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transaction.items.map((item, index) => {
                          const itemTotal = calculateItemTotal(item)
                          return (
                            <tr key={index}>
                              <td>
                                <strong>{item.transactionitem_id.inventory_id?.name || 'N/A'}</strong>
                              </td>
                              <td>{item.transactionitem_id.qty}</td>
                              <td>{item.transactionitem_id.measurement}</td>
                              <td>{item.transactionitem_id.unit}</td>
                              <td>${(item.transactionitem_id.price || 0).toFixed(2)}</td>
                              <td>${(item.transactionitem_id.sale_price || 0).toFixed(2)}</td>
                              {/* <td>${(item.transactionitem_id.shipping || 0).toFixed(2)}</td> */}
                              <td className="fw-bold">${itemTotal.toFixed(2)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="table-secondary">
                        <tr>
                          <th colSpan={6} className="text-end">Grand Total:</th>
                          <th className="text-success">${calculateTotalAmount().toFixed(2)}</th>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Summary Card */}
            <Card className="border-primary">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">Transaction Summary</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="text-success">${(transaction.price || 0).toFixed(2)}</h4>
                      <small className="text-muted">Total Price</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="text-info">${(transaction.sale_price || 0).toFixed(2)}</h4>
                      <small className="text-muted">Sale Price</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="text-warning">${(transaction.profit || 0).toFixed(2)}</h4>
                      <small className="text-muted">Profit</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="text-secondary">{transaction.items?.length || 0}</h4>
                      <small className="text-muted">Items</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <div className="alert alert-warning">
            <IconifyIcon icon="solar:info-circle-line-duotone" className="me-2" />
            No transaction data available.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ViewTransactionModal