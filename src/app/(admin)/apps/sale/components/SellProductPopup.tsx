'use client'
import { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { Button, Form, Table, Spinner, Card, Row, Col, ButtonGroup } from 'react-bootstrap'
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
      qty: yup.string(),
      quantity: yup
        .number()
        .required('Quantity required')
        .min(0.01, 'Minimum quantity is 0.01'),
      sale_price: yup
        .number()
        .required('Sale price required')
        .min(0, 'Minimum sale price is 0'),
      shipping: yup.number()
        .required('Sale price required')
        .min(0, 'Minimum sale price is 0'),
      price: yup
        .number()
        .required('Price required')
        .min(0, 'Minimum price is 0'),
      unit: yup.string().required('Unit is required'),
      markup: yup.number().optional().default(0),
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
  }, [])
  const user = useAuthStore((state) => state.user)
  const params = useParams()
  console.log("selectedProducts", selectedProducts)
  const router = useRouter();
  const { control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<SellMultipleFormData>({
    resolver: yupResolver(sellMultipleSchema),
    defaultValues: {
      items: selectedProducts.map((prod) => ({
        productId: prod._id,
        name: prod.name,
        qty: prod.qty,
        //quantity: '',
        price: prod.price,
        sale_price: prod.price + prod?.shippingCost, // Initialize with current price
        unit: prod.unit || '',
        shipping: prod?.shippingCost || 0,
        markup: 0,
        measurement: 1, // default to Full
      })),
      payment: 0,
      notes: '',
    },
  })

  const handleUnitChange = (index: number, newUnit: string, fieldOnChange: (val: string) => void) => {
    const oldUnit = getValues(`items.${index}.unit`)?.toLowerCase()
    const targetUnit = newUnit?.toLowerCase()
    const currentQty = Number(getValues(`items.${index}.quantity`)) || 0
    const currentSalePrice = Number(getValues(`items.${index}.sale_price`)) || 0
    const currentCostPrice = Number(getValues(`items.${index}.price`)) || 0
    const currentShipping = Number(getValues(`items.${index}.shipping`)) || 0
    const currentMarkup = Number(getValues(`items.${index}.markup`)) || 0

    if (oldUnit === 'kg' && targetUnit === 'gram') {
      setValue(`items.${index}.quantity`, Number((currentQty * 1000).toFixed(2)))
      setValue(`items.${index}.sale_price`, Number((currentSalePrice / 1000).toFixed(5)))
      setValue(`items.${index}.price`, Number((currentCostPrice / 1000).toFixed(5)))
      setValue(`items.${index}.shipping`, Number((currentShipping / 1000).toFixed(5)))
      setValue(`items.${index}.markup`, Number((currentMarkup / 1000).toFixed(5)))
    } else if (oldUnit === 'gram' && targetUnit === 'kg') {
      setValue(`items.${index}.quantity`, Number((currentQty / 1000).toFixed(5)))
      setValue(`items.${index}.sale_price`, Number((currentSalePrice * 1000).toFixed(2)))
      setValue(`items.${index}.price`, Number((currentCostPrice * 1000).toFixed(2)))
      setValue(`items.${index}.shipping`, Number((currentShipping * 1000).toFixed(2)))
      setValue(`items.${index}.markup`, Number((currentMarkup * 1000).toFixed(2)))
    }
    fieldOnChange(newUnit)
  }

  const { fields, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const totalAmountwithshipping = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantity) * Number(item.measurement) * Number(item.sale_price)
      + (Number(item.shipping) > 0 ? Number(item.quantity) * Number(item.shipping) : 1),
    0
  )
  const totalAmount = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantity) * Number(item.measurement) * Number(item.sale_price)
    //+  (Number(item.shipping) > 0 ? Number(item.quantity) * Number(item.shipping) : 1) ,
    , 0
  )

  const totalShipping = items.reduce(
    (sum: number, item: any) =>
      sum + (Number(item.shipping) > 0 ? Number(item.quantity) * Number(item.shipping) : 1),
    0
  );

  const unitOptions = useAuthStore(state => state.settings?.units)
  console.log("useAuthStore(state => state.settings?.units)", useAuthStore(state => state.settings))
  // Define available unit options
  //const unitOptions = ['kg', 'pound', 'per piece', 'gram']
  // Define measurement (fraction) options
  const measurementOptions = [
    { label: 'Full', value: 1 },
    { label: 'Half', value: 0.5 },
    { label: 'Quarter', value: 0.25 },
  ]
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto markup function - changed from percentage to fixed amount
  const applyMarkup = (amount: number) => {
    const currentItems = getValues('items')
    currentItems.forEach((item, index) => {
      const basePrice = Number(item.price) || 0
      const newSalePrice = basePrice + amount
      setValue(`items.${index}.sale_price`, Number(newSalePrice.toFixed(2)))
      setValue(`items.${index}.markup`, Number(amount.toFixed(2)))
    })
    showNotification({
      message: `Added $${amount} markup to all products`,
      variant: 'success'
    })
  }

  const onSubmit = async (data: SellMultipleFormData) => {
    console.log("submit_being called")
    setLoading(true)
    // Transform each item to match backend expected keys and convert back to original units:
    const transformedItems = data.items.map((item) => {
      const originalProduct = selectedProducts.find(p => p._id === item.productId);
      const originalUnit = originalProduct?.unit?.toLowerCase();
      const currentUnit = item.unit?.toLowerCase();

      let finalQty = Number(item.quantity) * Number(item.measurement);
      let finalPrice = item.price;
      let finalSalePrice = item.sale_price;
      let finalShipping = item.shipping;
      let finalMarkup = item.markup;
      let finalUnit = item.unit;

      // Logic to convert back to original unit if changed between kg/gram
      if (originalUnit && currentUnit && originalUnit !== currentUnit) {
        if (originalUnit === 'kg' && currentUnit === 'gram') {
          finalQty = finalQty / 1000;
          finalPrice = finalPrice * 1000;
          finalSalePrice = finalSalePrice * 1000;
          finalShipping = finalShipping * 1000;
          finalMarkup = finalMarkup * 1000;
          finalUnit = originalProduct.unit;
        } else if (originalUnit === 'gram' && currentUnit === 'kg') {
          finalQty = finalQty * 1000;
          finalPrice = finalPrice / 1000;
          finalSalePrice = finalSalePrice / 1000;
          finalShipping = finalShipping / 1000;
          finalMarkup = finalMarkup / 1000;
          finalUnit = originalProduct.unit;
        }
      }

      return {
        inventory_id: item.productId,
        qty: finalQty,
        measurement: item.measurement,
        name: item?.name,
        unit: finalUnit,
        price: finalPrice,
        shipping: finalShipping,
        sale_price: finalSalePrice,
        markup: finalMarkup,
      }
    })

    const org_price = transformedItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.qty) * Number(item.price),
      0
    )

    const org_price_with_shipping = transformedItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.qty) * (Number(item.price) + Number(item?.shipping)),
      0
    )

    const totalsale_price_amount = transformedItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.qty) * Number(item.sale_price),
      0
    )

    // Construct payload:
    const payload = {
      user_id: user._id,
      buyer_id: params?.id, // Buyer id from route parameters
      items: transformedItems,
      price: org_price,
      sale_price: totalsale_price_amount,
      profit: totalsale_price_amount - org_price_with_shipping,
      //total_shipping: 0,
      total_shipping: totalShipping,
      notes: data.notes,
      type: "sale",
    }

    try {
      console.log("payload", payload)
      const response = await api.post('/api/transaction', payload)
      console.log('sale processed:', response.data)
      fetchProducts()
      showNotification({ message: 'Transaction processed successfully', variant: 'success' })
      onClose()
      router.push(`/apps/wholesale/history/${params?.id}`);
    } catch (error: any) {
      console.error('Error processing sale:', error)
      showNotification({ message: error?.response?.data?.error || 'Error processing transaction', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const renderMarkupButtons = () => {
    const [markupValue, setMarkupValue] = useState('')

    const handleApplyMarkup = () => {
      const amount = Number(markupValue)
      if (isNaN(amount)) {
        showNotification({
          message: 'Please enter a valid number',
          variant: 'danger'
        })
        return
      }

      if (amount < 0) {
        showNotification({
          message: 'Markup amount cannot be negative',
          variant: 'danger'
        })
        return
      }

      const currentItems = getValues('items')
      currentItems.forEach((item, index) => {
        const basePrice = Number(item.price + item.shipping) || 0
        const newSalePrice = basePrice + amount
        setValue(`items.${index}.sale_price`, Number(newSalePrice.toFixed(2)))
        setValue(`items.${index}.markup`, Number(amount.toFixed(2)))
      })

      showNotification({
        message: `Added $${amount} markup to all products`,
        variant: 'success'
      })

      // Clear the input after applying
      setMarkupValue('')
    }

    return (
      <div className="mb-3 p-3 bg-light rounded">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>Quick Markup:</strong>
          <small className="text-muted">Add fixed amount to all products</small>
        </div>
        <div className={`d-flex gap-2 ${isMobile ? 'flex-column' : 'align-items-end'}`}>
          <div className="flex-grow-1">
            <Form.Group className="mb-0">
              <Form.Label className="small mb-1">Markup Amount ($)</Form.Label>
              <Form.Control
                type="number"
                step="any"
                placeholder="Enter amount (e.g., 25)"
                value={markupValue}
                onChange={(e) => setMarkupValue(e.target.value)}
                size="sm"
              />
            </Form.Group>
          </div>
          <Button
            variant="success"
            size="sm"
            onClick={handleApplyMarkup}
            disabled={!markupValue.trim()}
            className={isMobile ? 'mt-2' : ''}
          >
            Apply Markup
          </Button>
        </div>
      </div>
    )
  }

  const renderMobileItem = (field: any, index: number) => (
    <Card key={field.id} className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h6 mb-0">{field.name}</Card.Title>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => remove(index)}
            className="ms-2"
          >
            Remove
          </Button>
        </div>

        <div className="mb-2">
          <small className="text-muted">Available: {field.qty} | Cost: ${Number(field.price || 0).toFixed(2)}</small>
        </div>

        <Row className="g-2">
          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small">Quantity</Form.Label>
              <Form.Control
                type="number"
                step="any"
                size="sm"
                placeholder="Quantity"
                {...(control.register ? control.register(`items.${index}.quantity` as const) : {})}
              />
              {errors?.items && errors.items[index]?.quantity && (
                <small className="text-danger">
                  {errors.items[index].quantity?.message}
                </small>
              )}
            </Form.Group>
          </Col>

          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small">Unit</Form.Label>
              <Controller
                control={control}
                name={`items.${index}.unit` as const}
                render={({ field }) => (
                  <Form.Select
                    {...field}
                    size="sm"
                    onChange={(e) => handleUnitChange(index, e.target.value, field.onChange)}
                  >
                    <option value="">Select unit</option>
                    {unitOptions?.filter(u => {
                      const lowerCurrent = field.value?.toLowerCase();
                      if (['kg', 'gram'].includes(lowerCurrent)) {
                        return ['kg', 'gram'].includes(u.toLowerCase());
                      }
                      return true;
                    }).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </Form.Select>
                )}
              />
            </Form.Group>
          </Col>

          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small">Measurement</Form.Label>
              <Controller
                control={control}
                name={`items.${index}.measurement` as const}
                render={({ field }) => (
                  <Form.Select {...field} size="sm">
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
          </Col>

          <Col xs={6}>
            <Form.Group>
              <Form.Label className="small">Sale Price</Form.Label>
              <Form.Control
                type="number"
                step="any"
                size="sm"
                placeholder="Sale Price"
                {...(control.register ? control.register(`items.${index}.sale_price` as const) : {})}
              />
              {items[index]?.markup !== undefined && (
                <small className="text-info">
                  +${Number(items[index].markup).toFixed(2)} markup
                </small>
              )}
            </Form.Group>
          </Col>
        </Row>

        <div className="mt-2 text-end">
          <strong className="text-primary">
            Subtotal: ${(
              Number(items[index]?.measurement || 1) *
              Number(items[index]?.sale_price || 0) *
              Number(items[index]?.quantity || 0)
            ).toFixed(2)}
          </strong>
        </div>
      </Card.Body>
    </Card>
  )

  const renderDesktopTable = () => (
    <Table responsive bordered>
      <thead className="table-light">
        <tr>
          <th>Product</th>
          <th>Available</th>
          <th>Cost Price</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Measurement</th>
          <th>Sale Price</th>
          {/* <th>Markup</th> */}
          <th>Subtotal</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field, index) => (
          <tr key={field.id}>
            <td>{field.name}</td>
            <td>{field.qty}</td>
            <td>${Number(field.price + field.shipping).toFixed(2)}</td>
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
                  <Form.Select
                    {...field}
                    onChange={(e) => handleUnitChange(index, e.target.value, field.onChange)}
                  >
                    <option value="">Select unit</option>
                    {unitOptions?.filter(u => {
                      const lowerCurrent = field.value?.toLowerCase();
                      if (['kg', 'gram'].includes(lowerCurrent)) {
                        return ['kg', 'gram'].includes(u.toLowerCase());
                      }
                      return true;
                    }).map((unit) => (
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
                placeholder="Sale Price"
                {...control.register(`items.${index}.sale_price` as const)}
              />
              {items[index]?.markup !== undefined && (
                <div className="text-info small">
                  +${Number(items[index].markup).toFixed(2)} markup
                </div>
              )}
            </td>

            <td>
              {(
                (Number(items[index]?.measurement || 1) *
                  Number(items[index]?.sale_price || 0) * Number(items[index]?.quantity || 0))
              ).toFixed(2)}
            </td>
            <td>
              <Button variant="danger" size="sm" onClick={() => remove(index)}>
                REMOVE
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: isMobile ? '10px' : '20px',
      }}
      role="dialog"
    >
      <div
        className="modal-dialog"
        role="document"
        style={{
          maxWidth: isMobile ? '100%' : '90vw',
          width: isMobile ? '100%' : '85%',
          margin: isMobile ? '0' : '1.75rem auto',
          height: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="modal-content shadow-lg rounded border border-light"
          style={{
            backgroundColor: '#fff',
            position: 'relative',
            height: isMobile ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="modal-header bg-light border-bottom border-light">
            <h5 className={`modal-title ${isMobile ? 'h6' : ''}`}>
              Selling Products
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div
            className="modal-body"
            style={{
              position: 'relative',
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '15px' : '20px',
            }}
          >
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
              {/* Auto Markup Buttons */}
              {renderMarkupButtons()}

              {isMobile ? (
                <div className="mb-3">
                  {fields.map((field, index) => renderMobileItem(field, index))}
                </div>
              ) : (
                renderDesktopTable()
              )}

              <div className="mt-3 p-3 bg-light rounded">
                <Row>
                  <Col xs={12} md={6}>
                    <strong>Total Amount: ${totalAmount.toFixed(2)}</strong>
                  </Col>
                </Row>
              </div>

              <div className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <Form.Control
                        as="textarea"
                        rows={isMobile ? 2 : 3}
                        placeholder="Enter any notes"
                        {...field}
                      />
                    )}
                  />
                </Form.Group>
              </div>

              <div className="mt-3 d-flex justify-content-end">
                <Button
                  type="submit"
                  variant="success"
                  className={isMobile ? 'w-100' : ''}
                >
                  Checkout
                </Button>
              </div>
            </Form>
          </div>

          <div className="modal-footer bg-light border-top border-light">
            <Button
              variant="secondary"
              onClick={onClose}
              className={isMobile ? 'w-100' : ''}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}