'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Metadata } from 'next'
import { Row, Col, Card, CardBody, Button, Form, Table, ButtonGroup } from 'react-bootstrap'
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
    shippingCost: number;
    shipping: number;
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

interface DateRange {
  startDateTime: string; // YYYY-MM-DDTHH:mm format
  endDateTime: string;  // YYYY-MM-DDTHH:mm format
}

const AccountHistory = () => {
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const { id } = useParams() // buyer id from route parameter
  const user = useAuthStore((state) => state.user)

  // New state for date range selection with single inputs
  const [dateRange, setDateRange] = useState<DateRange>({
    startDateTime: moment().startOf('day').format('YYYY-MM-DDTHH:mm'),
    endDateTime: moment().endOf('day').format('YYYY-MM-DDTHH:mm')
  })

  // New state: if true, exclude shipping cost from totals.
  const [excludeShipping, setExcludeShipping] = useState<boolean>(false)

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Quick filter options
  const applyQuickFilter = (period: string) => {
    let start, end;
    const now = moment();
    
    switch(period) {
      case 'today':
        start = now.clone().startOf('day');
        end = now.clone().endOf('day');
        break;
      case 'yesterday':
        start = now.clone().subtract(1, 'day').startOf('day');
        end = now.clone().subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        start = now.clone().startOf('week');
        end = now.clone().endOf('day');
        break;
      case 'lastWeek':
        start = now.clone().subtract(1, 'week').startOf('week');
        end = now.clone().subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        start = now.clone().startOf('month');
        end = now.clone().endOf('day');
        break;
      case 'lastMonth':
        start = now.clone().subtract(1, 'month').startOf('month');
        end = now.clone().subtract(1, 'month').endOf('month');
        break;
      default:
        return;
    }

    setDateRange({
      startDateTime: start.format('YYYY-MM-DDTHH:mm'),
      endDateTime: end.format('YYYY-MM-DDTHH:mm')
    });
    
    // Automatically fetch when quick filter is applied
    fetchHistory(start.format('YYYY-MM-DDTHH:mm:00'), end.format('YYYY-MM-DDTHH:mm:00'));
  }

  const fetchHistory = async (start?: string, end?: string) => {
    setLoading(true)
    try {
      // Use provided parameters or fallback to state values
      const startDateTime = start || `${dateRange.startDateTime}:00`
      const endDateTime = end || `${dateRange.endDateTime}:00`
      
      const response = await api.get(
        `/api/transaction/history/${id}/${user?._id}`,
        { params: { startDateTime, endDateTime } }
      )
      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transaction history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

  const totalShipping_client = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'inventory_addition')
      .reduce((sum, tx) => sum + (tx?.total_shipping || 0), 0)
  }, [transactions])

  const totalPaymentReceived = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'payment' || tx.type === 'return' || tx.type === 'inventory_addition')
      .reduce((sum, tx) => {
        if (tx.type === 'payment') {
          if (tx.payment_direction === 'received') {
            return sum + ((tx?.price || 0))
          }
          return sum
        } else {
          return sum + ((tx?.price || 0))
        }
      }, 0)
  }, [transactions, excludeShipping])

  // Final amount due is calculated differently based on the checkbox.
  const finalAmountDue = useMemo(() => {
    if (excludeShipping) {
      // Exclude shipping cost entirely.
      return totalsaleAmount - totalPaymentReceived 
    }
    // Otherwise, include total shipping and any additional shipping payment.
    return (totalsaleAmount + totalShipping) - (totalPaymentReceived + totalShipping_client)
  }, [totalPaymentReceived, totalsaleAmount, excludeShipping, totalShipping, totalShipping_client])

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
                  {txItem.qty} {txItem.unit} of {name} (@ {formatCurrency(txItem.sale_price || txItem?.price)}) {!excludeShipping && ('+ (🚚' + " " +(formatCurrency(txItem.shipping * txItem.qty)) + ")")}
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
        Transaction History
      </h5>
      
      <Card className="mb-3">
        <CardBody>
          <Row className="mb-3">
            <Col md={12}>
              <ButtonGroup className="w-100">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => applyQuickFilter('today')}
                  className="flex-grow-1"
                >
                  Today
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => applyQuickFilter('yesterday')}
                  className="flex-grow-1"
                >
                  Yesterday
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => applyQuickFilter('thisWeek')}
                  className="flex-grow-1"
                >
                  This Week
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => applyQuickFilter('lastWeek')}
                  className="flex-grow-1"
                >
                  Last Week
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => applyQuickFilter('thisMonth')}
                  className="flex-grow-1"
                >
                  This Month
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => applyQuickFilter('lastMonth')}
                  className="flex-grow-1"
                >
                  Last Month
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
            <Col md={5}>
              <Form.Group>
                <Form.Label>Start Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startDateTime"
                  value={dateRange.startDateTime}
                  onChange={handleDateRangeChange}
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label>End Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endDateTime"
                  value={dateRange.endDateTime}
                  onChange={handleDateRangeChange}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button onClick={() => fetchHistory()} variant="primary" className="bg-gradient w-100">
                Search
              </Button>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={12}>
              <Form.Check
                type="checkbox"
                id="excludeShipping"
                label="Exclude Shipping Cost"
                checked={excludeShipping}
                onChange={(e) => setExcludeShipping(e.target.checked)}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
      
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div ref={contentRef} className="table-responsive">
          <div className="mb-2">
            <strong>Showing transactions from:</strong> {moment(dateRange.startDateTime).format('MMM DD, YYYY HH:mm')} to {moment(dateRange.endDateTime).format('MMM DD, YYYY HH:mm')}
          </div>
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
                    <td>{moment(tx.created_at).format('MM/DD/YYYY HH:mm')}</td>
                    <td>{getDetailsContent(tx)}</td>
                    <td>{tx.type === 'inventory_addition' ? 'Inventory Addition' : tx.type}</td>
                    <td>{tx.notes}</td>
                    <td>
                      {tx.type === 'payment'
                        ? tx.payment_direction === 'received' &&
                          ('- ' + formatCurrency(tx.price))
                        : (tx.type === 'return' || tx.type === 'inventory_addition') &&
                          ('- ' +  (!excludeShipping ? formatCurrency(tx.price + tx.total_shipping) : formatCurrency(tx.price)))}
                    </td>
                    <td>
                      {tx.type === 'sale'
                        ? ('+ ' + (!excludeShipping ? formatCurrency(tx.sale_price + tx.total_shipping) : formatCurrency(tx.sale_price) ))
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
              <Col md={8}>{formatCurrency(totalPaymentReceived + totalShipping_client)}</Col>
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