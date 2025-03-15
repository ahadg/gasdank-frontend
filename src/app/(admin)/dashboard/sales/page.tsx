
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Activity from './Components/Activity'
import BrandsListingCard from './Components/BrandsListingCard'
import EstimatedCard from './Components/EstimatedCard'
import Orders from './Components/Orders'
import OverviewChart from './Components/OverviewChart'
import SalesPageTitle from './Components/SalesPageTitle'
import SellingProductsCard from './Components/SellingProductsCard'
import Stat from './Components/Stat'
import TrafficSourceChart from './Components/TrafficSourceChart'
import { Card, Col, Row } from 'react-bootstrap'
import { Metadata } from 'next'

// export const metadata: Metadata = { title: 'Sales' }

const SalesPage = () => {
  return (
    <div>
      <SalesPageTitle />
      <Row>
        <Col>
          <Stat />
          {/* <Row>
            <OverviewChart />
          </Row> */}
        </Col>
      </Row>
    </div>

  )
}

export default SalesPage