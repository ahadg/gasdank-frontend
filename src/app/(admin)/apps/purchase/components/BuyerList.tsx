'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, Form } from 'react-bootstrap'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'

export const metadata: Metadata = { title: 'Purchase Transactions' }

export default function PurchaseTransactionsPage() {
  const user = useAuthStore((state) => state.user)
  const [buyers, setBuyers] = useState<any[]>([])
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Fetch buyers for the current user
  useEffect(() => {
    async function fetchBuyers() {
      if (user?._id) {
        setLoading(true)
        try {
          const response = await api.get(`/api/buyers?user_id=${user._id}`)
          setBuyers(response.data)
        } catch (error) {
          console.error('Error fetching buyers:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchBuyers()
  }, [user?._id])

  // Filter buyers by search query (searching on firstName and lastName)
  const filteredBuyers = buyers.filter((buyer) =>
    `${buyer.firstName} ${buyer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container-fluid">
      <PageTitle title="Purchase Transactions" subTitle="Transactions" />
      <Card className="mt-3 shadow-sm">
        <Card.Body>
          <h6 className="fs-15 mb-3">Select Buyer</h6>
          <div className="position-relative">
            <Button
              variant="outline-secondary"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-100 text-start d-flex justify-content-between align-items-center rounded-pill shadow-sm py-2 px-3"
            >
              <span>
                {selectedBuyer
                  ? `${selectedBuyer.firstName} ${selectedBuyer.lastName}`
                  : 'Select a Customer'}
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
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 p-2"
                />
                <ul
                  className="list-unstyled mb-0"
                  style={{ maxHeight: '300px', overflowY: 'auto', cursor: 'pointer' }}
                >
                  {filteredBuyers.length > 0 ? (
                    filteredBuyers.map((buyer) => (
                      <li
                        key={buyer._id}
                        className="p-2 border-bottom hover-bg-light"
                        onClick={() => {
                          setSelectedBuyer(buyer)
                          setDropdownOpen(false)
                        }}
                      >
                        {buyer.firstName} {buyer.lastName}
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-muted">No buyers found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          {loading && <p className="mt-2 text-muted">Loading buyers...</p>}

          {selectedBuyer && (
            <div className="mt-4 p-3 bg-light rounded shadow-sm">
              <h6 className="fs-15">Balance Due</h6>
              <p className="mb-0 fs-5 text-dark">
                ${Number(selectedBuyer.currentBalance).toLocaleString()}
              </p>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="bg-white">
          <div className="d-flex justify-content-end">
            <Link href={`/apps/purchase/${selectedBuyer?._id}`}>
              <Button variant="primary" disabled={!selectedBuyer}>
                CONTINUE
              </Button>
            </Link>
          </div>
        </Card.Footer>
      </Card>
    </div>
  )
}
