"use client"
import HorizontalLayout from '@/components/layout/HorizontalLayout'
import VerticalLayout from '@/components/layout/VerticalLayout'
import AuthProtectionWrapper from '@/components/wrappers/AuthProtectionWrapper'
import { useLayoutContext } from '@/context/useLayoutContext'
import { ChildrenType } from '../../types/component-props'

const AdminLayout = ({ children }: ChildrenType) => {
  const { layoutOrientation } = useLayoutContext()

  return (
    <AuthProtectionWrapper>
      <>
        {layoutOrientation === 'vertical' ?
          <VerticalLayout>
            {children}
          </VerticalLayout>
          :
          <HorizontalLayout>
            {children}
          </HorizontalLayout>
        }
      </>
    </AuthProtectionWrapper>
  )
}

export default AdminLayout