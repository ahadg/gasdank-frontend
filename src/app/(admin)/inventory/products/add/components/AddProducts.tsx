'use client'
import { useState, useEffect, ChangeEvent, FormEvent, useMemo } from 'react'
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
      category: yup.string().required('Category is required'),
      price: yup.number().required('Price is required').min(0, 'Price must be non-negative'),
    })
  ).min(1, 'At least one product is required'),
  shippingCost: yup.number().required('Shipping cost is required').min(0, 'Must be non-negative'),
})

type MultipleProductFormData = yup.InferType<typeof multipleProductSchema>

export default function AddProductsPage() {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user)

  // Form state for multiple products
  const { control, handleSubmit, watch } = useForm<MultipleProductFormData>({
    resolver: yupResolver(multipleProductSchema),
    defaultValues: {
      products: [{ name: '', qty: 0, unit: 'pound', category: '', price: 0 }],
      shippingCost: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  const productsData = watch('products')
  const shippingCost = watch('shippingCost')
  
  const totalProductsAmount = productsData.reduce(
    (sum: number, item: any) => sum + Number(item.qty) * Number(item.price),
    0
  )
  const totalAmount = totalProductsAmount + Number(shippingCost)

  // Calculate total quantity and average shipping per unit
  const totalQuantity = useMemo(
    () => productsData.reduce((sum: number, item: any) => sum + Number(item.qty), 0),
    [productsData]
  )
  const avgShipping = totalQuantity > 0 ? Number(shippingCost) / totalQuantity : 0

  // State for account selector (buyer)
  const [accounts, setAccounts] = useState<any[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Fetch buyers for the current user
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
  useEffect(() => {
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

  const handleAddRow = () => {
    append({ name: '', qty: 0, unit: '', category: '', price: 0 })
  }

  const produce_transaction = async (data,avg_shipping,shippingCost) => {
    console.log("produce_transaction called")
    setLoading(true)
    // Transform each item to match backend expected keys:
    const transformedItems = data.map((item) => ({
      inventory_id: item._id, // Assuming productId corresponds to inventory id
      qty: Number(item.qty),
      measurement: 1,
      unit: item.unit,
      price: item.price,
      shipping: avg_shipping,
      //sale_price: item.price,
    }))

    // const org_price = data.reduce(
    //   (sum: number, item: any) =>
    //     sum + Number(item.quantity) * Number(item.price) + (Number(item.shipping) > 0 ? Number(item.quantity) * Number(item.shipping) : 1),
    //   0
    // )

    // Construct payload:
    const payload = {
      user_id: user._id,
      buyer_id: selectedAccount._id, // Buyer id from route parameters
      items: transformedItems,
      price: totalProductsAmount,
      //sale_price: totalAmount,
      //profit: totalAmount - org_price,
      total_shipping: Number(shippingCost),
      notes: data.notes,
      type: "inventory_addition",
    }

    try {
      console.log("payload", payload)
      const response = await api.post('/api/transaction', payload)
      console.log('sale processed:', response.data)
      //fetchProducts()
      showNotification({ message: 'Transaction processed successfully', variant: 'success' })
      //router.push(`/apps/wholesale/history/${params?.id}`);
    } catch (error: any) {
      console.error('Error processing sale:', error)
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
    // Recalculate total quantity for avg shipping (can also use totalQuantity from useMemo)
    const total_quantity = data.products.reduce((sum, currval) => sum + Number(currval.qty), 0)
    const avg_shipping = total_quantity > 0 ? Number(shippingCost) / total_quantity : 0
    try {
      let products = []
      const calls = data.products.map(async (prod) => {
        const the_category = userCategories?.find((item) => item?.name === prod.category)
        let res = await api.post('/api/products', {
          user_id: user._id,
          buyer_id: selectedAccount._id,
          name: prod.name,
          qty: prod.qty,
          unit: prod.unit,
          category: the_category?._id,
          price: prod.price,
          shippingCost: avg_shipping,
          status: "", // Set default status if needed
          notes: "",  // Optional
        })
        products.push(res.data)
      })
      await Promise.all(calls)
      console.log("productsss",products)
      produce_transaction(products,avg_shipping,shippingCost)
      await api.post(`/api/buyers/balance/${selectedAccount._id}`, { currentBalance : -totalAmount } )
      showNotification({ message: 'Products added successfully', variant: 'success' })
      router.back()
    } catch (error: any) {
      console.error('Error adding products:', error)
      showNotification({ message: error?.response?.data?.error || 'Error adding products', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

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
          <Form onSubmit={handleSubmit(onSubmit, (formErrors) => {
            console.log("Form errors", formErrors)
            showNotification({ message: 'Please select/input all the necessary fields', variant: 'danger' })
          })}>
            <Table responsive bordered className="mb-3">
              <thead className="table-light">
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
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
                            <option value="kilo">Kilo</option>
                            <option value="gram">Gram</option>
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
                <strong>Total Amount: </strong>${totalAmount.toFixed(2)}
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
