import PageTitle from "@/components/PageTitle"
import PaymentList from "./components/PaymentList"
import PaymentStat from "./components/PaymentStat"
import { Metadata } from "next"

export const metadata: Metadata = { title: 'Payments' }

const PaymentsPage = () => {
  return (
    <>
      <PageTitle title='Payments' subTitle="Hospital" />
      <PaymentStat />
      <PaymentList />
    </>

  )
}

export default PaymentsPage