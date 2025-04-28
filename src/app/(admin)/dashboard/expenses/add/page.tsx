'use client'
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

export default function AddExpensePage() {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user) || { _id: '67cf4bb808facf7a76f9f229' }
  const [loading, setLoading] = useState(false)
  const [userCategories, setUserCategories] = useState<any[]>([])

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

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const payload = {
      ...data,
      user_id: user._id,
      user_created_by_id: user.created_by,
    }
    console.log("user",user)
    console.log("payload",payload)

    try {
      const response = await api.post('/api/expense', payload)
      if (response.status === 200 || response.status === 201) {
        showNotification({ message: 'Expense added successfully', variant: 'success' })
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
      <h4 className="mb-4">Add Expense</h4>
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
