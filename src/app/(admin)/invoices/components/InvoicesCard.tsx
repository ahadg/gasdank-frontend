import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllInvoices } from '@/helpers/data'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardFooter, CardHeader, Pagination } from 'react-bootstrap'

const InvoicesCard = async () => {
  const invoiceData = await getAllInvoices()
  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Invoices</h4>
        </div>
        <div className="d-flex flex-wrap flex-lg-nowrap gap-2">
          <div className="flex-shrink-0 d-flex align-items-center gap-2">
            <div className="position-relative">
              <input type="text" className="form-control ps-4" placeholder="Search Here..." />
              <IconifyIcon icon='tabler:search' className="position-absolute top-50 translate-middle-y start-0 ms-2" />
            </div>
          </div>
          <Link href="/invoices/create-invoice" className="btn btn-primary"><IconifyIcon icon='tabler:plus' className="me-1" />Add Invoice</Link>
        </div>
      </CardHeader>
      <div className="table-responsive">
        <table className="table table-hover text-nowrap mb-0">
          <thead className="bg-light-subtle">
            <tr>
              <th className="ps-3" style={{ width: 50 }}>
                <input type="checkbox" className="form-check-input" id="customCheck1" />
              </th>
              <th>Invoice ID</th>
              <th>Category </th>
              <th>Created On</th>
              <th>Invoice To</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th className="text-center" style={{ width: 120 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              invoiceData.map((item, idx) => (
                <tr key={idx}>
                  <td className="ps-3">
                    <input type="checkbox" className="form-check-input" id="customCheck2" />
                  </td>
                  <td><span className="text-muted fw-semibold">#PC1020@{idx}</span></td>
                  <td>{item.products?.category}</td>
                  <td><span className="fs-15 text-muted">{item.products?.date.toLocaleString('en-us', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-sm">
                        {
                          item.users?.image &&
                          <Image src={item.users?.image} alt='avatar' className="img-fluid rounded-circle" />
                        }
                      </div>
                      <h6 className="fs-14 mb-0">{item.users?.name}</h6>
                    </div>
                  </td>
                  <td>${item.amount}</td>
                  <td><span className="fs-15 text-muted">{item.date.toLocaleString('en-us', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
                  <td>
                    <span className={`badge bg-${item.invoicesStatus == 'Pending' ? 'warning' : item.invoicesStatus == 'Cancelled' ? 'danger' : 'success'}-subtle text-${item.invoicesStatus == 'Pending' ? 'warning' : item.invoicesStatus == 'Cancelled' ? 'danger' : 'success'} fs-12 p-1`}>{item.invoicesStatus}</span>
                  </td>
                  <td className="pe-3">
                    <div className="hstack gap-1 justify-content-end">
                      <Button variant='soft-primary' size='sm' className="btn-icon rounded-circle"> <IconifyIcon icon="tabler:eye" /></Button>
                      <Button variant='soft-success' size='sm' className="btn-icon rounded-circle"> <IconifyIcon icon="tabler:edit" className='fs-16' /></Button>
                      <Button variant='soft-danger' size='sm' className="btn-icon rounded-circle"> <IconifyIcon icon="tabler:trash" /></Button>
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
          <Pagination className="mb-0 justify-content-center">
            <Pagination.Item className=" disabled">
              <IconifyIcon icon="tabler:chevrons-left" />
            </Pagination.Item>
            <Pagination.Item>
              1
            </Pagination.Item>
            <Pagination.Item className=" active">
              2
            </Pagination.Item>
            <Pagination.Item>
              3
            </Pagination.Item>
            <Pagination.Item>
              <IconifyIcon icon="tabler:chevrons-right" />
            </Pagination.Item>
          </Pagination>
        </div>
      </CardFooter>
    </Card>
  )
}

export default InvoicesCard