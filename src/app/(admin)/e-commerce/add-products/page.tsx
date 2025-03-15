import PageTitle from '@/components/PageTitle'
import { currency } from '@/context/constants'
import { Metadata } from 'next'
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'
import DropzoneFormInput from '@/components/form/DropzoneFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export const metadata: Metadata = { title: 'Add Products' }

const AddProductPage = () => {
  return (
    <>
      <PageTitle title="Add Products" subTitle="eCommerce" />
      <Form>
        <Row>
          <Col lg={7}>
            <Card>
              <CardHeader className="border-bottom border-dashed">
                <CardTitle as={'h4'}>Product information</CardTitle>
                <p className="text-muted mb-0">Product Information encompasses all data within an organization
                  pertaining to the products it manufactures, procures, sells, or distributes.</p>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productName" className="form-label">Product Name</label>
                      <Form.Control type="text" id="productName" placeholder="Enter product name"
                             required />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="skuId" className="form-label">SKU Id</label>
                      <Form.Control type="text" id="skuId" placeholder="#19588" required />
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Product Description</label>
                      <Form.Control  as="textarea" id="description" rows={7}
                                placeholder="Short description about the product" defaultValue={''} />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productCode" className="form-label">Product Code</label>
                      <Form.Control type="text" id="productCode" placeholder="PC198866" required />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productCategory" className="form-label">Product Category</label>
                      <Form.Select className="my-1 my-md-0 me-sm-3" data-toggle="select2" id="productCategory">
                        <option>Select Category</option>
                        <option>Electronics</option>
                        <option>Mobile Accessories</option>
                        <option>Games</option>
                        <option>Sports</option>
                        <option>Watches</option>
                        <option>Bags</option>
                        <option>Toys</option>
                        <option>Cloth&apos;s</option>
                        <option>Shoes</option>
                        <option>Fashion</option>
                        <option>Furniture</option>
                      </Form.Select>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productType" className="form-label">Product Type</label>
                      <Form.Select className="my-1 my-md-0 me-sm-3" data-toggle="select2" id="productType">
                        <option>Select Type</option>
                        <option>Simple</option>
                        <option>Classy</option>
                      </Form.Select>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productBrand" className="form-label">Product Brand</label>
                      <Form.Select className="my-1 my-md-0 me-sm-3" data-toggle="select2" id="productBrand">
                        <option>Select Brand</option>
                        <option>Sony</option>
                        <option>Canon</option>
                        <option>Snitch</option>
                        <option>Titan</option>
                        <option>JCB</option>
                        <option>Wood</option>
                        <option>Apple</option>
                        <option>Nike</option>
                      </Form.Select>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productStatus" className="form-label">Status</label>
                      <Form.Select className="my-1 my-md-0 me-sm-3" data-toggle="select2" id="productStatus">
                        <option>Draft</option>
                        <option>Scheduled</option>
                        <option>Published</option>
                        <option>Entertainment</option>
                      </Form.Select>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productVisibility" className="form-label">Visibility</label>
                      <Form.Select className="my-1 my-md-0 me-sm-3" data-toggle="select2" id="productVisibility">
                        <option>Public</option>
                        <option>Hidden</option>
                      </Form.Select>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="basic-datepicker" className="form-label">Publish Date &amp; Time</label>
                      <Form.Control type="text" id="basic-datepicker"
                             placeholder="Basic datepicker" />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productPrice" className="form-label">Price</label>
                      <Form.Control type="number" id="productPrice" placeholder={`${currency}00.00`}
                             required />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productDiscounts" className="form-label">Discounts</label>
                      <Form.Control type="number" id="productDiscounts" placeholder="0%" required />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label htmlFor="productTax" className="form-label">Tax</label>
                      <Form.Select className="my-1 my-md-0 me-sm-3" data-toggle="select2" id="productTax">
                        <option>Select Tax</option>
                        <option>5%</option>
                        <option>8%</option>
                        <option>12%</option>
                        <option>16%</option>
                        <option>20%</option>
                        <option>22%</option>
                      </Form.Select>
                    </div>
                  </Col>
                  <Col lg={4}>
                    <h5>Product Size</h5>
                    <div className="mb-3 pt-2">
                      <label htmlFor="productLength" className="form-label">Length</label>
                      <Form.Control type="number" id="productLength" placeholder="0.00cm" required />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="my-4">
                      <label htmlFor="productBreadth" className="form-label">Breadth</label>
                      <Form.Control type="number" id="productBreadth" placeholder="0.00cm" required />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="my-4">
                      <label htmlFor="productWidth" className="form-label">Width</label>
                      <Form.Control type="number" id="productWidth" placeholder="0.00cm" required />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <h5>Colors</h5>
                    <div className="d-flex flex-wrap align-items-center gap-1 mt-2" role="group"
                         aria-label="Basic checkbox toggle button group">
                      <input type="checkbox" className="btn-check" id="color-dark2" />
                      <label
                        className="btn avatar btn-icon rounded-circle d-flex justify-content-center align-items-center"
                        htmlFor="color-dark2"> <IconifyIcon icon='tabler:circle-filled' className="fs-28 border rounded-circle text-success" /></label>
                      <input type="checkbox" className="btn-check" id="color-yellow2" />
                      <label
                        className="btn avatar btn-icon rounded-circle d-flex justify-content-center align-items-center"
                        htmlFor="color-yellow2"> <IconifyIcon icon='tabler:circle-filled' className="fs-28 border rounded-circle text-warning" /></label>
                      <input type="checkbox" className="btn-check" id="color-white2" />
                      <label
                        className="btn avatar btn-icon rounded-circle d-flex justify-content-center align-items-center"
                        htmlFor="color-white2"> <IconifyIcon icon='tabler:circle-filled' className="fs-28 border rounded-circle text-primary" /></label>
                      <input type="checkbox" className="btn-check" id="color-info" />
                      <label
                        className="btn avatar btn-icon rounded-circle d-flex justify-content-center align-items-center"
                        htmlFor="color-info"> <IconifyIcon icon='tabler:circle-filled' className="fs-28 border rounded-circle text-info" /></label>
                      <input type="checkbox" className="btn-check" id="color-danger" />
                      <label
                        className="btn avatar btn-icon rounded-circle d-flex justify-content-center align-items-center"
                        htmlFor="color-danger"> <IconifyIcon icon='tabler:circle-filled' className="fs-28 border rounded-circle text-danger" /></label>
                      <input type="checkbox" className="btn-check" id="color-black" />
                      <label
                        className="btn avatar btn-icon rounded-circle d-flex justify-content-center align-items-center"
                        htmlFor="color-black"> <IconifyIcon icon='tabler:circle-filled' className="fs-28 border rounded-circle text-dark" /></label>
                      <input type="checkbox" className="btn-check" id="color-light" />
                      <label
                        className="btn avatar btn-icon rounded-circle d-flex justify-content-center align-items-center"
                        htmlFor="color-light"> <IconifyIcon icon='tabler:circle-filled' className="fs-28 border rounded-circle text-light" /></label>
                      <input type="checkbox" className="btn-check" id="color-purple" />
                      <label
                        className="btn avatar btn-icon rounded-circle d-flex justify-content-center align-items-center"
                        htmlFor="color-purple"> <IconifyIcon icon='tabler:circle-filled' className="fs-28 border rounded-circle text-secondary" /></label>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg={5}>
            <Card>
              <CardHeader className="border-bottom border-dashed">
                <CardTitle className="mb-0" as={'h4'}>Product Gallery</CardTitle>
              </CardHeader>
              <CardBody>
                <DropzoneFormInput
                  className=""
                  iconProps={{ icon: 'tabler:cloud-upload', height: 32, width: 32, className: 'mb-1' }}
                  text="Drop your images here, or click to browse"
                  helpText={<span className="text-muted fs-13 ">(1600 x 1200 (4:3) recommended. PNG, JPG and GIF files are allowed )</span>}
                  showPreview
                />
              </CardBody>
              <CardFooter className="border-top border-dashed text-end">
                <div className="d-flex justify-content-end gap-1">
                  <Button variant="primary">Create Product</Button>
                  <Button variant="danger">Cancel</Button>
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default AddProductPage