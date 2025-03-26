'use client'
import { useState, useEffect, useRef } from 'react'
import { Metadata } from 'next'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useReactToPrint } from "react-to-print"
import moment from 'moment'

export const metadata: Metadata = { title: 'Transaction History' }

interface ITransactionItem {
  transactionitem_id: {
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
  const reactToPrintFn = useReactToPrint({ contentRef })
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const { id } = useParams() // buyer id from route parameter
  const user = useAuthStore((state) => state.user)
  console.log("transactions",transactions)
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

  // Compute receipt totals:
  const totalsaleAmount = transactions
    .filter((tx) => tx.type === 'sale' || tx.type === 'payment')
    .reduce((sum, tx) => { 
      if(tx.type === 'payment') {
         if(tx.payment_direction === "received") {
          return sum + ((tx?.price || 0) + (tx?.total_shipping || 0))
         } else {
          return sum
         }
      } else {
      return sum + ((tx?.price || 0) + (tx?.total_shipping || 0))
      }
    }, 0)
    

  const totalPaymentReceived = transactions
    .filter((tx) => tx.type === 'payment' || tx.type === 'return' || tx.type === 'inventory_addition')
    .reduce((sum, tx) => { 
      if(tx.type === 'payment') {
         if(tx.payment_direction === "given") {
          return sum + ((tx?.price || 0) + (tx?.total_shipping || 0))
         } else {
          return sum
         }
      } else {
      return sum + ((tx?.price || 0) + (tx?.total_shipping || 0))
      }
    }, 0)

  // Final amount due = total payment received minus sale amount.
  const finalAmountDue = totalPaymentReceived - totalsaleAmount

  // Build detailed content for the Details column.
  const getDetailsContent = (tx: ITransaction) => {
    if (tx.type === 'payment') {
      const method = tx.transactionpayment_id?.payment_method || 'N/A'
      let content = `Payment of $${tx.transactionpayment_id?.amount_paid} ${tx?.payment_direction} via ${method}`
      if (tx.notes) {
        content += ` (${tx.notes})`
      }
      return <span>{content}</span>
    } else {
      if (tx.items && tx.items.length > 0) {
        return (
          <>
            {tx.items.map((item, index) => {
              const txItem = item.transactionitem_id
              const name = txItem?.name || txItem?.inventory_id?.name || 'Item'
              const measurementLabel =
                txItem.measurement === "1"
                  ? "Full"
                  : txItem.measurement === "0.5"
                  ? "Half"
                  : txItem.measurement === "0.25"
                  ? "Quarter"
                  : txItem.measurement
              return (
                <div key={index}>
                  {txItem.qty} {txItem.unit} of {name} @ ${txItem.price.toFixed(2)} 
                </div>
              )
            })}
          </>
        )
      } else {
        return <span>-</span>
      }
    }
  }

  return (
    <div>
      <h5 className="mb-3 mt-2">Transaction History ({moment().format('MMMM Do YYYY')})</h5>
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
                    <td>{tx.type === "inventory_addition" ? "Inventory Addition" : tx.type}</td>
                    <td>{tx.notes}</td>
                    <td>
                      {tx.type === "payment"
                        ? tx.payment_direction === "received"  && ("- $" + tx.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }))
                        : (tx.type === "return" || tx.type === "inventory_addition")
                        ? ("- $" + (tx.price + (tx.total_shipping || 0))?.toLocaleString(undefined, { minimumFractionDigits: 2 }))
                        : ''}
                    </td>
                    <td>
                      {tx.type === "sale" ?
                        ("+ $" + (tx.sale_price + tx.total_shipping)?.toLocaleString(undefined, { minimumFractionDigits: 2 }))
                      :
                        tx.type === "payment" ? tx.payment_direction === "given"  && ("+ $" + tx.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })) : ''
                      }
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
              <Col md={8}>
                ${totalsaleAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <strong>Total Payment Received:</strong>
              </Col>
              <Col md={8}>
                ${totalPaymentReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <strong>Final Amount Due:</strong>
              </Col>
              <Col md={8}>
                ${finalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Col>
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
