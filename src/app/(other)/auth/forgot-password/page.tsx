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

const forgotPasswordSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
}).required()

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>

const ForgotPasswordPage = () => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    try {
      await api.post('/api/users/forgot-password', { email: data.email })
      setEmailSent(true)
      showNotification({ 
        message: 'If your email exists in our system, you will receive a password reset link shortly.',
        variant: 'success' 
      })
    } catch (error: any) {
      console.error('Error requesting password reset:', error)
      showNotification({ 
        message: 'Unable to process your request. Please try again later.',
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

            {!emailSent ? (
              <>
                <h3 className="fw-bold mb-3">Forgot Password</h3>
                <p className="text-muted mb-4">
                  Enter your email address and we'll send you a link to reset your PIN.
                </p>

                <Form onSubmit={handleSubmit(onSubmit)} className="text-start mb-3">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      {...register('email')}
                      isInvalid={!!errors.email}
                      placeholder="Enter your email"
                      className="py-2 px-3 rounded-3 shadow-sm"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="mb-4 d-grid">
                    <Button 
                      type="submit" 
                      className="btn btn-primary py-2 fw-semibold" 
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </Form>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-envelope-check fs-1 text-primary"></i>
                  </div>
                  <h3 className="fw-bold mb-3">Check Your Email</h3>
                  <p className="text-muted">
                    We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                  </p>
                </div>
              </>
            )}

            <p className="mb-0 text-center text-muted">
              <Link href="/auth/login" className="link-primary fw-semibold text-decoration-underline">
                Back to Login
              </Link>
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ForgotPasswordPage