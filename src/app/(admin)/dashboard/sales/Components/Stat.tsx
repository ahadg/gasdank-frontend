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

const Stat = () => {
  const [statData, setStatData] = useState<StatTypeExtended[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const user = useAuthStore((state) => state.user)
  console.log("startDate",startDate)
  const fetchStats = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)
      const url = `/api/users/stats/${user?._id}?${queryParams.toString()}`
      const response = await api.get(url)
      const data = response.data
      console.log("response...",data)
      // Build statData array from API response with a permission key for each stat.
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
          count: data.ClientoutPayableBalances || 0,
          change: data.outstandingBalancesChange,
          variant: data.outstandingBalancesChange < 0 ? 'danger' : 'success',
        },
        {
          title: "Company's Outstanding Balance",
          permissionKey: 'company_outstanding_balance',
          icon: 'solar:eye-bold-duotone',
          count: Math.abs(Number(data.companyPayableBalance)),
          change: data.outstandingBalancesChange,
          variant: data.outstandingBalancesChange < 0 ? 'danger' : 'success',
        },
        {
          title: `${user?.firstName} Balance`,
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
      // Get the user's dashboard stats access from the fetched data (or you can use user.access.dashboard_stats)
      const userStats = user?.access?.dashboard_stats || {}
      console.log("userStats",userStats)
      const filteredStats = stats.filter(stat => userStats[stat.permissionKey] === true)
      setStatData(filteredStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats initially when user is available
  useEffect(() => {
    //if (user && user._id) {
      fetchStats()
    //}
  }, [user])

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
          <Col md={4}>
            <Button variant="primary" onClick={fetchStats} className="mt-2">
              Apply Filter
            </Button>
          </Col>
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
                  <p className="mb-0 text-muted">
                    <span className={`text-${item.variant} me-2`}>
                      {item.change}% {item.variant === 'danger' ? (
                        <IconifyIcon icon="tabler:caret-down-filled" />
                      ) : (
                        <IconifyIcon icon="tabler:caret-up-filled" />
                      )}
                    </span>
                    <span className="text-nowrap">Since last month</span>
                  </p>
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
