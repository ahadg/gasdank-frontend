'use client'
import { FC, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Row, Col, Button, Form } from 'react-bootstrap'
import api from '@/utils/axiosInstance'

interface Buyer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

const AccountEdit: FC = () => {
  const router = useRouter()
  const { id } = useParams()  // Assumes route parameter is named "id"
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  // Fetch buyer details on mount
  useEffect(() => {
    async function fetchBuyer() {
      if (!id) return
      setLoading(true)
      try {
        const response = await api.get(`/api/buyers/${id}`)
        const data = response.data
        console.log("data",data)
        setBuyer(data)
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        })
      } catch (error) {
        console.error('Error fetching buyer details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBuyer()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    try {
      const response = await api.put(`/api/buyers/${id}`, formData)
      console.log('Buyer updated:', response.data)
      router.back()
    } catch (error: any) {
      console.error('Error updating buyer:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !buyer) return <p>Loading...</p>

  return (
    <div>
      <h5 className="mb-3">Edit Profile</h5>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <div>
          <Button variant="secondary" className="me-2" type="button" onClick={() => router.back()}>
            CANCEL
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'UPDATE'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default AccountEdit
