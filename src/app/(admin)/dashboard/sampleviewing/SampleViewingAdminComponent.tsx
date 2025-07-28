import React, { useState, useEffect } from 'react'
import { Button, Card, Table, Form, Row, Col, Modal, Spinner, Badge } from 'react-bootstrap'
import axios from 'axios' // Make sure axios is installed
import api from '@/utils/axiosInstance'

// Replace with your actual API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const SampleViewingAdminComponent = ({ currentUserId }) => {
    const [showModal, setShowModal] = useState(false)
  const [users, setUsers] = useState([])
  const [samples, setSamples] = useState([])
  const [filteredSamples, setFilteredSamples] = useState([])
  const [loading, setLoading] = useState(false)
  const [allSamplesLoaded, setAllSamplesLoaded] = useState(false) // Track if all samples are loaded
  const [filters, setFilters] = useState({
    userId: '',
    status: 'pending', // Default to pending
    dateFrom: '',
    dateTo: '',
    buyerName: ''
  })

  // Fetch users data (you'll need to implement this endpoint)
  const fetchUsers = async () => {
    try {
      const workerRes = await api.get('/api/users')
      return workerRes.data
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  // Fetch samples data using your route
  const fetchSamples = async (status = null) => {
    try {
      const params = {
        user_created_by: currentUserId
      }
      
      if (status) {
        params["status"] = status
      }

      const response = await api.get(`/api/sampleviewingclient`, { params })
      return response.data || []
    } catch (error) {
      console.error('Error fetching samples:', error)
      return []
    }
  }

  // Fetch data based on current filter status
  const fetchDataByStatus = async (status) => {
    if (!currentUserId) {
      console.error('No currentUserId provided')
      return
    }

    setLoading(true)
    try {
      let samplesData
      
      if (status === '' || !status) {
        // If no status filter, fetch all samples
        samplesData = await fetchSamples()
        setAllSamplesLoaded(true)
      } else {
        // Fetch samples with specific status
        samplesData = await fetchSamples(status)
        setAllSamplesLoaded(status === '')
      }
      
      setSamples(samplesData)
      return samplesData
    } catch (error) {
      console.error('Error fetching samples:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch when modal opens
  const fetchInitialData = async () => {
    if (!currentUserId) {
      console.error('No currentUserId provided')
      return
    }

    setLoading(true)
    try {
      // Fetch users
      const usersData = await fetchUsers()
      setUsers(usersData)

      // Fetch samples based on default status (pending)
      const samplesData = await fetchSamples('pending')
      setSamples(samplesData)
      setAllSamplesLoaded(false) // Only pending samples loaded initially

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load data when modal opens
  useEffect(() => {
    if (showModal) {
      fetchInitialData()
    }
  }, [showModal, currentUserId])

  // Apply filters and fetch data when status changes
  useEffect(() => {
    if (!showModal) return

    // Check if we need to fetch new data based on status filter
    const needsNewData = () => {
      if (!filters.status) {
        // No status filter - need all samples
        return !allSamplesLoaded
      }
      
      if (filters.status === 'pending') {
        // Need pending samples - check if we have any non-pending samples (means we have all data)
        return samples.length > 0 && samples.some(s => s.status !== 'pending') ? false : !samples.length
      }
      
      // Need specific status that's not pending
      // If we only have pending samples, we need to fetch all or specific status
      return samples.length === 0 || (samples.length > 0 && samples.every(s => s.status === 'pending'))
    }

    if (needsNewData()) {
      fetchDataByStatus(filters.status).then((newSamples) => {
        if (newSamples) {
          // Apply other filters after fetching
          applyFilters(newSamples)
        }
      })
    } else {
      // Apply filters to existing data
      applyFilters(samples)
    }
  }, [filters.status, showModal])

  // Apply non-status filters
  useEffect(() => {
    if (showModal) {
      applyFilters(samples)
    }
  }, [filters.userId, filters.buyerName, filters.dateFrom, filters.dateTo, samples])

  const applyFilters = (samplesToFilter) => {
    let filtered = [...samplesToFilter]

    if (filters.userId) {
      filtered = filtered.filter(sample => sample.user_id === filters.userId)
    }

    if (filters.status) {
      filtered = filtered.filter(sample => sample.status === filters.status)
    }

    if (filters.buyerName) {
      filtered = filtered.filter(sample => {
        const buyerName = sample.buyer_id?.name || 
          `${sample.buyer_id?.firstName || ''} ${sample.buyer_id?.lastName || ''}`.trim()
        return buyerName.toLowerCase().includes(filters.buyerName.toLowerCase())
      })
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(sample => 
        new Date(sample.sentAt) >= new Date(filters.dateFrom)
      )
    }

    if (filters.dateTo) {
      filtered = filtered.filter(sample => 
        new Date(sample.sentAt) <= new Date(filters.dateTo)
      )
    }

    setFilteredSamples(filtered)
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger'
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  const calculateSampleTotal = (items) => {
    return items.reduce((total, item) => 
      total + ((item.sale_price || 0) * (item.qty || 0)), 0
    ).toFixed(2)
  }

  const calculateSampleProfit = (items) => {
    return items.reduce((totalProfit, item) => {
      const basePrice = (item.price || 0) + (item.shippingCost || 0)
      const salePrice = item.sale_price || 0
      const profit = (salePrice - basePrice) * (item.qty || 0)
      return totalProfit + profit
    }, 0).toFixed(2)
  }

  // Reset filters and data when modal closes
  const handleModalClose = () => {
    setShowModal(false)
    setFilters({
      userId: '',
      status: 'pending', // Reset to pending
      dateFrom: '',
      dateTo: '',
      buyerName: ''
    })
    setSamples([])
    setFilteredSamples([])
    setAllSamplesLoaded(false)
  }

  // Don't render if no currentUserId
  if (!currentUserId) {
    return (
      <Button variant="outline-secondary" disabled>
        <i className="fas fa-users-cog me-2"></i>
        Admin Access Unavailable
      </Button>
    )
  }
  return (
    <>
      <Button
        variant="outline-info"
        className="mb-3 ms-2 mr-5"
        onClick={() => setShowModal(true)}
      >
        <i className="fas fa-users-cog me-2"></i>
        Admin: View All Assignments
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-clipboard-list me-2"></i>
            Sample Assignments Dashboard
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {/* Filters Section */}
          <Card className="mb-4">
            {/* <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="fas fa-filter me-2"></i>
                Filters & Export
              </h6>
            </Card.Header> */}
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Assigned User</Form.Label>
                    <Form.Select
                      value={filters.userId}
                      onChange={e => handleFilterChange('userId', e.target.value)}
                    >
                      <option value="">All Users</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={e => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Buyer Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search buyer name..."
                      value={filters.buyerName}
                      onChange={e => handleFilterChange('buyerName', e.target.value)}
                    />
                  </Form.Group>
                </Col>

                {/* <Col md={2}>
                  <Form.Group>
                    <Form.Label>Date From</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateFrom}
                      onChange={e => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Date To</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateTo}
                      onChange={e => handleFilterChange('dateTo', e.target.value)}
                    />
                  </Form.Group>
                </Col> */}
              </Row>

              {/* <Row className="mt-3">
                <Col>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={clearFilters}
                    className="me-2"
                  >
                    <i className="fas fa-times me-1"></i>
                    Clear Filters
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={exportToCSV}
                    disabled={filteredSamples.length === 0}
                  >
                    <i className="fas fa-download me-1"></i>
                    Export CSV ({filteredSamples.length} records)
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={loadAllSamples}
                    className="ms-2"
                    disabled={loading}
                  >
                    <i className="fas fa-list me-1"></i>
                    Load All Samples
                  </Button>
                </Col>
              </Row> */}
            </Card.Body>
          </Card>

          {/* Results Summary */}
          {/* <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">
              Showing {filteredSamples.length} of {samples.length} assignments
              {samples.length > 0 && samples.every(s => s.status === 'pending') && (
                <small className="text-muted ms-2">(Pending only - use "Load All" for other statuses)</small>
              )}
            </h6>
            {loading && <Spinner animation="border" size="sm" />}
          </div> */}

          {/* Sample Assignments Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading sample assignments...</p>
            </div>
          ) : filteredSamples.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-inbox fa-3x mb-3"></i>
              <p>No sample assignments found with current filters.</p>
              {samples.length === 0 && (
                <p className="small">Try clicking "Load All Samples" to see all statuses.</p>
              )}
            </div>
          ) : (
            <Table responsive bordered hover className="small">
              <thead className="table-dark">
                <tr>
                  <th>Sample ID</th>
                  <th>Buyer</th>
                  <th>Assigned To</th>
                  <th>Items</th>
                  <th>Total Value</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th>Date Sent</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredSamples.map(sample => {
                  const assignedUser = users.find(u => u._id === sample.user_id)
                  const buyerName = sample.buyer_id?.name || 
                    `${sample.buyer_id?.firstName || ''} ${sample.buyer_id?.lastName || ''}`.trim()

                  return (
                    <tr key={sample._id}>
                      <td>
                        <code className="small">{sample._id.slice(-8)}</code>
                      </td>
                      <td>
                        <strong>{buyerName || 'Unknown Buyer'}</strong>
                      </td>
                      <td>
                        {assignedUser ? (
                          <div>
                            <strong>{assignedUser.firstName} {assignedUser.lastName}</strong>
                            <br />
                            <small className="text-muted">{assignedUser.email}</small>
                          </div>
                        ) : (
                          <span className="text-muted">Unknown User</span>
                        )}
                      </td>
                      <td>
                        <div className="small">
                          {sample.items && sample.items.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              <strong>{item.name}</strong> ({item.qty} {item.unit})
                              <br />
                              <span className="text-muted">
                                ${item.price} → ${item.sale_price}
                              </span>
                            </div>
                          ))}
                          <Badge bg="info" className="mt-1">
                            {sample.items?.length || 0} item{(sample.items?.length || 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <strong className="text-primary">
                          ${calculateSampleTotal(sample.items || [])}
                        </strong>
                      </td>
                      <td>
                        <strong className="text-success">
                          ${calculateSampleProfit(sample.items || [])}
                        </strong>
                      </td>
                      <td>
                        {getStatusBadge(sample.status)}
                      </td>
                      <td>
                        <div className="small">
                          {new Date(sample.sentAt).toLocaleDateString()}
                          <br />
                          <span className="text-muted">
                            {new Date(sample.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="small" style={{ maxWidth: '150px' }}>
                          {sample.notes ? (
                            <span title={sample.notes}>
                              {sample.notes.length > 50 
                                ? `${sample.notes.substring(0, 50)}...` 
                                : sample.notes
                              }
                            </span>
                          ) : (
                            <span className="text-muted">No notes</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}

          {/* Summary Statistics */}
          {/* {filteredSamples.length > 0 && (
            <Card className="mt-4 bg-light">
              <Card.Body>
                <Row className="text-center">
                  <Col md={3}>
                    <h5 className="text-primary mb-0">
                      {filteredSamples.length}
                    </h5>
                    <small className="text-muted">Total Assignments</small>
                  </Col>
                  <Col md={3}>
                    <h5 className="text-warning mb-0">
                      {filteredSamples.filter(s => s.status === 'pending').length}
                    </h5>
                    <small className="text-muted">Pending</small>
                  </Col>
                  <Col md={3}>
                    <h5 className="text-success mb-0">
                      {filteredSamples.filter(s => s.status === 'accepted').length}
                    </h5>
                    <small className="text-muted">Accepted</small>
                  </Col>
                  <Col md={3}>
                    <h5 className="text-danger mb-0">
                      {filteredSamples.filter(s => s.status === 'rejected').length}
                    </h5>
                    <small className="text-muted">Rejected</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )} */}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {/* <Button 
            variant="primary" 
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Refresh Data'}
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SampleViewingAdminComponent