'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardHeader, CardTitle, CardBody, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

interface Access {
  read: boolean
  edit: boolean
  delete: boolean
  create: boolean
}

interface SampleViewingAccess {
  read: boolean
  edit: boolean
  delete: boolean
  create: boolean,
  pricesVisible: boolean
}

interface Config {
  categories: {
    read: boolean
    edit: boolean
    delete: boolean
    create: boolean
  }
  users: {
    read: boolean
    edit: boolean
    delete: boolean
    create: boolean
  }
}

interface DashboardStatAccess {
  today_sales: boolean
  today_profit: boolean
  inventory_value: boolean
  outstanding_balance: boolean
  user_balance: boolean
  company_balance: boolean
  online_balance: boolean
}

interface AccessData {
  dashboard: Access
  dashboard_stats: DashboardStatAccess
  sale: Access
  wholesale: Access
  inventory: Access
  activitylogs: Access
  config: Config
  reports: Access
  sampleholdings: Access
  sampleviewing: Access
  expenses: Access
  sampleviewingmanagement: SampleViewingAccess
}

const defaultAccess: AccessData = {
  dashboard: { read: true, edit: true, delete: true, create: true },
  dashboard_stats: {
    today_sales: true,
    today_profit: true,
    inventory_value: true,
    outstanding_balance: true,
    user_balance: true,
    company_balance: true,
    online_balance: true,
  },
  sale: { read: true, edit: true, delete: true, create: true },
  activitylogs: { read: true, edit: true, delete: true, create: true },
  wholesale: { read: true, edit: true, delete: true, create: true },
  inventory: { read: true, edit: true, delete: true, create: true },
  config: { 
    categories: { read: true, edit: true, delete: true, create: true },
    users: { read: true, edit: true, delete: true, create: true }
  },
  reports: { read: true, edit: true, delete: true, create: true },
  sampleholdings: { read: true, edit: true, delete: true, create: true },
  expenses: { read: true, edit: true, delete: true, create: true },
  sampleviewing: { read: true, edit: true, delete: true, create: true },
  sampleviewingmanagement: { read: true, edit: true, delete: true, create: true, pricesVisible : true },
}

const pages = ['dashboard', 'sale', 'wholesale', 'inventory', 'reports', 'expenses', 'sampleholdings', 'sampleviewing', 'sampleviewingmanagement']
const permissions = ['read', 'edit', 'delete', 'create']
const statPermissions = ['today_sales', 'today_profit', 'inventory_value', 'outstanding_balance', 'user_balance', 'company_balance', 'online_balance']
const configSections = ['categories', 'users']

const schema = yup.object({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().optional(),
  userName: yup.string().required('User Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
  password: yup
    .string()
    .required('PIN is required')
    .length(4, 'PIN must be exactly 4 digits'),
}).required()

type FormData = yup.InferType<typeof schema>

export default function AddUserPage() {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)
  console.log("user",user)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      phone: '',
      password: '',
    },
  })

  const [accessData, setAccessData] = useState(defaultAccess)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const payload = {
      ...data,
      role: user?.role == "superadmin" ? "admin" : 'user',
      access: accessData,
    }

    try {
      const response = await api.post('/api/users', payload)
      if (response.status === 200 || response.status === 201) {
        showNotification({ message: 'User added successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error('Error adding user:', error)
      showNotification({ message: error?.response?.data?.error || 'Error adding user', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const onError = (errors: any) => {
    const firstError = Object.values(errors)[0] as {message : string}
    const message = firstError?.message || 'Please correct the form errors'
    showNotification({ message, variant: 'danger' })
  }

  const handleAccessChange = (page: string, perm: string, checked: boolean) => {
    setAccessData((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [perm]: checked,
      },
    }))
  }

  const handleConfigAccessChange = (section: string, perm: string, checked: boolean) => {
    setAccessData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [section]: {
          ...prev.config[section],
          [perm]: checked,
        },
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

  return (
    <div className="container-fluid">
      <h4 className="mb-4"></h4>
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">Add User</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit(onSubmit, onError)}>
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
                <Form.Label>User Name</Form.Label>
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
                <Form.Label>PIN<span className="text-danger">*</span></Form.Label>
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
                  {/* Add pricesVisible checkbox only for sampleviewingmanagement */}
                  {page === 'sampleviewingmanagement' && (
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          checked={accessData.sampleviewingmanagement.pricesVisible}
                          onChange={(e) => handleAccessChange(page, 'pricesVisible', e.target.checked)}
                        />{' '}
                        pricesVisible
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <h5 className="mt-4">Config Permissions</h5>
            {configSections.map((section) => (
              <div key={section} className="mb-3">
                <strong>{section.charAt(0).toUpperCase() + section.slice(1)}</strong>
                <div className="d-flex gap-3">
                  {permissions.map((perm) => (
                    <div key={perm}>
                      <label>
                        <input
                          type="checkbox"
                          checked={accessData.config[section][perm]}
                          onChange={(e) => handleConfigAccessChange(section, perm, e.target.checked)}
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
                {loading ? 'Creating...' : 'CREATE'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}