'use client'

import { useState, useEffect } from 'react'
import { Card, Col, Row, Form, Button, Spinner, Image } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import 'sweetalert2/src/sweetalert2.scss'

export default function ProfilePage() {
  const { showNotification } = useNotificationContext()
  const router = useRouter()
  const { user: userData } = useAuthStore((state) => state)

  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await api.get('/api/users/me')
        setUser(res.data.user)
        setFormData({
          firstName: res.data.user.firstName || '',
          lastName: res.data.user.lastName || '',
          userName: res.data.user.userName || '',
          email: res.data.user.email || '',
          phone: res.data.user.phone || '',
          password: '', // optional
        })
      } catch (err: any) {
        console.error('Failed to load profile:', err)
        showNotification({ message: 'Failed to load profile. Please login again.', variant: 'danger' })
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (!user) return null

  const subscriptionStatusColor = user.subscriptionStatus === 'active' ? 'text-success' : 'text-danger'

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSaving(true)
  
    try {
      const updatePayload = { ...formData }
  
      // Check if password is provided
      if (updatePayload.password) {
        const passwordRegex = /^\d{4}$/ // exactly 4 digits
        if (!passwordRegex.test(updatePayload.password)) {
          showNotification({ message: 'Password must be exactly 4 digits.', variant: 'danger' })
          setSaving(false)
          return // Stop form submission
        }
      } else {
        delete updatePayload.password // if empty, don't send password
      }
  
      const res = await api.patch(`/api/users/${user._id}`, updatePayload)

      showNotification({ message: 'Profile updated successfully!', variant: 'success' })
    } catch (err: any) {
      console.error('Update failed:', err)
      showNotification({ message: 'Failed to update profile. Please try again.', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }
  

  return (
    <div className="profile-page">
      <Card className="shadow-sm rounded-4 p-4 mt-4">
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="First Name" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Last Name" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Username</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Username" 
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Email Address" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled // Email usually isn't editable unless you allow it
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Phone Number" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Password (optional)</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="New Password (leave empty to keep current)"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" className="mt-4" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>

          {/* Plan Details Section */}
          <div className="mt-5">
            <h5 className="fw-bold mb-3">💳 Plan Details</h5>
            <div className="p-3 border rounded bg-light">
              <Row className="g-3">
                <Col md={6}>
                  <div>
                    <small className="text-muted">Plan</small>
                    <p className="fw-semibold mb-0">{user.plan ? user.plan.toUpperCase() : '-'}</p>
                  </div>
                </Col>

                <Col md={6}>
                  <div>
                    <small className="text-muted">Status</small>
                    <p className={`fw-semibold mb-0 ${subscriptionStatusColor}`}>
                      {user.subscriptionStatus || 'Not Subscribed'}
                    </p>
                  </div>
                </Col>

                <Col md={6}>
                  <div>
                    <small className="text-muted">Current Period Start</small>
                    <p className="fw-semibold mb-0">
                      {user.currentPeriodStart ? dayjs(user.currentPeriodStart).format('MMM D, YYYY') : '-'}
                    </p>
                  </div>
                </Col>

                <Col md={6}>
                  <div>
                    <small className="text-muted">Current Period End</small>
                    <p className="fw-semibold mb-0">
                      {user.currentPeriodEnd ? dayjs(user.currentPeriodEnd).format('MMM D, YYYY') : '-'}
                    </p>
                  </div>
                </Col>

                {user.trialEnd && (
                  <Col md={6}>
                    <div>
                      <small className="text-muted">Trial Ends</small>
                      <p className="fw-semibold mb-0">
                        {dayjs(user.trialEnd).format('MMM D, YYYY')}
                      </p>
                    </div>
                  </Col>
                )}
              </Row>
              <div className="text-center mt-4">
                <Button 
                  variant="success" 
                  size="lg" 
                  className="px-5 py-2 rounded-4 fw-bold"
                  onClick={() => router.push('/plans')} // or your upgrade page
                >
                  Upgrade My Plan 🚀
                </Button>
            </div>
            </div>
          </div>

        </Form>
      </Card>
    </div>
  )
}
