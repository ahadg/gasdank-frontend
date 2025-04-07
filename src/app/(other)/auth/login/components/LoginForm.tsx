'use client'

import { useEffect } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import Link from 'next/link'
import Image from 'next/image'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currentYear, developedBy } from '@/context/constants'
import { useSignIn } from '../useSignIn'

const LoginPinPage = () => {
  const { form, login, loading } = useSignIn()
  const {
    register,
    setValue,
    formState: { errors },
    watch,
  } = form

  const pinValue = watch('pin')

  const handleInputChange = (index: number, value: string) => {
    const pinArray = pinValue.split('')
    pinArray[index] = value
    const newPin = pinArray.join('').padEnd(4, ' ')
    setValue('pin', newPin)
    const nextInput = document.getElementById(`pin-${index + 1}`)
    if (value && nextInput) nextInput.focus()
  }

  useEffect(() => {
    if (!pinValue) setValue('pin', '    ')
  }, [pinValue, setValue])

  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center bg-light">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="shadow-lg border-0 rounded-4 p-4 text-center">
            <Link href="/" className="auth-brand mb-4 d-block">
              <Image src={"https://w.gasdank.net/assets/img/logo-small.png"} alt="dark logo" width={60} height={60} className="logo-dark" />
              {/* <Image src={logo} alt="logo light" height={28} className="logo-light" /> */}
            </Link>

            {/* <h3 className="fw-bold mb-3">Login With PIN</h3> */}
            <p className="text-muted mb-4">
              Use your <strong>username or email</strong> and your <strong>4-digit PIN</strong> to log in.
            </p>

            <Form onSubmit={login} className="text-start mb-3">
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Username or Email</Form.Label>
                <Form.Control
                  type="text"
                  {...register('identifier')}
                  placeholder="Enter username or email"
                  isInvalid={!!errors.identifier}
                  className="py-2 px-3 rounded-3 shadow-sm"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.identifier?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">4 Digit PIN</Form.Label>
                <div className="d-flex gap-2 justify-content-between mt-2">
                  {[0, 1, 2, 3].map((i) => (
                    <Form.Control
                      key={i}
                      id={`pin-${i}`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      className="text-center fs-4 fw-bold rounded-3 shadow-sm border border-secondary-subtle"
                      style={{ width: '50px', height: '50px' }}
                      value={pinValue[i] === ' ' ? '' : pinValue[i] || ''}
                      onChange={(e) => handleInputChange(i, e.target.value)}
                    />
                  ))}
                </div>
                <input type="hidden" {...register('pin')} />
                {errors.pin && <div className="text-danger small mt-2">{errors.pin.message}</div>}
              </Form.Group>

              <div className="mb-4 d-grid">
                <Button type="submit" className="btn btn-primary py-2 fw-semibold" disabled={loading}>
                  {loading ? 'Logging in...' : 'Continue'}
                </Button>
              </div>
{/* 
              <p className="mb-3 text-center text-muted">
                Didn't receive code?{' '}
                <Link href="#" className="link-primary fw-semibold text-decoration-underline">
                  Send Again
                </Link>
              </p> */}
            </Form>

            {/* <p className="text-danger fs-14 mb-4">
              Back To{' '}
              <Link href="/" className="fw-semibold text-dark ms-1">
                Home
              </Link>
            </p>

            <p className="mt-auto mb-0 text-muted small">
              {currentYear} © Osen — Developed by{' '}
              <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">
                {developedBy}
              </span>
            </p> */}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default LoginPinPage