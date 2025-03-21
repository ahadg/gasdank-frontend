'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Table, Button } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'

export const metadata: Metadata = { title: 'Transaction History' }

interface HistoryModalProps {
  onClose: () => void
  selectedProduct: any
}

const HistoryModal = ({ onClose, selectedProduct }: HistoryModalProps) => {
  const { id } = useParams() // buyer id from route parameter
  const buyerId = id
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const user = useAuthStore((state) => state.user)
  const { showNotification } = useNotificationContext()

  useEffect(() => {
    async function fetchHistory() {
      if (buyerId && selectedProduct) {
        setLoading(true)
        try {
          const response = await api.get(`/api/transaction/itemshistory/${buyerId}/${selectedProduct._id}`)
          setHistory(response.data)
        } catch (error) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching transaction history', variant: 'danger' })
          console.error('Error fetching transaction history:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchHistory()
  }, [buyerId, selectedProduct])

  // Helper function to render type icon
  // Helper function to render type icon with text
  const renderTypeWithIcon = (type: string | undefined) => {
    let icon = null
    if (type === 'sale') {
      icon = <IconifyIcon icon="tabler:arrow-up" className="text-success me-1" />
    } else if (type === 'return') {
      icon = <IconifyIcon icon="tabler:arrow-down" className="text-danger me-1" />
    } else if (type === 'payment') {
      icon = <IconifyIcon icon="tabler:cash" className="text-primary me-1" />
    }
    return (
      <span className="d-flex align-items-center">
        {icon}
        <span>{type}</span>
      </span>
    )
  }

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
      role="dialog"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content shadow-lg rounded border border-light" style={{ backgroundColor: '#fff' }}>
          <div className="modal-header bg-light border-bottom border-light">
            <h5 className="modal-title">Transaction History</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h6 className="fs-15 mb-3">Past Transactions</h6>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="table-responsive">
                <Table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>DATE</th>
                      <th>ITEM</th>
                      <th>QUANTITY</th>
                      <th>Type</th>
                      <th>PRICE</th>
                      <th>SALE PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? (
                      history.map((tx, index) => (
                        <tr key={index}>
                          <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td>{tx.inventory_id?.name}</td>
                          <td>
                            {tx.qty} [{tx.unit}]
                          </td>
                          <td>
                            {renderTypeWithIcon(tx.transaction_id?.type)}
                            {/* {tx.transaction_id?.type} */}
                          </td>
                          <td>${tx.price}</td>
                          <td>{tx.sale_price ? `$${tx.sale_price}` : `-`}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center">
                          No transaction history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
          <div className="modal-footer bg-light border-top border-light">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryModal
