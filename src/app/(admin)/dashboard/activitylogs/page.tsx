'use client'
import { useState, useEffect } from "react"
import PageTitle from "@/components/PageTitle"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import Image from "next/image"
import Link from "next/link"
import { Button, Card, CardFooter, CardHeader, Col, Row, Form } from "react-bootstrap"
import Paginations from "./component/Paginations"
import moment from "moment"
import { Metadata } from "next"
import api from "@/utils/axiosInstance"
import { useAuthStore } from "@/store/authStore"
import { useNotificationContext } from "@/context/useNotificationContext"

// Helper function to build details content
const getDetailsContent = (tx: any) => {
  if (tx.type === 'payment') {
    const method = tx.transactionpayment_id?.payment_method || 'N/A'
    let content = `Payment of $${tx.transactionpayment_id?.amount_paid} ${tx.payment_direction} via ${method}`
    if (tx.notes) {
      content += ` (${tx.notes})`
    }
    return <span>{content}</span>
  } else {
    if (tx.items && tx.items.length > 0) {
      return (
        <>
          {tx.items.map((item: any, index: number) => {
            const txItem = item.transactionitem_id
            const name = txItem?.name || txItem?.inventory_id?.name || 'Item'
            return (
              <div key={index}>
                {txItem.qty} {txItem.unit} of {name} @ ${txItem.sale_price.toFixed(2)}
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

const ActivityLogsPage = () => {

  function toLocalDateTimeString(date: Date) {
    const offsetMs = date.getTime() - date.getTimezoneOffset() * 60000
    const localDate = new Date(offsetMs)
    return localDate.toISOString().slice(0, 16)
  }
  
  const { showNotification } = useNotificationContext()
  // State for logs, pagination and loading indicator
  const [activityData, setActivityData] = useState<any[]>([])
  
  // Set default start date to three days in the past
  const [startDate, setStartDate] = useState(() => {
    const threeDaysPast = new Date()
    threeDaysPast.setDate(threeDaysPast.getDate() - 3)
    threeDaysPast.setHours(0, 0, 0, 0)
    return toLocalDateTimeString(threeDaysPast)
  })
  
  const [endDate, setEndDate] = useState(() => {
    const now = new Date()
    return toLocalDateTimeString(now)
  })
  
  // New state for filtering by activity type
  const [activityType, setActivityType] = useState("")
  
  const [page, setPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [loading, setLoading] = useState(false)
  const limit = 10 // default limit per page

  const user = useAuthStore((state) => state.user)
  // Replace with your actual user id or get it from auth context if needed
  // const userId = "67cf4bb808facf7a76f9f229"

  const fetchActivityData = async () => {
    setLoading(true)
    try {
      const res = await api.get(
        `/api/activity/${user?._id}?page=${page}&limit=${limit}&type=${activityType}&from=${startDate}&end=${endDate}`
      )
      setActivityData(res.data.logs)
      setTotalLogs(res.data.totallogs)
    } catch (error: any) {
      console.log("err", error.response)
      showNotification({ message: error?.response?.data?.error || 'Error fetching activity logs', variant: 'danger' })
      console.error('Error fetching activity logs:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchActivityData()
  }, [page, startDate, endDate, activityType])

  return (
    <>
      <PageTitle title="Activity Logs" subTitle="Activity" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader className="border-bottom border-light">
              <Row className="justify-content-between align-items-end g-3">
                <Col lg={6}>
                  <Form className="mb-3">
                    <Row className="align-items-end">
                      <Col md={4}>
                        <Form.Group controlId="startDate">
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="endDate">
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="activityType">
                          <Form.Label>Activity Type</Form.Label>
                          <Form.Select
                            value={activityType}
                            onChange={(e) => setActivityType(e.target.value)}
                          >
                            <option value="">All Activity Types</option>
                            <option value="inventory_addition">Inventory Addition</option>
                            <option value="sale">Sale</option>
                            <option value="payment">Transaction</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </CardHeader>
            {loading ? (
              <div className="p-3">Loading...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-nowrap mb-0">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th>User</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityData.length > 0 ? (
                      activityData.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <h5 className="mb-0 text-dark">
                              {item.users?.image && (
                                <Image
                                  src={item.users.image}
                                  alt="avatar"
                                  className="rounded-circle avatar-xs me-1"
                                  width={24}
                                  height={24}
                                />
                              )}
                              <Link href="" className="text-dark">
                                {item.user_id?.firstName} {item.user_id?.lastName}
                              </Link>
                            </h5>
                          </td>
                          <td>
                            {item.buyer_id?.firstName} {item.buyer_id?.lastName}
                          </td>
                          <td>{item.type}</td>
                          <td>
                            <div className="mb-1">{item?.description}</div>
                            {item.notes && <div className="text-muted small">Note: {item.notes}</div>}
                          </td>
                          <td>{moment(item.date).format('MMM DD, YYYY')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">
                          No activity logs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <CardFooter className="d-flex align-items-center justify-content-end">
              <Paginations
                currentPage={page}
                totalItems={totalLogs}
                limit={limit}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ActivityLogsPage
