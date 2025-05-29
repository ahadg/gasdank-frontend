'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Metadata } from 'next'
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Button, Form, Table } from 'react-bootstrap'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
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
      name: yup.string().required('Product name is required'),
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

  const { control, handleSubmit, watch } = useForm<MultipleProductFormData>({
    resolver: yupResolver(multipleProductSchema),
    defaultValues: {
      products: [{ name: '', unit: 'pound', category: '', measurement: 1 }],
      shippingCost: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  // Watch form values
  const productsData = watch('products')
  const shippingCost = watch('shippingCost')

  const totalProductsAmount = productsData.reduce(
    (sum: number, item: any) => sum + Number(item.qty) * Number(item.price) * Number(item.measurement),
    0
  )
  const totalAmount = totalProductsAmount + Number(shippingCost)

  // Calculate total quantity and average shipping per unit
  const totalQuantity = useMemo(
    () => productsData.reduce((sum: number, item: any) => sum + Number(item.qty), 0),
    [productsData]
  )
  const avgShipping = totalQuantity > 0 ? Number(shippingCost) / totalQuantity : 0

  // State for account (buyer) selector
  const [accounts, setAccounts] = useState<any[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Fetch buyers for the current user
  useEffect(() => {
    async function fetchAccounts() {
      if (user?._id) {
        try {
          const response = await api.get(`/api/buyers?user_id=${user._id}`)
          setAccounts(response.data)
        } catch (error) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching accounts', variant: 'danger' })
          console.error('Error fetching accounts:', error)
        }
      }
    }
    fetchAccounts()
  }, [user?._id])

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
        } catch (error) {
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
    append({ name: '', qty: 0, unit: '', category: '', price: 0, measurement: 1 })
  }

  // Error callback for form submission
  const onError = (errors: any) => {
    console.log("Form errors", errors)
    showNotification({ message: 'Please select/input all the necessary fields', variant: 'danger' })
  }

  // Additional transaction production function
  const produce_transaction = async (data: any[], avg_shipping: number, shippingCost: number) => {
    try {
      console.log("data",data)
      setLoading(true)
      const transformedItems = data.map((item) => ({
        inventory_id: item._id,
        qty: Number(item.qty),
        measurement: item.measurement,
        name : item?.name,
        unit: item.unit,
        price: item.price,
        shipping: avg_shipping.toFixed(2),
      }))

      const payload = {
        user_id: user._id,
        buyer_id: selectedAccount._id,
        items: transformedItems,
        price: totalProductsAmount,
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
    const total_price = data.products.reduce((sum, currval) => sum + (Number(currval.qty) * Number(currval.price)), 0)
    try {
      let products: any[] = []
      const calls = data.products.map(async (prod) => {
        const the_category = userCategories.find((cat) => cat.name === prod.category)
        console.log('prod',prod)
        const res = await api.post('/api/inventory', {
          user_id: user._id,
          buyer_id: selectedAccount._id,
          name: prod.name,
          qty: prod.qty * prod.measurement,
          unit: prod.unit,
          category: the_category?._id,
          price: prod.price,
          shippingCost: avg_shipping.toFixed(3),
          status: "",
          notes: "",
        })
        products.push({...res.data,measurement : prod.measurement, qty: prod.qty})
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

  // Calculate average shipping per unit using useMemo
  const avgShippingDisplay = totalQuantity > 0 ? Number(shippingCost) / totalQuantity : 0

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Add Products</h4>
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">Add Multiple Products</CardTitle>
        </CardHeader>
        <CardBody>
          {/* Account Selector */}
          <div className="mb-4">
            <h6 className="fs-15">Select Account</h6>
            <div className="position-relative">
              <Button
                variant="outline-secondary"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-100 text-start d-flex justify-content-between align-items-center rounded-pill shadow-sm py-2 px-3"
              >
                <span>
                  {selectedAccount
                    ? `${selectedAccount.firstName} ${selectedAccount.lastName}`
                    : 'Select an Account'}
                </span>
                <IconifyIcon icon="tabler:chevron-down" className="fs-4" />
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
                  />
                  <ul
                    className="list-unstyled mb-0"
                    style={{ maxHeight: '300px', overflowY: 'auto', cursor: 'pointer' }}
                  >
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((acc) => (
                        <li
                          key={acc._id}
                          className="p-2 border-bottom hover-bg-light"
                          onClick={() => {
                            setSelectedAccount(acc)
                            setDropdownOpen(false)
                          }}
                        >
                          {acc.firstName} {acc.lastName}
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-muted">No accounts found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Product Form */}
          <Form onSubmit={handleSubmit(onSubmit, onError)}>
            <Table responsive bordered className="mb-3">
              <thead className="table-light">
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Measurement</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td>
                      <Controller
                        control={control}
                        name={`products.${index}.name` as const}
                        render={({ field }) => (
                          <Form.Control type="text" placeholder="Enter product name" {...field} />
                        )}
                      />
                    </td>
                    <td>
                      <Controller
                        control={control}
                        name={`products.${index}.qty` as const}
                        render={({ field }) => (
                          <Form.Control type="number" placeholder="Enter quantity" step="any" {...field} />
                        )}
                      />
                    </td>
                    <td>
                      <Controller
                        control={control}
                        name={`products.${index}.unit` as const}
                        render={({ field }) => (
                          <Form.Select {...field}>
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
                      <Controller
                        control={control}
                        name={`products.${index}.category` as const}
                        render={({ field }) => (
                          <Form.Select {...field}>
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
                          <Form.Control type="number" placeholder="Enter price" step="any" {...field} />
                        )}
                      />
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
            <Button variant="outline-primary" onClick={handleAddRow} className="mb-3">
              + Add Another Product
            </Button>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Shipping Cost</Form.Label>
                  <Controller
                    control={control}
                    name="shippingCost"
                    render={({ field }) => (
                      <Form.Control type="number" placeholder="Enter shipping cost" step="any" {...field} />
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              {/* <div>
                <strong>Average Shipping per Unit: </strong>${avgShipping.toFixed(2)}
              </div> */}
              <div>
                <strong>Total Amount: </strong>${totalAmount ? totalAmount.toFixed(2) : 0}
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-end">
              <Button type="submit" variant="success" disabled={loading}>
                {loading ? 'Submitting...' : 'CREATE PRODUCTS'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}

export default AddProductsPage
