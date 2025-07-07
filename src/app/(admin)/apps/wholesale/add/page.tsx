'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Row, Col, Card, CardHeader, CardTitle, CardBody, Button } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

export default function AddWholePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user)
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const email = formData.get('email')
    const phone = formData.get('phone')
    const startingBalance = formData.get('startingBalance')

    try {
      const response = await api.post('/api/buyers', {
        user_id: user?._id,
        firstName,
        lastName,
        email,
        phone,
        balance: Number(startingBalance),
        //currentBalance : Number(startingBalance),
      })

      if (response.status === 200 || response.status === 201) {
        showNotification({ message: 'Wholesale user added successfully', variant: 'success' })
        router.back()
      }
    } catch (error: any) {
      console.error(error)
      showNotification({ message: error?.response?.data?.error || 'Error adding wholesale user', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Add Wholesale User Account</h4>
      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0">
            Add Wholesale User Account
          </CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
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
                  required
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  defaultValue=""
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
                  // required
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  defaultValue=""
                />
              </Col>
            </Row>

            {/* Starting Balance */}
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">
                  Starting Balance<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="startingBalance"
                  className="form-control"
                  defaultValue="0"
                  // required
                />
              </Col>
            </Row>

            {/* Buttons */}
            <div className="mt-4">
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
