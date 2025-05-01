'use client'

import { useState, useEffect } from 'react'
import { Card, Col, Row, Button, Spinner } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'

export default function PlansPage() {
  const { showNotification } = useNotificationContext()

  const [plans, setPlans] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  async function fetchData() {
    try {
      const [plansRes, userRes] = await Promise.all([
        api.get('/api/systemsettings'),
        api.get('/api/users/me')
      ])
      setPlans(plansRes.data.plans || [])
      setUser(userRes.data.user)
      setSelectedPlan(userRes.data.user.plan)
    } catch (err: any) {
      console.error('Failed to load plans or user', err)
      showNotification({ message: 'Failed to load data.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  const handleSubscribe = async (planName: string, stripePriceId: string) => {
    console.log("palnnn",{old_plan : user.plan, new_plan : planName})
    setLoading(true)
    if (!user?._id) {
      showNotification({ message: 'User not found.', variant: 'danger' })
      return
    }
  
    try {
      setSubscribing(true)
      const res = await api.post('/api/stripe/create-checkout-session', {
        user_id: user._id,
        priceId: stripePriceId,
        isUpgrade: planName !== user.plan, // 💥 if choosing different plan than current
        plan : planName
      })
  
      if (res.data) {
        showNotification({ message: 'Plan Updated Successfully.', variant: 'success' })
        await fetchData()
        //window.location.href = res.data.url
      } else {
        showNotification({ message: 'Failed to initiate Stripe checkout.', variant: 'danger' })
      }
    } catch (err: any) {
      setLoading(false)
      console.error('Checkout session error', err)
      showNotification({ message: 'Something went wrong.', variant: 'danger' })
    } finally {
      setLoading(false)
      setSubscribing(false)
    }
  }
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4 text-center">Choose Your Plan</h2>

      <Row className="justify-content-center">
        {plans.length > 0 ? (
          plans.map((plan) => {
            const isSelected = selectedPlan === plan.name
            return (
              <Col key={plan.name} md={4} className="d-flex align-items-stretch">
                <Card
                  className={`flex-fill text-center rounded-4 shadow-sm p-4 ${
                    isSelected ? 'border-primary bg-light' : 'border-0 bg-white'
                  }`}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    borderWidth: isSelected ? '2px' : '1px',
                  }}
                  onClick={() => handleSubscribe(plan.name, plan.stripePriceId)}
                >
                  <div className="mb-3">
                    <h5 className="fw-bold">{plan.name.toUpperCase()}</h5>
                    <h2 className="fw-bold mt-2">
                      ${plan.price}
                      <small className="fs-6">/month</small>
                    </h2>
                  </div>

                  <ul className="list-unstyled small text-muted text-start my-4">
                    {plan.features?.map((feature: string) => (
                      <li key={feature} className="mb-2">✔️ {feature}</li>
                    ))}
                  </ul>

                  <Button
                    variant={isSelected ? 'primary' : 'outline-primary'}
                    className="rounded-pill px-4 mt-auto"
                    disabled={subscribing}
                  >
                    {isSelected ? 'Current Plan' : 'Subscribe'}
                  </Button>
                </Card>
              </Col>
            )
          })
        ) : (
          <div className="text-center text-muted">No plans available</div>
        )}
      </Row>
    </div>
  )
}
