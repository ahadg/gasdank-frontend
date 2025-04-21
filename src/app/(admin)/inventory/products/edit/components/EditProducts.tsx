'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
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
})

type ProductFormData = yup.InferType<typeof productSchema>

const EditProduct = () => {
  const router = useRouter()
  const params = useParams()
  const productId = params.id // e.g., from route /inventory/products/edit/[id]
  const { showNotification } = useNotificationContext()

  // Setup react-hook-form with Yup validation.
  const { handleSubmit, control, reset } = useForm<ProductFormData>({
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
  console.log("productId",productId)
  // Load product data from GET /api/inventory/:id
  useEffect(() => {
    console.log("productId",productId)
    async function fetchProduct() {
      try {
        const response = await api.get(`/api/inventory/product/${productId}`)
        const productData = response.data
        console.log("productData",productData)
        // Pre-populate the form with the fetched product data.
        reset({
          qty: productData.qty,
          unit: productData.unit,
          category: productData.category?._id,
          name: productData.name,
          price: productData.price,
          shippingCost: productData.shippingCost,
          status: productData.status,
          notes: productData.notes,
        })
      } catch (error) {
        console.error('Error fetching product:', error)
        console.error('Error fetching:', error?.response?.data?.error)
      }
    }
   fetchProduct()
      
  }, [productId, reset])

  // Load user-specific categories (GET /api/categories/:user_id)
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
      const response = await api.put(`/api/inventory/${productId}`, {
        user_id: user?._id, // Or use user._id if applicable
        ...data,
      })
      if (response.status === 200 || response.status === 204) {
        showNotification({ message: 'Product updated successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error('Error updating product:', error)
      showNotification({ message: error?.response?.data?.error || 'Error updating product', variant: 'danger' })
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

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Edit Product</h4>
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">Edit Product</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit(onSubmit,onError)}>
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
                          <option key={cat._id} value={cat._id}>
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
                {loading ? 'Updating...' : 'UPDATE'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}

export default EditProduct
