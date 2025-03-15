'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { Metadata } from 'next'
import { Row, Col, Card, CardHeader, CardTitle, CardBody, Button } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'

//export const metadata: Metadata = { title: 'Edit User' }

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id // assuming your dynamic route segment is named [id]

  const [formData, setFormData] = useState({
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotificationContext()
  // Load user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get(`/api/users/${userId}`)
        const userData = response.data
        setFormData({
          password: '', // For security reasons, password is not pre-filled.
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
        })
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    if (userId) fetchUser()
  }, [userId])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.patch(`http://localhost:4000/api/users/${userId}`, formData)
      if (response.status === 200 || response.status === 204) {
        showNotification({ message:'User updated successfully', variant: 'success' })
        //alert('User updated successfully')
        router.back()
      }
    } catch (error: any) {
      console.error('Error updating user:', error)
      showNotification({ message: error?.response?.data?.error || error?.response?.data?.message || "Error updating user", variant: 'danger' })
     // alert(error?.response?.data?.message || 'Error updating user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Edit User</h4>

      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">
            Edit User
          </CardTitle>
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
                <label className="form-label">
                  First Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
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
                />
              </Col>
            </Row>

            {/* Email & Phone Number */}
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">
                  Email<span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
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
