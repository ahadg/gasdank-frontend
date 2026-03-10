'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Row, Col, Card, CardHeader, CardBody, Button, Form, CardTitle } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup.string().oneOf(['general', 'expenses']).default('general'),
  active: yup.boolean().default(true),
})

type FormData = yup.InferType<typeof schema>

export default function AddCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user)

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

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const response = await api.post('/api/categories', {
        ...data,
        user_id: user?._id
      })

      if (user?._id) {
        await api.post(`/api/activity/${user._id}`, {
          page: 'categories',
          action: "UPDATE",
          resource_type: "category_modification",
          type: "category_modification",
          description: `Category added (${data.type})`,
          user_id: user._id,
          user_created_by: user.created_by,
        }).catch(err => console.error("Error creating activity:", err))
      }

      if (response.status === 200 || response.status === 201) {
        showNotification({
          message: `Category added successfully as ${data.type}`,
          variant: 'success'
        })
        router.back()
      }
    } catch (error: any) {
      console.error('Error adding category:', error)
      showNotification({
        message: error?.response?.data?.error || 'Error adding category',
        variant: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Add Category</h4>

      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">
            Add Category
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
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'CREATE'}
              </Button>
              <Button variant="outline-secondary" className="ms-2" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}