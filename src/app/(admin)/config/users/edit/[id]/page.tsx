'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { Metadata } from 'next'
import { Row, Col, Card, CardHeader, CardTitle, CardBody, Button, Form } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'

//export const metadata: Metadata = { title: 'Edit User' }

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
  purchase: Access;
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
    online_balance: false
  },
  purchase: { read: false, edit: false, delete: false, create: false },
  wholesale: { read: false, edit: false, delete: false, create: false },
  inventory: { read: false, edit: false, delete: false, create: false },
  config: { read: false, edit: false, delete: false, create: false },
  reports: { read: false, edit: false, delete: false, create: false },
}

const pages = ["dashboard", "purchase", "wholesale", "inventory", "config", "reports"]
const permissions = ["read", "edit", "delete", "create"]

// For dashboard stats, define the permission keys
const statPermissions = ["today_sales", "today_profit", "inventory_value", "outstanding_balance", "user_balance", "company_balance","online_balance"]

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id // assuming your dynamic route segment is named [id]
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  
  // Initialize form data with default access object
  const [formData, setFormData] = useState({
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    access: defaultAccess,
  })

  // Load user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get(`/api/users/${userId}`)
        const userData = response.data
        setFormData({
          password: '', // Do not pre-fill password for security reasons.
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          access: userData.access || defaultAccess,
        })
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    if (userId) fetchUser()
  }, [userId])

  // Handle standard input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Handle changes for access checkboxes (for main pages)
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.patch(`/api/users/${userId}`, formData)
      if (response.status === 200 || response.status === 204) {
        showNotification({ message: 'User updated successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error('Error updating user:', error)
      showNotification({ message: error?.response?.data?.error || error?.response?.data?.message || "Error updating user", variant: 'danger' })
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
          <form onSubmit={handleSubmit}>
            {/* Password */}
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
              </Col>
            </Row>

            {/* First Name & Last Name */}
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

            {/* Email & Phone */}
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

            {/* Access Permissions Section */}
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
                {loading ? 'Updating...' : 'UPDATE'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
