'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, Form, Row, Col, CardHeader, InputGroup } from 'react-bootstrap'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'
import AddBalanceModal from './AddBalance'
import { useNotificationContext } from '@/context/useNotificationContext'
import ReturnSaleModal from '../../sale/components/ReturnSaleModal'

export const metadata: Metadata = { title: 'Wholesale Accounts' }

// Balance Status Component
const BalanceStatusIndicator = ({ balance }: { balance: number }) => {
  console.log("balance", balance)
  const getBalanceStatus = () => {
    if (balance < 0) {
      return {
        color: '#dc3545', // Green - they owe us
        text: '',
        amount: (balance),
        bgColor: '#f8d7da',
        icon: 'tabler:arrow-up'
      }
    } else if (balance > 0) {
      return {
        color: '#28a745', // Red - we owe them
        text: '',
        amount: balance,
        bgColor: '#d4edda',
        icon: 'tabler:arrow-down'
      }
    } else {
      return {
        color: '#6c757d', // Gray - balanced
        text: ' ',
        amount: 0,
        bgColor: '#e9ecef',
        icon: 'tabler:check'
      }
    }
  }

  const status = getBalanceStatus()

  return (
    <div
      className="d-flex align-items-center justify-content-between px-2 py-1 rounded-pill"
      style={{
        backgroundColor: status.bgColor,
        border: `1px solid ${status.color}`,
        fontSize: '0.75rem',
        minWidth: '100px'
      }}
    >
      <IconifyIcon
        icon={status.icon}
        style={{ color: status.color, fontSize: '14px' }}
      />
      {/* <span style={{ color: status.color, fontWeight: '600' }}>
        {status.text}
      </span> */}
      <span style={{ color: status.color, fontWeight: '700' }}>
        ${status.amount.toLocaleString()}
      </span>
    </div>
  )
}

export default function WholesaleAccountsPage() {
  const user = useAuthStore((state) => state.user)
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [activeModal, setActiveModal] = useState<string>()
  const { showNotification } = useNotificationContext()

  async function fetchAccounts() {
    if (user?._id) {
      setLoading(true)
      try {
        const response = await api.get(`/api/buyers?user_id=${user._id}`)
        setAccounts(response.data)
      } catch (error) {
        showNotification({ message: error?.response?.data?.error || 'Error fetching accounts', variant: 'danger' })
        console.error('Error fetching accounts:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  // Fetch buyers for the current user
  useEffect(() => {
    fetchAccounts()
  }, [user?._id])

  console.log("selectedAccount", selectedAccount)

  useEffect(() => {
    if (selectedAccount) {
      let newSelectedAccount = accounts.find((item) => item?._id == selectedAccount?._id)
      setSelectedAccount(newSelectedAccount)
    }
  }, [accounts])

  // Filter accounts based on search query (searching on firstName and lastName)
  const filteredAccounts = accounts.filter((acc) =>
    `${acc.firstName} ${acc.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container-fluid">
      <PageTitle title="Wholesale Accounts" subTitle="Accounts" />

      <Card className="mt-3 shadow-sm">
        <CardHeader className="border-bottom border-light">
          <div>
            <Link href="/apps/wholesale/add" className="btn btn-primary"><IconifyIcon icon='tabler:plus' className="me-1" />Add Client</Link>
          </div>
        </CardHeader>
        <Card.Body>
          <h6 className="fs-15 mb-2 text-muted fw-semibold">Select Account</h6>
          <div className="position-relative" style={{ zIndex: dropdownOpen ? 1050 : 1 }}>
            <Button
              variant={dropdownOpen ? "light" : "outline-secondary"}
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`w-100 text-start d-flex justify-content-between align-items-center shadow-sm py-2 px-3 ${dropdownOpen ? 'border-primary' : ''}`}
              style={{ borderRadius: '0.75rem', transition: 'all 0.2s ease' }}
            >
              <div className="d-flex align-items-center">
                {selectedAccount ? (
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                      {selectedAccount.firstName?.charAt(0)}{selectedAccount.lastName?.charAt(0)}
                    </div>
                    <span className="fw-semibold text-dark fs-6" style={{ letterSpacing: '0.3px' }}>
                      {selectedAccount.firstName} {selectedAccount.lastName}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted d-flex align-items-center">
                    <IconifyIcon icon="tabler:user-search" className="me-2 fs-5 text-primary" />
                    <span className="fw-medium">Select an Account...</span>
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center gap-3">
                {selectedAccount && (
                  <BalanceStatusIndicator balance={selectedAccount.currentBalance} />
                )}
                <IconifyIcon 
                  icon={dropdownOpen ? "tabler:chevron-up" : "tabler:chevron-down"} 
                  className={`fs-4 text-muted`} 
                  style={{ transition: 'transform 0.2s ease', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
                />
              </div>
            </Button>
            
            {dropdownOpen && (
              <div
                className="position-absolute w-100 bg-white rounded shadow-lg border"
                style={{ top: 'calc(100% + 8px)', overflow: 'hidden' }}
              >
                <div className="p-2 bg-light border-bottom">
                  <InputGroup className="shadow-sm">
                    <InputGroup.Text className="bg-white border-end-0 text-primary">
                      <IconifyIcon icon="tabler:search" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search accounts by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-start-0 py-2"
                      style={{ boxShadow: 'none' }}
                      autoFocus
                    />
                    {searchQuery && (
                      <InputGroup.Text 
                        className="bg-white border-start-0 text-muted"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSearchQuery('')}
                      >
                        <IconifyIcon icon="tabler:x" />
                      </InputGroup.Text>
                    )}
                  </InputGroup>
                </div>
                <ul
                  className="list-unstyled mb-0 m-0"
                  style={{ maxHeight: '350px', overflowY: 'auto' }}
                >
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc, index) => (
                      <li
                        key={acc._id}
                        className={`p-3 d-flex justify-content-between align-items-center ${index !== filteredAccounts.length - 1 ? 'border-bottom border-light' : ''}`}
                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          setSelectedAccount(acc)
                          setDropdownOpen(false)
                          setSearchQuery('')
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: '40px', height: '40px' }}>
                            {acc.firstName?.charAt(0)}{acc.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark fs-6">{acc.firstName} {acc.lastName}</div>
                            {(acc.email || acc.phone) && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{acc.email || acc.phone || 'No contact info'}</div>}
                          </div>
                        </div>
                        <BalanceStatusIndicator balance={acc.currentBalance} />
                      </li>
                    ))
                  ) : (
                    <li className="p-5 text-center text-muted">
                      <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                        <IconifyIcon icon="tabler:users-x" className="fs-1 text-secondary" />
                      </div>
                      <h6 className="fw-semibold mb-1">No matches found</h6>
                      <p className="small mb-0">We couldn't find any account matching "{searchQuery}"</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          {loading && <p className="mt-2 text-muted">Loading accounts...</p>}

          {selectedAccount && (
            <div className="mt-4 p-3 bg-light rounded shadow-sm">
              <h6 className="fs-15 mb-3">Account Actions</h6>
              <div className="d-flex flex-column flex-md-row gap-2">
                <div className="flex-md-1">
                  <Link href={`/apps/wholesale/history/${selectedAccount._id}`} className="text-decoration-none">
                    <Button variant="primary" className="w-100">View Transaction</Button>
                  </Link>
                </div>

                <div className="flex-md-1">
                  <Button
                    onClick={() => setActiveModal('balance')}
                    variant="success"
                    className="w-100">
                    Add Balance
                  </Button>
                </div>

                <div className="flex-md-1">
                  <Button
                    variant="danger"
                    onClick={() => setActiveModal('returnsale')}
                  >
                    <IconifyIcon icon="tabler:arrow-back-up" className="me-1" />
                    Return Sale
                  </Button>
                </div>

                <div className="flex-md-1">
                  <Link href={`/apps/wholesale/edit/${selectedAccount._id}`} className="text-decoration-none">
                    <Button variant="info" className="w-100">Edit Account</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
        {selectedAccount && (
          <Card.Footer className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                {/* <BalanceStatusIndicator balance={selectedAccount.currentBalance} />
                <div className="text-muted small">
                  {selectedAccount.currentBalance < 0 
                    ? "Customer owes money" 
                    : selectedAccount.currentBalance > 0 
                    ? "We owe customer money" 
                    : "Account is balanced"
                  }
                </div> */}
              </div>
              <div>
                <strong>Account Balance:</strong> ${Number(selectedAccount.currentBalance).toLocaleString()}
              </div>
            </div>
          </Card.Footer>
        )}

        {activeModal === 'returnsale' && selectedAccount && (
          <ReturnSaleModal
            show={true}
            buyerId={selectedAccount?._id as string}
            onClose={() => setActiveModal(null)}
            onReturnComplete={() => {
              //fetchProducts() // refresh inventory
              setActiveModal(null)
            }}
          />
        )}
        {activeModal === 'balance' && selectedAccount && (
          <AddBalanceModal fetchAccounts={fetchAccounts} account={selectedAccount} onClose={() => setActiveModal(null)} />
        )}
      </Card>
    </div>
  )
}