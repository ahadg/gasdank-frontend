"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardHeader, CardTitle, CardBody, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

const schema = yup.object({
  category_id: yup.string().required('Category is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be greater than zero').required('Amount is required'),
  description: yup.string().required('Description is required'),
}).required()

type FormData = yup.InferType<typeof schema>

// Utility function to get date range for past week
const getPastWeekDateRange = () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 7)
  endDate.setDate(endDate.getDate() + 1)
  // Format for datetime-local input
  const formatDateTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return {
    startDateTime: formatDateTime(startDate),
    endDateTime: formatDateTime(endDate)
  }
}

export default function AddExpensePage() {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user) || { _id: '67cf4bb808facf7a76f9f229' }
  const [loading, setLoading] = useState(false)
  const [userCategories, setUserCategories] = useState<any[]>([])
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState(null)

  // Initialize with past week date range
  const [dateRange, setDateRange] = useState(getPastWeekDateRange())

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      category_id: '',
      amount: 0,
      description: '',
    },
  })

  // Fetch user-specific categories
  useEffect(() => {
    async function fetchUserCategories() {
      if (user?._id) {
        try {
          const response = await api.get(`/api/categories/${user._id}?type=expenses`)
          setUserCategories(response.data)
        } catch (error) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching categories', variant: 'danger' })
          console.error('Error fetching user categories:', error)
        }
      }
    }
    fetchUserCategories()
  }, [user?._id])

  // Fetch summary data
  const fetchSummary = async () => {
    if (!user?._id) return
    try {
      setSummaryLoading(true)
      const response = await api.get(`/api/expense/summary/${user._id}`, {
        params: {
          start: dateRange.startDateTime,
          end: dateRange.endDateTime
        }
      })
      setSummary(response.data)
    } catch (error: any) {
      showNotification({ message: error?.response?.data?.error || 'Error fetching summary', variant: 'danger' })
    } finally {
      setSummaryLoading(false)
    }
  }

  // Auto-fetch summary on component mount and when user changes
  useEffect(() => {
    if (user?._id) {
      fetchSummary()
    }
  }, [user?._id, dateRange.startDateTime, dateRange.endDateTime])

  // Handle date range changes
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Format currency helper function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const payload = {
      ...data,
      user_id: user._id,
      user_created_by_id: user.created_by,
    }
    console.log("user", user)
    console.log("payload", payload)

    try {
      const response = await api.post('/api/expense', payload)
      if (response.status === 200 || response.status === 201) {
        showNotification({ message: 'Expense added successfully', variant: 'success' })
        // Refresh summary after adding expense
        fetchSummary()
        router.back()
      }
    } catch (error: any) {
      console.error('Error adding expense:', error)
      showNotification({ message: error?.response?.data?.error || 'Error adding expense', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4"></h4>


      {/* Date Range Selector */}
      <Card className="mb-4">
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h6" className="mb-0">Date Range Filter</CardTitle>
        </CardHeader>
        <CardBody>
          <Row className="gy-3">
            <Col xs={12} md={5}>
              <Form.Group>
                <Form.Label>Start Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startDateTime"
                  value={dateRange.startDateTime}
                  onChange={handleDateRangeChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={5}>
              <Form.Group>
                <Form.Label>End Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endDateTime"
                  value={dateRange.endDateTime}
                  onChange={handleDateRangeChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={2} className="d-flex align-items-end">
              <Button
                onClick={fetchSummary}
                variant="primary"
                className="bg-gradient w-100"
                disabled={summaryLoading}
              >
                {summaryLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Summary Card */}
      {summary && (
        <Card className="mb-4">
          <CardHeader className="border-bottom border-light">
            <CardTitle as="h6" className="mb-0">Financial Summary</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md={3}>
                <div className="text-muted small">Total Revenue</div>
                <div className="fw-bold text-success">{formatCurrency(summary.totalRevenue)}</div>
              </Col>
              <Col md={3}>
                <div className="text-muted small">Total Expenses</div>
                <div className="fw-bold text-danger">{formatCurrency(summary.totalExpenses)}</div>
              </Col>
              <Col md={3}>
                <div className="text-muted small">Total Profit</div>
                <div className="fw-bold text-info">{formatCurrency(summary.totalProfit)}</div>
              </Col>
              <Col md={3}>
                <div className="text-muted small">Net Profit</div>
                <div className={`fw-bold ${summary.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(summary.netProfit)}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      )}


      {/* Add Expense Form */}
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">Add Expense</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Category<span className="text-danger">*</span></Form.Label>
                <Form.Select {...register('category_id')} isInvalid={!!errors.category_id}>
                  <option value="">Select category</option>
                  {userCategories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.category_id?.message}</Form.Control.Feedback>
              </Col>
              <Col md={6}>
                <Form.Label>Amount<span className="text-danger">*</span></Form.Label>
                <Form.Control type="number" {...register('amount')} isInvalid={!!errors.amount} />
                <Form.Control.Feedback type="invalid">{errors.amount?.message}</Form.Control.Feedback>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Description<span className="text-danger">*</span></Form.Label>
                <Form.Control as="textarea" rows={3} {...register('description')} isInvalid={!!errors.description} />
                <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
              </Col>
            </Row>
            <div className="mt-4">
              <Button variant="secondary" className="me-2" onClick={() => router.back()} disabled={loading}>
                CANCEL
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'SUBMIT'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}