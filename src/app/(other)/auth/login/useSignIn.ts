'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'
import useQueryParams from '@/hooks/useQueryParams'

const schema = yup.object({
  identifier: yup.string().required('Username or email is required'),
  pin: yup
    .string()
    .matches(/^\d{4}$/, 'PIN must be exactly 4 digits')
    .required('PIN is required'),
})

type FormData = yup.InferType<typeof schema>

export const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const setAuth = useAuthStore((state) => state.setAuth)
  const setSettings = useAuthStore((state) => state.setSettings)
  const queryParams = useQueryParams()
  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      identifier: '',
      pin: '',
    },
  })

  const { setValue } = form

  // Load identifier from localStorage on mount
  useEffect(() => {
    const savedIdentifier = localStorage.getItem('last_login_identifier')
    if (savedIdentifier) {
      setValue('identifier', savedIdentifier)
    }
  }, [setValue])

  const login = form.handleSubmit(async ({ identifier, pin }) => {
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { identifier, pin })
      const { token, user } = res.data

      if (token && user) {
        localStorage.setItem('last_login_identifier', identifier) // ✅ Save for next time
        setAuth(token, user)
        const response = await api.get('/api/personal-settings')
        setSettings(response.data)
        showNotification({ message: 'Login successful', variant: 'success' })
        console.log("user_user",user)
        const currentPath = user?.access?.dashboard?.read ? '/dashboard/sales' : '/apps/sale'
        router.push(queryParams['redirectTo'] ?? currentPath)
      } else {
        showNotification({ message: 'Invalid login response', variant: 'danger' })
      }
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.message || 'Login failed',
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  })

  return { form, login, loading }
}
