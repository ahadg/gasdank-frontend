'use client'
import { useState } from 'react'
import { Metadata } from 'next'
import { Button, CardHeader, CardFooter, Form, Spinner } from 'react-bootstrap'
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

// Validation schema for adding stock
const addStockSchema = yup.object({
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(0.1, 'Minimum quantity is 0.1'),
  unit: yup.string().required('Unit is required'),
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
  const { control, handleSubmit, watch } = useForm<AddStockFormData>({
    resolver: yupResolver(addStockSchema),
    defaultValues: {
      quantity: 0,
      unit: product.unit || '',
      measurement: 1,
      price: 0,
      note: '',
    },
  })
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)
  const params = useParams()
  // Available unit options
  const unitOptions = ['kg', 'pound', 'per piece', 'gram']
  // Measurement options for fractional input
  const measurementOptions = [
    { label: 'Full', value: 1 },
    { label: 'Half', value: 0.5 },
    { label: 'Quarter', value: 0.25 },
  ]

  // Calculate subtotal for display purposes
  const values = watch()
  const subtotal = Number(values.quantity || 0) * Number(values.measurement || 1) * Number(values.price || 0)
  const { showNotification } = useNotificationContext()

  const onSubmit = async (data: AddStockFormData) => {
    setLoading(true)
    // Construct payload for a "return" transaction (stock addition)
    const payload = {
      user_id: user._id,
      buyer_id: params?.id, // Replace with actual buyer id if needed.
      payment: 0, // Payment may be zero for stock additions
      notes: data.note,
      price: data.price * Number(data.quantity) * Number(data.measurement),
      type: "return",
      items: [
        {
          inventory_id: product._id,
          qty: Number(data.quantity) * Number(data.measurement),
          measurement: data.measurement,
          unit: data.unit,
          price: data.price,
        },
      ],
    }
    try {
      const response = await api.post('/api/transaction', payload)
      console.log('Transaction processed:', response.data)
      fetchProducts()
      showNotification({ message: 'Transaction processed successfully', variant: 'success' })
      onClose()
    } catch (error: any) {
      console.error('Error processing transaction:', error)
      showNotification({ message: error?.response?.data?.error || 'Error processing transaction', variant: 'danger' })
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
            <h6 className="fs-15 mb-3">Add Stock to Inventory</h6>
            <div className="mb-3">
              <strong>Product:</strong> {product.name}
            </div>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3">
                <Form.Label>Quantity to Add</Form.Label>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field }) => (
                    <Form.Control type="number" placeholder="Enter quantity" step="any" {...field} />
                  )}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Unit</Form.Label>
                <Controller
                  control={control}
                  name="unit"
                  render={({ field }) => (
                    <Form.Select {...field}>
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
                    <Form.Select {...field}>
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
                <Form.Label>Price</Form.Label>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <Form.Control type="number" placeholder="Enter price" step="any" {...field} />
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
                    <Form.Control type="text" placeholder="Enter note" {...field} />
                  )}
                />
              </Form.Group>
              <Button type="submit" variant="success" disabled={loading}>
                SELL PRODUCTS
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
