'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

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
})

type ProductFormData = yup.InferType<typeof productSchema>

const AddProduct = () => {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const { handleSubmit, control } = useForm<ProductFormData>({
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
    },
  })
  const [loading, setLoading] = useState(false)
  const [userCategories, setUserCategories] = useState<any[]>([])
  const user = useAuthStore((state) => state.user)

  // Load user-specific categories (GET /api/categories/:id)
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

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const response = await api.post('/api/products', {
        user_id: "67cf4bb808facf7a76f9f229",
        ...data,
      })
      if (response.status === 200 || response.status === 201) {
        showNotification({ message: 'Product added successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error(error)
      showNotification({ message: error?.response?.data?.error || 'Error adding product', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Add Product</h4>
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">
            Add Product
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput control={control} name="name" placeholder="Enter Product name" label="Product" />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput control={control} name="qty" type="number" placeholder="Enter quantity" label="Quantity" />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Unit</label>
                  <Controller
                    control={control}
                    name="unit"
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
                </div>
              </Col>
              {/* User-Specific Category Dropdown */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Form.Select {...field}>
                        <option value="">Select category</option>
                        {userCategories.map((cat: any) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput control={control} name="price" type="number" placeholder="Enter price" label="Price" />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput control={control} name="shippingCost" type="number" placeholder="Enter shipping cost" label="Shipping Cost" />
                </div>
              </Col>
              <Col lg={12}>
                <div className="mb-3">
                  <TextAreaFormInput control={control} name="notes" placeholder="Enter notes" label="Notes" rows={3} />
                </div>
              </Col>
            </Row>
            <div className="mt-4">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'CREATE'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}

export default AddProduct
