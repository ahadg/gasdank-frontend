'use client'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useState } from 'react'
import { Row, Col, Card, CardHeader, CardTitle, CardBody, Button } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'

export default function EditUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotificationContext()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const email = formData.get('email')
    const phone = formData.get('phone')

    try {
      const response = await api.post('/api/users', {
        password,
        firstName,
        lastName,
        email,
        phone,
        role : "user"
      })

      if (response.status === 200 || response.status === 201) {
        //alert('User added successfully')
        showNotification({ message: 'User added successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error(error)
      //alert(error?.response?.data?.message || 'Error adding user')
      showNotification({ message: error?.response?.data?.error || 'Login failed', variant: 'danger' })
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
                  defaultValue=""
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  placeholder=""
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
                  defaultValue=""
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder=""
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
                  defaultValue=""
                />
              </Col>
            </Row>

            {/* Buttons */}
            <div className="mt-4">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'CREATE'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
