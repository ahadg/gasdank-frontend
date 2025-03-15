'use client'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useNotificationContext } from '@/context/useNotificationContext'
import useQueryParams from '@/hooks/useQueryParams'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const { push } = useRouter()
  const { showNotification } = useNotificationContext()
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryParams = useQueryParams()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: 'muhmmadahad594@gmail.com',
      password: 'ahad1234',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const login = handleSubmit(async (values: LoginFormFields) => {
    setLoading(true)
    try {
      // Make an axios POST request to your login API endpoint
      const response = await api.post('/api/auth/login', {
        email: values.email,
        password: values.password,
      })
      console.log("response.data",response.data)
      // Assume your API returns an object with a token and user information
      const { token, user } = response.data

      if (token && user) {
        // Update Zustand store with the authentication data
        setAuth(token, user)
        // Optionally, store token in cookie/localStorage if needed here

        // Redirect the user to the dashboard
        push(queryParams['redirectTo'] ?? '/dashboard/sales')
        showNotification({ message: 'Successfully logged in. Redirecting....', variant: 'success' })
      } else {
        showNotification({ message: 'Login failed. Invalid response.', variant: 'danger' })
      }
    } catch (error: any) {
      showNotification({ message: error?.response?.data?.message || 'Login failed', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}

export default useSignIn
