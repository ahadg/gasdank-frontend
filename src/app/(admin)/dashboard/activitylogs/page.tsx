'use client'
import { useState, useEffect } from "react"
import PageTitle from "@/components/PageTitle"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import Image from "next/image"
import Link from "next/link"
import { Button, Card, CardFooter, CardHeader, Col, Row, Form, Badge } from "react-bootstrap"
import Paginations from "./component/Paginations"
import EditInveortyTransactionModal from "./component/EditInventoryModal"
import EditedTransactionsModal from "./component/ViewEditTransactionsModal"
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
  console.log("activityData",activityData)
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

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  console.log("editingTransactionId",editingTransactionId)
  // History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [viewingTransactionId, setViewingTransactionId] = useState<string | null>(null)

  // State to track edited transactions
  const [editedTransactions, setEditedTransactions] = useState<Set<string>>(new Set())

  const user = useAuthStore((state) => state.user)

  const fetchActivityData = async () => {
    setLoading(true)
    try {
      const res = await api.get(
        `/api/activity/${user?._id}?page=${page}&limit=${limit}&type=${activityType}&from=${startDate}&end=${endDate}`
      )
      setActivityData(res.data.logs)
      setTotalLogs(res.data.totallogs)
      console.log("res.data",res.data)
      // Check which transactions are edited
      const transactionIds = res.data.logs
        .filter((log: any) => log.transaction_id)
        .map((log: any) => log.transaction_id)
      
      if (transactionIds.length > 0) {
        checkEditedTransactions(transactionIds)
      }
    } catch (error: any) {
      console.log("err", error.response)
      showNotification({ message: error?.response?.data?.error || 'Error fetching activity logs', variant: 'danger' })
      console.error('Error fetching activity logs:', error)
    }
    setLoading(false)
  }

  const checkEditedTransactions = async (transactionIds: string[]) => {
    try {
      // You might want to create a batch endpoint for this, but for now we'll check individually
      const editedSet = new Set<string>()
      
      // For demonstration, we'll check a few transactions
      // In production, you might want to add an endpoint that returns edited status for multiple transactions
      const promises = transactionIds.slice(0, 5).map(async (id) => {
        try {
          const res = await api.get(`/api/transaction/${id}`)
          if (res.data.edited) {
            editedSet.add(id)
          }
        } catch (err) {
          // Transaction might not exist or access denied, ignore
        }
      })
      
      await Promise.all(promises)
      setEditedTransactions(editedSet)
    } catch (error) {
      console.error('Error checking edited transactions:', error)
    }
  }

  const handleEditClick = (activityItem: any) => {
    if ( (activityItem.type === 'inventory_addition'  || activityItem.type === 'sale') && activityItem.transaction_id) {
      console.log("activityItem.transaction_id",activityItem.transaction_id[0]?._id)
      setEditingTransactionId(activityItem.transaction_id[0]?._id)
      setShowEditModal(true)
    } else {
      showNotification({ 
        message: 'This activity cannot be edited or missing transaction ID', 
        variant: 'warning' 
      })
    }
  }

  const handleViewHistoryClick = (activityItem: any) => {
    if (activityItem.transaction_id) {
      setViewingTransactionId(activityItem.transaction_id[0]?._id)
      setShowHistoryModal(true)
    }
  }

  const handleModalClose = () => {
    setShowEditModal(false)
    setEditingTransactionId(null)
  }

  const handleHistoryModalClose = () => {
    setShowHistoryModal(false)
    setViewingTransactionId(null)
  }

  const handleTransactionUpdated = () => {
    // Refresh the activity data after successful update
    fetchActivityData()
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
                            <option value="user_created">User</option>
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
                      <th>Status</th>
                      <th>Actions</th>
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
                              {item?.worker?.length > 0 ? `${item?.worker?.[0]?.firstName} ${item?.worker?.[0]?.lastName} (W)`: `${item.user_id?.firstName} ${item.user_id?.lastName}`}
                               
                              </Link>
                            </h5>
                          </td>
                          <td>
                            {item.buyer_id?.firstName} {item.buyer_id?.lastName}
                          </td>
                          <td>{item.type?.split("_").length < 2 ? item?.type : item.type?.split("_")[0] + ' ' + item.type?.split("_")?.[1]}</td>
                          <td>
                            <div className="mb-1">{item?.description} - {item?.type == "expense_created" && "@" + item?.amount + "$ "}</div>
                            {item.notes && <div className="text-muted small">Note: {item.notes}</div>}
                          </td>
                          <td>{moment(item.date).format('MMM DD, YYYY')}</td>
                          <td>
                            {item.transaction_id?.[0]?.edited && (
                              <Badge bg="warning" className="me-1">
                                <IconifyIcon icon="solar:pen-2-line-duotone" className="me-1" />
                                Edited
                              </Badge>
                            )}
                            {!item.transaction_id && <span className="text-muted">-</span>}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {(item.type === 'inventory_addition' || item.type === 'sale') && item.transaction_id && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEditClick(item)}
                                >
                                  <IconifyIcon icon="solar:pen-2-line-duotone" className="me-1" />
                                  Edit
                                </Button>
                              )}
                              
                              {item.transaction_id?.[0]?.edited && (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => handleViewHistoryClick(item)}
                                >
                                  <IconifyIcon icon="solar:history-line-duotone" className="me-1" />
                                  History
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center">
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

      {/* Edit Transaction Modal */}
      <EditInveortyTransactionModal
        show={showEditModal}
        onHide={handleModalClose}
        transactionId={editingTransactionId}
        onTransactionUpdated={handleTransactionUpdated}
      />

      {/* View Transaction History Modal */}
      <EditedTransactionsModal
        show={showHistoryModal}
        onHide={handleHistoryModalClose}
        transactionId={viewingTransactionId}
      />
    </>
  )
}

export default ActivityLogsPage