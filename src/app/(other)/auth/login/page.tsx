"use client"

import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import LoginForm from './components/LoginForm'
import { Button, Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { Metadata } from 'next'
import { currentYear, developedBy } from '@/context/constants'
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/authStore'
import axios from 'axios'

// export const metadata: Metadata = { title: 'Log In' }

const LoginPage = () => {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)


  return (
    <>
      <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
        <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
       
        
            
            
              {/* <p className="text-muted mb-4">Enter your email address and password to access admin panel.</p> */}
              {/* <div className="d-flex justify-content-center gap-2 mb-3">
                <Button variant='soft-danger' className="avatar-lg"> <span> <IconifyIcon width={24} height={24} icon='tabler:brand-google-filled' className="fs-24" /></span></Button>
                <Button variant='soft-success' className="avatar-lg"> <span> <IconifyIcon width={24} height={24} icon='tabler:brand-apple' className="fs-24" /></span></Button>
                <Button variant='soft-primary' className="avatar-lg"> <span> <IconifyIcon width={24} height={24} icon='tabler:brand-facebook' className="fs-24" /></span></Button>
                <Button variant='soft-info' className="avatar-lg"> <span> <IconifyIcon width={24} height={24} icon='tabler:brand-linkedin' className="fs-24" /></span></Button>
              </div> */}
              {/* <p className="fs-13 fw-semibold">Or Login With Email</p> */}
              <LoginForm />
              {/* <p className="text-danger fs-14 mb-4">Don&apos;t have an account? <Link href="/auth/register" className="fw-semibold text-dark ms-1">Sign Up !</Link></p>
              <p className="mt-auto mb-0">
                 {currentYear} © Osen - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
              </p> */}
           
        
        </Row>
      </div>
    </>
  )
}

export default LoginPage