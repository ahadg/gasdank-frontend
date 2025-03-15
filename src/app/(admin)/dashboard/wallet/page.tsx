import PageTitle from "@/components/PageTitle"
import { Col, Row } from "react-bootstrap"
import BalanceCard from "./components/BalanceCard"
import QuickTransferCard from "./components/QuickTransferCard"
import Stat from "./components/Stat"
import TransactionsCard from "./components/TransactionsCard"
import WalletOverviewChart from "./components/WalletOverviewChart"
import { Metadata } from "next"


export const metadata: Metadata = { title: 'E-Wallet Dashboard' }

const WalletPage = () => {
  return (
    <div>
      <PageTitle title="E-Wallet" subTitle="Dashboard" />
      <Row>
        <Col xxl={9}>
          <Stat />
          <WalletOverviewChart />
        </Col>
        <Col xxl={3}>
          <Row>
            <Col md={6} xxl={12}>
              <BalanceCard />
            </Col>
            <Col md={6} xxl={12}>
              <QuickTransferCard />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <TransactionsCard />
        </Col>
      </Row>
    </div>

  )
}

export default WalletPage