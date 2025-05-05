'use client'
import { useState, useEffect } from 'react'
import PageTitle from "@/components/PageTitle"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import { 
  Card, CardHeader, CardFooter, CardTitle, Row, Col, Button, Form,
  Modal, Table
} from "react-bootstrap"
import Link from 'next/link'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthStore } from '@/store/authStore'

export default function UsersPage() {
  // State to hold users loaded from API and search text
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [roleFilter, setRoleFilter] = useState('all')
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [creatorInfo, setCreatorInfo] = useState(null)
  const { showNotification } = useNotificationContext()
  const currentUser = useAuthStore((state) => state.user)
  // Check if current user is superadmin or admin
  const isSuperAdmin = currentUser?.role === 'superadmin'
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin
  // Load users from API on component mount
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        // If superadmin, get all users. Otherwise, get only visible users
        const endpoint = '/api/users'
        const response = await api.get(endpoint)
        // Assuming the API returns an array of users
        setUsers(response.data)
      } catch (error) {
        showNotification({ message: error?.response?.data?.error || 'Error fetching user list', variant: 'danger' })
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [isSuperAdmin])

  // Handle search input changes
  const handleSearchChange = (event) => {
    setSearch(event.target.value)
  }

  // Handle role filter changes
  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value)
  }

  const searchLower = search.toLowerCase()

  // Filter users by firstName, lastName, email, and role if superadmin
  const filteredUsers = users.filter((user) => {
    const matchesSearch = (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    )
    
    // Apply role filter if it's not set to 'all'
    if (roleFilter !== 'all') {
      return matchesSearch && user.role === roleFilter
    }
    
    return matchesSearch
  })

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Handle opening the user info modal
  const handleViewUserInfo = async (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
    
    // If the user has a creator, fetch the creator's info
    if (user.created_by) {
      try {
        const response = await api.get(`/api/users/${user.created_by}`)
        setCreatorInfo(response.data)
      } catch (error) {
        console.error("Error fetching creator info:", error)
        setCreatorInfo(null)
      }
    } else {
      setCreatorInfo(null)
    }
  }
  
  // Handle closing the user info modal
  const handleCloseUserModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    setCreatorInfo(null)
  }

  return (
    <>
      {/* Page Title */}
      <PageTitle title="Users" subTitle="Accounts" />

      <Row>
        <Col xs={12}>
          <Card>
            {/* Header with Title and ADD NEW Button */}
            <CardHeader className="d-flex align-items-center justify-content-between border-bottom border-light">
              <CardTitle as="h4" className="mb-0">
                Users
              </CardTitle>
              {isAdmin && (
                <Link href={"/config/users/add"}>
                  <Button variant="success" className="bg-gradient">
                    <IconifyIcon icon="tabler:plus" className="me-1" />
                    ADD NEW
                  </Button>
                </Link>
              )}
            </CardHeader>

            {/* Search and Filter Bar */}
            <div className="px-3 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex gap-2 flex-wrap">
                {/* Search Input */}
                <div className="input-group" style={{ maxWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search"
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>
                
              </div>
              {/* Role Filter (Only for SuperAdmin) */}
              {isSuperAdmin && (
              <Form.Select 
                value={roleFilter} 
                onChange={handleRoleFilterChange}
                style={{ maxWidth: '150px' }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </Form.Select>
            )}
              {/* Export button could go here */}
              {/* {isSuperAdmin && (
                <Button variant="outline-primary" size="sm">
                  <IconifyIcon icon="tabler:download" className="me-1" />
                  Export
                </Button>
              )} */}
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-nowrap mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>FIRSTNAME</th>
                    <th>LASTNAME</th>
                    <th>EMAIL</th>
                    <th>PHONE NUMBER</th>
                    {/* Show role column for superadmin */}
                    {isSuperAdmin && <th>ROLE</th>}
                    {/* Show subscription columns for admin users */}
                    {isAdmin && users.some(user => user.role === 'admin') && (
                      <>
                        <th>SUBSCRIPTION</th>
                        <th>NEXT PAYMENT</th>
                      </>
                    )}
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 7 : 5} className="text-center">Loading...</td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={index}>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        {/* Show role for superadmin */}
                        {isSuperAdmin && (
                          <td>
                            <span className={`badge bg-${user.role === 'admin' ? 'success' : 'info'}-subtle text-${user.role === 'admin' ? 'success' : 'info'}`}>
                              {user.role}
                            </span>
                          </td>
                        )}
                        {/* Show subscription status and next payment date for admin users */}
                        {isAdmin && user.role === 'admin' && (
                          <>
                            <td>
                              {user.subscriptionStatus ? (
                                <span className={`badge bg-${user?.subscriptionStatus  ? 'success' : 'warning'}-subtle text-${user.subscriptionStatus ? 'success' : 'warning'}`}>
                                  {user.subscriptionStatus}
                                </span>
                              ) : 'Not active'}
                            </td>
                            <td>{user.currentPeriodEnd ? formatDate(user.currentPeriodEnd) : "Not active"}</td>
                          </>
                        )}
                        {/* If showing admin users and current user isn't admin, add empty cells */}
                        {isAdmin && user.role !== 'admin' && (
                          <>
                            {users.some(u => u.role === 'admin') && (
                              <>
                                <td>-</td>
                                <td>-</td>
                              </>
                            )}
                          </>
                        )}
                        <td>
                          {/* Edit button - visible to all admins */}
                          {isAdmin && (
                            <Link href={`/config/users/edit/${user._id}`}>
                              <Button
                                variant="soft-success"
                                size="sm"
                                className="btn-icon rounded-circle me-1"
                              >
                                <IconifyIcon icon="tabler:edit" />
                              </Button>
                            </Link>
                          )}
                          
                          {/* Info button - visible to all */}
                          <Button
                            variant="soft-info"
                            size="sm"
                            className="btn-icon rounded-circle me-1"
                            onClick={() => handleViewUserInfo(user)}
                          >
                            <IconifyIcon icon="tabler:info-circle" />
                          </Button>
                          
                          {/* Delete button - only visible to superadmin or if an admin is deleting a non-admin */}
                          {(isSuperAdmin || (isAdmin && user.role !== 'admin')) && (
                            <Button
                              variant="soft-danger"
                              size="sm"
                              className="btn-icon rounded-circle"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <IconifyIcon icon="tabler:trash" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isSuperAdmin ? 7 : 5} className="text-center">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with pagination info */}
            <CardFooter>
              <div className="d-flex justify-content-between">
                <div>
                  Showing {filteredUsers.length} of {users.length} entries
                </div>
                {/* Place a pagination component here if needed */}
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
      
      {/* User Info Modal */}
      <Modal
        show={showUserModal}
        onHide={handleCloseUserModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            User Information
            {selectedUser && (
              <span className="ms-2">
                <span className={`badge bg-${selectedUser.role === 'admin' ? 'success' : selectedUser.role === 'superadmin' ? 'primary' : 'info'}-subtle text-${selectedUser.role === 'admin' ? 'success' : selectedUser.role === 'superadmin' ? 'primary' : 'info'}`}>
                  {selectedUser.role}
                </span>
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser ? (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h5 className="border-bottom pb-2">Personal Information</h5>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td className="fw-bold">Full Name:</td>
                        <td>{selectedUser.firstName} {selectedUser.lastName}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Username:</td>
                        <td>{selectedUser.userName}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Email:</td>
                        <td>{selectedUser.email}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Phone:</td>
                        <td>{selectedUser.phone || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Role:</td>
                        <td className="text-capitalize">{selectedUser.role}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Created:</td>
                        <td>{formatDate(selectedUser.created_at)}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Last Updated:</td>
                        <td>{formatDate(selectedUser.updated_at)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                
                <Col md={6}>
                  <h5 className="border-bottom pb-2">Financial Information</h5>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td className="fw-bold">Balance:</td>
                        <td>${selectedUser.balance?.toFixed(2) || '0.00'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Cash Balance:</td>
                        <td>${selectedUser.cash_balance?.toFixed(2) || '0.00'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Inventory Value:</td>
                        <td>${selectedUser.inventory_value?.toFixed(2) || '0.00'}</td>
                      </tr>
                    </tbody>
                  </Table>
                  
                  {Object.keys(selectedUser.other_balance || {}).length > 0 && (
                    <>
                      <h6 className="mt-3">Other Balances</h6>
                      <Table borderless size="sm">
                        <tbody>
                          {Object.entries(selectedUser.other_balance).map(([key, value]: any) => (
                            <tr key={key}>
                              <td className="fw-bold text-capitalize">{key}:</td>
                              <td>${parseFloat(value).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </Col>
              </Row>
              
              {selectedUser.stripeCustomerId && (
                <Row className="mb-4">
                  <Col md={12}>
                    <h5 className="border-bottom pb-2">Subscription Information</h5>
                    <Table borderless size="sm">
                      <tbody>
                        <tr>
                          <td className="fw-bold" style={{ width: '200px' }}>Stripe Customer ID:</td>
                          <td>{selectedUser.stripeCustomerId}</td>
                        </tr>
                        {selectedUser.stripeSubscriptionId && (
                          <tr>
                            <td className="fw-bold">Stripe Subscription ID:</td>
                            <td>{selectedUser.stripeSubscriptionId}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="fw-bold">Subscription Status:</td>
                          <td>
                            {selectedUser.subscriptionStatus ? (
                              <span className={`badge bg-${selectedUser.subscriptionStatus === 'active' ? 'success' : 'warning'}-subtle text-${selectedUser.subscriptionStatus === 'active' ? 'success' : 'warning'}`}>
                                {selectedUser.subscriptionStatus}
                              </span>
                            ) : 'N/A'}
                          </td>
                        </tr>
                        {selectedUser.plan && (
                          <tr>
                            <td className="fw-bold">Plan:</td>
                            <td className="text-capitalize">{selectedUser.plan}</td>
                          </tr>
                        )}
                        {selectedUser.paymentMethodType && (
                          <tr>
                            <td className="fw-bold">Payment Method:</td>
                            <td className="text-capitalize">{selectedUser.paymentMethodType}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="fw-bold">Current Period Start:</td>
                          <td>{formatDate(selectedUser.currentPeriodStart)}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Current Period End:</td>
                          <td>{formatDate(selectedUser.currentPeriodEnd)}</td>
                        </tr>
                        {selectedUser.trialEnd && (
                          <tr>
                            <td className="fw-bold">Trial End:</td>
                            <td>{formatDate(selectedUser.trialEnd)}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              )}
              
              {isSuperAdmin && selectedUser.created_by && (
                <Row>
                  <Col md={12}>
                    <h5 className="border-bottom pb-2">Creator Information</h5>
                    {creatorInfo ? (
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <td className="fw-bold" style={{ width: '200px' }}>Created By:</td>
                            <td>{creatorInfo.firstName} {creatorInfo.lastName}</td>
                          </tr>
                          <tr>
                            <td className="fw-bold">Creator Email:</td>
                            <td>{creatorInfo.email}</td>
                          </tr>
                          <tr>
                            <td className="fw-bold">Creator Role:</td>
                            <td className="text-capitalize">{creatorInfo.role}</td>
                          </tr>
                        </tbody>
                      </Table>
                    ) : (
                      <p>Loading creator information...</p>
                    )}
                  </Col>
                </Row>
              )}
              
              {/* {isSuperAdmin && selectedUser.access && Object.keys(selectedUser.access).length > 0 && (
                <Row>
                  <Col md={12}>
                    <h5 className="border-bottom pb-2">Access Permissions</h5>
                    <Table borderless size="sm">
                      <tbody>
                        {Object.entries(selectedUser.access).map(([key, value]) => (
                          <tr key={key}>
                            <td className="fw-bold text-capitalize" style={{ width: '200px' }}>{key.replace(/_/g, ' ')}:</td>
                            <td>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : JSON.stringify(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              )} */}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading user information...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>
            Close
          </Button>
          {isAdmin && selectedUser && (
            <Link href={`/config/users/edit/${selectedUser._id}`}>
              <Button variant="primary">
                <IconifyIcon icon="tabler:edit" className="me-1" />
                Edit User
              </Button>
            </Link>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )

  // Function to handle user deletion (you would implement this)
  function handleDeleteUser(userId) {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    // Delete user logic
    api.delete(`/api/users/${userId}`)
      .then(() => {
        // Remove user from state
        setUsers(users.filter(user => user._id !== userId))
        showNotification({ message: 'User deleted successfully', variant: 'success' })
      })
      .catch(error => {
        showNotification({ message: error?.response?.data?.error || 'Error deleting user', variant: 'danger' })
      })
  }
}