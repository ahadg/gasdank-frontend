'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { Row, Col, Card, CardHeader, CardTitle, CardBody, Button, Form } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup.string().oneOf(['general', 'expenses']).default('general'),
  active: yup.boolean().default(true),
})

type FormData = yup.InferType<typeof schema>

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { showNotification } = useNotificationContext()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      type: 'general',
      active: true,
    }
  })

  const currentType = watch('type')

  // Load category data on mount
  useEffect(() => {
    async function fetchCategory() {
      try {
        setFetching(true)
        const response = await api.get(`/api/categories/detail/${categoryId}`)
        const categoryData = response.data
        if (categoryData) {
          setValue('name', categoryData.name || '')
          setValue('type', categoryData.type || 'general')
          setValue('active', categoryData.active !== undefined ? categoryData.active : true)
        }
      } catch (error) {
        console.error('Error fetching category:', error)
        showNotification({ message: 'Error fetching category details', variant: 'danger' })
      } finally {
        setFetching(false)
      }
    }
    if (categoryId) fetchCategory()
  }, [categoryId, setValue, showNotification])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      // The backend expects { id, formData }
      const response = await api.put(`/api/categories`, { id: categoryId, formData: data })
      if (response.status === 200 || response.status === 204) {
        showNotification({ message: 'Category updated successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error('Error updating category:', error)
      showNotification({ message: error?.response?.data?.error || error?.response?.data?.message || 'Error updating category', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="container-fluid text-center mt-5">
        <h4>Loading category details...</h4>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Edit Category</h4>
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">
            Edit Category
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Category Name */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>
                  Name<span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  isInvalid={!!errors.name}
                  placeholder="Enter category name"
                />
                <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
              </Col>
            </Row>

            {/* Category Type */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>
                  Type<span className="text-danger">*</span>
                </Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    id="general"
                    label="General"
                    value="general"
                    checked={currentType === 'general'}
                    {...register('type')}
                    onChange={() => setValue('type', 'general')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="expenses"
                    label="Expenses"
                    value="expenses"
                    checked={currentType === 'expenses'}
                    {...register('type')}
                    onChange={() => setValue('type', 'expenses')}
                  />
                </div>
                <small className="text-muted">
                  General: For regular product categories. Expenses: For tracking business expenses.
                </small>
              </Col>
            </Row>

            {/* Active Checkbox */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  id="active"
                  label="Active"
                  {...register('active')}
                />
              </Col>
            </Row>

            {/* Buttons */}
            <div className="mt-4">
              <Button
                variant="secondary"
                className="me-2"
                type="button"
                onClick={() => router.back()}
                disabled={loading}
              >
                CANCEL
              </Button>
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
