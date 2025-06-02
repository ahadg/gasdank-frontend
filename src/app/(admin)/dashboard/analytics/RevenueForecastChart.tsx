// components/RevenueForecastChart.js
'use client'
import React, { useState } from 'react'
import { Card, CardBody, CardHeader, Badge, Alert, Nav, Button, Row, Col, Modal, Table } from 'react-bootstrap'
import ReactApexChart from 'react-apexcharts'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type ChartType = 'line' | 'bar' | 'area';

interface ProductForecast {
  name: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  currentStock: number;
  predictedMonthlySales: number;
  confidence: number;
  daysOfStock: number;
  priority: 'high' | 'moderate' | 'low';
  potentialRevenue: number;
}

const RevenueForecastChart = ({ forecastData, loading }) => {
  const [activeTab, setActiveTab] = useState('profit') // Changed from 'revenue' to 'profit'
  const [chartType, setChartType] = useState<ChartType>('line')
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showInsights, setShowInsights] = useState(false)
  console.log("forecastData", forecastData)
  if (loading) {
    return (
      <Card className="shadow-sm border-0">
        <CardHeader className="bg-transparent py-2 border-0">
          <h6 className="mb-0">
            <IconifyIcon icon="tabler:chart-line" className="me-2" />
            Revenue Forecasting & Analytics
          </h6>
        </CardHeader>
        <CardBody className="py-4">
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Analyzing your sales data and generating forecasts...</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (!forecastData) {
    return (
      <Card className="shadow-sm border-0">
        <CardBody>
          <Alert variant="info">
            <IconifyIcon icon="tabler:info-circle" className="me-2" />
            No forecasting data available. Start making sales to see predictions based on your actual performance!
          </Alert>
        </CardBody>
      </Card>
    )
  }

  // Handle cases where there's no historical data
  const hasHistoricalData = forecastData.historicalData && forecastData.historicalData.some(d => 
    d.revenue > 0 || d.profit > 0 || d.transactions > 0
  );

  // Prepare chart data based on active tab
  const getChartData = () => {
    const categories = [
      ...forecastData.historicalData.map(d => `${d.month} ${d.year}`),
      ...forecastData.forecasts.map(f => `${f.month} ${f.year}`)
    ]

    const getDataKey = () => {
      switch (activeTab) {
        case 'revenue': return 'revenue'
        case 'transactions': return 'transactions'
        default: return 'profit'
      }
    }

    const dataKey = getDataKey()
    const formatValue = (val) => {
      if (activeTab === 'transactions') return val
      return `$${val?.toLocaleString() || 0}`
    }

    const historicalData = forecastData.historicalData.map(d => d[dataKey] || 0)
    const forecastValues = forecastData.forecasts.map(f => {
      switch (dataKey) {
        case 'revenue': return f.predictedRevenue
        case 'transactions': return f.predictedTransactions
        default: return f.predictedProfit
      }
    })

    // Get the last historical value to connect the forecast line
    const lastHistoricalValue = historicalData[historicalData.length - 1] || 0

    return {
      categories,
      series: [{
        name: `Historical ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
        data: [...historicalData, ...Array(forecastValues.length).fill(null)],
        color: activeTab === 'profit' ? '#47ad77' : activeTab === 'revenue' ? '#3e60d5' : '#fd7e14'
      }, {
        name: `Predicted ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
        data: [
          ...Array(historicalData.length - 1).fill(null),
          lastHistoricalValue, // Start forecast from last historical point
          ...forecastValues
        ],
        color: activeTab === 'profit' ? '#7bc98c' : activeTab === 'revenue' ? '#7c8db5' : '#ffad5c'
      }],
      formatValue
    }
  }

  const chartData = getChartData()

  // Chart options
  const chartOptions = {
    chart: {
      height: 350,
      type: chartType,
      toolbar: { 
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true
        }
      },
      zoom: { enabled: true }
    },
    stroke: {
      width: chartType === 'line' ? [3, 3] : [0, 0],
      curve: 'smooth' as const,
      dashArray: [0, 5]
    },
    colors: chartData.series.map(s => s.color),
    dataLabels: { 
      enabled: chartType === 'bar',
      formatter: chartData.formatValue
    },
    legend: {
      show: true,
      position: 'top' as const,
      horizontalAlign: 'left' as const
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: { colors: '#aab8c5' },
        rotate: -45
      }
    },
    yaxis: {
      labels: {
        formatter: chartData.formatValue,
        style: { colors: '#aab8c5' }
      }
    },
    grid: {
      borderColor: '#f1f3fa',
      strokeDashArray: 4
    },
    annotations: {
      xaxis: [{
        x: forecastData.historicalData.length - 0.5,
        borderColor: '#6c757d',
        borderWidth: 2,
        label: {
          text: 'Forecast',
          style: { color: '#fff', background: '#6c757d' }
        }
      }]
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val, { seriesIndex }) => {
          if (val === null) return 'N/A'
          return chartData.formatValue(val)
        }
      }
    },
    fill: {
      type: chartType === 'area' ? 'gradient' : 'solid',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2
      }
    }
  }

  // Get confidence color based on actual confidence levels
  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'success'
    if (confidence >= 50) return 'warning'
    if (confidence >= 30) return 'info'
    return 'secondary'
  }

  // Get trend icon based on trend direction
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return 'tabler:trending-up'
      case 'decreasing': return 'tabler:trending-down'
      default: return 'tabler:minus'
    }
  }

  // Handle product modal
  const handleProductClick = (productId) => {
    const product = forecastData.productForecasts[productId]
    if (product) {
      setSelectedProduct({ id: productId, ...product })
      setShowProductModal(true)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <>
      <Card className="shadow-sm border-0">
        <CardHeader className="bg-transparent py-3 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">
                <IconifyIcon icon="tabler:chart-line" className="me-2" />
                Revenue Forecasting & Analytics
              </h6>
              <small className="text-muted">
                {forecastData.summary?.dataPoints || 0} months of data • 
                {forecastData.summary?.avgConfidence || 0}% avg confidence • 
                {forecastData.summary?.projectedGrowth || 'No trend'}
              </small>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowInsights(!showInsights)}
              >
                <IconifyIcon icon="tabler:bulb" className="me-1" />
                Insights
              </Button>
              <div className="btn-group" role="group">
                {['line', 'bar', 'area'].map(type => (
                  <Button
                    key={type}
                    variant={chartType === type ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setChartType(type as ChartType)}
                  >
                    <IconifyIcon icon={`tabler:chart-${type}`} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Tabs - Reordered to show Profit first */}
          <Nav variant="pills" className="nav-justified mb-3">
            {[
              { key: 'profit', label: 'Profit', icon: 'tabler:trending-up' },
              { key: 'revenue', label: 'Revenue', icon: 'tabler:currency-dollar' },
              { key: 'transactions', label: 'Transactions', icon: 'tabler:shopping-cart' }
            ].map(tab => (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="d-flex align-items-center justify-content-center"
                >
                  <IconifyIcon icon={tab.icon} className="me-1" />
                  {tab.label}
                  {forecastData.trends?.confidence?.[tab.key] && (
                    <Badge 
                      bg={getConfidenceColor(forecastData.trends.confidence[tab.key])}
                      className="ms-2"
                    >
                      {forecastData.trends.confidence[tab.key]}%
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {/* Chart */}
          <div className="mb-4">
            <ReactApexChart
              options={chartOptions}
              series={chartData.series}
              type={chartType}
              height={350}
            />
          </div>

          {/* Summary Cards */}
          <Row className="g-3 mb-4">
            <Col lg={3} sm={6}>
              <Card className="bg-light border-0">
                <CardBody className="text-center py-3">
                  <IconifyIcon icon="tabler:cash" className="fs-2 text-primary mb-2" />
                  <h6 className="mb-1">{formatCurrency(forecastData.summary?.nextMonthRevenue)}</h6>
                  <small className="text-muted">Next Month Revenue</small>
                </CardBody>
              </Card>
            </Col>
            {/* <Col lg={3} sm={6}>
              <Card className="bg-light border-0">
                <CardBody className="text-center py-3">
                  <IconifyIcon icon="tabler:chart-arrows-vertical" className="fs-2 text-success mb-2" />
                  <h6 className="mb-1">{forecastData.summary?.growthRate || 0}%</h6>
                  <small className="text-muted">Growth Rate</small>
                </CardBody>
              </Card>
            </Col> */}
            <Col lg={3} sm={6}>
              <Card className="bg-light border-0">
                <CardBody className="text-center py-3">
                  <IconifyIcon icon="tabler:target" className="fs-2 text-warning mb-2" />
                  <h6 className="mb-1">{forecastData.summary?.avgConfidence || 0}%</h6>
                  <small className="text-muted">Avg Confidence</small>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} sm={6}>
              <Card className="bg-light border-0">
                <CardBody className="text-center py-3">
                  <IconifyIcon icon="tabler:shopping-bag" className="fs-2 text-info mb-2" />
                  <h6 className="mb-1">{forecastData.summary?.totalPredictedTransactions || 0}</h6>
                  <small className="text-muted">Predicted Sales</small>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Market Metrics */}
          {forecastData.marketMetrics && (
            <Row className="g-3 mb-4">
              <Col lg={6}>
                <Card className="border-0 bg-primary bg-opacity-10">
                  <CardBody>
                    <h6 className="text-primary mb-3">
                      <IconifyIcon icon="tabler:chart-pie" className="me-2" />
                      Market Metrics
                    </h6>
                    <Row className="g-2">
                      <Col sm={6}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">CLV:</span>
                          <strong>{formatCurrency(forecastData.marketMetrics.customerLifetimeValue)}</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">AOV:</span>
                          <strong>{formatCurrency(forecastData.marketMetrics.averageOrderValue)}</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Margin:</span>
                          <strong>{forecastData.marketMetrics.profitMargin}%</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Turnover:</span>
                          <strong>{forecastData.marketMetrics.inventoryTurnover}x</strong>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={6}>
                {/* <Card className="border-0 bg-success bg-opacity-10">
                  <CardBody>
                    <h6 className="text-success mb-3">
                      <IconifyIcon icon="tabler:trending-up" className="me-2" />
                      Trend Analysis
                    </h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Revenue Trend:</span>
                      <div className="d-flex align-items-center">
                        <IconifyIcon 
                          icon={getTrendIcon(forecastData.trends?.revenue)} 
                          className={`me-1 ${
                            forecastData.trends?.revenue === 'increasing' ? 'text-success' : 
                            forecastData.trends?.revenue === 'decreasing' ? 'text-danger' : 'text-muted'
                          }`}
                        />
                        <span className="fw-semibold">{forecastData.trends?.revenue || 'stable'}</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Profit Trend:</span>
                      <div className="d-flex align-items-center">
                        <IconifyIcon 
                          icon={getTrendIcon(forecastData.trends?.profit)} 
                          className={`me-1 ${
                            forecastData.trends?.profit === 'increasing' ? 'text-success' : 
                            forecastData.trends?.profit === 'decreasing' ? 'text-danger' : 'text-muted'
                          }`}
                        />
                        <span className="fw-semibold">{forecastData.trends?.profit || 'stable'}</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Model Accuracy:</span>
                      <Badge bg={getConfidenceColor(forecastData.summary?.methodology?.modelAccuracy || 0)}>
                        {forecastData.summary?.methodology?.modelAccuracy || 0}%
                      </Badge>
                    </div>
                  </CardBody>
                </Card> */}
              </Col>
            </Row>
          )}

          {/* Business Insights */}
          {showInsights && forecastData.businessInsights && (
            <Card className="border-0 bg-warning bg-opacity-10 mb-4">
              <CardBody>
                <h6 className="text-warning mb-3">
                  <IconifyIcon icon="tabler:bulb" className="me-2" />
                  Business Insights
                </h6>
                <Row className="g-3">
                  {forecastData.businessInsights.map((insight, index) => (
                    <Col md={6} key={index}>
                      <div className="p-3 bg-white rounded">
                        <h6 className="mb-2">{insight.title}</h6>
                        <p className="text-muted mb-2 small">{insight.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-primary fw-semibold">{insight.action}</small>
                          <Badge bg="light" text="dark">{insight.expectedGain}</Badge>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          )}

          {/* Product Forecasts */}
          {forecastData.productForecasts && Object.keys(forecastData.productForecasts).length > 0 && (
            <Card className="border-0">
              <CardHeader className="bg-transparent">
                <h6 className="mb-0">
                  <IconifyIcon icon="tabler:box" className="me-2" />
                  Product Inventory Forecasts
                </h6>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Current Stock</th>
                        <th>Predicted Sales</th>
                        <th>Days of Stock</th>
                        <th>Priority</th>
                        <th>Potential Revenue</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(forecastData.productForecasts).map(([productId, product]: [string, ProductForecast]) => (
                        <tr key={productId}>
                          <td>
                            <div>
                              <strong>{product.name}</strong>
                              <div className="d-flex align-items-center mt-1">
                                <IconifyIcon 
                                  icon={getTrendIcon(product.trend)} 
                                  className={`me-1 ${
                                    product.trend === 'increasing' ? 'text-success' : 
                                    product.trend === 'decreasing' ? 'text-danger' : 'text-muted'
                                  }`}
                                />
                                <small className="text-muted">{product.trend}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={product.currentStock < 10 ? 'text-danger fw-bold' : ''}>
                              {product.currentStock}
                            </span>
                          </td>
                          <td>
                            <div>
                              <strong>{product.predictedMonthlySales}/month</strong>
                              <div>
                                <Badge bg={getConfidenceColor(product.confidence)} className="mt-1">
                                  {product.confidence}% confidence
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={product.daysOfStock < 14 ? 'text-danger fw-bold' : 
                                          product.daysOfStock < 45 ? 'text-warning fw-bold' : ''}>
                              {product.daysOfStock === 999 ? '∞' : `${product.daysOfStock} days`}
                            </span>
                          </td>
                          <td>
                            <Badge bg={
                              product.priority === 'high' ? 'danger' : 
                              product.priority === 'moderate' ? 'warning' : 'success'
                            }>
                              {product.priority}
                            </Badge>
                          </td>
                          <td>{formatCurrency(product.potentialRevenue)}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleProductClick(productId)}
                            >
                              <IconifyIcon icon="tabler:eye" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>

      {/* Product Details Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="tabler:box" className="me-2" />
            {selectedProduct?.name} - Forecast Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Row className="g-4">
              <Col md={6}>
                <Card className="border-0 bg-light">
                  <CardBody>
                    <h6 className="text-primary mb-3">Current Status</h6>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Current Stock:</span>
                        <strong className={selectedProduct.currentStock < 10 ? 'text-danger' : ''}>
                          {selectedProduct.currentStock} units
                        </strong>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Days of Stock:</span>
                        <strong className={selectedProduct.daysOfStock < 14 ? 'text-danger' : 
                                        selectedProduct.daysOfStock < 45 ? 'text-warning' : ''}>
                          {selectedProduct.daysOfStock === 999 ? 'Unlimited' : `${selectedProduct.daysOfStock} days`}
                        </strong>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Priority Level:</span>
                        <Badge bg={
                          selectedProduct.priority === 'high' ? 'danger' : 
                          selectedProduct.priority === 'moderate' ? 'warning' : 'success'
                        }>
                          {selectedProduct.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light">
                  <CardBody>
                    <h6 className="text-success mb-3">Forecast Predictions</h6>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Predicted Monthly Sales:</span>
                        <strong>{selectedProduct.predictedMonthlySales} units</strong>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Potential Revenue:</span>
                        <strong className="text-success">{formatCurrency(selectedProduct.potentialRevenue)}</strong>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>Confidence Level:</span>
                        <Badge bg={getConfidenceColor(selectedProduct.confidence)}>
                          {selectedProduct.confidence}%
                        </Badge>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Trend:</span>
                        <div className="d-flex align-items-center">
                          <IconifyIcon 
                            icon={getTrendIcon(selectedProduct.trend)} 
                            className={`me-1 ${
                              selectedProduct.trend === 'increasing' ? 'text-success' : 
                              selectedProduct.trend === 'decreasing' ? 'text-danger' : 'text-muted'
                            }`}
                          />
                          <span className="fw-semibold">{selectedProduct.trend}</span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md={12}>
                <Alert variant="info">
                  <IconifyIcon icon="tabler:info-circle" className="me-2" />
                  <strong>Recommendation:</strong> Consider ordering {selectedProduct.suggestedOrderQuantity} units 
                  to maintain optimal stock levels based on predicted demand.
                </Alert>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            <IconifyIcon icon="tabler:shopping-cart" className="me-1" />
            Order Stock
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default RevenueForecastChart