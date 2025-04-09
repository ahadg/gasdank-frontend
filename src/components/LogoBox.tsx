import React from 'react'
import logo from '@/assets/images/logo.png'
import logoSm from '@/assets/images/logo-sm.png'
import logoDark from '@/assets/images/logo-dark.png'
import Image from 'next/image'
import Link from 'next/link'

const LogoBox = () => {
  return (
    <Link href="/dashboard/sales" className="logo">
      <span className="logo-light">
        <span className="logo-lg"><Image  src={"https://w.gasdank.net/assets/img/logo-small.png"} width={53} height={55} alt="logo" /></span>
        <span className="logo-sm"><Image  src={"https://w.gasdank.net/assets/img/logo-small.png"}  width={53} height={55} alt="small logo" /></span>
      </span>
      <span className="logo-dark">
        <span className="logo-lg"><Image  src={"https://w.gasdank.net/assets/img/logo-small.png"} width={53} height={55}  alt="dark logo" /></span>
        <span className="logo-sm"><Image  src={"https://w.gasdank.net/assets/img/logo-small.png"} width={53} height={55} alt="small logo" /></span>
      </span>
    </Link>
  )
}

export default LogoBox