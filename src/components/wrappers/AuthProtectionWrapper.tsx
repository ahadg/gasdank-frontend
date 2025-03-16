'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import FallbackLoading from '../FallbackLoading'
import { useAuthStore } from '@/store/authStore'
import type { ChildrenType } from '@/types/component-props'

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { push } = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user) // Assume that user contains the token/info

  useEffect(() => {
    if (!user) {
      push(`/auth/login?redirectTo=${pathname}`)
    }
  }, [user, push, pathname])

  if (!user) {
    return <FallbackLoading />
  }

  return <Suspense fallback={<FallbackLoading />}>{children}</Suspense>
}

export default AuthProtectionWrapper
