'use client'
import { useEffect, useState } from 'react'
import { Button, Form, Spinner, Modal, Card, Row, Col, Alert, Badge } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface ReturnInventoryModalProps {
    show: boolean
    onHide: () => void
    product: any
    onReturnComplete?: () => void
}

interface RecentSale {
    _id: string
    qty: number
    measurement: number
    unit: string
    shipping: number
    price: number
    sale_price?: number
    created_at: string
}

export default function ReturnInventoryModal({ show, onHide, product, onReturnComplete }: ReturnInventoryModalProps) {
    const user = useAuthStore((state) => state.user)
    const { showNotification } = useNotificationContext()
    const unitOptions = useAuthStore(state => state.settings?.units) || []

    // Step 1: Buyer selection
    const [buyers, setBuyers] = useState<any[]>([])
    const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
    const [buyersLoading, setBuyersLoading] = useState(false)

    // Step 2: Transaction selection
    const [recentSales, setRecentSales] = useState<RecentSale[]>([])
    const [salesLoading, setSalesLoading] = useState(false)
    const [selectedTransactionId, setSelectedTransactionId] = useState<string>('')
    const [selectedTransaction, setSelectedTransaction] = useState<RecentSale | null>(null)
    const [availableToReturn, setAvailableToReturn] = useState<number>(0)

    // Step 3: Return details
    const [quantity, setQuantity] = useState<number>(0)
    const [measurement, setMeasurement] = useState<number>(1)
    const [unit, setUnit] = useState<string>(product?.unit || '')
    const [salePrice, setSalePrice] = useState<number>(0)
    const [note, setNote] = useState<string>('')
    const [processing, setProcessing] = useState(false)

    const measurementOptions = [
        { label: 'Full', value: 1 },
        { label: 'Half', value: 0.5 },
        { label: 'Quarter', value: 0.25 },
    ]

    // Fetch all buyers
    useEffect(() => {
        async function fetchBuyers() {
            if (!show || !user?._id) return
            setBuyersLoading(true)
            try {
                const response = await api.get(`/api/buyers?user_id=${user._id}`)
                setBuyers(response.data || [])
            } catch (error) {
                console.error('Error fetching buyers:', error)
            } finally {
                setBuyersLoading(false)
            }
        }
        fetchBuyers()
    }, [show, user?._id])

    // Fetch recent sales when buyer is selected
    useEffect(() => {
        async function fetchSales() {
            if (!selectedBuyerId || !product?._id) {
                setRecentSales([])
                return
            }
            setSalesLoading(true)
            try {
                const response = await api.get(`/api/transaction/recent/${selectedBuyerId}/${product._id}`)
                setRecentSales(response.data.saleTransactions || [])
                setAvailableToReturn(response.data.totals?.availableToReturn || 0)

                // Auto-select most recent transaction if available
                if (response.data.saleTransactions?.length > 0) {
                    handleTransactionChange(response.data.saleTransactions[0]._id, response.data.saleTransactions)
                } else {
                    setSelectedTransactionId('')
                    setSelectedTransaction(null)
                }
            } catch (error) {
                console.error('Error fetching recent sales:', error)
                showNotification({ message: 'Error fetching transaction history', variant: 'danger' })
            } finally {
                setSalesLoading(false)
            }
        }
        fetchSales()
    }, [selectedBuyerId, product?._id])

    const handleTransactionChange = (transactionId: string, salesList = recentSales) => {
        setSelectedTransactionId(transactionId)
        const transaction = salesList.find(t => t._id === transactionId)
        if (transaction) {
            setSelectedTransaction(transaction)
            setUnit(transaction.unit || product?.unit || '')
            setMeasurement(transaction.measurement || 1)
            setSalePrice(transaction.sale_price || 0)
        } else {
            setSelectedTransaction(null)
        }
    }

    const handleReturnSubmit = async () => {
        if (!selectedBuyerId || !selectedTransaction || !quantity || quantity <= 0) {
            showNotification({ message: 'Please complete all required fields', variant: 'danger' })
            return
        }

        const returnQty = quantity * measurement
        const soldQty = selectedTransaction.qty * selectedTransaction.measurement

        if (returnQty > soldQty) {
            showNotification({
                message: `Cannot return ${returnQty} units. Only ${soldQty} units were sold in this transaction.`,
                variant: 'danger'
            })
            return
        }

        setProcessing(true)
        try {
            const payload = {
                user_id: user._id,
                buyer_id: selectedBuyerId,
                payment: 0,
                notes: note || `Return of ${product.name} from inventory management`,
                price: selectedTransaction.price * quantity * measurement,
                total_shipping: selectedTransaction.shipping * quantity,
                sale_price: salePrice * quantity * measurement,
                profit: (salePrice * quantity * measurement) - (selectedTransaction.price * quantity * measurement + selectedTransaction.shipping * quantity),
                type: "return",
                items: [
                    {
                        inventory_id: product._id,
                        qty: quantity,
                        measurement: measurement,
                        unit: unit,
                        name: product.name,
                        sale_price: salePrice,
                        shipping: selectedTransaction.shipping,
                        price: selectedTransaction.price,
                        reference_transaction_id: selectedTransaction._id,
                    },
                ],
            }

            await api.post('/api/transaction', payload)
            showNotification({ message: 'Return processed successfully', variant: 'success' })

            if (onReturnComplete) onReturnComplete()
            onHide()
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

    const resetForm = () => {
        setSelectedBuyerId('')
        setRecentSales([])
        setSelectedTransactionId('')
        setSelectedTransaction(null)
        setQuantity(0)
        setNote('')
    }

    useEffect(() => {
        if (!show) resetForm()
    }, [show])

    const subtotal = quantity * measurement * (selectedTransaction?.price || 0)

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    <IconifyIcon icon="tabler:arrow-back-up" className="me-2" />
                    Return Inventory
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ position: 'relative' }}>
                {processing && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 10 }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                )}

                <h6 className="mb-3">Returning Stock for: <strong>{product?.name}</strong></h6>

                {/* Step 1: Select Buyer */}
                <Form.Group className="mb-3">
                    <Form.Label>1. Select Buyer</Form.Label>
                    <Form.Select
                        value={selectedBuyerId}
                        onChange={(e) => setSelectedBuyerId(e.target.value)}
                        disabled={buyersLoading || processing}
                    >
                        <option value="">-- Select Buyer --</option>
                        {buyers.map(b => (
                            <option key={b._id} value={b._id}>
                                {b.firstName} {b.lastName} {b.company ? `(${b.company})` : ''}
                            </option>
                        ))}
                    </Form.Select>
                    {buyersLoading && <small className="text-muted">Loading buyers...</small>}
                </Form.Group>

                {/* Step 2: Select Transaction */}
                {selectedBuyerId && (
                    <Form.Group className="mb-3">
                        <Form.Label>2. Select Sale Transaction</Form.Label>
                        {salesLoading ? (
                            <div className="d-flex align-items-center gap-2 py-1">
                                <Spinner animation="border" size="sm" variant="primary" />
                                <small>Fetching transactions...</small>
                            </div>
                        ) : recentSales.length === 0 ? (
                            <Alert variant="warning" className="py-2 small">
                                No recent sales found for this buyer and product.
                            </Alert>
                        ) : (
                            <Form.Select
                                value={selectedTransactionId}
                                onChange={(e) => handleTransactionChange(e.target.value)}
                                disabled={processing}
                            >
                                <option value="">-- Select Transaction --</option>
                                {recentSales.map(t => (
                                    <option key={t._id} value={t._id}>
                                        {new Date(t.created_at).toLocaleDateString()} - {t.qty} {t.unit} @ ${t.price}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                        {availableToReturn > 0 && (
                            <div className="mt-1">
                                <Badge bg="info">Total available to return from all transactions: {availableToReturn.toFixed(2)}</Badge>
                            </div>
                        )}
                    </Form.Group>
                )}

                {/* Step 3: Return Details */}
                {selectedTransaction && (
                    <div className="border rounded p-3 bg-light mb-3">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantity to Return</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="any"
                                        value={quantity || ''}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        max={selectedTransaction.qty}
                                        placeholder="Enter quantity"
                                    />
                                    <Form.Text className="text-muted">
                                        Max in this transaction: {selectedTransaction.qty} {selectedTransaction.unit}
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Unit</Form.Label>
                                    <Form.Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                        {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Measurement</Form.Label>
                                    <Form.Select
                                        value={measurement}
                                        onChange={(e) => setMeasurement(Number(e.target.value))}
                                    >
                                        {measurementOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Original Sale Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(Number(e.target.value))}
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Subtotal (Inventory Value)</Form.Label>
                                    <div className="form-control-plaintext fw-bold">
                                        ${subtotal.toFixed(2)}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group>
                            <Form.Label>Note</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Return reason or notes..."
                            />
                        </Form.Group>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={processing}>
                    Cancel
                </Button>
                <Button
                    variant="info"
                    onClick={handleReturnSubmit}
                    disabled={processing || !selectedTransaction || !quantity || quantity <= 0}
                >
                    {processing ? 'Processing...' : 'Return Inventory'}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
