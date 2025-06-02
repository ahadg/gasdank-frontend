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
import PaymentTypesChart from './PaymentTypesChart'
import api from '@/utils/axiosInstance'
import ForecastingSection from './ForecastingSection'

function toLocalDateTimeString(date) {
  const offsetMs = date.getTime() - date.getTimezoneOffset() * 60000
  const localDate = new Date(offsetMs)
  return localDate.toISOString().slice(0, 16)
}

const DashboardStats = () => {
  const user = useAuthStore((state) => state.user)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    today.setMonth(today.getMonth() - 1)
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
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotificationContext()

  // State for API data
  const [dashboardData, setDashboardData] = useState({
    topClients: [],
    topProducts: [],
    topCategories: [],
    monthlyRevenue: { data: [], chartData: [], categories: [] },
    sparklineData: { sales: { data: [], total: 0 }, profit: { data: [], total: 0 }, expenses: { data: [], total: 0 } }
  })

  // Dynamic chart options based on API data
  const barChartOpts = {
    chart: {
      height: 380,
      type: 'bar' as const,
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
      categories: dashboardData.monthlyRevenue.categories.length > 0 
        ? dashboardData.monthlyRevenue.categories 
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
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
      data: dashboardData.monthlyRevenue.chartData.length > 0 
        ? dashboardData.monthlyRevenue.chartData 
        : [44, 55, 41, 64, 22, 43, 36, 52, 38, 71]
    }],
  }

  const fetchdata = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        startDate,
        endDate,
        ...(product && product !== '' && { product })
      };

      // Fetch all data in parallel
      const [
        topClientResponse,
        topProductsResponse,
        topCategoriesResponse,
        monthlyRevenueResponse,
        sparklineResponse
      ] = await Promise.all([
        api.get('/api/dashboard/top-clients', { params }),
        api.get('/api/dashboard/top-products', { params }),
        api.get('/api/dashboard/top-categories', { params }),
        api.get('/api/dashboard/monthly-revenue', { params }),
        api.get('/api/dashboard/sparkline-data')
      ]);

      // Update state with fetched data
      setDashboardData({
        topClients: topClientResponse.data.clients || [],
        topProducts: topProductsResponse.data.products || [],
        topCategories: topCategoriesResponse.data.categories || [],
        monthlyRevenue: monthlyRevenueResponse.data || { data: [], chartData: [], categories: [] },
        sparklineData: sparklineResponse.data || { sales: { data: [], total: 0 }, profit: { data: [], total: 0 }, expenses: { data: [], total: 0 } }
      });

      console.log("fetchdata", {
        topClients: topClientResponse.data,
        topProducts: topProductsResponse.data,
        topCategories: topCategoriesResponse.data,
        monthlyRevenue: monthlyRevenueResponse.data,
        sparklineData: sparklineResponse.data
      });
    
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification({ 
        message: error?.response?.data?.error || 'Error fetching dashboard data', 
        variant: 'danger' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdata()
  }, [])

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

  // Handle update button click
  const handleUpdate = () => {
    fetchdata()
  }

  useEffect(() => {
    // Fetch stats data when filters change
    if (user) {
      fetchdata()
    }
  }, [user, startDate, endDate, product])

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
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="shadow-sm"
                  onClick={handleUpdate}
                  disabled={loading}
                >
                  <IconifyIcon icon="tabler:refresh" className="me-1" />
                  {loading ? 'Loading...' : 'Update'}
                </Button>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      
      <ForecastingSection startDate={startDate} endDate={endDate}/>
      {/* Charts & Data Section */}
      <Row className="g-2">
        {/* SparkChart */}
        <Col lg={12} className="mb-2">
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Revenue Trends</h6>
              <Col md={3}>
                <Form.Group>
                  <Form.Select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="border-0 bg-light form-control-sm"
                  >
                    <option value="">All Products</option>
                    {dashboardData.topProducts.map((prod) => (
                      <option key={prod._id} value={prod._id}>{prod.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </CardHeader>
            
            <CardBody className="py-2">
              <SparkChart sparklineData={dashboardData.sparklineData} />
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
                    <Form.Group>
                      <Form.Select
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="border-0 bg-light form-control-sm"
                      >
                        <option value="">All Products</option>
                        {dashboardData.topProducts.map((prod) => (
                          <option key={prod._id} value={prod._id}>{prod.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </CardHeader>
                <CardBody className="py-2">
                  {loading ? (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <ReactApexChart 
                      height={220} 
                      options={barChartOpts} 
                      series={barChartOpts.series} 
                      type="bar" 
                      className="apex-charts" 
                    />
                  )}
                </CardBody>
              </Card>
            </Col>
            
            {/* Payment Types Chart */}
            <Col lg={12} className="mb-2">
              <PaymentTypesChart startDate={startDate} endDate={endDate}/>
            </Col>
          </Row>
        </Col>

        <Col lg={6} md={12}>
          <Row>
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
                  {loading ? (
                    <div className="text-center p-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    </div>
                  ) : (
                    <div>
                      {dashboardData.topCategories.map((category, idx) => (
                        <div key={category._id} className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small text-muted">{category.name}</span>
                            <div className="d-flex align-items-center">
                              <span className="small fw-bold me-2">${category.revenue.toLocaleString()}</span>
                              <span className="text-muted small">{category.percentage}%</span>
                            </div>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar bg-${['primary', 'success', 'info', 'warning', 'danger'][idx % 5]}`} 
                              role="progressbar" 
                              style={{ width: `${category.percentage}%` }}
                              aria-valuenow={category.percentage} 
                              aria-valuemin={0} 
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                      ))}
                      {dashboardData.topCategories.length === 0 && (
                        <div className="text-center text-muted p-3">
                          <p>No category data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

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
                        {loading ? (
                          <tr>
                            <td colSpan={2} className="text-center py-3">
                              <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                            </td>
                          </tr>
                        ) : dashboardData.topProducts.length > 0 ? (
                          dashboardData.topProducts.slice(0, 5).map((item, idx) => (
                            <tr key={item._id}>
                              <td className="py-1">
                                <div className="d-flex align-items-center">
                                  <div className="flex-shrink-0 me-2">
                                    <div className={`avatar avatar-xs bg-soft-${['primary', 'success', 'info', 'warning', 'danger'][idx % 5]} rounded text-${['primary', 'success', 'info', 'warning', 'danger'][idx % 5]}`}>
                                      <span className="avatar-title small">{item.name?.charAt(0)}</span>
                                    </div>
                                  </div>
                                  <div className="flex-grow-1">
                                    <span className="small">
                                      <Link href="/e-commerce/product-details" className="text-reset">
                                        {item?.name}
                                      </Link>
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="text-end py-1">
                                <span className="small fw-bold">${item.revenue.toLocaleString()}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="text-center text-muted py-3">
                              No product data available
                            </td>
                          </tr>
                        )}
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
                    <Form.Group>
                      <Form.Select
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="border-0 bg-light form-control-sm"
                      >
                        <option value="">All Products</option>
                        {dashboardData.topProducts.map((prod) => (
                          <option key={prod._id} value={prod._id}>{prod.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
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
                        {loading ? (
                          <tr>
                            <td colSpan={2} className="text-center py-3">
                              <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                            </td>
                          </tr>
                        ) : dashboardData.topClients.length > 0 ? (
                          dashboardData.topClients.slice(0, 5).map((client, idx) => (
                            <tr key={client._id}>
                              <td className="py-1">
                                <div className="d-flex align-items-center">
                                  <div className="flex-shrink-0 me-2">
                                    <div className={`avatar avatar-xs bg-soft-${['warning', 'danger', 'primary', 'success', 'info'][idx % 5]} rounded text-${['warning', 'danger', 'primary', 'success', 'info'][idx % 5]}`}>
                                      <span className="avatar-title small">
                                        {client.name?.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-grow-1">
                                    <span className="small">{client.name}</span>
                                    {client.email && (
                                      <div className="text-muted" style={{ fontSize: '10px' }}>
                                        {client.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="text-end py-1">
                                <span className="small fw-bold">${client.sales.toLocaleString()}</span>
                                <div className="text-muted" style={{ fontSize: '10px' }}>
                                  {client.transactionCount} orders
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="text-center text-muted py-3">
                              No client data available
                            </td>
                          </tr>
                        )}
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