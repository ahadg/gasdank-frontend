'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Metadata } from 'next'
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Button, Form, Table } from 'react-bootstrap'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export const metadata: Metadata = { title: 'Add Products' }

const multipleProductSchema = yup.object({
  products: yup.array().of(
    yup.object({
      referenceNumber: yup.number().required('Reference number is required'),
      name: yup.string().optional(),
      qty: yup.number().required('Quantity is required').min(1, 'Minimum quantity is 1'),
      unit: yup.string().required('Unit is required'),
      measurement: yup
        .number()
        .required('Measurement is required')
        .oneOf([1, 0.5, 0.25], 'Invalid measurement'),
      category: yup.string().required('Category is required'),
      price: yup.number().required('Price is required').min(0, 'Price must be non-negative'),
    })
  ).min(1, 'At least one product is required'),
  shippingCost: yup.number().required('Shipping cost is required').min(0, 'Must be non-negative'),
})

type MultipleProductFormData = yup.InferType<typeof multipleProductSchema>

function AddProductsPage() {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user)
  // State for managing reference numbers
  const [nextReferenceNumber, setNextReferenceNumber] = useState<number>(1)
  const [referenceNumberLoading, setReferenceNumberLoading] = useState(false)

  const { control, handleSubmit, getValues, reset } = useForm<MultipleProductFormData>({
    resolver: yupResolver(multipleProductSchema),
    defaultValues: {
      products: [{ referenceNumber: 1, name: '', qty: 0, unit: 'pound', category: '', measurement: 1, price: 0 }],
      shippingCost: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  // Use useWatch for real-time updates
  const productsData = useWatch({
    control,
    name: 'products',
    defaultValue: [{ referenceNumber: 0, name: '', qty: 0, unit: 'pound', category: '', measurement: 1, price: 0 }]
  })

  const shippingCost = useWatch({
    control,
    name: 'shippingCost',
    defaultValue: 0
  })

  // Calculate total quantity
  const totalQuantity = useMemo(
    () => productsData.reduce((sum, item) => sum + Number(item?.qty || 0), 0),
    [productsData]
  )

  // Calculate average shipping per unit
  const avgShipping = useMemo(
    () => (totalQuantity > 0 ? Number(shippingCost || 0) / totalQuantity : 0),
    [shippingCost, totalQuantity]
  )

  // Calculate total amount correctly: qty * (price + avgShipping) for each product
  const totalAmount = useMemo(() => {
    const productsTotal = productsData.reduce((sum, item) => {
      const qty = Number(item?.qty || 0);
      const price = Number(item?.price || 0);

      // Calculate avg_shipping per item (as number, rounded to 2 decimals)
      let avg_shipping = totalQuantity > 0 ? Number(shippingCost || 0) / totalQuantity : 0;
      avg_shipping = Math.round(avg_shipping * 100) / 100; // Round to 2 decimal places

      const itemTotal = qty * (price + avg_shipping);
      return sum + itemTotal;
    }, 0);

    return productsTotal;
  }, [productsData, shippingCost, totalQuantity]);

  // State for account (buyer) selector
  const [accounts, setAccounts] = useState<any[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Fetch next reference number
  const fetchNextReferenceNumber = async () => {
    setReferenceNumberLoading(true)
    try {
      const response = await api.get('/api/inventory/next-reference-number')
      setNextReferenceNumber(response.data.nextReferenceNumber)
    } catch (error: any) {
      showNotification({ message: error?.response?.data?.error || 'Error fetching reference number', variant: 'danger' })
      console.error('Error fetching reference number:', error)
    } finally {
      setReferenceNumberLoading(false)
    }
  }

  // Fetch buyers for the current user
  useEffect(() => {
    async function fetchAccounts() {
      if (user?._id) {
        try {
          const response = await api.get(`/api/buyers?user_id=${user._id}`)
          setAccounts(response.data)
        } catch (error: any) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching accounts', variant: 'danger' })
          console.error('Error fetching accounts:', error)
        }
      }
    }
    fetchAccounts()
  }, [user?._id])

  // Fetch next reference number on component mount
  useEffect(() => {
    fetchNextReferenceNumber()
  }, [])

  // Reset form with correct reference number when it's fetched
  useEffect(() => {
    if (nextReferenceNumber > 1) {
      reset({
        products: [{ referenceNumber: nextReferenceNumber, name: '', qty: 0, unit: 'pound', category: '', measurement: 1, price: 0 }],
        shippingCost: 0,
      })
    }
  }, [nextReferenceNumber, reset])

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter((acc) =>
    `${acc.firstName} ${acc.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Fetch user-specific categories
  const [userCategories, setUserCategories] = useState<any[]>([])
  useEffect(() => {
    async function fetchUserCategories() {
      if (user?._id) {
        try {
          const response = await api.get(`/api/categories/${user._id}`)
          setUserCategories(response.data)
        } catch (error: any) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching categories', variant: 'danger' })
          console.error('Error fetching user categories:', error)
        }
      }
    }
    fetchUserCategories()
  }, [user?._id])

  const measurementOptions = [
    { label: 'Full', value: 1 },
    { label: 'Half', value: 0.5 },
    { label: 'Quarter', value: 0.25 },
  ]

  const handleAddRow = () => {
    const newReferenceNumber = nextReferenceNumber + fields.length
    append({ 
      referenceNumber: newReferenceNumber, 
      name: '', 
      qty: 0, 
      unit: 'pound', 
      category: '', 
      price: 0, 
      measurement: 1 
    })
  }

  // Error callback for form submission
  const onError = (errors: any) => {
    console.log("Form errors", errors)
    showNotification({ message: 'Please select/input all the necessary fields', variant: 'danger' })
  }

  // Additional transaction production function
  const produce_transaction = async (data: any[], avg_shipping: number, shippingCost: number) => {
    try {
      console.log("data", data)
      setLoading(true)
      const transformedItems = data.map((item) => ({
        inventory_id: item._id,
        qty: Number(item.qty),
        measurement: item.measurement,
        name: item?.name,
        unit: item.unit,
        price: item.price,
        shipping: avg_shipping.toFixed(2),
      }))

      const productsTotal = productsData.reduce((sum, item) => {
        const qty = Number(item?.qty || 0);
        const price = Number(item?.price || 0);
    
        const itemTotal = qty * (price);
        return sum + itemTotal;
      }, 0);

      const payload = {
        user_id: user._id,
        buyer_id: selectedAccount._id,
        items: transformedItems,
        price: productsTotal.toFixed(2),
        total_shipping: Number(shippingCost),
        type: 'inventory_addition',
      }

      console.log('payload', payload)
      const response = await api.post('/api/transaction', payload)
      console.log('Transaction processed:', response.data)
      showNotification({ message: 'Transaction processed successfully', variant: 'success' })
    } catch (error: any) {
      console.error('Error processing transaction:', error.response)
      showNotification({ message: error?.response?.data?.error || 'Error processing transaction', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: MultipleProductFormData) => {
    if (!selectedAccount) {
      showNotification({ message: 'Please select an account first.', variant: 'danger' })
      return
    }
    setLoading(true)
    
    const total_quantity = data.products.reduce((sum, currval) => sum + Number(currval.qty), 0)
    const avg_shipping = total_quantity > 0 ? Number(shippingCost) / total_quantity : 0
    
    console.log("Calculation details:", {
      avg_shipping,
      total_quantity,
      shippingCost,
      totalAmount
    })
    
    try {
      let products: any[] = []
      const calls = data.products.map(async (prod) => {
        const the_category = userCategories.find((cat) => cat.name === prod.category)
        console.log('prod', prod)
        const res = await api.post('/api/inventory', {
          user_id: user._id,
          buyer_id: selectedAccount._id,
          reference_number: prod.referenceNumber,
          name: prod.name,
          qty: prod.qty * prod.measurement,
          unit: prod.unit,
          category: the_category?._id,
          price: prod.price,
          shippingCost: avg_shipping.toFixed(2),
          status: "",
          notes: "",
        })
        products.push({...res.data, measurement: prod.measurement, qty: prod.qty})
      })
      await Promise.all(calls)
      console.log('Created products =>', products)
      await produce_transaction(products, avg_shipping, shippingCost)
      showNotification({ message: 'Products added successfully', variant: 'success' })
      router.back()
    } catch (error: any) {
      console.error('Error adding products:', error)
      showNotification({ message: error?.response?.data?.error || 'Error adding products', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  // Mobile Product Card Component
  const MobileProductCard = ({ field, index }: { field: any; index: number }) => (
    <Card className="mb-3 d-md-none">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Product {index + 1}</h6>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            <IconifyIcon icon="tabler:trash" />
          </Button>
        </div>
        
        <Row className="g-2">
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Reference #</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.referenceNumber` as const}
              render={({ field }) => (
                <Form.Control 
                  type="number" 
                  value={nextReferenceNumber + index}
                  disabled
                  className="bg-light"
                  size="sm"
                  {...field}
                />
              )}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Product Name</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.name` as const}
              render={({ field }) => (
                <Form.Control 
                  type="text" 
                  placeholder="(optional)" 
                  size="sm"
                  {...field} 
                />
              )}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Quantity</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.qty` as const}
              render={({ field }) => (
                <Form.Control 
                  type="number" 
                  placeholder="Enter quantity" 
                  step="any" 
                  size="sm"
                  {...field} 
                />
              )}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Unit</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.unit` as const}
              render={({ field }) => (
                <Form.Select size="sm" {...field}>
                  <option value="">Select unit</option>
                  <option value="per piece">Per Piece</option>
                  <option value="pound">Pound</option>
                  <option value="Kg">Kg</option>
                  <option value="gram">Gram</option>
                </Form.Select>
              )}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Measurement</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.measurement` as const}
              render={({ field }) => (
                <Form.Select size="sm" {...field}>
                  <option value="">Select measurement</option>
                  {measurementOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              )}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Price</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.price` as const}
              render={({ field }) => (
                <Form.Control 
                  type="number" 
                  placeholder="Enter price" 
                  step="any" 
                  size="sm"
                  {...field} 
                />
              )}
            />
          </Col>
          <Col xs={12}>
            <Form.Label className="small fw-semibold">Category</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.category` as const}
              render={({ field }) => (
                <Form.Select size="sm" {...field}>
                  <option value="">Select category</option>
                  {userCategories.map((cat: any) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )

  return (
    <div className="container-fluid px-2 px-md-3">
      <div className="d-flex align-items-center mb-3 mb-md-4">
        <h4 className="mb-0 fs-5 fs-md-4">Add Products</h4>
      </div>
      
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0 fs-6 fs-md-5">Add Multiple Products</CardTitle>
        </CardHeader>
        <CardBody className="p-2 p-md-3">
          {/* Account Selector */}
          <div className="mb-3 mb-md-4">
            <h6 className="fs-6 fs-md-5">Select Account</h6>
            <div className="position-relative">
              <Button
                variant="outline-secondary"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="text-start d-flex justify-content-between align-items-center rounded-pill shadow-sm py-2 px-3"
                size="sm"
              >
                <span className="text-truncate">
                  {selectedAccount
                    ? `${selectedAccount.firstName} ${selectedAccount.lastName}`
                    : 'Select an Account'}
                </span>
                <IconifyIcon icon="tabler:chevron-down" className="fs-4 flex-shrink-0" />
              </Button>
              {dropdownOpen && (
                <div
                  className="position-absolute w-100 bg-white border rounded shadow"
                  style={{ zIndex: 1000, top: '110%' }}
                >
                  <Form.Control
                    type="text"
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 p-2"
                    size="sm"
                  />
                  <ul
                    className="list-unstyled mb-0"
                    style={{ maxHeight: '200px', overflowY: 'auto', cursor: 'pointer' }}
                  >
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((acc) => (
                        <li
                          key={acc._id}
                          className="p-2 border-bottom hover-bg-light small"
                          onClick={() => {
                            setSelectedAccount(acc)
                            setDropdownOpen(false)
                          }}
                        >
                          {acc.firstName} {acc.lastName}
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-muted small">No accounts found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Product Form */}
          <Form onSubmit={handleSubmit(onSubmit, onError)}>
            {/* Desktop Table - Hidden on mobile */}
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <Table bordered className="mb-3">
                  <thead className="table-light">
                    <tr>
                      <th className="small">Reference #</th>
                      <th className="small">Product Name</th>
                      <th className="small">Quantity</th>
                      <th className="small">Unit</th>
                      <th className="small">Measurement</th>
                      <th className="small">Category</th>
                      <th className="small">Price</th>
                      <th className="small">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id}>
                        <td>
                          <Controller
                            control={control}
                            name={`products.${index}.referenceNumber` as const}
                            render={({ field }) => (
                              <Form.Control 
                                type="number" 
                                value={nextReferenceNumber + index}
                                disabled
                                className="bg-light"
                                size="sm"
                                {...field}
                              />
                            )}
                          />
                        </td>
                        <td>
                          <Controller
                            control={control}
                            name={`products.${index}.name` as const}
                            render={({ field }) => (
                              <Form.Control 
                                type="text" 
                                placeholder="(optional)" 
                                size="sm"
                                {...field} 
                              />
                            )}
                          />
                        </td>
                        <td>
                          <Controller
                            control={control}
                            name={`products.${index}.qty` as const}
                            render={({ field }) => (
                              <Form.Control 
                                type="number" 
                                placeholder="Enter quantity" 
                                step="any" 
                                size="sm"
                                {...field} 
                              />
                            )}
                          />
                        </td>
                        <td>
                          <Controller
                            control={control}
                            name={`products.${index}.unit` as const}
                            render={({ field }) => (
                              <Form.Select size="sm" {...field}>
                                <option value="">Select unit</option>
                                <option value="per piece">Per Piece</option>
                                <option value="pound">Pound</option>
                                <option value="Kg">Kg</option>
                                <option value="gram">Gram</option>
                              </Form.Select>
                            )}
                          />
                        </td>
                        <td>
                          <Controller
                            control={control}
                            name={`products.${index}.measurement` as const}
                            render={({ field }) => (
                              <Form.Select size="sm" {...field}>
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
                          <Controller
                            control={control}
                            name={`products.${index}.category` as const}
                            render={({ field }) => (
                              <Form.Select size="sm" {...field}>
                                <option value="">Select category</option>
                                {userCategories.map((cat: any) => (
                                  <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                  </option>
                                ))}
                              </Form.Select>
                            )}
                          />
                        </td>
                        <td>
                          <Controller
                            control={control}
                            name={`products.${index}.price` as const}
                            render={({ field }) => (
                              <Form.Control 
                                type="number" 
                                placeholder="Enter price" 
                                step="any" 
                                size="sm"
                                {...field} 
                              />
                            )}
                          />
                        </td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <IconifyIcon icon="tabler:trash" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            {/* Mobile Cards - Hidden on desktop */}
            <div className="d-md-none">
              {fields.map((field, index) => (
                <MobileProductCard key={field.id} field={field} index={index} />
              ))}
            </div>

            <Button 
              variant="outline-primary" 
              onClick={handleAddRow} 
              className="mb-3 w-md-auto"
              size="sm"
              disabled={referenceNumberLoading}
            >
              <IconifyIcon icon="tabler:plus" className="me-1" />
              Add Another Product
            </Button>

            {/* Shipping Cost */}
            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Shipping Cost</Form.Label>
                  <Controller
                    control={control}
                    name="shippingCost"
                    render={({ field }) => (
                      <Form.Control 
                        type="number" 
                        placeholder="Enter shipping cost" 
                        step="any" 
                        size="sm"
                        {...field} 
                      />
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Summary */}
            <Card className="mb-3 bg-light">
              <CardBody className="p-2 p-md-3">
                <div className="row g-2">
                  <div className="col-12 col-md-4">
                    <div className="small">
                      <strong>Total Quantity:</strong>
                      <div className="text-primary fs-6">{totalQuantity}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="small">
                      <strong>Avg Shipping per Unit:</strong>
                      <div className="text-primary fs-6">${avgShipping.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="small">
                      <strong>Total Amount:</strong>
                      <div className="text-success fs-6">${totalAmount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Submit Button */}
            <div className="d-grid d-md-flex justify-content-md-end">
              <Button 
                type="submit" 
                variant="success" 
                disabled={loading}
                className="w-md-auto"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  'CREATE PRODUCTS'
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}

export default AddProductsPage