'use client'
import { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { Button, Form, Table, Spinner } from 'react-bootstrap'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { redirect, useParams } from 'next/navigation'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useRouter } from "next/navigation";

const sellMultipleSchema = yup.object({
  items: yup.array().of(
    yup.object({
      productId: yup.string().required(),
      name: yup.string().required(),
      quantity: yup
        .number()
        .required('Quantity required')
        .min(1, 'Minimum quantity is 1'),
      sale_price: yup
        .number()
        .required('Sale price required')
        .min(1, 'Minimum sale price is 1'),
      shipping: yup.number()
        .required('Sale price required')
        .min(0, 'Minimum sale price is 0'),
      price: yup
        .number()
        .required('Price required')
        .min(0, 'Minimum price is 0'),
      unit: yup.string().required('Unit is required'),
      measurement: yup
        .number()
        .required('Measurement required')
        .oneOf([1, 0.5, 0.25], 'Invalid measurement'),
    })
  ),
  payment: yup
    .number()
    .required('Payment is required')
    .min(0, 'Payment must be non-negative'),
  notes: yup.string().optional(),
})

type SellMultipleFormData = yup.InferType<typeof sellMultipleSchema>

export default function SellMultipleProductsModal({
  selectedProducts,
  onClose,
  fetchProducts,
}: {
  selectedProducts: any[]
  onClose: () => void
  fetchProducts: () => void
}) {
  useEffect(() => {
    //redirect(`/apps/wholesale/history/${params?.id}`)
  },[])
  const user = useAuthStore((state) => state.user)
  const params = useParams()
  console.log("selectedProducts",selectedProducts)
  const router = useRouter();
  const { control, handleSubmit, watch, formState: { errors } } = useForm<SellMultipleFormData>({
    resolver: yupResolver(sellMultipleSchema),
    defaultValues: {
      items: selectedProducts.map((prod) => ({
        productId: prod._id,
        name: prod.name,
        quantity: 0,
        price: prod.price,
        sale_price: prod.price || 0,
        unit: prod.unit || '',
        shipping: prod?.shippingCost || 0,
        measurement: 1, // default to Full
      })),
      payment: 0,
      notes: '',
    },
  })

  const { fields, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const totalAmount = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantity) * Number(item.shipping) * Number(item.measurement) * Number(item.sale_price) ,
    0
  )

  const totalShipping = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantity) * Number(item.shipping) * Number(item.measurement) ,
    0
  )

  // Define available unit options
  const unitOptions = ['kg', 'pound', 'per piece', 'gram']
  // Define measurement (fraction) options
  const measurementOptions = [
    { label: 'Full', value: 1 },
    { label: 'Half', value: 0.5 },
    { label: 'Quarter', value: 0.25 },
  ]
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: SellMultipleFormData) => {
    console.log("submit_being called")
    setLoading(true)
    // Transform each item to match backend expected keys:
    const transformedItems = data.items.map((item) => ({
      inventory_id: item.productId, // Assuming productId corresponds to inventory id
      qty: Number(item.quantity) * Number(item.measurement),
      measurement: item.measurement,
      unit: item.unit,
      price: item.price,
      shipping: item.shipping,
      sale_price: item.sale_price,
    }))

    const org_price = items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.quantity) * Number(item.shipping) * Number(item.measurement) * Number(item.price),
      0
    )

    // Construct payload:
    const payload = {
      user_id: user._id,
      buyer_id: params?.id, // Buyer id from route parameters
      items: transformedItems,
      price: org_price,
      sale_price: totalAmount,
      profit: totalAmount - org_price,
      total_shipping: totalShipping,
      notes: data.notes,
      type: "purchase",
    }

    try {
      console.log("payload", payload)
      const response = await api.post('/api/transaction', payload)
      console.log('Purchase processed:', response.data)
      fetchProducts()
      showNotification({ message: 'Transaction processed successfully', variant: 'success' })
      onClose()
      router.push(`/apps/wholesale/history/${params?.id}`);
    } catch (error: any) {
      console.error('Error processing purchase:', error)
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
      <div className="modal-dialog" role="document" style={{ maxWidth: '90vw', width: '70%' }}>
        <div className="modal-content shadow-lg rounded border border-light" style={{ backgroundColor: '#fff', position: 'relative' }}>
          <div className="modal-header bg-light border-bottom border-light">
            <h5 className="modal-title">Selling Products to {user?.firstName + ' ' + user.lastName }</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
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
            <Form onSubmit={(handleSubmit(onSubmit, (errors) => console.log('Validation Errors:', errors)))}>
              <Table responsive bordered>
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Measurement</th>
                    <th>Price</th>
                    <th>Sale Price</th>
                    <th>Shipping (per unit)</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td>{field.name}</td>
                      <td>
                        <Form.Control
                          type="number"
                          step="any"
                          placeholder="Quantity"
                          {...(control.register ? control.register(`items.${index}.quantity` as const) : {})}
                        />
                        {errors?.items && errors.items[index]?.quantity && (
                          <small className="text-danger">
                            {errors.items[index].quantity?.message}
                          </small>
                        )}
                      </td>
                      <td>
                        <Controller
                          control={control}
                          name={`items.${index}.unit` as const}
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
                      </td>
                      <td>
                        <Controller
                          control={control}
                          name={`items.${index}.measurement` as const}
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
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="any"
                          disabled
                          placeholder="Price"
                          {...(control.register ? control.register(`items.${index}.price` as const) : {})}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="any"
                          placeholder="Sale Price"
                          {...(control.register ? control.register(`items.${index}.sale_price` as const) : {})}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="any"
                          placeholder="Shipping"
                          disabled
                          {...(control.register ? control.register(`items.${index}.shipping` as const) : {})}
                        />
                      </td>
                      <td>
                        {(
                          (Number(items[index]?.quantity || 0) *  Number(items[index]?.shipping || 0) ) *
                          Number(items[index]?.measurement || 1) *
                          Number(items[index]?.sale_price || 0) 
                        ).toFixed(2)}
                      </td>
                      <td>
                        <Button variant="danger" onClick={() => remove(index)}>
                          REMOVE
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="mt-1">
                <strong>Total Shipping : </strong>${totalShipping.toFixed(2)}
              </div>
              <div className="mt-1">
                <strong>Total Amount :  </strong>${totalAmount.toFixed(2)}
              </div>
              <div className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Note</Form.Label>
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <Form.Control as="textarea" rows={3} placeholder="Enter any notes" {...field} />
                    )}
                  />
                </Form.Group>
              </div>
              <div className="mt-3 d-flex justify-content-end">
                <Button type="submit" variant="success">
                  Checkout
                </Button>
              </div>
            </Form>
          </div>
          <div className="modal-footer bg-light border-top border-light">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
