import { useState, useEffect } from "react"
import { Button, Card, Col, Row, Modal, Badge, Accordion, Table } from "react-bootstrap"
import moment from "moment"
import api from "@/utils/axiosInstance"
import { useNotificationContext } from "@/context/useNotificationContext"
import IconifyIcon from "@/components/wrappers/IconifyIcon"

interface EditedTransactionsModalProps {
  show: boolean
  onHide: () => void
  transactionId: string | null
}

interface TransactionItem {
  transactionitem_id: string | any
  inventory_id: string | any
  qty: number
  measurement: number
  sale_price: number
  price: number
  shipping: number
  unit: string
  name: string
}

interface EditHistory {
  updated_at: string
  original_items: TransactionItem[]
  items: TransactionItem[]
}

interface EditedTransaction {
  _id: string
  date: string
  notes: string
  edited: boolean
  updated_at: string
  total_shipping: number
  price: number
  type: string
  prevValues: EditHistory[] | EditHistory
  items: any[]
  buyer_id: any
  user_id: any
}

const EditedTransactionsModal: React.FC<EditedTransactionsModalProps> = ({
  show,
  onHide,
  transactionId
}) => {
  const { showNotification } = useNotificationContext()
  
  const [transaction, setTransaction] = useState<EditedTransaction | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTransactionHistory = async (id: string) => {
    setLoading(true)
    try {
      // Fetch transaction with populated references for prevValues
      const res = await api.get(`/api/transaction/${id}?populate=prevValues`)
      const transactionData = res.data
      console.log("Transaction with history:", transactionData)
      setTransaction(transactionData)
    } catch (error: any) {
      showNotification({ 
        message: error?.response?.data?.error || 'Error fetching transaction history', 
        variant: 'danger' 
      })
      console.error('Error fetching transaction history:', error)
    }
    setLoading(false)
  }

  const formatItemsComparison = (originalItems: TransactionItem[], newItems: TransactionItem[]) => {
    const changes: string[] = []
    
    // Create maps for easier comparison using both _id and transactionitem_id
    const originalMap = new Map()
    const newMap = new Map()
    
    originalItems.forEach(item => {
      const key = item.transactionitem_id?._id || item.transactionitem_id
      originalMap.set(key, item)
    })
    
    newItems.forEach(item => {
      const key = item.transactionitem_id?._id || item.transactionitem_id
      newMap.set(key, item)
    })
    
    // Check for changes in existing items
    originalItems.forEach(originalItem => {
      const originalKey = originalItem.transactionitem_id?._id || originalItem.transactionitem_id
      const newItem = newMap.get(originalKey)
      
      if (newItem) {
        const itemName = newItem.name || originalItem.name || 
                        newItem.inventory_id?.name || originalItem.inventory_id?.name || 'Item'
        
        if (originalItem.qty !== newItem.qty) {
          changes.push(`${itemName}: Quantity changed from ${originalItem.qty} to ${newItem.qty}`)
        }
        if (originalItem.price !== newItem.price) {
          changes.push(`${itemName}: Price changed from ${originalItem.price} to ${newItem.price}`)
        }
        if (originalItem.measurement !== newItem.measurement) {
          changes.push(`${itemName}: Measurement changed from ${originalItem.measurement} to ${newItem.measurement}`)
        }
        if (originalItem.shipping !== newItem.shipping) {
          changes.push(`${itemName}: Shipping changed from ${originalItem.shipping} to ${newItem.shipping}`)
        }
      }
    })
    
    // Check for new items
    newItems.forEach(newItem => {
      const newKey = newItem.transactionitem_id?._id || newItem.transactionitem_id
      if (!originalMap.has(newKey)) {
        const itemName = newItem.name || newItem.inventory_id?.name || 'Item'
        changes.push(`Added new item: ${itemName} (Qty: ${newItem.qty})`)
      }
    })
    
    // Check for removed items
    originalItems.forEach(originalItem => {
      const originalKey = originalItem.transactionitem_id?._id || originalItem.transactionitem_id
      if (!newMap.has(originalKey)) {
        const itemName = originalItem.name || originalItem.inventory_id?.name || 'Item'
        changes.push(`Removed item: ${itemName}`)
      }
    })
    
    return changes
  }

  const calculateItemTotal = (items: TransactionItem[]) => {
    return items.reduce((total, item) => {
      const basePrice = (item.qty || 0) * (item.measurement || 1) * (item.price || 0)
      const shippingCost = (item.qty || 0) * (item.shipping || 0)
      return total + basePrice + shippingCost
    }, 0)
  }

  const renderItemsTable = (items: TransactionItem[], title: string) => (
    <div className="mb-3">
      <h6 className="text-muted mb-2">{title}</h6>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Measurement</th>
            <th>Price</th>
            <th>Shipping</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const itemTotal = (item.qty || 0) * (item.measurement || 1) * (item.price || 0) + (item.qty || 0) * (item.shipping || 0)
            return (
              <tr key={index}>
                <td>{item.name || item?.inventory_id?.name || 'N/A'}</td>
                <td>{item.qty}</td>
                <td>{item.measurement}</td>
                <td>${(item.price || 0).toFixed(2)}</td>
                <td>${(item.shipping || 0).toFixed(2)}</td>
                <td>${itemTotal.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )

  const handleClose = () => {
    setTransaction(null)
    onHide()
  }

  useEffect(() => {
    if (transactionId && show) {
      fetchTransactionHistory(transactionId)
    }
  }, [transactionId, show])

  // Normalize prevValues to always be an array
  const editHistory = transaction?.prevValues ? 
    (Array.isArray(transaction.prevValues) ? transaction.prevValues : [transaction.prevValues]) : []

  return (
    <Modal show={show} onHide={handleClose} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <IconifyIcon icon="solar:history-line-duotone" className="me-2" />
          Transaction Edit History
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
            <p className="mt-2">Loading transaction history...</p>
          </div>
        ) : transaction ? (
          <div>
            {/* Current Transaction Info */}
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Current Transaction Status</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Transaction ID:</strong> {transaction._id}</p>
                    <p><strong>Type:</strong> {transaction.type}</p>
                    <p><strong>Date:</strong> {moment(transaction.date).format('MMM DD, YYYY HH:mm')}</p>
                    <p><strong>Last Updated:</strong> {moment(transaction.updated_at).format('MMM DD, YYYY HH:mm')}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Customer:</strong> {transaction.buyer_id?.firstName} {transaction.buyer_id?.lastName}</p>
                    <p><strong>User:</strong> {transaction.user_id?.firstName} {transaction.user_id?.lastName}</p>
                    <p><strong>Total Price:</strong> ${(transaction.price || 0).toFixed(2)}</p>
                    <p><strong>Total Shipping:</strong> ${(transaction.total_shipping || 0).toFixed(2)}</p>
                  </Col>
                </Row>
                {transaction.notes && (
                  <div className="mt-3">
                    <strong>Notes:</strong>
                    <p className="text-muted">{transaction.notes}</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Current Items */}
            {transaction.items && transaction.items.length > 0 && (
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">Current Items</h6>
                </Card.Header>
                <Card.Body>
                  {renderItemsTable(
                    transaction.items.map(item => ({
                      transactionitem_id: item.transactionitem_id?._id,
                      inventory_id: item.transactionitem_id?.inventory_id?._id,
                      name: item.transactionitem_id?.inventory_id?.name || item?.inventory_id?.name,
                      qty: item.transactionitem_id?.qty || 0,
                      measurement: item.transactionitem_id?.measurement || 1,
                      price: item.transactionitem_id?.price || 0,
                      sale_price: item.transactionitem_id?.sale_price || 0,
                      shipping: item.transactionitem_id?.shipping || 0,
                      unit: item.transactionitem_id?.unit || ''
                    })),
                    "Current Items"
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Edit History */}
            {editHistory.length > 0 ? (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <IconifyIcon icon="solar:clock-circle-line-duotone" className="me-2" />
                    Edit History ({editHistory.length} {editHistory.length === 1 ? 'edit' : 'edits'})
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Accordion>
                    {editHistory.map((edit, index) => {
                      const changes = formatItemsComparison(edit.original_items || [], edit.items || [])
                      const originalTotal = calculateItemTotal(edit.original_items || [])
                      const newTotal = calculateItemTotal(edit.items || [])
                      
                      return (
                        <Accordion.Item key={index} eventKey={index.toString()}>
                          <Accordion.Header>
                            <div className="d-flex justify-content-between w-100 me-3">
                              <span>
                                Edit #{editHistory.length - index} - {moment(edit.updated_at).format('MMM DD, YYYY HH:mm')}
                              </span>
                              <Badge bg={changes.length > 0 ? "info" : "secondary"}>
                                {changes.length} {changes.length === 1 ? 'change' : 'changes'}
                              </Badge>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            {/* Summary of Changes */}
                            {/* {changes.length > 0 ? (
                              <div className="mb-3">
                                <h6 className="text-primary">Changes Made:</h6>
                                <ul className="list-unstyled">
                                  {changes.map((change, changeIndex) => (
                                    <li key={changeIndex} className="mb-1">
                                      <IconifyIcon icon="solar:arrow-right-line-duotone" className="me-2 text-primary" />
                                      {change}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="alert alert-info">
                                No item changes detected in this edit.
                              </div>
                            )} */}

                            {/* Total Changes */}
                            {originalTotal !== newTotal && (
                              <div className="mb-3">
                                <h6 className="text-warning">Total Amount Change:</h6>
                                <p className="mb-0">
                                  <span className="text-muted">From: ${originalTotal.toFixed(2)}</span>
                                  <IconifyIcon icon="solar:arrow-right-line-duotone" className="mx-2" />
                                  <span className="text-success">To: ${newTotal.toFixed(2)}</span>
                                  <Badge 
                                    bg={newTotal > originalTotal ? "success" : "danger"} 
                                    className="ms-2"
                                  >
                                    {newTotal > originalTotal ? '+' : ''}${(newTotal - originalTotal).toFixed(2)}
                                  </Badge>
                                </p>
                              </div>
                            )}

                            {/* Before and After Tables */}
                            <Row>
                              <Col md={6}>
                                {renderItemsTable(edit.original_items || [], "Before Edit")}
                              </Col>
                              <Col md={6}>
                                {renderItemsTable(edit.items || [], "After Edit")}
                              </Col>
                            </Row>
                          </Accordion.Body>
                        </Accordion.Item>
                      )
                    })}
                  </Accordion>
                </Card.Body>
              </Card>
            ) : (
              <div className="alert alert-info">
                <IconifyIcon icon="solar:info-circle-line-duotone" className="me-2" />
                No edit history found for this transaction.
              </div>
            )}
          </div>
        ) : (
          <div className="alert alert-warning">
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

export default EditedTransactionsModal