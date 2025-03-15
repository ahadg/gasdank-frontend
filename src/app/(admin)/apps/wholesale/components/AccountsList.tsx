'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, Form, Row, Col } from 'react-bootstrap'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'
import AddBalanceModal from './AddBalance'

export const metadata: Metadata = { title: 'Wholesale Accounts' }

export default function WholesaleAccountsPage() {
  const user = useAuthStore((state) => state.user)
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [activeModal,setActiveModal] = useState<string>()
  // Fetch buyers for the current user
  useEffect(() => {
    async function fetchAccounts() {
      if (user?._id) {
        setLoading(true)
        try {
          const response = await api.get(`/api/buyers?user_id=${user._id}`)
          setAccounts(response.data)
        } catch (error) {
          console.error('Error fetching accounts:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchAccounts()
  }, [user?._id])

  // Filter accounts based on search query (searching on firstName and lastName)
  const filteredAccounts = accounts.filter((acc) =>
    `${acc.firstName} ${acc.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container-fluid">
      <PageTitle title="Wholesale Accounts" subTitle="Accounts" />

      <Card className="mt-3 shadow-sm">
        <Card.Body>
          <h6 className="fs-15 mb-2">Select Account</h6>
          <div className="position-relative">
            <Button
              variant="outline-secondary"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-100 text-start d-flex justify-content-between align-items-center rounded-pill shadow-sm py-2 px-3"
            >
              <span>
                {selectedAccount
                  ? `${selectedAccount.firstName} ${selectedAccount.lastName}`
                  : 'Select an Account'}
              </span>
              <IconifyIcon icon="tabler:chevron-down" className="fs-4" />
            </Button>
            {dropdownOpen && (
              <div
                className="position-absolute w-100 bg-white border rounded shadow"
                style={{ zIndex: 1000, top: '110%' }}
              >
                <Form.Control
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 p-2"
                />
                <ul
                  className="list-unstyled mb-0"
                  style={{ maxHeight: '300px', overflowY: 'auto', cursor: 'pointer' }}
                >
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => (
                      <li
                        key={acc._id}
                        className="p-2 border-bottom hover-bg-light"
                        onClick={() => {
                          setSelectedAccount(acc)
                          setDropdownOpen(false)
                        }}
                      >
                        {acc.firstName} {acc.lastName}
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-muted">No accounts found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          {loading && <p className="mt-2 text-muted">Loading accounts...</p>}
          
          {selectedAccount && (
            <div className="mt-4 p-3 bg-light rounded shadow-sm">
              <h6 className="fs-15">Account Actions</h6>
              <div className="d-flex gap-3">
                <Link href={`/apps/wholesale/history/${selectedAccount._id}`}>
                  <Button variant="primary">View History</Button>
                </Link>
                {/* <Link href={`/apps/wholesale/add/${selectedAccount._id}`}> */}
                <Button 
                onClick={() => setActiveModal('balance')}
                variant="success">Add Balance</Button>
                {/* </Link> */}
                <Link href={`/apps/wholesale/edit/${selectedAccount._id}`}>
                  <Button variant="info">Edit Account</Button>
                </Link>
              </div>
            </div>
          )}
        </Card.Body>
        {selectedAccount && (
          <Card.Footer className="bg-white">
            <div className="d-flex justify-content-end">
              <div>
                <strong>Account Balance:</strong> ${Number(selectedAccount.currentBalance).toLocaleString()}
              </div>
            </div>
          </Card.Footer>
        )}
        {activeModal === 'balance' && selectedAccount && (
          <AddBalanceModal account={selectedAccount} onClose={() => setActiveModal(null)} />
        )}
      </Card>
    </div>
  )
}
