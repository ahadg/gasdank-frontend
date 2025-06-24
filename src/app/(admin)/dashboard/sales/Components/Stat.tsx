'use client'
import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Row, Col, Card, CardBody, Button, Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'

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

function toLocalDateTimeString(date: Date) {
  const offsetMs = date.getTime() - date.getTimezoneOffset() * 60000
  const localDate = new Date(offsetMs)
  return localDate.toISOString().slice(0, 19)
}

// Stats Loader Component
const StatsLoader = () => {
  const placeholders = Array(8).fill(0);
  
  return (
    <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1 text-center">
      {placeholders.map((_, idx) => (
        <Col key={idx}>
          <Card className="animate-pulse">
            <CardBody>
              <div className="bg-light rounded h-4 w-75 mx-auto mb-3"></div>
              <div className="d-flex align-items-center justify-content-center gap-2 my-3 py-1">
                <div className="avatar-title text-bg-light bg-opacity-50 rounded-circle" style={{ width: '48px', height: '48px' }}></div>
                <div className="bg-light rounded h-8" style={{ width: '80px' }}></div>
              </div>
              <div className="bg-light rounded h-6 w-50 mx-auto mt-3"></div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

const Stat = () => {
  const user = useAuthStore((state) => state.user)
  const [startDate, setStartDate] = useState(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    oneWeekAgo.setHours(0, 0, 0, 0)
    return toLocalDateTimeString(oneWeekAgo)
  })
  const [endDate, setEndDate] = useState(() => {
    const now = new Date()
    return toLocalDateTimeString(now)
  })

  const [statData, setStatData] = useState<StatTypeExtended[]>([])
  const [loading, setLoading] = useState(false)

  // State for editing user balance
  const [editingBalance, setEditingBalance] = useState<string>('')
  const [newBalance, setNewBalance] = useState<string>('')
  const { showNotification } = useNotificationContext()
  const [balance, setBalance] = useState<number>()
  const [otherBalance, setOtherBalance] = useState<any>({})
  
  const fetchStats = async () => {
    if (!user?._id) return

    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)
      const url = `/api/users/stats/${user._id}?${queryParams.toString()}`
      const response = await api.get(url)
      const data = response.data
      setBalance(data.loggedInUserTotalBalance)
      setOtherBalance(data.other_balance)
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
          title: 'Eft Balance',
          permissionKey: 'online_balance',
          icon: 'solar:eye-bold-duotone',
          count: data.other_balance?.EFT,
          change: data.onlineBalanceChange,
          variant: data.onlineBalanceChange < 0 ? 'danger' : 'success',
        },
        {
          title: 'Crypto Balance',
          permissionKey: 'online_balance',
          icon: 'solar:eye-bold-duotone',
          count: data.other_balance?.Crypto,
          change: data.onlineBalanceChange,
          variant: data.onlineBalanceChange < 0 ? 'danger' : 'success',
        },
      ]

      const userStats = user?.access?.dashboard_stats || {}
      const filteredStats = stats.filter(stat => userStats[stat.permissionKey] === true)
      setStatData(filteredStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update user cash balance via PUT /api/users/{userId}
  const updateBalance = async (title) => {
    if (!newBalance) return
    try {
      let payment_method = ''
      let update_obj = {}
      if(title === "Eft Balance") {
          update_obj = {
            other_balance : { 
              ...otherBalance,
              EFT : otherBalance?.EFT ? otherBalance?.EFT  + parseInt(newBalance) :  parseInt(newBalance),
            }
          } 
          payment_method = 'EFT'
      } else if(title === "Crypto Balance") {
        update_obj = {
          other_balance : {
            ...otherBalance,
            Crypto : otherBalance?.Crypto ? otherBalance?.Crypto  + parseInt(newBalance) :  parseInt(newBalance),
          }
        } 
        payment_method = 'Crypto'
      } else {
        update_obj = {
          cash_balance: balance + parseInt(newBalance)
        } 
        payment_method = 'Cash'
      }
      
      await api.put(`/api/users/${user._id}`, update_obj)
      await api.post(`/api/activity/${user._id}`, {
        page : 'dashboard',
        action : "UPDATE",
        resource_type : "balance_modification",
        type : "balance_modification",
        payment_method,
        description : `${parseInt(newBalance)} ${payment_method} added from dashboard`,
        user_id : user?._id,
        user_created_by : user?.created_by,
        amount : parseInt(newBalance)
      })
      showNotification({ message: 'Balance updated successfully', variant: 'success' })
      // Refresh stats after update
      fetchStats()
      setEditingBalance('')
      setNewBalance('')
    } catch (error: any) {
      console.error('Error updating balance:', error)
      showNotification({ message: error?.response?.data?.error || 'Error updating balance', variant: 'danger' })
    }
  }

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
        </Row>
      </Form>

      {loading ? (
        <StatsLoader />
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
                  {(item.permissionKey === 'user_balance' || item.title === "Eft Balance" || item.title === "Crypto Balance") && (
                    <div className="d-flex justify-content-center align-items-center mt-2">
                      {editingBalance === item.title ? (
                        <>
                          <Form.Control
                            type="number"
                            placeholder="Add Balance"
                            value={newBalance}
                            onChange={(e) => setNewBalance(e.target.value)}
                            style={{ width: '100px', marginRight: '8px' }}
                          />
                          <Button variant="success" size="sm" onClick={() => updateBalance(item?.title)}>
                            Update
                          </Button>
                          <Button variant="outline-secondary" size="sm" onClick={() => setEditingBalance('')} className="ms-2">
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button variant="link" size="sm" onClick={() => setEditingBalance(item.title)}>
                          <IconifyIcon icon="tabler:plus" /> Add Balance
                        </Button>
                      )}
                    </div>
                  )}
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