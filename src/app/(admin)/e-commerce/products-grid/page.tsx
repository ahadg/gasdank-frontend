import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import CategoryMenu from './components/CategoryMenu'
import CustomPagination from './components/CustomPagination'
import Products from './components/Products'
import Stat from './components/Stat'

export const metadata: Metadata = { title: 'Products Grid' }

const ProductsGridPage = () => {
  return (
    <>
      <PageTitle title='Products Grid' subTitle="eCommerce" />
      <Row>
        <CategoryMenu />
        <Col xxl={9}>
          <Stat />
          <Products />
          <Row className="mb-4 align-items-center">
            <div className="col-sm">
              <div className="text-muted">
                Showing <span className="fw-semibold">10</span> of <span className="fw-semibold">35</span> Results
              </div>
            </div>
            <Col sm={'auto'} className="mt-3 mt-sm-0">
              {/* <nav>
                <CustomPagination />
              </nav> */}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}

export default ProductsGridPage