'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Row, Col, Card, CardBody } from 'react-bootstrap'
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
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        const response = await api.get(`/api/users/stats/${user?._id}`)
        const data = response.data
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
            count: data.ClientoutPayableBalances,
            change: data.outstandingBalancesChange,
            variant: data.outstandingBalancesChange < 0 ? 'danger' : 'success',
          },
          {
            title: "Company's Outstanding Balance",
            permissionKey: 'company_outstanding_balance',
            icon: 'solar:eye-bold-duotone',
            count: Math.abs(data.company_payable_balance),
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
        // Filter out stat cards for which the user does not have access
        const userStats = data?.user?.access?.dashboard_stats || {}
        const filteredStats = stats.filter(stat => userStats[stat.permissionKey] === true)
        setStatData(filteredStats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    if (user && user._id) {
      fetchStats()
    }
  }, [user])

  if (loading) return <p>Loading stats...</p>

  return (
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
                  {item.change}% {item.variant === 'danger' ? (
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
  )
}

export default Stat
