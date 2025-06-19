'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthStore } from '@/store/authStore'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Modal from 'react-bootstrap/Modal'

export default function SampleViewingToolPage() {
  const { showNotification } = useNotificationContext()
  const [products, setProducts] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [buyerId, setBuyerId] = useState('')
  const [workerId, setWorkerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historySessions, setHistorySessions] = useState<any[]>([])

  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, workerRes] = await Promise.all([
          api.get(`/api/inventory/${user?._id}`),
          api.get('/api/users'),
        ])
        setProducts(productRes.data.products || [])
        setWorkers(workerRes.data || [])
      } catch (err: any) {
        console.log("error", err)
        showNotification({ message: 'Failed to load data.', variant: 'danger' })
      }
    }

    const fetchAccounts = async () => {
      try {
        const response = await api.get(`/api/buyers?user_id=${user._id}`)
        setAccounts(response.data)
      } catch (error: any) {
        showNotification({
          message: error?.response?.data?.error || 'Error fetching accounts',
          variant: 'danger'
        })
      }
    }

    fetchData()
    fetchAccounts()
  }, [user._id])

  const handleAddItem = (product: any) => {
    if (!selectedItems.find(item => item._id === product._id)) {
      setSelectedItems([...selectedItems, { ...product, price: '', qty: 1 }])
    }
  }

  const handleUpdateItem = (index: number, field: string, value: string | number) => {
    const updated = [...selectedItems]
    updated[index][field] = value
    setSelectedItems(updated)
  }

  const handleRemoveItem = (index: number) => {
    const updated = [...selectedItems]
    updated.splice(index, 1)
    setSelectedItems(updated)
  }

  const handleSubmit = async () => {
    if (!buyerId || !workerId || selectedItems.length === 0) {
      showNotification({ message: 'Please fill all fields.', variant: 'danger' })
      return
    }

    try {
      setLoading(true)
      const payload = {
        id : user?._id,
        buyer_id: buyerId,
        user_id: workerId,
        items: selectedItems.map(item => ({
          productId: item._id,
          name: item.name,
          unit: item.unit,
          qty: item.qty,
          price: item.price,
        })),
      }
      console.log("payload", payload)
      await api.post('/api/sampleviewingclient', payload)

      showNotification({ message: 'Sample viewing session created.', variant: 'success' })
      setBuyerId('')
      setWorkerId('')
      setSelectedItems([])
    } catch (err: any) {
      console.error('Error submitting session:', err)
      showNotification({ message: 'Failed to submit sample session.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="mb-3 text-end">
        <Button
          className="mb-3 text-end"
          variant="outline-primary"
          onClick={async () => {
            try {
              setShowHistory(true)
              const res = await api.get(`/api/sampleviewingclient?user_created_by=${user?._id}`)
              console.log("setHistorySessions",res)
              setHistorySessions(res.data || [])
            } catch {
              showNotification({ message: 'Failed to fetch history.', variant: 'danger' })
            }
          }}
        >
          <IconifyIcon icon='tabler:x' /> View History
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Select Buyer</Form.Label>
            <Form.Select value={buyerId} onChange={e => setBuyerId(e.target.value)}>
              <option value="">Select a buyer</option>
              {accounts.map((buyer: any) => (
                <option key={buyer._id} value={buyer._id}>
                  {buyer.name || `${buyer.firstName} ${buyer.lastName}`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Select Worker</Form.Label>
            <Form.Select value={workerId} onChange={e => setWorkerId(e.target.value)}>
              <option value="">Select a worker</option>
              {workers.map(worker => (
                <option key={worker._id} value={worker._id}>
                  {worker.firstName} {worker.lastName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h5>Available Products</h5>
          <div className="d-flex flex-wrap gap-3">
            {products.map(product => (
              <Button
                key={product._id}
                variant="outline-secondary"
                onClick={() => handleAddItem(product)}
              >
                {product.name}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      {selectedItems.length > 0 && (
        <Card className="shadow-sm rounded-4 mb-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">Selected Items</h5>
            <Table responsive bordered>
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, index) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>
                      <Form.Control
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={e => handleUpdateItem(index, 'qty', Number(e.target.value))}
                      />
                    </td>
                    <td>{item.unit}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={item.price}
                        onChange={e => handleUpdateItem(index, 'price', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <div className="d-grid">
        <Button onClick={handleSubmit} disabled={loading || selectedItems.length === 0}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Send Sample List'}
        </Button>
      </div>

      <Modal show={showHistory} onHide={() => setShowHistory(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sample Viewing History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historySessions.length === 0 ? (
            <p className="text-muted">No sample sessions yet.</p>
          ) : (
            <Table bordered responsive className="small">
              <thead className="table-light">
                <tr>
                  <th>Buyer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historySessions.map((session: any) => (
                  <tr key={session._id}>
                    <td>{session.buyer_id?.firstName || session.buyer_id?.firstName || 'N/A'}</td>
                    <td>{new Date(session.sentAt).toLocaleString()}</td>
                    <td>
                      {session.items.map((item: any) => (
                        <div key={item.productId} className="d-flex justify-content-between">
                          <span>{item.name} ({item.qty})</span>
                          <span className={`text-${item.status === 'accepted' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="text-capitalize">{session.viewingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
