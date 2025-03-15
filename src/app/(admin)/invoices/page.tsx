import mastercardImg from "@/assets/images/cards/mastercard.svg"
import visaImg from "@/assets/images/cards/visa.svg"
import PageTitle from "@/components/PageTitle"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import Image from "next/image"
import Link from "next/link"
import { Col, Row } from "react-bootstrap"
import InvoicesCard from "./components/InvoicesCard"
import InvoicesStat from "./components/InvoicesStat"
import { Metadata } from "next"

export const metadata: Metadata = { title: 'Invoices' }

const InvoicesPage = () => {
  return (
    <>
      <PageTitle title='Invoices' subTitle="Invoice" />
      <InvoicesStat />
      <div className="d-flex flex-wrap flex-lg-nowrap align-items-center gap-2 mb-3">
        <div className="d-inline-flex align-items-center gap-2 me-auto">
          <h5 className="mb-0 fs-14 text-muted">Last Updated a minute ago</h5>
          <Link href=""><IconifyIcon icon='tabler:refresh' className="align-middle fs-16" /></Link>
        </div>
        <div className="d-inline-flex flex-wrap align-items-center gap-1">
          <Link href=""><Image src={mastercardImg} alt="master card img" height={24} /></Link>
          <Link href=""><Image src={visaImg} alt="vis card img" height={24} /></Link>
          <p className="mb-0">Invoice get paid 3x faster with online payments, <Link href="" className="fw-medium">Turn On Payments</Link></p>
        </div>
      </div>
      <Row>
        <Col xs={12}>
          <InvoicesCard />
        </Col>
      </Row>
    </>
  )
}

export default InvoicesPage