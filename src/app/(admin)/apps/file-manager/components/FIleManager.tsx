import React from 'react'
import { Card } from 'react-bootstrap'
import SideBarFile from './SideBarFile'
import QuickAccess from './QuickAccess'
import Link from 'next/link'
import Recent from './Recent'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const FIleManager = () => {

  return (
    <>
      <Card>
        <div className="d-flex">
          <div className='d-sm-none d-xl-block'>
            <SideBarFile />
          </div>
          <div className="w-100 border-start">
            <QuickAccess />
            <div className="px-3 d-flex align-items-center justify-content-between mb-3">
              <h4 className="header-title">Recent</h4>
              <Link href="" className="link-reset fw-semibold text-decoration-underline link-offset-2">View All <IconifyIcon icon="tabler:arrow-right" /></Link>
            </div>
            <Recent />
          </div>
        </div>
      </Card>
    </>
  )
}

export default FIleManager