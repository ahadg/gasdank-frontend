'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Card, CardHeader, CardBody, CardTitle, Modal, Form, Row, Col, Spinner } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'

export default function SampleHoldingPage() {
  const user = useAuthStore((state) => state.user)
  const { showNotification } = useNotificationContext()
  const [samples, setSamples] = useState<any[]>([])
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, id: string | null }>({ show: false, id: null })
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSample, setNewSample] = useState({
    name: '',
    qty: '',
    unit: '',
    measurement: 1,
    price: '',
    shippingCost: '',
    category_id: '',
    buyer_id: ''
  })
  const unitOptions = ['kg', 'pound', 'per piece', 'gram']
  const [userCategories, setUserCategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const fetchSamples = async () => {
    try {
      const res = await api.get(`/api/sample?user_id=${user._id}`)
      setSamples(res.data)
    } catch (err: any) {
      showNotification({ message: 'Failed to load samples', variant: 'danger' })
    }
  }
  useEffect(() => {
    fetchSamples()
  }, [user._id, 
   // showNotification
  ])

  const measurementOptions = [
    { label: 'Full', value: 1 },
    { label: 'Half', value: 0.5 },
    { label: 'Quarter', value: 0.25 },
  ]


  useEffect(() => {
    async function fetchUserCategories() {
      if (user?._id) {
        try {
          const response = await api.get(`/api/categories/${user._id}`)
          setUserCategories(response.data)
        } catch (error) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching categories', variant: 'danger' })
        }
      }
    }
    fetchUserCategories()
  }, [user?._id, 
  //  showNotification
  ])

  useEffect(() => {
    async function fetchAccounts() {
      if (user?._id) {
        setLoading(true)
        try {
          const response = await api.get(`/api/buyers?user_id=${user._id}`)
          setAccounts(response.data)
        } catch (error) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching accounts', variant: 'danger' })
        } finally {
          setLoading(false)
        }
      }
    }
    fetchAccounts()
  }, [user?._id])

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/api/sample/${id}/accept`)
      showNotification({ message: 'Sample moved to inventory', variant: 'success' })
      setSamples(samples.filter((s) => s._id !== id))
    } catch (err) {
      showNotification({ message: 'Failed to accept sample', variant: 'danger' })
    }
  }

  const handleReturn = async (id: string) => {
    try {
      await api.post(`/api/sample/${id}/return`)
      showNotification({ message: 'Sample returned to sender', variant: 'info' })
      setSamples(samples.filter((s) => s._id !== id))
    } catch (err) {
      showNotification({ message: 'Failed to return sample', variant: 'danger' })
    }
  }

  const handleAddSample = async () => {
    try {
      const avgShipping = Number(newSample.qty) > 0 ? Number(newSample?.shippingCost) / Number(newSample.qty) : 0

      const payload = {
        ...newSample,
        qty: Number(newSample.qty),
        measurement: Number(newSample.measurement),
        user_id: user._id,
        price : Number(newSample?.price),
        shippingCost : avgShipping.toFixed(2),
        status: 'holding'
      }
      console.log("payload",payload)
      await api.post('/api/sample', payload)
      showNotification({ message: 'Sample added to holding area', variant: 'success' })
      setShowAddModal(false)
      setNewSample({ name: '', qty: '', unit: '',shippingCost : '', price : '', measurement: 1, category_id: '', buyer_id: '' })
      fetchSamples()
    } catch (err) {
      showNotification({ message: 'Failed to add sample', variant: 'danger' })
    }
  }

  return (
    <div className="container-fluid">
      <h4 className="mb-4"></h4>
      <div className="mb-3 text-end">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Add Sample</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle as="h5">Samples Waiting for Approval</CardTitle>
        </CardHeader>
        <CardBody>
          <Table bordered responsive>
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Measurement</th>
                <th>Price</th>
                <th>Shipping Cost</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {samples.length > 0 ? samples.map((sample) => (
                <tr key={sample._id}>
                  <td>{sample.name}</td>
                  <td>{sample.qty}</td>
                  <td>{sample.unit}</td>
                  <td>{sample.measurement}</td>
                  <td>{sample.price}</td>
                  <td>{sample.shippingCost}</td>
                  <td>
                    <Button variant="success" className="me-2" onClick={() => handleAccept(sample._id)}>
                      Accept
                    </Button>
                    <Button variant="outline-danger" onClick={() => setConfirmModal({ show: true, id: sample._id })}>
                      Return
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center text-muted">No samples in holding area</td></tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Return Confirmation Modal */}
      <Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, id: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to return this sample? A message will be sent to the sender.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmModal({ show: false, id: null })}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (confirmModal.id) handleReturn(confirmModal.id); setConfirmModal({ show: false, id: null }) }}>Return Sample</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Sample Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Sample</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={newSample.name} onChange={(e) => setNewSample({ ...newSample, name: e.target.value })} />
            </Form.Group>
            {/* <Form.Group className="mb-3">
              <Form.Label>Sender Phone</Form.Label>
              <Form.Control value={newSample.sender_phone} onChange={(e) => setNewSample({ ...newSample, sender_phone: e.target.value })} />
            </Form.Group> */}
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control type="number" value={newSample.qty} onChange={(e) => setNewSample({ ...newSample, qty: e.target.value })} />
                </Form.Group>
              </Col>
              <Col>
              <Form.Group className="mb-3">
                <Form.Label>Unit</Form.Label>
                    <Form.Select
                    value={newSample.unit}
                    onChange={(e) => setNewSample({ 
                      ...newSample, 
                      unit: e.target.value
                    })}
                    >
                      <option value="">Select unit</option>
                      {unitOptions.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </Form.Select>
              </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control type="number" value={newSample.price} onChange={(e) => setNewSample({ ...newSample, price: e.target.value })} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Shipping Cost</Form.Label>
                  <Form.Control type="number" value={newSample.shippingCost} onChange={(e) => setNewSample({ ...newSample, shippingCost: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Measurement</Form.Label>
              <Form.Select
                value={newSample.measurement}
                onChange={(e) => setNewSample({ 
                  ...newSample, 
                  measurement: parseFloat(e.target.value) 
                })}
              >
                <option value="">Select measurement</option>
                {measurementOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select value={newSample.category_id} onChange={(e) => setNewSample({ ...newSample, category_id: e.target.value })}>
                <option value="">Select Category</option>
                {userCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Buyer</Form.Label>
              <Form.Select value={newSample.buyer_id} onChange={(e) => setNewSample({ ...newSample, buyer_id: e.target.value })}>
                <option value="">Select Buyer</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>{acc.firstName} {acc.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddSample}>Add Sample</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}