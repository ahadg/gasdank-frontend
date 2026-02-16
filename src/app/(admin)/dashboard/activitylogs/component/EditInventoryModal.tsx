import { useState, useEffect } from "react"
import { Button, Card, Col, Row, Form, Modal } from "react-bootstrap"
import moment from "moment"
import api from "@/utils/axiosInstance"
import { useNotificationContext } from "@/context/useNotificationContext"

interface EditTransactionModalProps {
  show: boolean
  onHide: () => void
  transactionId: string | null
  onTransactionUpdated: () => void
}

interface TransactionItem {
  id: string
  name: string
  qty: number
  unit: string
  sale_price: number
  price: number
  measurement: number
  shipping: number
  inventory_id: string
}

interface EditFormData {
  date: string
  notes: string
  items: TransactionItem[]
  total_shipping: number
  type: string
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  show,
  onHide,
  transactionId,
  onTransactionUpdated
}) => {
  const { showNotification } = useNotificationContext()

  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [originalTransaction, setOriginalTransaction] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    date: '',
    notes: '',
    items: [],
    total_shipping: 0,
    type: ''
  })

  const fetchTransactionById = async (id: string) => {
    setEditLoading(true)
    console.log("fetchTransactionById", id)
    try {
      const res = await api.get(`/api/transaction/${id}`)
      const transaction = res.data
      console.log("transaction", transaction)
      setEditingTransaction(transaction)
      setOriginalTransaction(JSON.parse(JSON.stringify(transaction))) // Deep copy for comparison

      const formattedItems = transaction.items?.map((item: any) => ({
        id: item.transactionitem_id?._id,
        name: item.transactionitem_id?.name || item.transactionitem_id?.inventory_id?.name || '',
        qty: item.transactionitem_id?.qty || 0,
        unit: item.transactionitem_id?.unit || '',
        sale_price: item.transactionitem_id?.sale_price || 0,
        price: item.transactionitem_id?.price || 0,
        measurement: item.transactionitem_id?.measurement || 1,
        shipping: item.transactionitem_id?.shipping || 0,
        inventory_id: item.transactionitem_id?.inventory_id?._id || item.transactionitem_id?.inventory_id || ''
      })) || []

      setEditFormData({
        date: transaction.date ? moment(transaction.date).format('YYYY-MM-DDTHH:mm') : '',
        notes: transaction.notes || '',
        items: formattedItems,
        total_shipping: transaction.total_shipping || 0,
        type: transaction.type || 'sale'
      })
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error fetching transaction details',
        variant: 'danger'
      })
      console.error('Error fetching transaction:', error)
    }
    setEditLoading(false)
  }

  const handleSaveTransaction = async () => {
    if (!editingTransaction?._id) return
    setEditLoading(true)
    try {
      const total_quantity = editFormData?.items.reduce((sum, currval) => sum + Number(currval.qty), 0)
      const avg_shipping = total_quantity > 0 ? Number(editFormData.total_shipping) / total_quantity : 0
      const updateData = {
        date: editFormData.date,
        notes: editFormData.notes,
        total_shipping: editFormData.total_shipping,
        type: editFormData.type,
        items: editFormData.items.map((item: TransactionItem) => ({
          transactionitem_id: item.id,
          inventory_id: item.inventory_id,
          qty: item.qty,
          measurement: item.measurement,
          sale_price: item.sale_price,
          price: item.price,
          shipping: editFormData.type === 'sale' ? avg_shipping : item?.shipping,
          unit: item.unit,
          name: item.name
        })),
        // Include original transaction data for comparison
        original_items: originalTransaction.items?.map((item: any) => ({
          transactionitem_id: item.transactionitem_id?._id,
          inventory_id: item.transactionitem_id?.inventory_id?._id || item.transactionitem_id?.inventory_id,
          qty: item.transactionitem_id?.qty || 0,
          measurement: item.transactionitem_id?.measurement || 1,
          sale_price: item.transactionitem_id?.sale_price || 0,
          price: item.transactionitem_id?.price || 0,
          shipping: item.transactionitem_id?.shipping || 0
        })) || [],
        original_total_shipping: originalTransaction.total_shipping || 0,
        buyer_id: editingTransaction.buyer_id,
        user_id: editingTransaction.user_id
      }
      console.log("originalTransaction", originalTransaction)
      console.log("updateData", updateData)
      await api.put(`/api/transaction/${editingTransaction._id}`, updateData)

      showNotification({
        message: 'Transaction updated successfully',
        variant: 'success'
      })

      handleClose()
      onTransactionUpdated()
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error updating transaction',
        variant: 'danger'
      })
      console.error('Error updating transaction:', error)
    }
    setEditLoading(false)
  }

  const handleFormChange = (field: string, value: any, itemIndex?: number) => {
    if (itemIndex !== undefined) {
      setEditFormData((prev) => ({
        ...prev,
        items: prev.items.map((item, index) =>
          index === itemIndex ? { ...item, [field]: value } : item
        )
      }))
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleClose = () => {
    setEditingTransaction(null)
    setOriginalTransaction(null)
    setEditFormData({ date: '', notes: '', items: [], total_shipping: 0, type: '' })
    onHide()
  }

  const calculateItemTotal = (item: TransactionItem) => {
    // For sale transactions, use sale_price; for others, use price
    const unitPrice = editFormData.type === 'sale' ? (item.sale_price || 0) : (item.price || 0)
    const basePrice = (item.qty || 0) * (item.measurement || 1) * unitPrice
    const shippingCost = (item.qty || 0) * (item.shipping || 0)
    return basePrice
    //+ shippingCost
  }

  const totalPrice = editFormData.items.reduce(
    (acc, item) => acc + calculateItemTotal(item),
    0
  )
  //+ editFormData.total_shipping

  useEffect(() => {
    if (transactionId && show) {
      fetchTransactionById(transactionId)
    }
  }, [transactionId, show])

  const isPaymentTransaction = editFormData.type === 'payment'
  const isSaleTransaction = editFormData.type === 'sale'

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Edit {editFormData.type === 'payment' ? 'Payment' :
            editFormData.type === 'inventory_addition' ? 'Inventory Addition' :
              editFormData.type === 'return' ? 'Return' : 'Sale'} Transaction
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editLoading ? (
          <div className="text-center p-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading transaction details...</p>
          </div>
        ) : editingTransaction ? (
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Transaction Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.type}
                    disabled
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editFormData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Add any notes about this transaction..."
              />
            </Form.Group>

            {!isPaymentTransaction && (
              <>
                <h6 className="mb-3">Transaction Items</h6>
                {editFormData.items.length > 0 ? (
                  editFormData.items.map((item: TransactionItem, index: number) => (
                    <Card key={index} className="mb-3 shadow-sm">
                      <Card.Body>
                        <Row>
                          <Col md={isSaleTransaction ? 2 : 3}>
                            <Form.Group className="mb-2">
                              <Form.Label>Item Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={item.name}
                                disabled
                                className="bg-light"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group className="mb-2">
                              <Form.Label>Quantity</Form.Label>
                              <Form.Control
                                type="number"
                                value={item.qty}
                                onChange={(e) => handleFormChange('qty', (e.target.value) || '', index)}
                              // min="0"
                              // step="0.01"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group className="mb-2">
                              <Form.Label>Measurement</Form.Label>
                              <Form.Control
                                type="number"
                                value={item.measurement}
                                onChange={(e) => handleFormChange('measurement', (e.target.value) || '', index)}
                              // min="0"
                              // step="0.01"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={isSaleTransaction ? 1 : 2}>
                            <Form.Group className="mb-2">
                              <Form.Label>Unit</Form.Label>
                              <Form.Control
                                type="text"
                                value={item.unit}
                                disabled
                                className="bg-light"
                              />
                            </Form.Group>
                          </Col>

                          {/* Cost Price - always show for non-sale transactions */}
                          {!isSaleTransaction && (
                            <Col md={3}>
                              <Form.Group className="mb-2">
                                <Form.Label>Price ($)</Form.Label>
                                <Form.Control
                                  // type="number"
                                  value={item.price}
                                  onChange={(e) => handleFormChange('price', (e.target.value) || '', index)}
                                // min="0"
                                // step="0.01"
                                />
                              </Form.Group>
                            </Col>
                          )}

                          {/* Sale Price - show for sale transactions */}
                          {isSaleTransaction && (
                            <>
                              {/* <Col md={2}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Cost ($)</Form.Label>
                                  <Form.Control
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0, index)}
                                    min="0"
                                    step="0.01"
                                  />
                                </Form.Group>
                              </Col> */}
                              <Col md={3}>
                                <Form.Group className="mb-2">
                                  <Form.Label>Sale Price ($)</Form.Label>
                                  <Form.Control
                                    type="number"
                                    value={item.sale_price}
                                    onChange={(e) => handleFormChange('sale_price', (e.target.value), index)}
                                  // min="0"
                                  // step="0.01"
                                  />
                                </Form.Group>
                              </Col>
                            </>
                          )}
                        </Row>

                        <Row>
                          {/* <Col md={3}>
                            <Form.Group className="mb-2">
                              <Form.Label>Shipping per Unit ($)</Form.Label>
                              <Form.Control
                                type="number"
                                value={item.shipping}
                                onChange={(e) => handleFormChange('shipping', parseFloat(e.target.value) || 0, index)}
                                min="0"
                                step="0.01"
                              />
                            </Form.Group>
                          </Col> */}
                          {/* <Col md={9} className="d-flex align-items-end">
                            <div className="text-end w-100">
                              <small className="text-muted d-block">
                                Base: ${((item.qty || 0) * (item.measurement || 1) * (isSaleTransaction ? (item.sale_price || 0) : (item.price || 0))).toFixed(2)}
                              </small>
                              <small className="text-muted d-block">
                                Shipping: ${((item.qty || 0) * (item.shipping || 0)).toFixed(2)}
                              </small>
                              <strong className="text-primary">
                                Line Total: ${calculateItemTotal(item).toFixed(2)}
                              </strong>
                              {isSaleTransaction && (
                                <small className="text-success d-block">
                                  Profit: ${(((item.qty || 0) * (item.measurement || 1) * ((item.sale_price || 0) - (item.price || 0)))).toFixed(2)}
                                </small>
                              )}
                            </div>
                          </Col> */}
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-muted py-3">
                    No items found in this transaction
                  </div>
                )}

                {/* Total Shipping + Total Price */}
                <Row className="mt-4">
                  <Col md={6}>
                    {/* <Form.Group>
                      <Form.Label>Total Shipping ($)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        disabled={true}
                        step="0.01"
                        value={editFormData.total_shipping}
                        onChange={(e) => handleFormChange('total_shipping', parseFloat(e.target.value) || 0)}
                      />
                    </Form.Group> */}
                  </Col>
                  <Col md={6} className="text-end d-flex flex-column justify-content-end">
                    <div className="p-3 border rounded bg-light">
                      <strong>Total Transaction: </strong> ${totalPrice.toFixed(2)}
                      {isSaleTransaction && (
                        <div className="text-success mt-1">
                          <small>
                            Total Profit: ${editFormData.items.reduce((acc, item) => {
                              const profit = (item.qty || 0) * (item.measurement || 1) * ((item.sale_price || 0) - (item.price || 0));
                              return acc + profit;
                            }, 0).toFixed(2)}
                          </small>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </>
            )}

            {isPaymentTransaction && (
              <div className="alert alert-info">
                <strong>Payment Transaction</strong>
                <p className="mb-0">
                  Amount: ${editingTransaction.price || 0}<br />
                  Method: {editingTransaction.payment_method || 'N/A'}<br />
                  Direction: {editingTransaction.payment_direction || 'N/A'}
                </p>
              </div>
            )}
          </Form>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveTransaction}
          disabled={editLoading || !editingTransaction}
        >
          {editLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EditTransactionModal