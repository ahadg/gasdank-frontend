'use client'
import { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react'
import { Metadata } from 'next'
import { Row, Col, Card, CardBody, Button, Form, Table } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useReactToPrint } from 'react-to-print'
import moment from 'moment'

export const metadata: Metadata = { title: 'Transaction History' }

interface ITransactionItem {
  transactionitem_id: {
    sale_price: number;
    _id: string;
    inventory_id: {
      name: string;
    };
    qty: number;
    unit: string;
    measurement: string; // e.g., "1", "0.5", "0.25"
    price: number;
    name?: string;
  };
  _id: string;
}

interface ITransaction {
  payment: number;
  price: number;
  sale_price: number;
  status: number;
  datePaid?: string;
  notes?: string;
  item_count: number;
  total: number;
  amount: number;
  total_shipping: number;
  type?: string; // "sale" | "return" | "payment" | "inventory_addition"
  items?: ITransactionItem[];
  created_at: string;
  payment_direction: string;
  transactionpayment_id?: {
    payment_method: string;
    amount_paid: number;
  };
}

const AccountHistory = () => {
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({  contentRef })
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const { id } = useParams() // buyer id from route parameter
  const user = useAuthStore((state) => state.user)

  // New state: if true, exclude shipping cost from totals.
  const [excludeShipping, setExcludeShipping] = useState<boolean>(false)
  // State for additional shipping payment (if needed)
  const [additionalShippingPayment, setAdditionalShippingPayment] = useState<number>(0)

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true)
      try {
        const response = await api.get(`/api/transaction/history/${id}/${user?._id}`)
        setTransactions(response.data)
      } catch (error) {
        console.error('Error fetching transaction history:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id && user?._id) {
      fetchHistory()
    }
  }, [id, user?._id])

  // Compute totals
  const totalsaleAmount = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'sale' || tx.type === 'payment')
      .reduce((sum, tx) => {
        if (tx.type === 'payment') {
          if (tx.payment_direction === 'given') {
            return sum + (tx?.price || 0)
          }
          return sum
        } else {
          return sum + (tx?.sale_price || 0)
        }
      }, 0)
  }, [transactions])

  const totalShipping = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'sale')
      .reduce((sum, tx) => sum + (tx?.total_shipping || 0), 0)
  }, [transactions])

  const totalPaymentReceived = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'payment' || tx.type === 'return' || tx.type === 'inventory_addition')
      .reduce((sum, tx) => {
        if (tx.type === 'payment') {
          if (tx.payment_direction === 'received') {
            return sum + ((tx?.price || 0) + (tx?.total_shipping || 0))
          }
          return sum
        } else {
          return sum + ((tx?.price || 0) + (tx?.total_shipping || 0))
        }
      }, 0)
  }, [transactions])

  // Final amount due is calculated differently based on the checkbox.
  const finalAmountDue = useMemo(() => {
    if (excludeShipping) {
      // Exclude shipping cost entirely.
      return totalPaymentReceived - totalsaleAmount
    }
    // Otherwise, include total shipping and any additional shipping payment.
    return (totalPaymentReceived ) - (totalsaleAmount + totalShipping)
  }, [totalPaymentReceived, totalsaleAmount, excludeShipping])

  const formatCurrency = (value: number) =>
    `$${value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  // Build detailed content for the Details column.
  const getDetailsContent = (tx: ITransaction) => {
    if (tx.type === 'payment') {
      const method = tx.transactionpayment_id?.payment_method || 'N/A'
      let content = `Payment of ${formatCurrency(tx.transactionpayment_id?.amount_paid)} ${tx.payment_direction} via ${method}`
      if (tx.notes) {
        content += ` (${tx.notes})`
      }
      return <div>{content}</div>
    } else {
      if (tx.items && tx.items.length > 0) {
        return (
          <div>
            {tx.items.map((item, index) => {
              const txItem = item.transactionitem_id
              const name = txItem?.name || txItem?.inventory_id?.name || 'Item'
              const measurementLabel =
                txItem.measurement === '1'
                  ? 'Full'
                  : txItem.measurement === '0.5'
                  ? 'Half'
                  : txItem.measurement === '0.25'
                  ? 'Quarter'
                  : txItem.measurement
              return (
                <div key={index}>
                  {txItem.qty} {txItem.unit} of {name} (@ {formatCurrency(txItem.sale_price)})
                </div>
              )
            })}
          </div>
        )
      } else {
        return <div>-</div>
      }
    }
  }

  return (
    <div>
      <h5 className="mb-3 mt-2">
        Transaction History ({moment().format('MMMM Do YYYY')})
        <Row className="mt-2">
              <Col>
                <Form.Check
                  type="checkbox"
                  id="excludeShipping"
                  label="Exclude Shipping Cost"
                  checked={excludeShipping}
                  onChange={(e) => setExcludeShipping(e.target.checked)}
                />
              </Col>
            </Row>
      </h5>
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div ref={contentRef} className="table-responsive">
          <Table className="table table-nowrap mb-0">
            <thead className="bg-light-subtle">
              <tr>
                <th>Date</th>
                <th>Details</th>
                <th>Type</th>
                <th>Notes</th>
                <th>Funds In</th>
                <th>Funds Out</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td>{getDetailsContent(tx)}</td>
                    <td>{tx.type === 'inventory_addition' ? 'Inventory Addition' : tx.type}</td>
                    <td>{tx.notes}</td>
                    <td>
                      {tx.type === 'payment'
                        ? tx.payment_direction === 'received' &&
                          ('- ' + formatCurrency(tx.price))
                        : (tx.type === 'return' || tx.type === 'inventory_addition') &&
                          ('- ' + formatCurrency(tx.price + (tx.total_shipping || 0)))}
                    </td>
                    <td>
                      {tx.type === 'sale'
                        ? ('+ ' + formatCurrency(tx.sale_price))
                        : tx.type === 'payment' &&
                          tx.payment_direction === 'given' &&
                          ('+ ' + formatCurrency(tx.price))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <div className="mt-4 border-top pt-3">
            <Row>
              <Col md={4}>
                <strong>Total Sale Amount:</strong>
              </Col>
              <Col md={8}>{formatCurrency(totalsaleAmount)}</Col>
            </Row>
            <Row>
              <Col md={4}>
                <strong>Total Payment Received:</strong>
              </Col>
              <Col md={8}>{formatCurrency(totalPaymentReceived)}</Col>
            </Row>
            {!excludeShipping && (
              <Row>
                <Col md={4}>
                  <strong>Total Shipping Cost:</strong>
                </Col>
                <Col md={8}>{formatCurrency(totalShipping)}</Col>
              </Row>
            )}
            <Row className="mt-2">
              <Col md={4}>
                <strong>Final Amount Due:</strong>
              </Col>
              <Col md={8}>{formatCurrency(finalAmountDue)}</Col>
            </Row>
           
          </div>
        </div>
      )}
      <div className="mt-3 d-flex justify-content-end">
        <Button onClick={() => reactToPrintFn()} variant="secondary" className="bg-gradient">
          EXPORT TO PDF
        </Button>
      </div>
    </div>
  )
}

export default AccountHistory
