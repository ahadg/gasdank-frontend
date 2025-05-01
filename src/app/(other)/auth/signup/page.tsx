'use client'

import { useState, useEffect } from 'react'
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

const stepOneSchema = yup.object({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  userName: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('PIN is required')
    .matches(/^[0-9]{4}$/, 'PIN must be exactly 4 digits'),
  phone: yup.string().required('Phone is required'),
}).required()

type StepOneFormData = yup.InferType<typeof stepOneSchema>

const SignupPage = () => {
  const { showNotification } = useNotificationContext()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [loading, setLoading] = useState(false)

  const form = useForm<StepOneFormData>({
    resolver: yupResolver(stepOneSchema),
  })

  const { register, handleSubmit, formState: { errors }, getValues } = form

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await api.get('/api/systemsettings')
        setPlans(res.data.plans || [])
      } catch (err) {
        showNotification({ message: 'Failed to load plans', variant: 'danger' })
      }
    }
    fetchPlans()
  }, [])

  const onSubmitStepOne = () => {
    setCurrentStep(2)
  }

  const handleFinalSignup = async () => {
    const formData = getValues()
    const payload = {
      ...formData,
      plan: selectedPlan,
      role: "admin"
    }

    setLoading(true)
    try {
      const userres = await api.post('/api/users/signup', payload)
      const checkoutRes = await api.post('/api/stripe/create-checkout-session', {
        priceId: plans.find(p => p.name === selectedPlan)?.stripePriceId,
        user_id: userres?.data?.user?.id,
        plan: selectedPlan,
      })

      if (checkoutRes.data?.url) {
        window.location.href = checkoutRes.data.url
      } else {
        showNotification({ message: 'Failed to initiate Stripe checkout.', variant: 'danger' })
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      showNotification({ message: error?.response?.data?.error || 'Signup failed', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center bg-light">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="shadow-lg border-0 rounded-4 p-4 text-center">
            <Link href="/" className="auth-brand mb-3 d-block">
              <Image src={logoT} alt="Logo" width={60} height={60} className="logo-dark" />
            </Link>

            <p className="text-muted mb-3 fs-6">
              Start your journey with <span className="fw-semibold text-primary">60 Days Free</span>
            </p>

            <div className="d-flex justify-content-center gap-5 mb-4">
              {[1, 2].map((step) => (
                <div className="text-center" key={step}>
                  <div
                    className={`rounded-circle border d-flex justify-content-center align-items-center mx-auto shadow ${
                      currentStep === step ? 'bg-primary text-white' : 'bg-light text-muted'
                    }`}
                    style={{
                      width: '45px',
                      height: '45px',
                      transition: 'all 0.3s ease',
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    {step}
                  </div>
                  <div className={`small mt-2 fw-semibold ${currentStep === step ? 'text-primary' : 'text-muted'}`}>
                    {step === 1 ? 'User Info' : 'Select Plan'}
                  </div>
                </div>
              ))}
            </div>

            <Form onSubmit={handleSubmit(onSubmitStepOne)} className="text-start">
              {currentStep === 1 && (
                <>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label className="fw-semibold">First Name</Form.Label>
                      <Form.Control
                        {...register('firstName')}
                        isInvalid={!!errors.firstName}
                        placeholder="First Name"
                        className="py-2 px-3 rounded-3 shadow-sm"
                      />
                      <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-semibold">Last Name</Form.Label>
                      <Form.Control
                        {...register('lastName')}
                        isInvalid={!!errors.lastName}
                        placeholder="Last Name"
                        className="py-2 px-3 rounded-3 shadow-sm"
                      />
                      <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Username</Form.Label>
                    <Form.Control
                      {...register('userName')}
                      isInvalid={!!errors.userName}
                      placeholder="Username"
                      className="py-2 px-3 rounded-3 shadow-sm"
                    />
                    <Form.Control.Feedback type="invalid">{errors.userName?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control
                      type="email"
                      {...register('email')}
                      isInvalid={!!errors.email}
                      placeholder="Email address"
                      className="py-2 px-3 rounded-3 shadow-sm"
                    />
                    <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">PIN (4 Digits)</Form.Label>
                    <Form.Control
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      {...register('password')}
                      isInvalid={!!errors.password}
                      placeholder="Enter 4-digit PIN"
                      className="py-2 px-3 rounded-3 shadow-sm text-center"
                      maxLength={4}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Phone</Form.Label>
                    <Form.Control
                      {...register('phone')}
                      isInvalid={!!errors.phone}
                      placeholder="Phone number"
                      className="py-2 px-3 rounded-3 shadow-sm"
                    />
                    <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-grid mb-2">
                    <Button type="submit" className="btn btn-primary py-2 fw-semibold">
                      Next
                    </Button>
                  </div>
                </>
              )}
            </Form>

            {currentStep === 2 && (
              <>
                {/* <p className="text-muted mb-4 text-center">
                  Select a plan to get started – <span className="fw-semibold text-success">60 Days Free</span>
                </p> */}
                {plans.length > 0 ? (
                  plans.map((plan) => {
                    const isSelected = selectedPlan === plan.name
                    return (
                      <Card
                        key={plan.name}
                        className={`position-relative mb-3 p-4 rounded-4 shadow-sm ${
                          isSelected ? 'border-primary bg-light' : 'border-0 bg-white'
                        }`}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                          borderWidth: isSelected ? '2px' : '1px',
                        }}
                        onClick={() => setSelectedPlan(plan.name)}
                      >
                        <span className="badge bg-success position-absolute top-0 end-0 m-2">60 Days Free</span>

                        <h5 className="mb-2 fw-bold">{plan.name.toUpperCase()}</h5>
                        <h4 className="fw-bold mb-3">
                          ${plan.price} <small className="fs-6 text-muted">/ month</small>
                        </h4>
                        <ul className="list-unstyled text-muted small mb-0">
                          {plan.features?.map((feat: string) => (
                            <li key={feat} className="mb-2">✔️ {feat}</li>
                          ))}
                        </ul>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center text-muted">Loading plans...</div>
                )}

                <div className="d-grid mt-4">
                  <Button
                    onClick={handleFinalSignup}
                    disabled={!selectedPlan || loading}
                    className="btn btn-success py-2 fw-semibold"
                    style={{ transition: 'background 0.3s ease', fontSize: '1rem' }}
                  >
                    {loading ? 'Signing up...' : 'Complete Signup & Start Free Trial'}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SignupPage
