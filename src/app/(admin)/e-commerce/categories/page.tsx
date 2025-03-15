import ChoicesFormInput from "@/components/form/ChoicesFormInput"
import PageTitle from "@/components/PageTitle"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import { getProducts } from "@/helpers/data"
import { Metadata } from "next"
import Image from "next/image"
import { Button, Card, CardFooter, CardHeader, Col, Form, Pagination, Row } from "react-bootstrap"

export const metadata: Metadata = { title: 'Categories' }

const CategoriesPage = async () => {
  const categoriesData = await getProducts()
  return (
    <>
      <PageTitle title='Categories' subTitle="eCommerce" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader className="border-bottom border-light">
              <Row className="justify-content-between gy-2 position-relative">
                <Col lg={3}>
                  <div className="position-relative">
                    <Form.Control type="text" className="ps-4" placeholder="Search Company" />
                    <IconifyIcon icon='tabler:search' className="position-absolute top-50 translate-middle-y ms-2" />
                  </div>
                </Col>
                <Col sm={6} xl={4} xxl={3}>
                  <form>
                    <div className="d-flex flex-wrap flex-lg-nowrap gap-2">
                      <div className="flex-grow-1">
                        <ChoicesFormInput className="form-select my-1 my-md-0 me-sm-3" data-toggle="select2" id="select">
                          <option>10</option>
                          <option>20</option>
                          <option>25</option>
                          <option>30</option>
                          <option>50</option>
                        </ChoicesFormInput>
                      </div>
                      <button type="button" className="btn btn-primary"><IconifyIcon icon='tabler:plus' className="me-1" />Add Category</button>
                    </div>
                  </form>
                </Col>
              </Row>
            </CardHeader>
            <div className="table-responsive">
              <table className="table table-hover text-nowrap mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th className="ps-3" style={{ width: 50 }}>
                      <input type="checkbox" className="form-check-input" id="customCheck1" />
                    </th>
                    <th>Categories</th>
                    <th>Average Price Range</th>
                    <th>Best Selling Items</th>
                    <th>Customer Rating (1-5)</th>
                    <th>Discounts Available</th>
                    <th>Status</th>
                    <th className="text-center" style={{ width: 120 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    categoriesData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="ps-3">
                          <input type="checkbox" className="form-check-input" id="customCheck2" />
                        </td>
                        <td>
                          <div className="d-flex justify-content-start align-items-center gap-3">
                            <div className="avatar-md">
                              <Image src={item.image} alt="Product-1" className="img-fluid rounded-2" />
                            </div>
                            <div className="d-flex flex-column">
                              <span className="fw-medium text-nowrap">{item.category}</span>
                              <span className="text-dark fw-semibold">Brand : {item.brand.map((brand, idx) => (<span key={idx} className="fw-normal">{brand},&nbsp;</span>))} </span>
                            </div>
                          </div>
                        </td>
                        <td>${item.averagePriceMin} - ${item.averagePriceMax}</td>
                        <td>{item.sellingItems.map((sell, idx) => (<span key={idx}>{sell},&nbsp;</span>))}</td>
                        <td> <span className="badge p-1 bg-light text-dark fs-12 me-1"><IconifyIcon icon='tabler:star-filled' className="align-text-top fs-14 text-warning me-1" />{item.rating.star}</span></td>
                        <td>{item.discountsAvailable}</td>
                        <td>
                          <span className={`badge bg-${item.status == 'Inactive' ? 'danger' : 'success'}-subtle text-${item.status == 'Inactive' ? 'danger' : 'success'} fs-12 p-1`}>{item.status}</span>
                        </td>
                        <td className="pe-3">
                          <div className="hstack gap-1 justify-content-end">
                            <Button variant="soft-primary" size="sm" className="btn-icon rounded-circle"> <IconifyIcon icon="tabler:eye" /></Button>
                            <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle"> <IconifyIcon icon="tabler:trash" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            <CardFooter>
              <div className="d-flex justify-content-end">
                <Pagination className="pagination pagination-boxed pagination-sm mb-0 justify-content-center">
                  <Pagination.Item className=" disabled">
                    <IconifyIcon icon="tabler:chevron-left" />
                  </Pagination.Item>
                  <Pagination.Item className=" active">
                    1
                  </Pagination.Item>
                  <Pagination.Item>
                    2
                  </Pagination.Item>
                  <Pagination.Item>
                    3
                  </Pagination.Item>
                  <Pagination.Item>
                    <IconifyIcon icon="tabler:chevron-right" />
                  </Pagination.Item>
                </Pagination>
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default CategoriesPage