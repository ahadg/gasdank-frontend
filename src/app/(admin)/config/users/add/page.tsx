'use client'
import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Metadata } from 'next'
import { Button, Card, CardHeader, CardTitle, CardBody, Row, Col, Form } from 'react-bootstrap'
import axios from 'axios'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'

//export const metadata: Metadata = { title: 'Add User' }

interface Access {
  read: boolean;
  edit: boolean;
  delete: boolean;
  create: boolean;
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
  config: Access
  reports: Access
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
    online_balance: true
  },
  sale: { read: true, edit: true, delete: true, create: true },
  wholesale: { read: true, edit: true, delete: true, create: true },
  inventory: { read: true, edit: true, delete: true, create: true },
  config: { read: true, edit: true, delete: true, create: true },
  reports: { read: true, edit: true, delete: true, create: true },
}

const pages = ['dashboard', 'sale', 'wholesale', 'inventory', 'config', 'reports']
const permissions = ['read', 'edit', 'delete', 'create']

// Permissions for dashboard stats
const statPermissions = [
  'today_sales',
  'today_profit',
  'inventory_value',
  'outstanding_balance',
  'user_balance',
  'company_balance',
  "online_balance"
]
export default function AddUserPage() {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role : "user",
    access: defaultAccess,
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAccessChange = (page: string, perm: string, e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      access: {
        ...prev.access,
        [page]: {
          ...prev.access[page],
          [perm]: e.target.checked,
        },
      },
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/api/users', formData)
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

  // Handle changes for dashboard stats permissions
  const handleStatAccessChange = (stat: string, e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      access: {
        ...prev.access,
        dashboard_stats: {
          ...prev.access.dashboard_stats,
          [stat]: e.target.checked,
        },
      },
    }))
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Add User</h4>

      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">Add User</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            {/* Standard Fields */}
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">First Name<span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Email<span className="text-danger">*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
              </Col>
            </Row>
            {/* Access Permissions */}
            <Row className="mb-3">
              <Col>
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
                              name={`access.${page}.${perm}`}
                              checked={formData.access[page][perm]}
                              onChange={(e) => handleAccessChange(page, perm, e)}
                            />{' '}
                            {perm.charAt(0).toUpperCase() + perm.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
               {/* Dashboard Stats Permissions Section */}
               <Row className="mb-3">
              <Col>
                <h5 className="mt-0">Dashboard Stats Access</h5>
                <div className="d-flex gap-3 flex-wrap">
                  {statPermissions.map((stat) => (
                    <div key={stat} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`dashboard_stats_${stat}`}
                        name={`access.dashboard_stats.${stat}`}
                        checked={formData.access?.dashboard_stats?.[stat]}
                        onChange={(e) => handleStatAccessChange(stat, e)}
                      />
                      <label className="form-check-label" htmlFor={`dashboard_stats_${stat}`}>
                        {stat.replace('_', ' ').toUpperCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
            {/* Buttons */}
            <div className="mt-4">
              <Button variant="secondary" className="me-2" type="button" onClick={() => router.back()} disabled={loading}>
                CANCEL
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'CREATE'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
