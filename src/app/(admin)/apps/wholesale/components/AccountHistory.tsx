'use client'
import { useState, useEffect, useRef } from 'react'
import { Metadata } from 'next'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useReactToPrint } from "react-to-print";
import moment from 'moment';

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
  price : number;
  sale_price : number;
  status: number;
  datePaid?: string;
  notes?: string;
  item_count: number;
  total: number;
  amount: number;
  type?: string; // "sale" | "return" | "payment"
  items?: ITransactionItem[];
  created_at: string;
  transactionpayment_id?: {
    payment_method: string;
    amount_paid: number;
  };
}

const AccountHistory = () => {
    const contentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef });
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const { id } = useParams() // buyer id from route parameter
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true)
      try {
        // Fetch transactions from /api/transaction/history/:buyer_id/:user_id
        const response = await api.get(`/api/transaction/history/${id}/${user?._id}`)
        setTransactions(response.data) // Expecting an array of ITransaction objects
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
  .filter((tx) => (tx.type === 'sale'))
  .reduce((sum, tx) => sum + tx.sale_price, 0)
const totalPaymentReceived = transactions
  .filter((tx) => (tx.type === 'payment' || tx.type === 'return'))
  .reduce(
    (sum, tx) => sum + (tx?.price || 0),
    0
  )
// Final amount due = total sale amount minus payment received.
const finalAmountDue = totalsaleAmount - totalPaymentReceived


  return (
    <div>
      <h5 className="mb-3 mt-2">Transaction History  ({moment().format('MMMM Do YYYY')})</h5>
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
                <th>Amount Recieved</th>
                <th>Amount Due</th>
                {/* <th style={{ width: 120 }}>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => {
                  let detailsContent = ''

                  if (tx.type === 'payment') {
                    const method = tx.transactionpayment_id?.payment_method || 'N/A'
                    detailsContent = `Payment of $${tx.transactionpayment_id.amount_paid} via ${method}`
                    if (tx.notes) {
                      detailsContent += ` (${tx.notes})`
                    }
                  } else {
                    if (tx.items && tx.items.length > 0) {
                      detailsContent = tx.items
                        .map((item) => {
                          const txItem = item.transactionitem_id
                          const name = txItem?.name || `Item (${txItem?.inventory_id?.name?.slice(0, 10)})`
                          return `${txItem?.qty} * ${name} (${txItem.unit})`
                        })
                        .join(', ')
                    } else {
                      detailsContent = '-'
                    }
                  }

                  const amountDue = tx.total - tx.amount
                  return (
                    <tr key={idx}>
                      <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td>{detailsContent}</td>
                      <td>{tx.type == "sale" ? "sale" : tx.type}</td>
                      <td>{tx.notes}</td>
                      <td>{(tx.type === "payment" || tx.type === "return") && ("- $" + tx.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }))}</td>
                      <td>{tx.type === "sale" && ("+ $" + tx.sale_price?.toLocaleString(undefined, { minimumFractionDigits: 2 }))}</td>
                      {/* <td>
                        <Button variant="primary" size="sm">
                          VIEW
                        </Button>
                      </td> */}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center">
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
        <Button  onClick={() => reactToPrintFn()}  variant="secondary" className="bg-gradient">
          EXPORT TO PDF
        </Button>
      </div>
    </div>
  )
}

export default AccountHistory
