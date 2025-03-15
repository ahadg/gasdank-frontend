import PageTitle from '@/components/PageTitle'
import { getAllSellers } from '@/helpers/data'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import CustomPagination from './components/CustomPagination'
import SellersCard from './components/SellersCard'

export const metadata: Metadata = { title: 'Sellers' }

const SellersPage = async () => {
  const SellersData = await getAllSellers()
  return (
    <>
      <PageTitle title='Sellers' subTitle="eCommerce" />
      <Row className="row-cols-1 row-cols-md-2 row-cols-lg-3">
        {
          SellersData?.map((item, idx) => (
            <Col xl={4} lg={6} key={idx}>
              <SellersCard {...item} />
            </Col>
          ))
        }
      </Row>
      <div className="d-flex justify-content-end">
        <CustomPagination />
      </div>
    </>
  )
}

export default SellersPage