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

    const startingBalance = Number(formData.get('startingBalance'))
    const balanceType = formData.get('balanceType')

    // Normalize: company_owing = positive, client_owing = negative
    let finalBalance = startingBalance
    if (balanceType === 'client_owing') {
      finalBalance = -Math.abs(startingBalance)
    }


    try {
      const response = await api.post('/api/buyers', {
        user_id: user?._id,
        firstName,
        lastName,
        email,
        phone,
        balance: finalBalance,
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
                  required
                />
              </Col>
              {/* Replace the existing Balance Type column with this improved version */}
              <Col md={6}>
                <label className="form-label">Balance Type</label>
                <select 
                  name="balanceType" 
                  className="form-select" 
                  defaultValue="company_owing"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #ced4da',
                    borderRadius: '0.375rem',
                    padding: '0.375rem 2.25rem 0.375rem 0.75rem',
                    fontSize: '1rem',
                    fontWeight: '400',
                    lineHeight: '1.5',
                    color: '#495057',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '16px 12px',
                    appearance: 'none',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#86b7fe';
                    e.target.style.outline = '0';
                    e.target.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ced4da';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="company_owing">Company Owing (we owe client)</option>
                  <option value="client_owing">Client Owing (client owes us)</option>
                </select>
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
