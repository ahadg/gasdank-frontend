'use client'
import { useState, useEffect } from 'react'
import { Row, Col, Card, CardBody, Button, Form, CardHeader, Dropdown } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'
import SparkChart from '@/app/(admin)/charts/sparklines/components/SparkChart'
import ComponentContainerCard from '@/components/ComponentContainerCard'
import ReactApexChart from 'react-apexcharts'
import { salesProductData } from '../sales/data'
import Link from 'next/link'

function toLocalDateTimeString(date) {
  const offsetMs = date.getTime() - date.getTimezoneOffset() * 60000
  const localDate = new Date(offsetMs)
  return localDate.toISOString().slice(0, 16)
}

const DashboardStats = () => {
  const user = useAuthStore((state) => state.user)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    today.setMonth(today.getMonth() - 1) // Default to last 30 days
    today.setHours(0, 0, 0, 0)
    return toLocalDateTimeString(today)
  })
  const [endDate, setEndDate] = useState(() => {
    const now = new Date()
    return toLocalDateTimeString(now)
  })

  const [clientName, setClientName] = useState("")
  const [product, setProduct] = useState("")
  const [timeRange, setTimeRange] = useState("30d")
  const { showNotification } = useNotificationContext()

  // Sample chart options
  const barChartOpts = {
    chart: {
      height: 380,
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        distributed: true,
        dataLabels: {
          position: 'top'
        },
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      axisBorder: {
        show: false
      },
      labels: {
        style: {
          colors: '#aab8c5',
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return '$' + val.toFixed(0)
        },
        style: {
          colors: '#aab8c5',
        }
      }
    },
    grid: {
      borderColor: '#f1f3fa',
      padding: {
        bottom: 10
      }
    },
    colors: ['#3e60d5', '#47ad77', '#fa5c7c', '#6c757d', '#39afd1', '#2b908f', '#ffbc00', '#f2726f', '#8d6e63', '#1de9b6'],
    series: [{
      name: 'Revenue',
      data: [44, 55, 41, 64, 22, 43, 36, 52, 38, 71]
    }],
  }


  // Handle time range selection
  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
    const now = new Date()
    let start = new Date()
    
    switch(range) {
      case "7d":
        start.setDate(now.getDate() - 7)
        break
      case "30d":
        start.setMonth(now.getMonth() - 1)
        break
      case "90d":
        start.setMonth(now.getMonth() - 3)
        break
      case "ytd":
        start = new Date(now.getFullYear(), 0, 1)
        break
      default:
        start.setMonth(now.getMonth() - 1)
    }
    
    setStartDate(toLocalDateTimeString(start))
    setEndDate(toLocalDateTimeString(now))
  }

  useEffect(() => {
    // Fetch stats data here
  }, [user, startDate, endDate, clientName, product])

  return (
    <div className="dashboard-container">


      {/* Filters */}
      <Card className="shadow-sm border-0 mb-2 mt-3">
        <CardBody className="py-2">
          <Row className="align-items-center">
            <Col lg={9}>
              <Row className="g-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-muted small mb-0">Client</Form.Label>
                    <Form.Select
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="border-0 bg-light form-control-sm"
                    >
                      <option value="">All Clients</option>
                      <option value="client1">Client One</option>
                      <option value="client2">Client Two</option>
                      <option value="client3">Client Three</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-muted small mb-0">Product</Form.Label>
                    <Form.Select
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="border-0 bg-light form-control-sm"
                    >
                      <option value="">All Products</option>
                      <option value="product1">Product One</option>
                      <option value="product2">Product Two</option>
                      <option value="product3">Product Three</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-muted small mb-0">Start Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-0 bg-light form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-muted small mb-0">End Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-0 bg-light form-control-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col lg={3}>
              <div className="text-lg-end mt-2 mt-lg-0">
                <Dropdown className="d-inline-block me-1">
                  <Dropdown.Toggle variant="light" size="sm" className="border-0">
                    <IconifyIcon icon="tabler:calendar" className="me-1" />
                    {timeRange === "7d" ? "Last 7 Days" : 
                     timeRange === "30d" ? "Last 30 Days" : 
                     timeRange === "90d" ? "Last 90 Days" : "Year to Date"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleTimeRangeChange("7d")}>Last 7 Days</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleTimeRangeChange("30d")}>Last 30 Days</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleTimeRangeChange("90d")}>Last 90 Days</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleTimeRangeChange("ytd")}>Year to Date</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Button variant="primary" size="sm" className="shadow-sm">
                  <IconifyIcon icon="tabler:refresh" className="me-1" />
                  Update
                </Button>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Charts & Data Section */}
      <Row className="g-2">
        {/* SparkChart */}
        <Col lg={12} className="mb-2">
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-transparent py-2 border-0">
              <h6 className="mb-0">Revenue Trends</h6>
            </CardHeader>
            <CardBody className="py-2">
              <SparkChart />
            </CardBody>
          </Card>
        </Col>

        {/* Bar Chart */}
        <Col lg={6} md={12}>
          <Row>
            {/* Monthly Revenue */}
            <Col lg={12} className="mb-2">
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Monthly Revenue</h6>
                  <div>
                    <Button variant="light" size="sm" className="btn-sm p-1">
                      <IconifyIcon icon="tabler:download" width={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="py-2">
                  <ReactApexChart 
                    height={220} 
                    options={barChartOpts as any} 
                    series={barChartOpts.series} 
                    type="bar" 
                    className="apex-charts" 
                  />
                </CardBody>
              </Card>
            </Col>
            
            {/* Top Categories */}
            <Col lg={12} className="mb-2">
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Top Categories</h6>
                  <div>
                    <Button variant="light" size="sm" className="btn-sm p-1">
                      <IconifyIcon icon="tabler:filter" width={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="py-2">
                  {/* Category Progress Bars */}
                  <div>
                    {[
                      { name: "Electronics", percentage: 65, color: "primary", amount: "$12,490" },
                      { name: "Clothing", percentage: 48, color: "success", amount: "$9,238" },
                      { name: "Accessories", percentage: 35, color: "info", amount: "$6,710" },
                      { name: "Home & Kitchen", percentage: 27, color: "warning", amount: "$5,172" },
                      { name: "Books", percentage: 16, color: "danger", amount: "$3,061" }
                    ].map((category : any, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small text-muted">{category.name}</span>
                          <div className="d-flex align-items-center">
                            <span className="small fw-bold me-2">{category.amount}</span>
                            <span className="text-muted small">{category.percentage}%</span>
                          </div>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                        <div
                            className={`progress-bar bg-${category.color}`} 
                            role="progressbar" 
                            style={{ width: `${category.percentage}%` }}
                            aria-valuenow={category.percentage} 
                            aria-valuemin={0} 
                            aria-valuemax={100}
                            />

                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Top Products Section */}
        <Col lg={6} md={12}>
          <Row>
            {/* Top Selling Products */}
            <Col lg={12} className="mb-2">
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Top Selling Products</h6>
                  <div>
                    <Button variant="light" size="sm" className="btn-sm p-1">
                      <IconifyIcon icon="tabler:eye" width={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="py-1">Product</th>
                          <th className="text-end py-1">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesProductData.slice(0, 5).map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1">
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 me-2">
                                  <div className={`avatar avatar-xs bg-soft-${['primary', 'success', 'info', 'warning', 'danger'][idx % 5]} rounded text-${['primary', 'success', 'info', 'warning', 'danger'][idx % 5]}`}>
                                    <span className="avatar-title small">{item.name.charAt(0)}</span>
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <span className="small">
                                    <Link href="/e-commerce/product-details" className="text-reset">
                                      {item.name}
                                    </Link>
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="text-end py-1">
                              <span className="small fw-bold">${item.amount}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Top Clients */}
            <Col lg={12} className="mb-2">
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Top Clients</h6>
                  <div>
                    <Button variant="light" size="sm" className="btn-sm p-1">
                      <IconifyIcon icon="tabler:eye" width={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="py-1">Client</th>
                          <th className="text-end py-1">Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesProductData.slice(0, 5).map((item :any, idx) => (
                          <tr key={idx}>
                            <td className="py-1">
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 me-2">
                                  <div className={`avatar avatar-xs bg-soft-${['warning', 'danger', 'primary', 'success', 'info'][idx % 5]} rounded text-${['warning', 'danger', 'primary', 'success', 'info'][idx % 5]}`}>
                                    <span className="avatar-title small">
                                      {['A', 'B', 'C', 'D', 'E'][idx % 5]}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <span className="small">Client {idx + 1}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-end py-1">
                              <span className="small fw-bold">${(item.amount * 1.2).toFixed(2)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardStats