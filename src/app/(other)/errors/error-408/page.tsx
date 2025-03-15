import React from 'react'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import error408Img from '@/assets/images/error/error-408.png'
import Image from 'next/image'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { Metadata } from 'next'
import { currentYear, developedBy } from '@/context/constants'

export const metadata: Metadata = { title: 'Error 408' }

const Error408Page = () => {
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
            <Link href="/dashboard/sales" className="auth-brand mb-3">
              <Image src={logoDark} alt="dark logo" height={24} className="logo-dark" />
              <Image src={logo} alt="logo light" height={24} className="logo-light" />
            </Link>
            <div className="mx-auto text-center">
              <h3 className="fw-semibold mb-2">Oooh No ! </h3>
              <Image src={error408Img} alt="error 408 img" height={230} />
              <h3 className="fw-bold mt-3 text-primary lh-base">Error 408 Request Time Out</h3>
              <h5 className="fw-bold mt-2 text-dark lh-base">The Server Timed Out Waiting For The Client&apos;s Request.</h5>
              <p className="text-muted fs-12 mb-3">The server did not receive a complete request message within the time that it was prepared to wait.</p>
              <Link href="/dashboard/sales" className="btn btn-primary">Back To Home <IconifyIcon icon='tabler:home' className="ms-1" /></Link>
            </div>
            <p className="mt-3 mb-0">
               {currentYear} © Osen - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
            </p>
          </Card>
        </Col>
      </Row>
    </div>

  )
}

export default Error408Page