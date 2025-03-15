'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

const SalesPage = dynamic(() => import('@/app/(admin)/dashboard/sales/page'), {
  ssr: false,
})

const DarkMode = () => {
  const { changeTheme } = useLayoutContext()
  useEffect(() => {
    changeTheme('dark')
  }, [])
  return (
    <VerticalLayout>
      <SalesPage />
    </VerticalLayout>
  )
}

export default DarkMode
