'use client'
import { useState } from 'react'
import { Metadata } from 'next'
import { Button, CardHeader, CardFooter, Form } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'

export const metadata: Metadata = { title: 'Add Balance' }

interface AddBalanceModalProps {
  account: any
  onClose: () => void
  fetchAccounts: () => void
}

export default function AddBalanceModal({ fetchAccounts, account, onClose }: AddBalanceModalProps) {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash')
  const [transactionDirection, setTransactionDirection] = useState<string>('received')
  const { showNotification } = useNotificationContext()

  const handleUpdate = async () => {
    setLoading(true)
    // Construct payload using transactionDirection for the type.
    const payload = {
      user_id: user._id,
      buyer_id: account._id,
      payment: paymentAmount,
      notes: '',
      payment_direction : transactionDirection, // "received" or "given"
      type :  "payment",
      payment_method: paymentMethod,
    }
    try {
      const response = await api.post('/api/transaction', payload)
      console.log('Balance updated:', response.data)
      fetchAccounts()
      onClose()
    } catch (error: any) {
      showNotification({ message: error?.response?.data?.error || 'Error updating balance', variant: 'danger' })
      console.error('Error updating balance:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
      role="dialog"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content shadow-lg rounded border border-light" style={{ backgroundColor: '#fff' }}>
          <CardHeader className="bg-light border-bottom border-light">
            {/* Optionally, add a title here */}
            <button type="button" className="btn-close" onClick={onClose}></button>
          </CardHeader>
          <div className="modal-body">
            <h6 className="fs-15 mb-3">
              {account.firstName} {account.lastName}
            </h6>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Payment Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    id="cashMethod"
                    name="paymentMethod"
                    label="Cash"
                    checked={paymentMethod === 'Cash'}
                    onChange={() => setPaymentMethod('Cash')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="eftMethod"
                    name="paymentMethod"
                    label="EFT"
                    checked={paymentMethod === 'EFT'}
                    onChange={() => setPaymentMethod('EFT')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="cryptoMethod"
                    name="paymentMethod"
                    label="Crypto"
                    checked={paymentMethod === 'Crypto'}
                    onChange={() => setPaymentMethod('Crypto')}
                  />
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Transaction Direction</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    id="receivedMethod"
                    name="transactionDirection"
                    label="Received"
                    checked={transactionDirection === 'received'}
                    onChange={() => setTransactionDirection('received')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="givenMethod"
                    name="transactionDirection"
                    label="Given"
                    checked={transactionDirection === 'given'}
                    onChange={() => setTransactionDirection('given')}
                  />
                </div>
              </Form.Group>
            </Form>
          </div>
          <CardFooter className="bg-light border-top border-light">
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleUpdate} disabled={loading} className="ms-2">
                {loading ? 'Updating...' : 'UPDATE BALANCE'}
              </Button>
            </div>
          </CardFooter>
        </div>
      </div>
    </div>
  )
}
