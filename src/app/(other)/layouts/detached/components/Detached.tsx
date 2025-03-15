'use client'
// import SalesPage from '@/app/(admin)/dashboard/sales/page'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

const SalesPage = dynamic(() => import('@/app/(admin)/dashboard/sales/page'), {
  ssr: false,
})

const Detached = () => {
  const { changeLayoutMode } = useLayoutContext()
  useEffect(() => {
    changeLayoutMode('detached')
  }, [])
  return <>
    <VerticalLayout>
      <SalesPage />
    </VerticalLayout>
  </>
}

export default Detached