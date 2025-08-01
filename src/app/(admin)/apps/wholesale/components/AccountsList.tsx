'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, Form, Row, Col, CardHeader } from 'react-bootstrap'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'
import AddBalanceModal from './AddBalance'
import { useNotificationContext } from '@/context/useNotificationContext'
import ReturnSaleModal from '../../sale/components/ReturnSaleModal'

export const metadata: Metadata = { title: 'Wholesale Accounts' }

// Balance Status Component
const BalanceStatusIndicator = ({ balance }: { balance: number }) => {
  const getBalanceStatus = () => {
    if (balance < 0) {
      return {
        color: '#28a745', // Green - they owe us
        text: '',
        amount: Math.abs(balance),
        bgColor: '#d4edda',
        icon: 'tabler:arrow-up'
      }
    } else if (balance > 0) {
      return {
        color: '#dc3545', // Red - we owe them
        text: '',
        amount: balance,
        bgColor: '#f8d7da',
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
  const [activeModal,setActiveModal] = useState<string>()
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
  
  console.log("selectedAccount",selectedAccount)
  
  useEffect(() => {
    if(selectedAccount) {
      let newSelectedAccount = accounts.find((item) => item?._id == selectedAccount?._id)
      setSelectedAccount(newSelectedAccount)
    }
  },[accounts])

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
              <div className="d-flex align-items-center gap-2">
                {selectedAccount && (
                  <BalanceStatusIndicator balance={selectedAccount.currentBalance} />
                )}
                <IconifyIcon icon="tabler:chevron-down" className="fs-4" />
              </div>
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
                        className="p-2 border-bottom hover-bg-light d-flex justify-content-between align-items-center"
                        onClick={() => {
                          setSelectedAccount(acc)
                          setDropdownOpen(false)
                        }}
                      >
                        <span>{acc.firstName} {acc.lastName}</span>
                        <BalanceStatusIndicator balance={acc.currentBalance} />
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