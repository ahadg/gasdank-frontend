'use client'
import SalesPage from '@/app/(admin)/dashboard/sales/page'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'

const IconView = () => {
  const { changeMenu } = useLayoutContext()
  useEffect(() => {
    changeMenu.size('condensed')
  }, [])
  return (
    <>
      <VerticalLayout>
        <SalesPage />
      </VerticalLayout>
    </>
  )
}

export default IconView
