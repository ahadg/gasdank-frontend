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

const StatCard = ({ title, icon, count, change, variant }: StatType) => {
  return (
    <Card>
      <CardBody>
        <h5 className="text-muted fs-13 text-uppercase" title={title}>
          {title}
        </h5>
        <div className="d-flex align-items-center justify-content-center gap-2 my-2 py-1">
          <div className="user-img fs-42 flex-shrink-0">
            <span className="avatar-title text-bg-primary rounded-circle fs-22">
              <IconifyIcon icon={icon} />
            </span>
          </div>
          <h3 className="mb-0 fw-bold">{count}</h3>
        </div>
        <p className="mb-0 text-muted">
          <span className={`text-${variant} me-2`}>
            {change}%{' '}
            {variant === 'danger' ? (
              <IconifyIcon icon="tabler:caret-down-filled" />
            ) : (
              <IconifyIcon icon="tabler:caret-up-filled" />
            )}
          </span>
          <span className="text-nowrap">Since last month</span>
        </p>
      </CardBody>
    </Card>
  )
}

const Stat = () => {
  const [statData, setStatData] = useState<StatType[]>([])
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)
  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        const response = await api.get(`/api/users/stats/${user?._id}`)
        const data = response.data
        // Build statData array from API response.
        const stats: StatType[] = [
          {
            title: 'Total Sales',
            icon: 'solar:case-round-minimalistic-bold-duotone',
            count: data.totalSales,
            change: data.totalSalesChange,
            variant: data.totalSalesChange < 0 ? 'danger' : 'success',
          },
          {
            title: 'Total Profit',
            icon: 'solar:bill-list-bold-duotone',
            count: data.totalProfit,
            change: data.totalProfitChange,
            variant: data.totalProfitChange < 0 ? 'danger' : 'success',
          },
          {
            title: 'Inventory Value',
            icon: 'solar:wallet-money-bold-duotone',
            count: data.inventoryValue,
            change: data.inventoryValueChange,
            variant: data.inventoryValueChange < 0 ? 'danger' : 'success',
          },
          {
            title: 'Outstanding Balances',
            icon: 'solar:eye-bold-duotone',
            count: data.outstandingBalances,
            change: data.outstandingBalancesChange,
            variant: data.outstandingBalancesChange < 0 ? 'danger' : 'success',
          },
          {
            title: 'Muhammad Balances',
            icon: 'solar:eye-bold-duotone',
            count: 0,
            change: data.outstandingBalancesChange,
            variant: data.outstandingBalancesChange < 0 ? 'danger' : 'success',
          },
          {
            title: 'Company Balances',
            icon: 'solar:eye-bold-duotone',
            count: data.companyBalance,
            change: data.companyBalanceChange,
            variant: data.companyBalanceChange < 0 ? 'danger' : 'success',
          },
        ]
        setStatData(stats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <p>Loading stats...</p>

  return (
    <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1 text-center">
      {statData.map((item, idx) => (
        <Col key={idx}>
          <StatCard {...item} />
        </Col>
      ))}
    </Row>
  )
}

export default Stat
