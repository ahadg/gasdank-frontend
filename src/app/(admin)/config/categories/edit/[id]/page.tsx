'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { Row, Col, Card, CardHeader, CardTitle, CardBody, Button, Form } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import { Metadata } from 'next'

//export const metadata: Metadata = { title: 'Edit Category' }

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id // assuming your dynamic route segment is named [id]

  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    active: true,
  })
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotificationContext()

  // Load category data on mount
  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await api.get(`/api/categories/${categoryId}`)
        const categoryData = response.data
        setFormData({
          name: categoryData.name || '',
          type: categoryData.type || 'general',
          active: categoryData.active !== undefined ? categoryData.active : true,
        })
      } catch (error) {
        console.error('Error fetching category:', error)
      }
    }
    if (categoryId) fetchCategory()
  }, [categoryId])

  // Handles both text inputs and checkbox
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.put(`/api/categories`, { id: categoryId, formData })
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
                  value={formData.name}
                  onChange={handleChange}
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
                    name="type"
                    checked={formData.type === 'general'}
                    onChange={() => setFormData(prev => ({ ...prev, type: 'general' }))}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="expenses"
                    label="Expenses"
                    name="type"
                    checked={formData.type === 'expenses'}
                    onChange={() => setFormData(prev => ({ ...prev, type: 'expenses' }))}
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
                  checked={formData.active}
                  onChange={handleChange}
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
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
