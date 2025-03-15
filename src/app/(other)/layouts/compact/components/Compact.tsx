'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const SalesPage = dynamic(() => import('@/app/(admin)/dashboard/sales/page'), {
  ssr: false,
})

const Compact = () => {
  const router = useRouter()
  const { changeMenu } = useLayoutContext()
  useEffect(() => {
    changeMenu.size('compact')
  }, [])
  return (
    <>
      <VerticalLayout>
        <SalesPage />
      </VerticalLayout>
    </>
  )
}

export default Compact
