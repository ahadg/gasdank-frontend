'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Row, Col, Card, CardHeader, CardBody, Button, Form, CardTitle } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

export default function AddCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categoryType, setCategoryType] = useState<'general' | 'expenses'>('general')
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')
    const active = formData.get('active') === 'on'

    try {
      const response = await api.post('/api/categories', {
        name,
        type: categoryType,
        active,
        user_id: user?._id
      })

      await api.post(`/api/activity/${user._id}`, {
        page: 'categories',
        action: "UPDATE",
        resource_type: "category_modification",
        type: "category_modification",
        description: `Category added (${categoryType})`,
        user_id: user._id,
        user_created_by: user.created_by,
      })

      if (response.status === 200 || response.status === 201) {
        showNotification({
          message: `Category added successfully as ${categoryType}`,
          variant: 'success'
        })
        router.back()
      }
    } catch (error: any) {
      console.error(error)
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
          <form onSubmit={handleSubmit}>
            {/* Category Name */}
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">
                  Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter category name"
                  required
                />
              </Col>
            </Row>

            {/* Category Type */}
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">
                  Type<span className="text-danger">*</span>
                </label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    id="general"
                    label="General"
                    name="categoryType"
                    checked={categoryType === 'general'}
                    onChange={() => setCategoryType('general')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="expenses"
                    label="Expenses"
                    name="categoryType"
                    checked={categoryType === 'expenses'}
                    onChange={() => setCategoryType('expenses')}
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
                  name="active"
                  defaultChecked
                />
              </Col>
            </Row>

            {/* Buttons */}
            <div className="mt-4">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'CREATE'}
              </Button>
              <Button variant="outline-secondary" className="ms-2" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}