'use client'

import { useEffect, useState } from 'react'
import { 
  Table, Button, Card, CardHeader, CardBody, CardTitle, Modal, 
  Form, Row, Col, Spinner, Badge, InputGroup
} from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export default function SampleHoldingPage() {
  const user = useAuthStore((state) => state.user)
  const { showNotification } = useNotificationContext()
  const [validationErrors, setValidationErrors] = useState([]);

  const [samples, setSamples] = useState([])
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null })
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSample, setNewSample] = useState({
    buyer_id: '',
    shippingCost: '', // Single shipping cost for all products
    products: [
      {
        name: '',
        qty: '',
        unit: 'pound',
        measurement: 1,
        price: '',
        category_id: ''
      }
    ]
  })

  let unitOptions = useAuthStore(state => state.settings?.units)
  const measurementOptions = [
    { label: 'Full', value: 1 },
    { label: 'Half', value: 0.5 },
    { label: 'Quarter', value: 0.25 }
  ]

  const [userCategories, setUserCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBuyer, setSelectedBuyer] = useState(null)

  const fetchSamples = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/sample?user_id=${user._id}`)
      setSamples(res.data)
    } catch (err) {
      showNotification({ message: 'Failed to load samples', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSamples()
  }, [user._id])

  useEffect(() => {
    async function fetchUserCategories() {
      try {
        const response = await api.get(`/api/categories/${user._id}`)
        setUserCategories(response.data)
      } catch (error) {
        showNotification({ message: error?.response?.data?.error || 'Error fetching categories', variant: 'danger' })
      }
    }
    fetchUserCategories()
  }, [user._id])

  useEffect(() => {
    async function fetchAccounts() {
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
    fetchAccounts()
  }, [user._id])

  const handleAccept = async (id) => {
    try {
      await api.post(`/api/sample/${id}/accept`)
      showNotification({ message: 'Sample moved to inventory', variant: 'success' })
      setSamples(samples.filter((s) => s._id !== id))
    } catch (err) {
      showNotification({ message: 'Failed to accept sample', variant: 'danger' })
    }
  }

  const handleReturn = async (id) => {
    try {
      await api.post(`/api/sample/${id}/return`)
      showNotification({ message: 'Sample returned to sender', variant: 'info' })
      setSamples(samples.filter((s) => s._id !== id))
    } catch (err) {
      showNotification({ message: 'Failed to return sample', variant: 'danger' })
    }
  }

  const handleProductChange = (index, field, value) => {
    const updated = [...newSample.products]
    updated[index][field] = value
    setNewSample({ ...newSample, products: updated })
  }

  const addProductRow = () => {
    setNewSample({
      ...newSample,
      products: [...newSample.products, {
        name: '',
        qty: '',
        unit: 'pound',
        measurement: 1,
        price: '',
        category_id: ''
      }]
    })
  }

  const removeProductRow = (index) => {
    const updated = [...newSample.products]
    updated.splice(index, 1)
    setNewSample({ ...newSample, products: updated })
  }

  // Calculate shipping cost per unit for each product
  const calculateShippingPerUnit = () => {
    const totalQuantity = newSample.products.reduce((sum, product) => {
      return sum + (Number(product.qty) || 0)
    }, 0)
    
    if (totalQuantity === 0 || !newSample.shippingCost) return 0
    
    return Number(newSample.shippingCost) / totalQuantity
  }

  const handleAddSample = async () => {
    const errors = []
  
    if (!newSample.buyer_id) {
      errors.push('Please select a buyer.')
    }

    // if (!newSample.shippingCost || Number(newSample.shippingCost) < 0) {
    //   errors.push('Shipping cost must be a valid number.')
    // }
  
    newSample.products.forEach((p, index) => {
      if (!p.name) errors.push(`Product ${index + 1}: Name is required.`)
      if (!p.qty || Number(p.qty) <= 0) errors.push(`Product ${index + 1}: Quantity must be a positive number.`)
      if (!p.unit) errors.push(`Product ${index + 1}: Unit is required.`)
      if (!p.price || Number(p.price) < 0) errors.push(`Product ${index + 1}: Price must be a valid number.`)
    })
  
    if (errors.length > 0) {
      showNotification({ message: 'Please input or select required fields before submitting.', variant: 'danger' })
      return
    }
  
    try {
      const shippingPerUnit = calculateShippingPerUnit().toFixed(2)
      
      const products = newSample.products.map(p => ({
        ...p,
        qty: Number(p.qty),
        price: Number(p.price).toFixed(2),
        shippingCost: Number(shippingPerUnit), // Calculated shipping per unit
        measurement: Number(p.measurement)
      }))
      
      const payload = {
        user_id: user._id,
        buyer_id: newSample.buyer_id,
        products,
        totalShippingCost: Number(newSample.shippingCost).toFixed(2), // Store total shipping cost
        status: 'holding'
      }
      
      await api.post('/api/sample', payload)
      showNotification({ message: 'Sample added to holding area', variant: 'success' })
      resetAndCloseModal()
      fetchSamples()
      setValidationErrors([])
    } catch (err) {
      showNotification({ message: 'Failed to add sample', variant: 'danger' })
    }
  }
  
  const [historyModal, setHistoryModal] = useState(false)
  const [historySamples, setHistorySamples] = useState([])

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/api/sample?user_id=${user._id}&status=history`)
      setHistorySamples(res.data)
      setHistoryModal(true)
    } catch (err) {
      showNotification({ message: 'Failed to load history', variant: 'danger' })
    }
  }

  const resetAndCloseModal = () => {
    setShowAddModal(false)
    setNewSample({
      buyer_id: '',
      shippingCost: '',
      products: [{ name: '', qty: '', unit: 'pound', price: '', measurement: 1, category_id: '' }]
    })
    setSelectedBuyer(null)
  }

  const handleBuyerSelect = (e) => {
    const buyerId = e.target.value
    setNewSample({ ...newSample, buyer_id: buyerId })
    const selected = accounts.find(acc => acc._id === buyerId)
    setSelectedBuyer(selected)
  }

  return (
    <div className="container-fluid py-4">
     <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Sample Holding Area</h4>
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center"
          >
            <i className="bi bi-plus-circle me-2"></i> Add Sample
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={fetchHistory}
            className="d-flex align-items-center"
          >
            <i className="bi bi-clock-history me-2"></i> History
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <CardTitle as="h5" className="mb-0">Samples Waiting for Approval</CardTitle>
            {loading && <Spinner animation="border" size="sm" />}
          </div>
        </CardHeader>
        <CardBody>
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Products</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {samples.length > 0 ? samples.map((sample) => (
                <tr key={sample._id}>
                  <td className="align-middle" style={{ width: "20%" }}>
                    <div className="d-flex flex-column">
                      <span className="fw-medium">{sample.buyer_id?.firstName ? `${sample.buyer_id?.firstName} ${sample.buyer_id?.lastName}` : 'Unknown Buyer'}</span>
                      <small className="text-muted">{sample.company_name || ''}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      {sample.products.map((product, i) => (
                        <div key={i} className="border-bottom pb-2 mb-2">
                          <div className="d-flex justify-content-between">
                            <div className="me-3">
                              <span className="fw-medium">{product.name}</span>
                              <div className="d-flex align-items-center mt-1">
                                <Badge bg="light" text="dark" className="me-2">
                                  {product.qty} {product.unit} 
                                  {product.measurement !== 1 && ` (${product.measurement * 100}%)`}
                                </Badge>
                                {product.category_name && 
                                  <Badge bg="secondary" className="bg-opacity-25 text-dark">
                                    {product.category_name}
                                  </Badge>
                                }
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="fw-medium">${Number((product.price) + product.shippingCost).toFixed(2)}</div>
                              {/* <small className="text-muted">+${Number(product.shippingCost || 0).toFixed(2)}/unit shipping</small> */}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-1 d-flex justify-content-between">
                        <small className="text-muted">{sample.products.length} product{sample.products.length !== 1 ? 's' : ''} total</small>
                        {/* {sample.totalShippingCost && (
                          <small className="text-muted">Total shipping: ${Number(sample.totalShippingCost).toFixed(2)}</small>
                        )} */}
                      </div>
                    </div>
                  </td>
                  <td className="text-end align-middle">
                    <Button variant="success" size="sm" className="me-2" onClick={() => handleAccept(sample._id)}>
                      <i className="bi bi-check2 me-1"></i> Accept
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => setConfirmModal({ show: true, id: sample._id })}>
                      <i className="bi bi-arrow-return-left me-1"></i> Return
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    <div className="text-muted">
                      <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                      <p className="mb-0">No samples in holding area</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Confirm Return Modal */}
      <Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, id: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Return</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="rounded-circle bg-light d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '70px', height: '70px' }}>
            <i className="bi bi-arrow-return-left text-danger fs-3"></i>
          </div>
          <h5>Return this Sample?</h5>
          <p className="text-muted">This action will notify the sender that you've returned their sample.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmModal({ show: false, id: null })}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => { 
              if (confirmModal.id) handleReturn(confirmModal.id); 
              setConfirmModal({ show: false, id: null }) 
            }}
          >
            Return Sample
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={historyModal} 
        onHide={() => setHistoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sample History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historySamples.length > 0 ? (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {historySamples.map(sample => (
                  <tr key={sample._id}>
                    <td>
                      <strong>{sample.buyer_id?.firstName ? `${sample.buyer_id?.firstName} ${sample.buyer_id?.lastName}` : 'Unknown Buyer'}</strong><br />
                      <small className="text-muted">{sample.company_name || ''}</small>
                    </td>
                    <td>
                      <Badge bg={sample.status === 'accepted' ? 'success' : 'danger'}>
                        {sample.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      {sample.products.map((p, i) => (
                        <div key={i} className="mb-1">
                          <span>{p.name}</span> – {p.qty} {p.unit} 
                          {p.measurement !== 1 && ` (${p.measurement * 100}%)`}<br />
                          <small className="text-muted">${p.price} + ${(p.shippingCost || 0).toFixed(2)}/unit shipping</small>
                        </div>
                      ))}
                      {sample.totalShippingCost && (
                        <div><small className="text-muted">Total shipping: ${sample.totalShippingCost}</small></div>
                      )}
                    </td>
                    <td>
                      <small>{new Date(sample.created_at).toLocaleDateString()}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-inbox fs-3 d-block mb-3"></i>
              <p>No history found yet.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setHistoryModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Sample Modal */}
      <Modal 
        show={showAddModal} 
        onHide={resetAndCloseModal}
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Sample</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Select 
                value={newSample.buyer_id} 
                onChange={handleBuyerSelect}
              >
                <option value="">-- Select Seller --</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.firstName} {acc.lastName} {acc.company ? `(${acc.company})` : ''}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          {/* Single Shipping Cost Input */}
          <div className="mb-4">
            <Card className="shadow-sm">
              <CardHeader className="bg-light py-2">
                <h6 className="mb-0">Shipping Information</h6>
              </CardHeader>
              <CardBody>
                <Form.Group>
                  <Form.Label>Total Shipping Cost</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control 
                      type="number" 
                      placeholder="0.00"
                      value={newSample.shippingCost} 
                      onChange={(e) => setNewSample({ ...newSample, shippingCost: e.target.value })} 
                    />
                  </InputGroup>
                  {newSample.shippingCost && newSample.products.some(p => p.qty) && (
                    <small className="text-muted">
                      Shipping per unit: ${calculateShippingPerUnit().toFixed(2)}
                    </small>
                  )}
                </Form.Group>
              </CardBody>
            </Card>
          </div>
          
          <div className="mb-3">
            <div className="d-flex align-items-center mb-3">
              <h5 className="mb-0 ms-2">Products</h5>
            </div>
            
            {newSample.products.map((product, index) => (
              <Card key={index} className="mb-3 shadow-sm">
                <CardHeader className="bg-light py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Product {index + 1}</h6>
                    {newSample.products.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => removeProductRow(index)}
                        className="btn-icon"
                      >
                         <IconifyIcon icon='tabler:x' />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <Row className="mb-3">
                    <Col xs={12}>
                      <Form.Label>Product Name</Form.Label>
                      <Form.Control 
                        placeholder="Enter product name"
                        value={product.name} 
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)} 
                      />
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Category</Form.Label>
                      <Form.Select 
                        value={product.category_id} 
                        onChange={(e) => handleProductChange(index, 'category_id', e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {userCategories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Measurement</Form.Label>
                      <Form.Select 
                        value={product.measurement} 
                        onChange={(e) => handleProductChange(index, 'measurement', (e.target.value))}
                      >
                        {measurementOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Quantity</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="number" 
                          placeholder="0"
                          value={product.qty} 
                          onChange={(e) => handleProductChange(index, 'qty', e.target.value)} 
                        />
                        <Form.Select 
                          value={product.unit} 
                          onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                        >
                          {/* <option value="">Unit</option> */}
                          {unitOptions.map((unit) => (
                            <option key={unit}>{unit}</option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Price</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control 
                          type="number" 
                          placeholder="0"
                          value={product.price} 
                          onChange={(e) => handleProductChange(index, 'price', e.target.value)} 
                        />
                      </InputGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
            
            <div className="mb-3">
              <Button 
                onClick={addProductRow} 
                variant="outline-primary"
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-circle me-2"></i> Add Another Product
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetAndCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleAddSample}
            disabled={!newSample.buyer_id}
          >
            <i className="bi bi-check2 me-1"></i> Add to Holding
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}