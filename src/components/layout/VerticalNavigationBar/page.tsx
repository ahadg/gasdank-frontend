'use client'
import { useState, useEffect, lazy, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { useLayoutContext } from '@/context/useLayoutContext'
import HoverMenuToggle from './components/HoverMenuToggle'
import { Button } from 'react-bootstrap'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'

// Lazy load the AppMenu component
const AppMenu = lazy(() => import('./components/AppMenu'))

const VerticalNavigationBar = () => {
  const { toggleBackdrop } = useLayoutContext()
  const user = useAuthStore((state) => state.user)
  const [filteredMenuItems, setFilteredMenuItems] = useState<any[]>([])
  
  // Complete menu items array
  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'tabler:home',
      // badge: { text: "5", variant: "success" },
      url: '/dashboard/sales',
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: 'tabler:file-analytics',
      // badge: { text: "5", variant: "success" },
      url: '/dashboard/analytics',
    },
    {
      key: 'sale',
      label: 'Sales',
      icon: 'tabler:shopping-bag-edit',
      url: '/apps/sale',
    },
    {
      key: 'wholesale',
      label: 'Wholesale',
      icon: 'tabler:inbox',
      url: '/apps/wholesale',
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: 'tabler:calendar',
      url: '/inventory/products',
    },
    {
      key: 'activitylogs',
      label: 'Activity logs',
      icon: 'tabler:calendar',
      url: '/dashboard/activitylogs',
    },
    {
      key: 'expenses',
      label: 'Expenses',
      icon: 'tabler:moneybag-minus',
      url: '/dashboard/expenses/add',
    },
    {
      key: 'sample',
      label: 'Sample Holdings',
      icon: 'tabler:zoom-question',
      url: '/dashboard/samplesholdings',
    },
    {
      key: 'sampleviewing',
      label: 'Sample Viewing Tool',
      icon: 'tabler:eye-search',
      url: '/dashboard/sampleviewing',
    },
    {
      key: 'sampleviewingmanagement',
      label: 'Sample Viewing Management',
      icon: 'tabler:eye-search',
      url: '/dashboard/sampleviewingworker',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: 'clarity:notification-line',
      url: '/dashboard/notifications',
    },
    {
      key: 'config',
      label: 'Config',
      icon: 'tabler:medical-cross',
      children: [
        {
          key: 'users',
          label: 'Users',
          url: '/config/users',
          parentKey: 'hospital',
        },
        {
          key: 'categories',
          label: 'Categories',
          url: '/config/categories',
          parentKey: 'config',
        },
      ]
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: 'tabler:file-invoice',
      children: [
        {
          key: 'outofstock',
          label: 'Out of stock',
          url: '/reports/outofstock',
          parentKey: 'reports',
        },
        {
          key: 'lowinventory',
          label: 'Low inventory',
          url: '/reports/lowinventory',
          parentKey: 'reports',
        },
      ]
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: 'material-symbols:person',
      url: '/dashboard/profile',
    },
    // Optionally include other items (e.g., logout) handled separately.
  ]

  // Fetch user access data from the backend and filter menu items accordingly.
  useEffect(() => {
    async function fetchUserAccess() {
      if (user && user._id) {
        try {
          const response = await api.get(`/api/users/${user._id}`)
          const userData = response.data
          const access = userData.access || {}
          // Filter out items that have read access false
          const filtered = menuItems.filter(item => {
            if (access[item.key] !== undefined) {
              return access[item.key].read
            }
            return true
          })
          setFilteredMenuItems(filtered)
        } catch (error) {
          console.error("Error fetching user access:", error)
          // Fallback to showing full menu if error occurs
          setFilteredMenuItems(menuItems)
        }
      }
    }
    fetchUserAccess()
  }, [user])

  return (
    <div className="sidenav-menu" id="leftside-menu-container">
      <LogoBox />
      <HoverMenuToggle />
      <button onClick={toggleBackdrop} className="button-close-fullsidebar">
        <span>
          <IconifyIcon icon='tabler:x' className="align-middle" />
        </span>
      </button>
      <SimplebarReactClient>
        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={filteredMenuItems} />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}

export default VerticalNavigationBar
