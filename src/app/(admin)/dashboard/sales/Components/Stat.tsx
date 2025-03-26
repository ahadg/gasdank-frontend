'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Row, Col, Card, CardBody, Button, Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'

export const metadata: Metadata = { title: 'Dashboard Stats' }

export interface StatType {
  title: string
  icon: string
  count: string
  change: number
  variant: 'danger' | 'success'
}

interface StatTypeExtended extends StatType {
  permissionKey: string
}

/**
 * Convert a JavaScript Date to a local ISO string suitable for <input type="datetime-local">
 * For example, "2025-06-24T07:00"
 */
function toLocalDateTimeString(date: Date) {
  // Adjust for the user's local time zone offset
  const offsetMs = date.getTime() - date.getTimezoneOffset() * 60000
  const localDate = new Date(offsetMs)
  // Format to YYYY-MM-DDTHH:MM (slice(0,16) cuts off seconds and milliseconds)
  return localDate.toISOString().slice(0, 16)
}

const Stat = () => {
  const user = useAuthStore((state) => state.user)

  // Set default start date to today at 00:00 local time
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return toLocalDateTimeString(today)
  })

  // Set default end date to "now" in local time
  const [endDate, setEndDate] = useState(() => {
    const now = new Date()
    return toLocalDateTimeString(now)
  })

  const [statData, setStatData] = useState<StatTypeExtended[]>([])
  const [loading, setLoading] = useState(false)

  // Build the stats
  const fetchStats = async () => {
    if (!user?._id) return

    setLoading(true)
    try {
      // Build query params
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)

      // Example: GET /api/users/stats/<USER_ID>?startDate=...&endDate=...
      const url = `/api/users/stats/${user._id}?${queryParams.toString()}`
      const response = await api.get(url)
      const data = response.data

      // Build statData array from the API response
      const stats: StatTypeExtended[] = [
        {
          title: 'Total Sales',
          permissionKey: 'today_sales',
          icon: 'solar:case-round-minimalistic-bold-duotone',
          count: data.totalSales,
          change: data.totalSalesChange,
          variant: data.totalSalesChange < 0 ? 'danger' : 'success',
        },
        {
          title: 'Total Profit',
          permissionKey: 'today_profit',
          icon: 'solar:bill-list-bold-duotone',
          count: data.totalProfit,
          change: data.totalProfitChange,
          variant: data.totalProfitChange < 0 ? 'danger' : 'success',
        },
        {
          title: 'Inventory Value',
          permissionKey: 'inventory_value',
          icon: 'solar:wallet-money-bold-duotone',
          count: data.inventoryValue,
          change: data.inventoryValueChange,
          variant: data.inventoryValueChange < 0 ? 'danger' : 'success',
        },
        {
          title: "Client's Outstanding Balance",
          permissionKey: 'clients_outstanding_balance',
          icon: 'solar:eye-bold-duotone',
          count: data.ClientoutPayableBalances || '0',
          change: data.outstandingBalancesChange,
          variant: data.outstandingBalancesChange < 0 ? 'danger' : 'success',
        },
        {
          title: "Company's Outstanding Balance",
          permissionKey: 'company_outstanding_balance',
          icon: 'solar:eye-bold-duotone',
          count: String(Math.abs(Number(data.companyPayableBalance))),
          change: data.outstandingBalancesChange,
          variant: data.outstandingBalancesChange < 0 ? 'danger' : 'success',
        },
        {
          title: `${user?.firstName} Cash`,
          permissionKey: 'user_balance',
          icon: 'solar:eye-bold-duotone',
          count: data.loggedInUserTotalBalance,
          change: data.loggedInUserTotalBalance,
          variant: data.loggedInUserTotalBalance < 0 ? 'danger' : 'success',
        },
        {
          title: 'Company Balances',
          permissionKey: 'company_balance',
          icon: 'solar:eye-bold-duotone',
          count: data.companyBalance,
          change: data.companyBalanceChange,
          variant: data.companyBalanceChange < 0 ? 'danger' : 'success',
        },
        {
          title: 'Online Balances',
          permissionKey: 'online_balance',
          icon: 'solar:eye-bold-duotone',
          count: data.onlineBalance,
          change: data.onlineBalanceChange,
          variant: data.onlineBalanceChange < 0 ? 'danger' : 'success',
        },
      ]

      // Filter out stats that user does not have access to
      const userStats = user?.access?.dashboard_stats || {}
      const filteredStats = stats.filter((stat) => userStats[stat.permissionKey] === true)
      setStatData(filteredStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats initially (and re-fetch whenever user, startDate, or endDate changes)
  useEffect(() => {
    fetchStats()
  }, [user, startDate, endDate])

  return (
    <div>
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
          {/* <Col md={4} className="d-flex align-items-center">
            <Button variant="primary" onClick={fetchStats} className="mt-2">
              Apply Filter
            </Button>
          </Col> */}
        </Row>
      </Form>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1 text-center">
          {statData.map((item, idx) => (
            <Col key={idx}>
              <Card>
                <CardBody>
                  <h5 className="text-muted fs-13 text-uppercase" title={item.title}>
                    {item.title}
                  </h5>
                  <div className="d-flex align-items-center justify-content-center gap-2 my-2 py-1">
                    <div className="user-img fs-42 flex-shrink-0">
                      <span className="avatar-title text-bg-primary rounded-circle fs-22">
                        <IconifyIcon icon={item.icon} />
                      </span>
                    </div>
                    <h3 className="mb-0 fw-bold">{item.count}</h3>
                  </div>
                  {/* <p className="mb-0 text-muted">
                    <span className={`text-${item.variant} me-2`}>
                      {item.change}%{' '}
                      {item.variant === 'danger' ? (
                        <IconifyIcon icon="tabler:caret-down-filled" />
                      ) : (
                        <IconifyIcon icon="tabler:caret-up-filled" />
                      )}
                    </span>
                    <span className="text-nowrap">Since last month</span>
                  </p> */}
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default Stat
