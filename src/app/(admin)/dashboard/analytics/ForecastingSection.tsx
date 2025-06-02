// components/ForecastingSection.js
'use client'
import React, { useState, useEffect } from 'react'
import { Row, Col, Card, CardBody, CardHeader, Button, Badge, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import api from '@/utils/axiosInstance'
import { useNotificationContext } from '@/context/useNotificationContext'
import RevenueForecastChart from './RevenueForecastChart'

const ForecastingSection = ({ startDate, endDate }) => {
  const [forecastData, setForecastData] = useState(null)
  const [lowStockData, setLowStockData] = useState([])
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const { showNotification } = useNotificationContext()

  const fetchForecastingData = async () => {
    try {
      setLoading(true)
      const [forecastResponse, lowStockResponse] = await Promise.all([
        api.get('/api/dashboard/forecasting', { params: { months: 3 } }),
        api.get('/api/dashboard/low-stock-products')
      ])

      setForecastData(forecastResponse.data)
      setLowStockData(lowStockResponse.data.lowStockProducts || [])
    } catch (error) {
      console.error('Error fetching forecasting data:', error)
      showNotification({
        message: 'Error fetching forecasting data',
        variant: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAISuggestions = async () => {
    try {
      setAiLoading(true)
      const response = await api.post('/api/dashboard/ai-suggestions')
      setAiSuggestions(response.data.suggestions || [])
      showNotification({
        message: 'AI suggestions generated successfully!',
        variant: 'success'
      })
    } catch (error) {
      console.error('Error fetching AI suggestions:', error)
      showNotification({
        message: 'Error generating AI suggestions',
        variant: 'danger'
      })
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    fetchForecastingData()
  }, [startDate, endDate])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger'
      case 'high': return 'warning'
      case 'moderate': return 'info'
      default: return 'secondary'
    }
  }

  const getSuggestionColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      default: return 'info'
    }
  }

  return (
    <Row className="g-2 mt-3">
      {/* Revenue Forecasting Chart */}
      <Col lg={8}>
        <RevenueForecastChart forecastData={forecastData} loading={loading} />
      </Col>

      {/* AI Suggestions */}
      <Col lg={4}>
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <IconifyIcon icon="tabler:bulb" className="me-2" />
              AI Business Suggestions
            </h6>
            <Button
              variant="primary"
              size="sm"
              onClick={fetchAISuggestions}
              disabled={aiLoading}
            >
              <IconifyIcon icon="tabler:refresh" className="me-1" />
              {aiLoading ? 'Generating...' : 'Get Suggestions'}
            </Button>
          </CardHeader>
          <CardBody className="py-2" style={{ maxHeight: '750px', overflowY: 'auto' }}>
            {aiSuggestions.length > 0 ? (
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="border rounded p-2 mb-2">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="mb-1 small">{suggestion.title}</h6>
                      <Badge bg={getSuggestionColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="mb-1 small text-muted">{suggestion.description}</p>
                    <div className="small">
                      <strong>Action:</strong> {suggestion.action}
                    </div>
                    <div className="small text-success">
                      <strong>Impact:</strong> {suggestion.impact}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted p-3">
                <IconifyIcon icon="tabler:bulb" width="2rem" height="2rem" className="mb-2" />
                <p>Click "Get Suggestions" to generate AI-powered business insights</p>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>

      {/* Low Stock Alert */}
      <Col lg={12}>
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <IconifyIcon icon="tabler:alert-triangle" className="me-2" />
              Inventory Alerts & Restocking Suggestions
            </h6>
            <Badge bg="warning">{lowStockData.length} items need attention</Badge>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="text-center p-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
              </div>
            ) : lowStockData.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-1">Product</th>
                      <th className="text-center py-1">Current Stock</th>
                      <th className="text-center py-1">Daily Sales</th>
                      <th className="text-center py-1">Days Left</th>
                      <th className="text-center py-1">Suggested Order</th>
                      <th className="text-center py-1">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockData.slice(0, 10).map((item, idx) => (
                      <tr key={item._id}>
                        <td className="py-1">
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 me-2">
                              <div className={`avatar avatar-xs bg-soft-${getPriorityColor(item.reorderPriority)} rounded text-${getPriorityColor(item.reorderPriority)}`}>
                                <span className="avatar-title small">{item.name?.charAt(0)}</span>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <span className="small">{item.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-1">
                          <span className="small fw-bold">{item.currentStock}</span>
                        </td>
                        <td className="text-center py-1">
                          <span className="small">{item.dailyVelocity}</span>
                        </td>
                        <td className="text-center py-1">
                          <span className="small">
                            {item.daysOfStock ? `${item.daysOfStock} days` : 'N/A'}
                          </span>
                        </td>
                        <td className="text-center py-1">
                          <span className="small fw-bold text-primary">
                            {item.suggestedOrderQuantity} units
                          </span>
                        </td>
                        <td className="text-center py-1">
                          <Badge bg={getPriorityColor(item.reorderPriority)}>
                            {item.reorderPriority}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted p-3">
                <IconifyIcon icon="tabler:check-circle" width="2rem" height="2rem" className="mb-2 text-success" />
                <p className="mb-0">All products are well-stocked!</p>
                <small>No immediate restocking needed</small>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>

      {/* Additional Forecast Metrics */}
      {/* {forecastData && (
        <Col lg={12}>
          <Card className="shadow-sm border-0 mt-2">
            <CardHeader className="bg-transparent py-2 border-0">
              <h6 className="mb-0">
                <IconifyIcon icon="tabler:trending-up" className="me-2" />
                Forecast Summary & Business Insights
              </h6>
            </CardHeader>
            <CardBody className="py-2">
              <Row className="g-3">
                <Col md={3}>
                  <div className="text-center p-2 bg-light rounded">
                    <h5 className="mb-1 text-primary">
                      ${forecastData.forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0)?.toLocaleString()}
                    </h5>
                    <small className="text-muted">Total Predicted Revenue</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-2 bg-light rounded">
                    <h5 className="mb-1 text-success">
                      {forecastData.forecasts.reduce((sum, f) => sum + f.predictedTransactions, 0)}
                    </h5>
                    <small className="text-muted">Expected Transactions</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-2 bg-light rounded">
                    <h5 className="mb-1 text-info">
                      {Math.round(forecastData.forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecastData.forecasts.length)}%
                    </h5>
                    <small className="text-muted">Average Confidence</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-2 bg-light rounded">
                    <h5 className="mb-1">
                      <Badge bg={forecastData.trends.profit === 'increasing' ? 'success' : 'danger'}>
                        {forecastData.trends.profit === 'increasing' ? 'Growing' : 'Declining'}
                      </Badge>
                    </h5>
                    <small className="text-muted">Profit Trend</small>
                  </div>
                </Col>
              </Row>
              
              <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
                <h6 className="mb-2">
                  <IconifyIcon icon="tabler:lightbulb" className="me-2" />
                  Key Recommendations
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled mb-0 small">
                      <li className="mb-1">
                        <IconifyIcon icon="tabler:arrow-right" className="me-1 text-primary" width="0.8rem" height="0.8rem" />
                        {forecastData.trends.revenue === 'increasing' 
                          ? 'Consider increasing inventory to meet growing demand'
                          : 'Focus on cost optimization and customer retention'
                        }
                      </li>
                      <li className="mb-1">
                        <IconifyIcon icon="tabler:arrow-right" className="me-1 text-primary" width="0.8rem" height="0.8rem" />
                        Monitor low-stock items closely to prevent stockouts
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled mb-0 small">
                      <li className="mb-1">
                        <IconifyIcon icon="tabler:arrow-right" className="me-1 text-success" width="0.8rem" height="0.8rem" />
                        Plan marketing campaigns for predicted peak periods
                      </li>
                      <li className="mb-1">
                        <IconifyIcon icon="tabler:arrow-right" className="me-1 text-success" width="0.8rem" height="0.8rem" />
                        Review pricing strategy based on demand forecasts
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      )} */}
    </Row>
  )
}

export default ForecastingSection