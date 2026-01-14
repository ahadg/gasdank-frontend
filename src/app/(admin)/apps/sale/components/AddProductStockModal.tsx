'use client'
import { useEffect, useState } from 'react'
import { Metadata } from 'next'
import { Button, CardHeader, CardFooter, Form, Spinner, Table } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useParams } from 'next/navigation'
import { useNotificationContext } from '@/context/useNotificationContext'

export const metadata: Metadata = { title: 'Add Product Stock' }

interface AddProductModalProps {
  product: any
  onClose: () => void
  fetchProducts: () => void
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
  transaction_id: {
    _id: string
    created_at: string
  }
}

// Validation schema for adding stock
const addStockSchema = yup.object({
  selectedTransactionId: yup.string().required('Please select a transaction'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(0.1, 'Minimum quantity is 0.1'),
  unit: yup.string().required('Unit is required'),
  shipping: yup.number().required('shipping is required'),
  saleprice: yup.number().required('saleprice is required'),
  name: yup.string().optional(),
  measurement: yup
    .number()
    .required('Measurement is required')
    .oneOf([1, 0.5, 0.25], 'Invalid measurement'),
  price: yup
    .number()
    .required('Price is required')
    .min(0, 'Price must be non-negative'),
  note: yup.string().optional(),
})

type AddStockFormData = yup.InferType<typeof addStockSchema>

export default function AddProductModal({ product, onClose, fetchProducts }: AddProductModalProps) {
  console.log("product_product", product)
  const { control, handleSubmit, watch, setValue } = useForm<AddStockFormData>({
    resolver: yupResolver(addStockSchema),
    defaultValues: {
      selectedTransactionId: '',
      quantity: 0,
      unit: product.unit || '',
      measurement: 1,
      shipping: 0,
      saleprice: 0,
      price: 0,
      note: '',
    },
  })
  const [buyer, setbuyer] = useState<any>()
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)
  const params = useParams()
  let unitOptions = useAuthStore(state => state.settings?.units)

  const measurementOptions = [
    { label: 'Full', value: 1 },
    { label: 'Half', value: 0.5 },
    { label: 'Quarter', value: 0.25 },
  ]

  const values = watch()
  const subtotal = Number(values.quantity || 0) * Number(values.measurement || 1) * Number(values.price) + (Number(values.shipping))
  const { showNotification } = useNotificationContext()
  const [recentsaleLoading, setrecentsaleLoading] = useState<boolean>(false)
  const [recentsale, setrecentsale] = useState<RecentSale[]>([])
  const [availableToReturn, setAvailableToReturn] = useState<number>(0)
  const [selectedTransaction, setSelectedTransaction] = useState<RecentSale | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      if (product) {
        setrecentsaleLoading(true)
        try {
          const response = await api.get(`/api/transaction/recent/${params?.id}/${product._id}`)
          setrecentsale(response.data.saleTransactions || [])
          setbuyer(response.data.buyer)
          setAvailableToReturn(response.data.totals?.availableToReturn || 0)

          // Set default values from the most recent transaction
          if (response.data.saleTransactions && response.data.saleTransactions.length > 0) {
            const mostRecent = response.data.saleTransactions[0]
            setSelectedTransaction(mostRecent)
            setValue('selectedTransactionId', mostRecent._id)
            setValue('shipping', mostRecent.shipping || 0)
            setValue('saleprice', mostRecent.sale_price || 0)
            setValue('price', mostRecent.price || 0)
            setValue('unit', mostRecent.unit || product.unit || '')
            setValue('measurement', mostRecent.measurement as 1 | 0.5 | 0.25 || 1)
          }
        } catch (error: any) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching transaction history', variant: 'danger' })
          console.error('Error fetching transaction history:', error)
        } finally {
          setrecentsaleLoading(false)
        }
      }
    }
    fetchHistory()
  }, [product])

  // Handle transaction selection change
  const handleTransactionChange = (transactionId: string) => {
    const selected = recentsale.find(t => t._id === transactionId)
    if (selected) {
      setSelectedTransaction(selected)
      setValue('shipping', selected.shipping || 0)
      setValue('saleprice', selected.sale_price || 0)
      setValue('price', selected.price || 0)
      setValue('unit', selected.unit || product.unit || '')
      setValue('measurement', selected.measurement as 1 | 0.5 | 0.25 || 1)
    }
  }

  const onError = (errors: any) => {
    const firstError = Object.values(errors)[0] as { message?: string }
    const message = firstError?.message || 'Please correct the form errors'
    showNotification({ message, variant: 'danger' })
  }

  const onSubmit = async (data: AddStockFormData) => {
    setLoading(true)

    // Calculate total quantity being returned
    const returnQty = Number(data.quantity) * Number(data.measurement)

    // Find the selected transaction
    const selectedSale = recentsale.find(t => t._id === data.selectedTransactionId)
    if (!selectedSale) {
      showNotification({
        message: 'Please select a valid transaction',
        variant: 'danger'
      })
      setLoading(false)
      return
    }

    // Calculate the quantity sold in the selected transaction
    const soldQty = selectedSale.qty * selectedSale.measurement

    // Check if return quantity exceeds sold quantity from selected transaction
    if (returnQty > soldQty) {
      showNotification({
        message: `Cannot return ${returnQty} units. Only ${soldQty} units were sold in this transaction.`,
        variant: 'danger'
      })
      setLoading(false)
      return
    }

    // Check against total available to return
    if (returnQty > availableToReturn) {
      showNotification({
        message: `Cannot return ${returnQty} units. Only ${availableToReturn} units available to return in total.`,
        variant: 'danger'
      })
      setLoading(false)
      return
    }

    // Construct payload for a "return" transaction (stock addition)
    const payload = {
      user_id: user._id,
      buyer_id: params?.id,
      payment: 0,
      notes: data.note,
      price: Number(data.price) * Number(data.quantity) * Number(data.measurement),
      total_shipping: data.shipping,
      sale_price: data.saleprice,
      profit: Number(data.saleprice) - (Number(data.price) + Number(data.shipping)),
      type: "return",
      items: [
        {
          inventory_id: product._id,
          qty: Number(data.quantity),
          measurement: data.measurement,
          unit: data.unit,
          name: product?.name,
          sale_price: data.saleprice,
          shipping: Number(data?.shipping) / Number(data.quantity),
          price: data.price,
          reference_transaction_id: data.selectedTransactionId, // Add reference to original sale
        },
      ],
    }

    try {
      console.log("payload", payload)
      const response = await api.post('/api/transaction', payload)
      console.log('Transaction processed:', response.data)
      fetchProducts()
      showNotification({
        message: 'Return processed successfully',
        variant: 'success'
      })
      onClose()
    } catch (error: any) {
      console.error('Error processing transaction:', error)
      showNotification({
        message: error?.response?.data?.error || 'Error processing transaction',
        variant: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
      role="dialog"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content shadow-lg rounded border border-light" style={{ backgroundColor: '#fff', position: 'relative' }}>
          <CardHeader className="modal-header bg-light border-bottom border-light">
            <button type="button" className="btn-close" onClick={onClose}></button>
          </CardHeader>
          <div className="modal-body" style={{ position: 'relative' }}>
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}>
                <Spinner animation="border" variant="primary" />
              </div>
            )}
            <h6 className="fs-15 mb-3">
              Returning Stock of {product.name} from ({buyer?.firstName} {buyer?.lastName})
              {availableToReturn > 0 && (
                <span className="ms-2 badge bg-success">
                  {availableToReturn.toFixed(2)} units available to return
                </span>
              )}
            </h6>

            {/* Transaction Selection Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>Select Sale Transaction</Form.Label>
              {recentsaleLoading ? (
                <div className="d-flex align-items-center gap-2 text-muted">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <span>Fetching transactions...</span>
                </div>
              ) : recentsale.length === 0 ? (
                <div className="alert alert-warning py-2 small">
                  No previous transactions found for this product and buyer.
                </div>
              ) : (
                <Controller
                  control={control}
                  name="selectedTransactionId"
                  render={({ field }) => (
                    <Form.Select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleTransactionChange(e.target.value)
                      }}
                    >
                      <option value="">Select a transaction</option>
                      {recentsale.map((transaction) => (
                        <option key={transaction._id} value={transaction._id}>
                          {new Date(transaction.created_at).toLocaleDateString()} -
                          {transaction.qty} {transaction.unit} @ ${transaction.price}
                          {transaction.sale_price && ` (Sale: $${transaction.sale_price})`}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
              )}
            </Form.Group>

            {/* Selected Transaction Details */}
            {selectedTransaction && (
              <div className="mb-3 p-3 border rounded bg-light">
                <h6 className="fs-14 mb-2">Selected Transaction Details:</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Date:</strong> {new Date(selectedTransaction.created_at).toLocaleDateString()}</p>
                    <p className="mb-1"><strong>Quantity:</strong> {selectedTransaction.qty} {selectedTransaction.unit}</p>
                    <p className="mb-1"><strong>Measurement:</strong> {selectedTransaction.measurement}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Price:</strong> ${selectedTransaction.price}</p>
                    <p className="mb-1"><strong>Shipping:</strong> ${selectedTransaction.shipping}</p>
                    {selectedTransaction.sale_price && (
                      <p className="mb-1"><strong>Sale Price:</strong> ${selectedTransaction.sale_price}</p>
                    )}
                  </div>
                </div>
                <p className="mb-0 text-info">
                  <strong>Available to return from this transaction:</strong> {(selectedTransaction.qty * selectedTransaction.measurement).toFixed(2)} units
                </p>
              </div>
            )}

            <Form onSubmit={handleSubmit(onSubmit, onError)}>
              <Form.Group className="mb-3 mt-1">
                <Form.Label>Quantity to Return</Form.Label>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field }) => (
                    <Form.Control
                      type="number"
                      placeholder="Enter quantity"
                      step="any"
                      {...field}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        const currentMeasurement = values.measurement || 1
                        const maxTotalQty = selectedTransaction ? (selectedTransaction.qty * selectedTransaction.measurement) : 0
                        const maxAllowedQty = maxTotalQty / currentMeasurement

                        if (val > maxAllowedQty) {
                          field.onChange(maxAllowedQty)
                          showNotification({
                            message: `Quantity cannot exceed available amount (${maxAllowedQty.toFixed(2)}) for the selected measurement`,
                            variant: 'warning'
                          })
                        } else {
                          field.onChange(e.target.value)
                        }
                      }}
                      disabled={!selectedTransaction}
                    />
                  )}
                />
                {selectedTransaction && (
                  <Form.Text className="text-muted">
                    Max: {(selectedTransaction.qty * selectedTransaction.measurement).toFixed(2)} units from this transaction
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Unit</Form.Label>
                <Controller
                  control={control}
                  name="unit"
                  render={({ field }) => (
                    <Form.Select {...field} disabled={!selectedTransaction}>
                      <option value="">Select unit</option>
                      {unitOptions.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Measurement</Form.Label>
                <Controller
                  control={control}
                  name="measurement"
                  render={({ field }) => (
                    <Form.Select
                      {...field}
                      disabled={!selectedTransaction}
                      onChange={(e) => {
                        const newMeasurement = parseFloat(e.target.value)
                        field.onChange(newMeasurement)

                        // Clamp quantity if it exceeds max for new measurement
                        const maxTotalQty = selectedTransaction ? (selectedTransaction.qty * selectedTransaction.measurement) : 0
                        const maxAllowedQty = maxTotalQty / newMeasurement
                        const currentQty = parseFloat(watch('quantity') as unknown as string) || 0

                        if (currentQty > maxAllowedQty) {
                          setValue('quantity', maxAllowedQty)
                          showNotification({
                            message: `Quantity adjusted to ${maxAllowedQty.toFixed(2)} to fit within transaction limits for the new measurement`,
                            variant: 'info'
                          })
                        }
                      }}
                    >
                      <option value="">Select measurement</option>
                      {measurementOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Sale Price</Form.Label>
                <Controller
                  control={control}
                  name="saleprice"
                  render={({ field }) => (
                    <Form.Control
                      type="number"
                      placeholder="Enter Sale price"
                      step="any"
                      {...field}
                      disabled={!selectedTransaction}
                    />
                  )}
                />
              </Form.Group>

              <div className="mb-3">
                <strong>Subtotal: </strong>${subtotal.toFixed(2)}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Note</Form.Label>
                <Controller
                  control={control}
                  name="note"
                  render={({ field }) => (
                    <Form.Control
                      type="text"
                      placeholder="Enter note"
                      {...field}
                      disabled={!selectedTransaction}
                    />
                  )}
                />
              </Form.Group>

              <Button
                type="submit"
                variant="success"
                disabled={loading || !selectedTransaction || recentsale.length === 0}
              >
                {loading ? 'Processing...' : 'Add to stock'}
              </Button>
            </Form>
          </div>
          <CardFooter className="modal-footer bg-light border-top border-light">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  )
}