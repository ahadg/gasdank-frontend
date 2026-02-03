'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Badge,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

// Validation schema
const productSchema = yup.object({
  qty: yup
    .number()
    .typeError('Quantity must be a number')
    .required('Please enter quantity'),
  unit: yup.string().required('Please select a unit'),
  category: yup.string().required('Please select a category'),
  name: yup.string().required('Please enter product name'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .required('Please enter price'),
  shippingCost: yup
    .number()
    .typeError('Shipping cost must be a number')
    .default(0),
  status: yup.string(),
  notes: yup.string(),
  product_type: yup.string().optional(),
})

type ProductFormData = yup.InferType<typeof productSchema>

// Type for tracking changes
type ProductChangeTracker = {
  qty: { previous: number; current: number; change: number; direction: 'increased' | 'decreased' | 'unchanged' };
  price: { previous: number; current: number; change: number; direction: 'increased' | 'decreased' | 'unchanged' };
  shippingCost: { previous: number; current: number; change: number; direction: 'increased' | 'decreased' | 'unchanged' };
  unit: { previous: string; current: string; changed: boolean };
}

const EditProduct = () => {
  const router = useRouter()
  const params = useParams()
  const productId = params.id
  const { showNotification } = useNotificationContext()

  // Original product data
  const [originalProduct, setOriginalProduct] = useState<any>(null)

  // Change tracking state
  const [changeTracker, setChangeTracker] = useState<ProductChangeTracker>({
    qty: { previous: 0, current: 0, change: 0, direction: 'unchanged' },
    price: { previous: 0, current: 0, change: 0, direction: 'unchanged' },
    shippingCost: { previous: 0, current: 0, change: 0, direction: 'unchanged' },
    unit: { previous: '', current: '', changed: false }
  })

  // Setup react-hook-form with Yup validation
  const { handleSubmit, control, reset, watch } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      qty: 0,
      unit: '',
      category: '',
      name: '',
      price: 0,
      shippingCost: 0,
      status: '',
      notes: '',
      product_type: '',
    },
  })

  const [loading, setLoading] = useState(false)
  const [userCategories, setUserCategories] = useState<any[]>([])
  const [productTypes, setProductTypes] = useState<any[]>([])
  const user = useAuthStore((state) => state.user)

  // Set up watchers for form fields we need to track
  const watchQty = watch('qty')
  const watchPrice = watch('price')
  const watchShippingCost = watch('shippingCost')
  const watchUnit = watch('unit')
  let unitOptions = useAuthStore(state => state.settings?.units)
  // Load product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await api.get(`/api/inventory/product/${productId}`)
        const productData = response.data
        setOriginalProduct(productData)

        // Pre-populate the form
        reset({
          qty: productData.qty,
          unit: productData.unit,
          category: productData.category?._id,
          name: productData.name,
          price: productData.price,
          shippingCost: productData.shippingCost,
          status: productData.status,
          notes: productData.notes,
          product_type: productData.product_type?._id || productData.product_type,
        })

        // Initialize change tracker with original values
        setChangeTracker({
          qty: {
            previous: productData.qty,
            current: productData.qty,
            change: 0,
            direction: 'unchanged'
          },
          price: {
            previous: productData.price,
            current: productData.price,
            change: 0,
            direction: 'unchanged'
          },
          shippingCost: {
            previous: productData.shippingCost,
            current: productData.shippingCost,
            change: 0,
            direction: 'unchanged'
          },
          unit: {
            previous: productData.unit,
            current: productData.unit,
            changed: false
          }
        })
      } catch (error) {
        console.error('Error fetching product:', error)
      }
    }

    fetchProduct()
  }, [productId, reset])

  // Load user-specific categories
  useEffect(() => {
    async function fetchUserCategories() {
      try {
        if (user?._id) {
          const response = await api.get(`/api/categories/${user._id}`)
          setUserCategories(response.data)
        }
      } catch (error) {
        console.error('Error fetching user categories:', error)
      }
    }
    fetchUserCategories()
  }, [user?._id])

  // Load product types
  useEffect(() => {
    async function fetchProductTypes() {
      try {
        if (user?._id) {
          const response = await api.get(`/api/product-types/${user._id}`)
          setProductTypes(response.data)
        }
      } catch (error) {
        console.error('Error fetching product types:', error)
      }
    }
    fetchProductTypes()
  }, [user?._id])

  // Update change tracker when form values change - only when original product is loaded
  // and when the watched fields actually change
  useEffect(() => {
    if (!originalProduct) return;

    // Calculate quantity changes
    const qtyChange = Number(watchQty) - originalProduct.qty
    const qtyDirection = qtyChange > 0
      ? 'increased'
      : qtyChange < 0 ? 'decreased' : 'unchanged'

    // Calculate price changes
    const priceChange = Number(watchPrice) - originalProduct.price
    const priceDirection = priceChange > 0
      ? 'increased'
      : priceChange < 0 ? 'decreased' : 'unchanged'

    // Calculate shipping cost changes
    const shippingChange = Number(watchShippingCost) - originalProduct.shippingCost
    const shippingDirection = shippingChange > 0
      ? 'increased'
      : shippingChange < 0 ? 'decreased' : 'unchanged'

    // Check for unit change
    const unitChanged = watchUnit !== originalProduct.unit

    // Update change tracker
    setChangeTracker({
      qty: {
        previous: originalProduct.qty,
        current: Number(watchQty),
        change: Math.abs(qtyChange),
        direction: qtyDirection
      },
      price: {
        previous: originalProduct.price,
        current: Number(watchPrice),
        change: Math.abs(priceChange),
        direction: priceDirection
      },
      shippingCost: {
        previous: originalProduct.shippingCost,
        current: Number(watchShippingCost),
        change: Math.abs(shippingChange),
        direction: shippingDirection
      },
      unit: {
        previous: originalProduct.unit,
        current: watchUnit,
        changed: unitChanged
      }
    })
  }, [originalProduct, watchQty, watchPrice, watchShippingCost, watchUnit])

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      // Prepare change tracking data to send to the backend
      const changeData = {
        user_id: user?._id,
        ...data,
        changes: {
          qty: changeTracker.qty.direction !== 'unchanged' ? {
            previous: changeTracker.qty.previous,
            current: changeTracker.qty.current,
            direction: changeTracker.qty.direction
          } : null,
          price: changeTracker.price.direction !== 'unchanged' ? {
            previous: changeTracker.price.previous,
            current: changeTracker.price.current,
            direction: changeTracker.price.direction
          } : null,
          shippingCost: changeTracker.shippingCost.direction !== 'unchanged' ? {
            previous: changeTracker.shippingCost.previous,
            current: changeTracker.shippingCost.current,
            direction: changeTracker.shippingCost.direction
          } : null,
          unit: changeTracker.unit.changed ? {
            previous: changeTracker.unit.previous,
            current: changeTracker.unit.current
          } : null
        }
      }

      const response = await api.put(`/api/inventory/${productId}`, changeData)

      if (response.status === 200 || response.status === 204) {
        showNotification({ message: 'Product updated successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error('Error updating product:', error)
      showNotification({
        message: error?.response?.data?.error || 'Error updating product',
        variant: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  const onError = (formErrors: any) => {
    const firstErrorKey = Object.keys(formErrors)[0]
    if (firstErrorKey) {
      const firstErrorMessage = formErrors[firstErrorKey]?.message
      if (firstErrorMessage) {
        showNotification({ message: firstErrorMessage, variant: 'danger' })
      }
    }
  }

  // Helper function to render change indicators for numeric fields
  const renderChangeIndicator = (fieldName: 'qty' | 'price' | 'shippingCost') => {
    const field = changeTracker[fieldName]

    if (field.direction === 'unchanged') return null

    const isPriceField = fieldName === 'price' || fieldName === 'shippingCost'
    const formattedChange = isPriceField ? `$${field.change.toFixed(2)}` : field.change.toFixed(0)
    const formattedPrevious = isPriceField ? `$${field.previous.toFixed(2)}` : field.previous

    const tooltipContent = `Previous: ${formattedPrevious}`

    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-${fieldName}`}>{tooltipContent}</Tooltip>}
      >
        <div className="change-indicator mt-1">
          <Badge
            bg={field.direction === 'increased' ? 'success' : 'danger'}
            className="change-badge"
            style={{
              fontSize: '0.8rem',
              padding: '0.25rem 0.45rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {field.direction === 'increased' ? (
              <i className="fas fa-arrow-up" style={{ fontSize: '0.7rem' }}></i>
            ) : (
              <i className="fas fa-arrow-down" style={{ fontSize: '0.7rem' }}></i>
            )}
            {formattedChange}
          </Badge>
        </div>
      </OverlayTrigger>
    )
  }

  // Helper function to render unit change indicator
  const renderUnitChange = () => {
    if (!changeTracker.unit.changed) return null

    const tooltipContent = `Previous: ${changeTracker.unit.previous}`

    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-unit">{tooltipContent}</Tooltip>}
      >
        <div className="change-indicator mt-1">
          <Badge
            bg="info"
            style={{
              fontSize: '0.8rem',
              padding: '0.25rem 0.45rem'
            }}
          >
            Changed
          </Badge>
        </div>
      </OverlayTrigger>
    )
  }

  // Count how many fields have changes
  const changedFieldsCount = [
    changeTracker.qty.direction !== 'unchanged',
    changeTracker.price.direction !== 'unchanged',
    changeTracker.shippingCost.direction !== 'unchanged',
    changeTracker.unit.changed
  ].filter(Boolean).length

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Edit Product</h4>
        {changedFieldsCount > 0 && (
          <Badge
            bg="primary"
            style={{
              fontSize: '0.9rem',
              padding: '0.35rem 0.65rem'
            }}
          >
            {changedFieldsCount} {changedFieldsCount === 1 ? 'Change' : 'Changes'} Detected
          </Badge>
        )}
      </div>

      <Card className="mb-4">
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">Product Details</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit(onSubmit, onError)}>
            {/* Product Name and Category */}
            <Row className="mb-3">
              <Col lg={6}>
                <TextFormInput
                  control={control}
                  name="name"
                  placeholder="Enter Product name"
                  label="Product Name"
                />
              </Col>
              <Col lg={6}>
                <label className="form-label">Category</label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Form.Select {...field}>
                      <option value="">Select category</option>
                      {userCategories.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <label className="form-label">Product Type</label>
                <Controller
                  control={control}
                  name="product_type"
                  render={({ field }) => (
                    <Form.Select {...field}>
                      <option value="">Select product type</option>
                      {productTypes.map((type: any) => (
                        <option key={type._id} value={type._id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
              </Col>
            </Row>

            {/* Tracked Fields Section */}
            <Card className="inner-card mb-3" style={{ borderLeft: '4px solid #6c757d' }}>
              <CardBody>
                <h6 className="mb-3 text-secondary">
                  <i className="fas fa-chart-line me-2"></i>
                  Tracked Fields
                </h6>
                <Row>
                  {/* Quantity Field */}
                  <Col lg={6} md={6} className="mb-3">
                    <div className="position-relative">
                      <TextFormInput
                        control={control}
                        name="qty"
                        type="number"
                        placeholder="Enter quantity"
                        label={
                          <div className="d-flex align-items-center">
                            <span>Quantity</span>
                            {renderChangeIndicator('qty')}
                          </div>
                        }
                      />
                      {changeTracker.qty.direction !== 'unchanged' && (
                        <div
                          className="previous-value"
                          style={{
                            fontSize: '0.75rem',
                            color: '#6c757d',
                            marginTop: '2px'
                          }}
                        >
                          Previous: {changeTracker.qty.previous}
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Unit Field */}
                  <Col lg={6} md={6} className="mb-3">
                    <div className="position-relative">
                      <label className="form-label d-flex align-items-center">
                        <span>Unit</span>
                        {renderUnitChange()}
                      </label>
                      <Controller
                        control={control}
                        name="unit"
                        render={({ field }) => (
                          <Form.Select {...field}>
                            <option value="">Select unit</option>
                            {unitOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                          </Form.Select>
                        )}
                      />
                      {changeTracker.unit.changed && (
                        <div
                          className="previous-value"
                          style={{
                            fontSize: '0.75rem',
                            color: '#6c757d',
                            marginTop: '2px'
                          }}
                        >
                          Previous: {changeTracker.unit.previous}
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Price Field */}
                  {user?.showProductPrice !== false && (
                    <Col lg={6} md={6} className="mb-3">
                      <div className="position-relative">
                        <TextFormInput
                          control={control}
                          name="price"
                          type="number"
                          placeholder="Enter price"
                          label={
                            <div className="d-flex align-items-center">
                              <span>Price ($)</span>
                              {renderChangeIndicator('price')}
                            </div>
                          }
                        />
                        {changeTracker.price.direction !== 'unchanged' && (
                          <div
                            className="previous-value"
                            style={{
                              fontSize: '0.75rem',
                              color: '#6c757d',
                              marginTop: '2px'
                            }}
                          >
                            Previous: ${changeTracker.price.previous.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </Col>
                  )}

                  {/* Shipping Cost Field */}
                  {user?.showProductPrice !== false && (
                    <Col lg={6} md={6} className="mb-3">
                      <div className="position-relative">
                        <TextFormInput
                          control={control}
                          name="shippingCost"
                          type="number"
                          placeholder="Enter shipping cost"
                          label={
                            <div className="d-flex align-items-center">
                              <span>Shipping Cost ($)</span>
                              {renderChangeIndicator('shippingCost')}
                            </div>
                          }
                        />
                        {changeTracker.shippingCost.direction !== 'unchanged' && (
                          <div
                            className="previous-value"
                            style={{
                              fontSize: '0.75rem',
                              color: '#6c757d',
                              marginTop: '2px'
                            }}
                          >
                            Previous: ${changeTracker.shippingCost.previous.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </Col>
                  )}
                </Row>
              </CardBody>
            </Card>

            {/* Notes Section */}
            <Row>
              <Col lg={12}>
                <div className="mb-3">
                  <TextAreaFormInput
                    control={control}
                    name="notes"
                    placeholder="Enter notes"
                    label="Notes"
                    rows={3}
                  />
                </div>
              </Col>
            </Row>

            {/* Changes Summary - Only show if there are changes */}
            {changedFieldsCount > 0 && (
              <Card className="mb-4" style={{
                background: 'rgba(25, 135, 84, 0.05)',
                borderLeft: '4px solid #198754',
                boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
              }}>
                <CardBody>
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-clipboard-check me-2 text-success"></i>
                    <h6 className="mb-0 text-success">Changes Summary</h6>
                  </div>

                  <Row className="g-3">
                    {changeTracker.qty.direction !== 'unchanged' && (
                      <Col lg={6} md={6} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <strong className="text-muted">Quantity:</strong>
                          <div>
                            <span className="text-muted">{changeTracker.qty.previous}</span>
                            <i className="fas fa-long-arrow-alt-right mx-2 text-muted"></i>
                            <span className="fw-bold">{changeTracker.qty.current}</span>
                            <Badge
                              bg={changeTracker.qty.direction === 'increased' ? 'success' : 'danger'}
                              className="ms-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {changeTracker.qty.direction === 'increased' ? '+' : '-'}{changeTracker.qty.change}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    )}

                    {changeTracker.price.direction !== 'unchanged' && user?.showProductPrice !== false && (
                      <Col lg={6} md={6} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <strong className="text-muted">Price:</strong>
                          <div>
                            <span className="text-muted">${changeTracker.price.previous.toFixed(2)}</span>
                            <i className="fas fa-long-arrow-alt-right mx-2 text-muted"></i>
                            <span className="fw-bold">${changeTracker.price.current.toFixed(2)}</span>
                            <Badge
                              bg={changeTracker.price.direction === 'increased' ? 'success' : 'danger'}
                              className="ms-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {changeTracker.price.direction === 'increased' ? '+' : '-'}${changeTracker.price.change.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    )}

                    {changeTracker.shippingCost.direction !== 'unchanged' && user?.showProductPrice !== false && (
                      <Col lg={6} md={6} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <strong className="text-muted">Shipping:</strong>
                          <div>
                            <span className="text-muted">${changeTracker.shippingCost.previous.toFixed(2)}</span>
                            <i className="fas fa-long-arrow-alt-right mx-2 text-muted"></i>
                            <span className="fw-bold">${changeTracker.shippingCost.current.toFixed(2)}</span>
                            <Badge
                              bg={changeTracker.shippingCost.direction === 'increased' ? 'success' : 'danger'}
                              className="ms-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {changeTracker.shippingCost.direction === 'increased' ? '+' : '-'}${changeTracker.shippingCost.change.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    )}

                    {changeTracker.unit.changed && (
                      <Col lg={6} md={6} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <strong className="text-muted">Unit:</strong>
                          <div>
                            <span className="text-muted">{changeTracker.unit.previous}</span>
                            <i className="fas fa-long-arrow-alt-right mx-2 text-muted"></i>
                            <span className="fw-bold">{changeTracker.unit.current}</span>
                            <Badge
                              bg="info"
                              className="ms-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Changed
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </CardBody>
              </Card>
            )}

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="secondary"
                onClick={() => router.back()}
                disabled={loading}
              >
                <i className="fas fa-arrow-left me-1"></i> Cancel
              </Button>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="d-flex align-items-center"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i> Save Changes
                    {changedFieldsCount > 0 && (
                      <Badge
                        bg="light"
                        text="dark"
                        className="ms-2"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {changedFieldsCount}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div >
  )
}

export default EditProduct