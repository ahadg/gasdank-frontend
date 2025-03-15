'use client'
import { useState } from 'react'
import { Metadata } from 'next'
import { Button, CardHeader, CardFooter, CardTitle, Form } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

export const metadata: Metadata = { title: 'Add Balance' }

interface AddBalanceModalProps {
  account: any
  onClose: () => void
}

export default function AddBalanceModal({ account, onClose }: AddBalanceModalProps) {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash')

  const handleUpdate = async () => {
    setLoading(true)
    // Construct payload according to your backend expectations.
    const payload = {
      user_id: user._id,
      buyer_id: account._id,
      payment: paymentAmount,
      notes: '',
      type: 'payment', // Payment transaction type
      payment_method: paymentMethod,
    }
    try {
      const response = await api.post('/api/transaction', payload)
      console.log('Balance updated:', response.data)
      onClose()
    } catch (error: any) {
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
            {/* <CardTitle as="h5" className="mb-0">Add Balance</CardTitle> */}
            <button type="button" className="btn-close" onClick={onClose}></button>
          </CardHeader>
          <div className="modal-body">
            <h6 className="fs-15 mb-3">
              Add Balance for {account.firstName} {account.lastName}
            </h6>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Payment Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
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
                  {/* <Form.Check
                    inline
                    type="radio"
                    id="sellMethod"
                    name="paymentMethod"
                    label="Sell Product"
                    checked={paymentMethod === 'Sell Product'}
                    onChange={() => setPaymentMethod('Sell Product')}
                  /> */}
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
