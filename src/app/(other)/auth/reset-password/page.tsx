'use client'

import { useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import Link from 'next/link'
import Image from 'next/image'
import logoT from '@/assets/images/logoT.png'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required('PIN is required')
    .matches(/^[0-9]{4}$/, 'PIN must be exactly 4 digits'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'PINs must match')
    .required('Confirm PIN is required'),
}).required()

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>

const ResetPasswordPage = () => {
  const { showNotification } = useNotificationContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)

  const form = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  })

  const { register, handleSubmit, watch, formState: { errors } } = form
  const pinValue = watch('password', '')

  const handleInputChange = (index: number, value: string, fieldName: string) => {
    const pinArray = fieldName === 'password' ? 
      pinValue.split('') : 
      watch('confirmPassword', '').split('')
    
    pinArray[index] = value
    const newPin = pinArray.join('').padEnd(4, ' ')
    
    if (fieldName === 'password') {
      form.setValue('password', newPin)
    } else {
      form.setValue('confirmPassword', newPin)
    }
    
    const nextInput = document.getElementById(`${fieldName}-${index + 1}`)
    if (value && nextInput) nextInput.focus()
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      showNotification({ message: 'Reset token is missing', variant: 'danger' })
      return
    }

    setLoading(true)
    try {
      await api.post('/api/users/reset-password', {
        token,
        password: data.password,
      })
      
      setResetComplete(true)
      showNotification({ 
        message: 'Your PIN has been reset successfully!',
        variant: 'success' 
      })
    } catch (error: any) {
      console.error('Error resetting password:', error)
      showNotification({ 
        message: error?.response?.data?.error || 'Unable to reset your PIN. The link may be expired or invalid.',
        variant: 'danger' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center bg-light">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="shadow-lg border-0 rounded-4 p-4 text-center">
            <Link href="/" className="auth-brand mb-4 d-block">
              <Image src={logoT} alt="Logo" width={60} height={60} className="logo-dark" />
            </Link>

            {!resetComplete ? (
              <>
                <h3 className="fw-bold mb-3">Reset Your PIN</h3>
                <p className="text-muted mb-4">
                  Please enter your new 4-digit PIN below.
                </p>

                <Form onSubmit={handleSubmit(onSubmit)} className="text-start mb-3">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">New PIN</Form.Label>
                    <div className="d-flex gap-2 justify-content-between mt-2">
                      {[0, 1, 2, 3].map((i) => (
                        <Form.Control
                          key={i}
                          id={`password-${i}`}
                          type="password"
                          maxLength={1}
                          inputMode="numeric"
                          className="text-center fs-4 fw-bold rounded-3 shadow-sm border border-secondary-subtle"
                          style={{ width: '50px', height: '50px' }}
                          value={pinValue[i] === ' ' ? '' : pinValue[i] || ''}
                          onChange={(e) => handleInputChange(i, e.target.value, 'password')}
                        />
                      ))}
                    </div>
                    <input type="hidden" {...register('password')} />
                    {errors.password && <div className="text-danger small mt-2">{errors.password.message}</div>}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Confirm PIN</Form.Label>
                    <div className="d-flex gap-2 justify-content-between mt-2">
                      {[0, 1, 2, 3].map((i) => (
                        <Form.Control
                          key={i}
                          id={`confirmPassword-${i}`}
                          type="password"
                          maxLength={1}
                          inputMode="numeric"
                          className="text-center fs-4 fw-bold rounded-3 shadow-sm border border-secondary-subtle"
                          style={{ width: '50px', height: '50px' }}
                          onChange={(e) => handleInputChange(i, e.target.value, 'confirmPassword')}
                        />
                      ))}
                    </div>
                    <input type="hidden" {...register('confirmPassword')} />
                    {errors.confirmPassword && <div className="text-danger small mt-2">{errors.confirmPassword.message}</div>}
                  </Form.Group>

                  <div className="mb-4 d-grid">
                    <Button 
                      type="submit" 
                      className="btn btn-primary py-2 fw-semibold" 
                      disabled={loading}
                    >
                      {loading ? 'Resetting...' : 'Reset PIN'}
                    </Button>
                  </div>
                </Form>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-check-circle fs-1 text-success"></i>
                  </div>
                  <h3 className="fw-bold mb-3">PIN Reset Complete</h3>
                  <p className="text-muted mb-4">
                    Your PIN has been reset successfully. You can now log in with your new PIN.
                  </p>
                  <div className="d-grid">
                    <Button 
                      onClick={() => router.push('/auth/login')}
                      className="btn btn-primary py-2 fw-semibold"
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ResetPasswordPage