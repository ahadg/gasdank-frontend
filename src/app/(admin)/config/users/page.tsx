'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import PageTitle from "@/components/PageTitle"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import { Card, CardHeader, CardFooter, CardTitle, Row, Col, Button } from "react-bootstrap"
import Link from 'next/link'
import api from '@/utils/axiosInstance'

export default function UsersPage() {
  // State to hold users loaded from API and search text
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Load users from API on component mount
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const response = await api.get('/api/users')
        // Assuming the API returns an array of users
        setUsers(response.data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const searchLower = search.toLowerCase()

  // Filter users by firstName, lastName, or email
  const filteredUsers = users.filter((user) => {
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  })

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
              <Link href={"/config/users/add"}>
                <Button variant="success" className="bg-gradient">
                  <IconifyIcon icon="tabler:plus" className="me-1" />
                  ADD NEW
                </Button>
              </Link>
            </CardHeader>

            {/* Search Bar */}
            <div className="px-3 py-3 d-flex justify-content-start">
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

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-nowrap mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    {/* <th>PIN</th> */}
                    <th>FIRSTNAME</th>
                    <th>LASTNAME</th>
                    <th>EMAIL</th>
                    <th>PHONE NUMBER</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center">Loading...</td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={index}>
                        {/* <td>{user.pin}</td> */}
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <Link href={`/config/users/edit/${user._id}`}>
                            <Button
                              variant="soft-success"
                              size="sm"
                              className="btn-icon rounded-circle me-1"
                            >
                              <IconifyIcon icon="tabler:edit" />
                            </Button>
                          </Link>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            className="btn-icon rounded-circle"
                          >
                            <IconifyIcon icon="tabler:trash" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with pagination info */}
            <CardFooter>
              <div className="d-flex justify-content-between">
                <div>
                  {/* {`Showing ${filteredUsers.length} of ${users.length} entries`} */}
                </div>
                {/* Place a pagination component here if needed */}
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}
