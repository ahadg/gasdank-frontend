'use client'
import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, Plus, X, GripVertical, LayoutGrid, Info, Wallet, CreditCard, Bitcoin, DollarSign, Package, Users, Building, FileText, Lock, EyeOff, Shield } from 'lucide-react'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthStore } from '@/store/authStore'

// Mock data for demonstration - replace with your actual API calls
const mockUser = { _id: '123', access: { dashboard_stats: { today_sales: true, today_profit: true, inventory_value: true, clients_outstanding_balance: true, company_outstanding_balance: true, company_balance: true } } }
const mockApiCall = (url: string) => Promise.resolve({ data: { user: mockUser, totalSales: '45,230', totalSalesChange: 12, totalProfit: '8,450', totalProfitChange: -3, inventoryValue: '125,680', inventoryValueChange: 8, clientPayableBalances: '15,200', companyPayableBalance: '-8,900', companyBalance: '89,450', companyBalanceChange: 15 } })
const mockShowNotification = ({ message, variant }: { message: string, variant: string }) => console.log(`${variant}: ${message}`)

export interface StatType {
  title: string
  icon: string
  count: string
  change: number
  variant: 'danger' | 'success'
}

interface StatTypeExtended extends StatType {
  permissionKey: string
  id: string
  category: 'financial' | 'sales' | 'inventory' | 'other'
}

interface FinancialBalance {
  type: 'Cash' | 'EFT' | 'Crypto'
  amount: string
  iconName: string
  color: string
}

function toLocalDateTimeString(date: Date) {
  const offsetMs = date.getTime() - date.getTimezoneOffset() * 60000
  const localDate = new Date(offsetMs)
  return localDate.toISOString().slice(0, 19)
}

// Drag and Drop utility functions
const handleDragStart = (e: React.DragEvent, index: number) => {
  e.dataTransfer.setData('text/plain', index.toString())
  e.currentTarget.classList.add('opacity-50')
}

const handleDragEnd = (e: React.DragEvent) => {
  e.currentTarget.classList.remove('opacity-50')
}

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  e.currentTarget.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-50')
}

const handleDragLeave = (e: React.DragEvent) => {
  e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50')
}

const handleDrop = (e: React.DragEvent, dropIndex: number, items: any[], setItems: (items: any[]) => void) => {
  e.preventDefault()
  e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50')

  const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))

  if (dragIndex === dropIndex) return

  const newItems = [...items]
  const [draggedItem] = newItems.splice(dragIndex, 1)
  newItems.splice(dropIndex, 0, draggedItem)

  setItems(newItems)

  // In a real app, save layout preference
  console.log('Saving layout:', newItems.map(item => item.id))
}

// Icon utility function
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'wallet': return Wallet
    case 'creditcard': return CreditCard
    case 'bitcoin': return Bitcoin
    case 'solar:case-round-minimalistic-bold-duotone': return FileText
    case 'solar:bill-list-bold-duotone': return DollarSign
    case 'solar:box-bold-duotone': return Package
    case 'solar:users-group-rounded-bold-duotone': return Users
    case 'solar:buildings-bold-duotone': return Building
    case 'solar:card-bold-duotone': return CreditCard
    default: return FileText
  }
}

// Access Denied/Locked Page Component
const AccessDeniedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Icon Container */}
          <div className="mb-6">
            <div className="relative inline-flex">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-gray-800" />
              </div>
            </div>
          </div>

          {/* Title and Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h1>
          <p className="text-gray-600 mb-2">
            You don't have permission to access the dashboard statistics.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This area requires specific permissions that are not currently granted to your account.
          </p>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <EyeOff className="w-4 h-4" />
              <span>Dashboard statistics are hidden due to permission restrictions, Try switching to a different page.</span>
            </div>
          </div>
          {/* Contact Support */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              If you believe this is a mistake, please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact Stats Loader Component
const StatsLoader = () => {
  const placeholders = Array(6).fill(0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {placeholders.map((_, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      ))}
    </div>
  )
}

// Compact Financial Overview Widget Component
const FinancialOverview = ({
  balances,
  editingBalance,
  setEditingBalance,
  newBalance,
  setNewBalance,
  reason,
  setReason,
  updateBalance
}: {
  balances: FinancialBalance[]
  editingBalance: string
  setEditingBalance: (type: string) => void
  newBalance: string
  setNewBalance: (value: string) => void
  reason: string
  setReason: (value: string) => void
  updateBalance: (type: string) => void
}) => {
  const [activeTab, setActiveTab] = useState('all')

  const totalAmount = balances.reduce((sum, balance) => sum + parseFloat(balance.amount || '0'), 0)

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success': return 'bg-emerald-50 text-emerald-600'
      case 'info': return 'bg-blue-50 text-blue-600'
      case 'warning': return 'bg-amber-50 text-amber-600'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Financial Overview</h3>
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
          <Wallet className="w-3 h-3 text-white" />
        </div>
      </div>

      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900">${totalAmount.toLocaleString()}</h2>
        <p className="text-xs text-gray-500">Total Balance</p>
      </div>

      <div className="flex bg-gray-100 rounded p-0.5 mb-3 text-xs">
        {['all', 'cash', 'eft', 'crypto'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 px-2 font-medium rounded transition-all duration-200 ${activeTab === tab
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="min-h-0">
        {activeTab === 'all' ? (
          <div className="space-y-1">
            {balances.map((balance, idx) => {
              const IconComponent = getIconComponent(balance.iconName)

              return (
                <div key={idx} className="flex items-center justify-between p-1.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${getColorClasses(balance.color)}`}>
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{balance.type}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">${balance.amount}</span>
                </div>
              )
            })}
          </div>
        ) : (
          (() => {
            const selectedBalance = balances.find(b => b.type.toLowerCase() === activeTab)
            if (!selectedBalance) return null
            const SelectedIconComponent = getIconComponent(selectedBalance.iconName)

            return (
              <div className="text-center py-2">
                <div className={`w-8 h-8 rounded flex items-center justify-center mx-auto mb-2 ${getColorClasses(selectedBalance.color)}`}>
                  <SelectedIconComponent className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">${selectedBalance.amount}</h3>
                <p className="text-xs text-gray-500 mb-2">{selectedBalance.type} Balance</p>

                {editingBalance === `${selectedBalance.type} Balance` ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Add Balance"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateBalance(`${selectedBalance.type} Balance`)}
                        className="flex-1 bg-emerald-600 text-white py-1 px-2 rounded text-xs font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setEditingBalance('')
                          setNewBalance('')
                          setReason('')
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-1 px-2 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingBalance(`${selectedBalance.type} Balance`)}
                    className="inline-flex items-center gap-1 bg-blue-600 text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                )}
              </div>
            )
          })()
        )}
      </div>
    </div>
  )
}

// Compact Regular Stat Widget Component
const StatWidget = ({
  item,
  index,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isCustomizationMode
}: {
  item: StatTypeExtended
  index: number
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, index: number) => void
  isCustomizationMode: boolean
}) => {
  const IconComponent = getIconComponent(item.icon)

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 transition-all duration-200 hover:shadow-md hover:border-gray-300 ${isCustomizationMode ? 'cursor-move hover:ring-1 hover:ring-blue-400' : ''
        }`}
      draggable={isCustomizationMode}
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate pr-1" title={item.title}>
          {item.title}
        </h3>
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <IconComponent className="w-3 h-3 text-white" />
          </div>
          {isCustomizationMode && (
            <GripVertical className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      <div className="mb-1">
        <h2 className="text-lg font-bold text-gray-900 leading-tight">{item.count}</h2>
      </div>

      {item.change !== 0 && (
        <div className="flex items-center gap-1">
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${item.variant === 'success'
            ? 'text-emerald-600'
            : 'text-red-600'
            }`}>
            {item.change > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(item.change)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default function Stat() {
  const { user } = useAuthStore()
  const [startDate, setStartDate] = useState(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    oneWeekAgo.setHours(0, 0, 0, 0)
    return toLocalDateTimeString(oneWeekAgo)
  })

  const [endDate, setEndDate] = useState(() => {
    const now = new Date()
    now.setDate(now.getDate() + 2)
    return toLocalDateTimeString(now)
  })

  const [statData, setStatData] = useState<StatTypeExtended[]>([])
  const [loading, setLoading] = useState(false)
  const [editingBalance, setEditingBalance] = useState<string>('')
  const [newBalance, setNewBalance] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [balance, setBalance] = useState<number>(0)
  const [otherBalance, setOtherBalance] = useState<any>({ EFT: 0, Crypto: 0 })
  const [isCustomizationMode, setIsCustomizationMode] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const { showNotification } = useNotificationContext()

  const fetchStats = async () => {
    if (!user?._id) return

    setLoading(true)
    setAccessDenied(false) // Reset access denied state

    try {
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append('startDate', startDate)
      if (endDate) queryParams.append('endDate', endDate)

      const url = `/api/users/stats/${user._id}?${queryParams.toString()}`
      const response = await api.get(url)
      const data = response.data

      setUserData(data.user)
      setBalance(data.groupCashBalance || 0)
      setOtherBalance(data?.other_balance || { EFT: 0, Crypto: 0 })

      const stats: StatTypeExtended[] = [
        {
          id: 'total-sales',
          title: 'Total Sales',
          permissionKey: 'today_sales',
          icon: 'solar:case-round-minimalistic-bold-duotone',
          count: data.totalSales || '0',
          change: data.totalSalesChange || 0,
          variant: (data.totalSalesChange || 0) < 0 ? 'danger' : 'success',
          category: 'sales',
        },
        {
          id: 'total-profit',
          title: 'Total Profit',
          permissionKey: 'today_profit',
          icon: 'solar:bill-list-bold-duotone',
          count: data.totalProfit || '0',
          change: data.totalProfitChange || 0,
          variant: (data.totalProfitChange || 0) < 0 ? 'danger' : 'success',
          category: 'sales',
        },
        {
          id: 'inventory-value',
          title: 'Inventory Value',
          permissionKey: 'inventory_value',
          icon: 'solar:wallet-money-bold-duotone',
          count: data.inventoryValue || '0',
          change: data.inventoryValueChange || 0,
          variant: (data.inventoryValueChange || 0) < 0 ? 'danger' : 'success',
          category: 'inventory',
        },
        {
          id: 'clients-payable',
          title: "Company Client's Payable Balance (Clients owe to us)",
          permissionKey: 'clients_outstanding_balance',
          icon: 'solar:eye-bold-duotone',
          count: data.clientPayableBalances || '0',
          change: data.outstandingBalancesChange || 0,
          variant: (data.outstandingBalancesChange || 0) < 0 ? 'danger' : 'success',
          category: 'other',
        },
        {
          id: 'company-payable',
          title: "Company Payable Balance (Total Amount Owed to Clients)",
          permissionKey: 'company_outstanding_balance',
          icon: 'solar:eye-bold-duotone',
          count: String(Math.abs(Number(data.companyPayableBalance) || 0)),
          change: data.outstandingBalancesChange || 0,
          variant: (data.outstandingBalancesChange || 0) < 0 ? 'danger' : 'success',
          category: 'other',
        },
        {
          id: 'company-balance',
          title: 'Company Balances',
          permissionKey: 'company_balance',
          icon: 'solar:eye-bold-duotone',
          count: data.companyBalance || '0',
          change: data.companyBalanceChange || 0,
          variant: (data.companyBalanceChange || 0) < 0 ? 'danger' : 'success',
          category: 'financial',
        },
      ]

      const userStats = data.user?.access?.dashboard_stats || {}
      const filteredStats = stats.filter(stat => userStats[stat.permissionKey] === true)

      // Apply saved layout order if exists
      const savedLayout = localStorage.getItem('dashboardLayout')
      if (savedLayout) {
        const layoutOrder = JSON.parse(savedLayout)
        const orderedStats = layoutOrder.map((id: string) =>
          filteredStats.find(stat => stat.id === id)
        ).filter(Boolean)
        const remainingStats = filteredStats.filter(stat =>
          !layoutOrder.includes(stat.id)
        )
        setStatData([...orderedStats, ...remainingStats])
      } else {
        setStatData(filteredStats)
      }

    } catch (error: any) {
      console.error('Error fetching stats:', error)

      // Check if it's a 403 Access Denied error
      if (error.response?.status === 403 || error.message?.includes('Access Denied') || error.message?.includes('403')) {
        setAccessDenied(true)
        showNotification({
          message: 'Access denied: You do not have permission to view dashboard statistics',
          variant: 'danger'
        })
      } else {
        showNotification({
          message: error.message || 'Error fetching stats',
          variant: 'danger'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const updateBalance = async (title: string) => {
    if (!newBalance || !user?._id) return

    try {
      let paymentMethod: 'Cash' | 'Crypto' | 'EFT' = 'Cash'

      if (title === "EFT Balance") {
        paymentMethod = 'EFT'
      } else if (title === "Crypto Balance") {
        paymentMethod = 'Crypto'
      } else {
        paymentMethod = 'Cash'
      }

      const amount = parseInt(newBalance)

      await api.post('/api/balance/update', {
        amount,
        method: paymentMethod
      })

      // Create description with reason if provided
      let description = `${amount} ${paymentMethod} from dashboard,`
      if (reason.trim()) {
        description += ` reason : \n${reason.trim()}`
      }

      // Log activity
      await api.post(`/api/activity/${user._id}`, {
        page: 'dashboard',
        action: "UPDATE",
        resource_type: "balance_modification",
        type: "balance_modification",
        payment_method: paymentMethod,
        description,
        user_id: user._id,
        user_created_by: user.created_by,
        amount
      })

      showNotification({
        message: 'Balance updated successfully',
        variant: 'success'
      })

      // Refresh stats after update
      fetchStats()
      setEditingBalance('')
      setNewBalance('')
      setReason('')

    } catch (error: any) {
      console.error('Error updating balance:', error)
      showNotification({
        message: error.response?.data?.message || error.message || 'Error updating balance',
        variant: 'danger'
      })
    }
  }

  const financialBalances: FinancialBalance[] = [
    {
      type: 'Cash',
      amount: balance?.toString() || '0',
      iconName: 'wallet',
      color: 'success'
    },
    {
      type: 'EFT',
      amount: otherBalance?.EFT?.toString() || '0',
      iconName: 'creditcard',
      color: 'info'
    },
    {
      type: 'Crypto',
      amount: otherBalance?.Crypto?.toString() || '0',
      iconName: 'bitcoin',
      color: 'warning'
    }
  ]

  useEffect(() => {
    fetchStats()
  }, [user, startDate, endDate])

  // If access is denied, show the locked page
  if (accessDenied) {
    return <AccessDeniedPage />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <Calendar className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <Calendar className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={() => setIsCustomizationMode(!isCustomizationMode)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${isCustomizationMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {isCustomizationMode ? (
                  <>
                    <X className="w-4 h-4" />
                    Exit Customize
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4" />
                    Customize Layout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Customization Mode Alert */}
        {isCustomizationMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <span className="font-medium">Customization Mode:</span> Drag widgets to reorder your dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Compact Stats Grid */}
        {loading ? (
          <StatsLoader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Financial Overview Widget - Takes 2 columns on larger screens */}
            <FinancialOverview
              balances={financialBalances}
              editingBalance={editingBalance}
              setEditingBalance={setEditingBalance}
              newBalance={newBalance}
              setNewBalance={setNewBalance}
              reason={reason}
              setReason={setReason}
              updateBalance={updateBalance}
            />

            {/* Other Stat Widgets */}
            {statData.map((item, idx) => (
              <StatWidget
                key={item.id}
                item={item}
                index={idx}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e, dropIndex) => handleDrop(e, dropIndex, statData, setStatData)}
                isCustomizationMode={isCustomizationMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}