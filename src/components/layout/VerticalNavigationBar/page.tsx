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
  const { user, setUser } = useAuthStore((state) => state)
  const [filteredMenuItems, setFilteredMenuItems] = useState<any[]>([])
  const setSettings = useAuthStore((state) => state.setSettings)
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
      key: 'sample_management',
      label: 'Pending approvals',
      icon: 'tabler:eye-search',
      children: [
        {
          key: 'sampleholdings',
          label: 'Sample Intake / holding',
          // icon: 'tabler:zoom-question',
          url: '/dashboard/samplesholdings',
          parentKey: 'sample_management',
        },
        {
          key: 'sampleviewing',
          label: 'Create Order',
          // icon: 'tabler:eye-search',
          url: '/dashboard/sampleviewing',
          parentKey: 'sample_management',
        },
        {
          key: 'sampleviewingmanagement',
          label: 'work order',
          // icon: 'tabler:eye-search',
          url: '/dashboard/sampleviewingworker',
          parentKey: 'sample_management',
        },
      ]
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
          parentKey: 'config',
        },
        {
          key: 'categories',
          label: 'Categories',
          url: '/config/categories',
          parentKey: 'config',
        },
        {
          key: 'settings',
          label: 'Settings',
          url: '/config/settings',
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

  // Function to filter menu items based on access permissions
  const filterMenuItems = (items, access) => {
    return items.reduce((filtered, item) => {
      // Handle sample_management section
      if (item.key === 'sample_management') {
        // Filter sample_management children based on individual access
        const filteredChildren = item.children?.filter((child) => {
          if (child.key === 'sampleholdings') {
            return access.sampleholdings?.read
          }
          if (child.key === 'sampleviewing') {
            return access.sampleviewing?.read
          }
          if (child.key === 'sampleviewingmanagement') {
            return access.sampleviewingmanagement?.read
          }
          return true
        }) || []

        // Only include sample_management if it has at least one accessible child
        if (filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children: filteredChildren
          })
        }
        return filtered
      }

      // Handle config section with nested structure
      if (item.key === 'config' && access.config) {
        // Filter config children based on nested access
        const filteredChildren = item.children?.filter((child) => {
          console.log("access.config.users?.read", access.config.users?.read)
          if (child.key === 'users') {
            return access.config.users?.read
          }
          if (child.key === 'categories') {
            return access.config.categories?.read
          }
          return true
        }) || []

        // Only include config if it has at least one accessible child
        if (filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children: filteredChildren
          })
        }
        // If no children, don't add the config item at all
        return filtered
      }

      // Handle reports section (similar nested structure)
      if (item.key === 'reports' && access.reports) {
        if (item.children && access.reports.read) {
          filtered.push({
            ...item,
            children: item.children.filter((child) => {
              // Add specific logic for reports children if needed
              return true
            })
          })
        }
        return filtered
      }

      // Handle other sections with regular access structure
      if (access[item.key] !== undefined) {
        if (access[item.key].read) {
          if (item.children) {
            // Include item with filtered children
            filtered.push({
              ...item,
              children: item.children.filter((child) => {
                // Add granular child access logic here if needed
                return true
              })
            })
          } else {
            // Include simple item
            filtered.push(item)
          }
        }
        return filtered
      }

      // Show items that don't have access restrictions (like profile, notifications)
      filtered.push(item)
      return filtered
    }, [])
  }
  let unitOptions = useAuthStore(state => state.settings?.units)
  // Fetch user access data from the backend and filter menu items accordingly.
  useEffect(() => {
    async function fetchUserAccess() {
      //if(!unitOptions) {
      const response = await api.get('/api/personal-settings')
      setSettings(response.data)
      //}
      if (user && user._id) {
        try {
          const response = await api.get(`/api/users/me`)
          const userData = response.data?.user
          const access = userData.access || {}
          console.log("setting_userData", userData)
          setUser(userData)

          // Filter menu items based on access permissions
          const filtered = filterMenuItems(menuItems, access)
          setFilteredMenuItems(filtered)
        } catch (error) {
          console.error("Error fetching user access:", error)
          // Fallback to showing full menu if error occurs
          setFilteredMenuItems(menuItems)
        }
      } else {
        // If no user, show full menu (or handle as needed)
        setFilteredMenuItems(menuItems)
      }
    }
    fetchUserAccess()
  }, [])

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