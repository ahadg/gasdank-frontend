'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Row, Col, Card, CardHeader, CardTitle, CardBody, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'

interface Access {
  read: boolean;
  edit: boolean;
  delete: boolean;
  create: boolean;
}
interface DashboardStatAccess {
  today_sales: boolean;
  today_profit: boolean;
  inventory_value: boolean;
  outstanding_balance: boolean;
  user_balance: boolean;
  company_balance: boolean;
  online_balance: boolean;
}
interface AccessData {
  dashboard: Access;
  dashboard_stats: DashboardStatAccess;
  sale: Access;
  wholesale: Access;
  inventory: Access;
  config: Access;
  reports: Access;
}
const defaultAccess: AccessData = {
  dashboard: { read: false, edit: false, delete: false, create: false },
  dashboard_stats: {
    today_sales: false,
    today_profit: false,
    inventory_value: false,
    outstanding_balance: false,
    user_balance: false,
    company_balance: false,
    online_balance: false,
  },
  sale: { read: false, edit: false, delete: false, create: false },
  wholesale: { read: false, edit: false, delete: false, create: false },
  inventory: { read: false, edit: false, delete: false, create: false },
  config: { read: false, edit: false, delete: false, create: false },
  reports: { read: false, edit: false, delete: false, create: false },
}

const pages = ["dashboard", "sale", "wholesale", "inventory", "config", "reports"]
const permissions = ["read", "edit", "delete", "create"]
const statPermissions = ["today_sales", "today_profit", "inventory_value", "outstanding_balance", "user_balance", "company_balance", "online_balance"]

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().optional(),
  userName: yup.string().required('User name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
  password: yup
  .string()
  .optional()
  .matches(/^\d{4}$/, 'PIN must be exactly 4 digits')
  .nullable()
  .transform((value) => (value === '' ? null : value)),

})

type FormData = yup.InferType<typeof schema>

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id
  const { showNotification } = useNotificationContext()

  const [loading, setLoading] = useState(false)
  const [accessData, setAccessData] = useState<AccessData>(defaultAccess)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get(`/api/users/${userId}`)
        const userData = response.data
        setValue('firstName', userData.firstName || '')
        setValue('lastName', userData.lastName || '')
        setValue('userName', userData.userName || '')
        setValue('email', userData.email || '')
        setValue('phone', userData.phone || '')
        setAccessData(userData.access || defaultAccess)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    if (userId) fetchUser()
  }, [userId, setValue])

  const handleAccessChange = (page: string, perm: string, checked: boolean) => {
    setAccessData((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [perm]: checked,
      },
    }))
  }

  const handleStatAccessChange = (stat: string, checked: boolean) => {
    setAccessData((prev) => ({
      ...prev,
      dashboard_stats: {
        ...prev.dashboard_stats,
        [stat]: checked,
      },
    }))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        access: accessData,
      }
      const response = await api.patch(`/api/users/${userId}`, payload)
      if (response.status === 200 || response.status === 204) {
        showNotification({ message: 'User updated successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error('Error updating user:', error)
      showNotification({
        message: error?.response?.data?.error || error?.response?.data?.message || "Error updating user",
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Edit User</h4>
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">Edit User</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>First Name<span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" {...register('firstName')} isInvalid={!!errors.firstName} />
                <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
              </Col>
              <Col md={6}>
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" {...register('lastName')} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>User Name<span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" {...register('userName')} isInvalid={!!errors.userName} />
                <Form.Control.Feedback type="invalid">{errors.userName?.message}</Form.Control.Feedback>
              </Col>
              <Col md={6}>
                <Form.Label>Email<span className="text-danger">*</span></Form.Label>
                <Form.Control type="email" {...register('email')} isInvalid={!!errors.email} />
                <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Phone</Form.Label>
                <Form.Control type="text" {...register('phone')} />
              </Col>
              <Col md={6}>
                <Form.Label>PIN</Form.Label>
                <Form.Control type="password" {...register('password')} isInvalid={!!errors.password} />
                <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
              </Col>
            </Row>

            <h5 className="mt-4">Access Permissions</h5>
            {pages.map((page) => (
              <div key={page} className="mb-3">
                <strong>{page.charAt(0).toUpperCase() + page.slice(1)}</strong>
                <div className="d-flex gap-3">
                  {permissions.map((perm) => (
                    <div key={perm}>
                      <label>
                        <input
                          type="checkbox"
                          checked={accessData[page][perm]}
                          onChange={(e) => handleAccessChange(page, perm, e.target.checked)}
                        />{' '}
                        {perm}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <h5 className="mt-4">Dashboard Stats Access</h5>
            <div className="d-flex flex-wrap gap-3">
              {statPermissions.map((stat) => (
                <div key={stat}>
                  <label>
                    <input
                      type="checkbox"
                      checked={accessData.dashboard_stats[stat]}
                      onChange={(e) => handleStatAccessChange(stat, e.target.checked)}
                    />{' '}
                    {stat.replace(/_/g, ' ').toUpperCase()}
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button variant="secondary" className="me-2" onClick={() => router.back()} disabled={loading}>
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
