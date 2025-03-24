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

// Validation schema for adding stock
const addStockSchema = yup.object({
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(0.1, 'Minimum quantity is 0.1'),
  unit: yup.string().required('Unit is required'),
  shipping: yup.number().required('shipping is required'),
  saleprice: yup.number().required('saleprice is required'),
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
  const { control, handleSubmit, watch, setValue } = useForm<AddStockFormData>({
    resolver: yupResolver(addStockSchema),
    defaultValues: {
      quantity: 0,
      unit: product.unit || '',
      measurement: 1,
      shipping : 0,
      saleprice: 0,
      price: 0,
      note: '',
    },
  })
  const [buyer,setbuyer] = useState<any>()
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
  const subtotal = Number(values.quantity || 0) * Number(values.measurement || 1) * Number(values.price ) + (Number(values.shipping) )
  const { showNotification } = useNotificationContext()
  const [recentsaleLoading,setrecentsaleLoading] = useState<boolean>(false)
  const [recentsale,setrecentsale] = useState<any>()
  console.log("recentsale",recentsale)
  useEffect(() => {
    async function fetchHistory() {
      if (product) {
        setLoading(true)
        try {
          const response = await api.get(`/api/transaction/recent/${params?.id}/${product._id}`)
          setrecentsale(response.data.recentTransactionItem)
          setrecentsaleLoading(true)
          setValue('shipping', response.data.recentTransactionItem?.shipping || 0)
          setValue('saleprice', response.data.recentTransactionItem?.sale_price || 0)
          setValue('price', response.data.recentTransactionItem?.price || 0)
          setbuyer(response.data.buyer)
          // set shipping,saleprice,price
        } catch (error) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching transaction history', variant: 'danger' })
          console.error('Error fetching transaction history:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchHistory()
  }, [product])


  const onSubmit = async (data: AddStockFormData) => {
    setLoading(true)
    // Construct payload for a "return" transaction (stock addition)
    const payload = {
      user_id: user._id,
      buyer_id: params?.id, // Replace with actual buyer id if needed.
      payment: 0, // Payment may be zero for stock additions
      notes: data.note,
      price: Number(data.price) * Number(data.quantity) * Number(data.measurement),
      total_shipping : data.shipping,
      type: "return",
      items: [
        {
          inventory_id: product._id,
          qty: Number(data.quantity),
          measurement: data.measurement,
          unit: data.unit,
          shipping : Number(data?.shipping) / Number(data.quantity),
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
            <h6 className="fs-15 mb-3">Returning Stock of {product.name} from ({buyer?.firstName} {buyer?.lastName}) </h6>
            <h6 className="fs-15 mb-1">Recent Transactions Found:</h6>
            {!recentsaleLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="table-responsive">
                <Table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>DATE</th>
                      <th>ITEM</th>
                      <th>QUANTITY</th>
                      <th>SHIPPING (per unit)</th>
                      <th>PRICE</th>
                      <th>SALE PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentsaleLoading && ( recentsale ? (
                        <tr key={1}>
                          <td>{new Date(recentsale?.created_at).toLocaleDateString()}</td>
                          <td>{recentsale?.inventory_id?.name}</td>
                          <td>
                            {recentsale?.qty} [{recentsale.unit}]
                          </td>
                          <td>
                            {/* {renderTypeWithIcon(recentsale.transaction_id?.type)} */}
                            {/* {recentsale.transaction_id?.type} */}
                            {recentsale.shipping}
                          </td>
                          <td>${recentsale.price}</td>
                          <td>{recentsale.sale_price ? `$${recentsale.sale_price}` : `-`}</td>
                        </tr>
                    
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center">
                          No transaction history found.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3 mt-1">
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
                <Form.Label>Total Shipping</Form.Label>
                <Controller
                  control={control}
                  name="shipping"
                  render={({ field }) => (
                    <Form.Control type="number" placeholder="Enter shipping" step="any" {...field} />
                  )}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Sale Price</Form.Label>
                <Controller
                  control={control}
                  name="saleprice"
                  render={({ field }) => (
                    <Form.Control type="number" placeholder="Enter Sale price" step="any" {...field} />
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
                Add to stock
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
