import React from 'react'
import { Row, Col, Card, CardBody } from 'react-bootstrap'
import ReactApexChart from 'react-apexcharts'

const SparkChart = ({ sparklineData }) => {
  // Default data if no sparklineData is provided
  const defaultData = {
    sales: { data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14], total: 0 },
    profit: { data: [2, 8, 8, 16, 18, 15, 47, 75, 65, 19, 14], total: 0 },
    expenses: { data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54], total: 0 }
  }

  const data = sparklineData || defaultData

  // Sparkline chart options
  const sparklineOptions = {
    chart: {
      type: 'line' as const,
      height: 80,
      sparkline: {
        enabled: true
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    tooltip: {
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        title: {
          formatter: function (seriesName) {
            return ''
          }
        }
      },
      marker: {
        show: false
      }
    }
  }

  return (
    <Row className="g-2">
      {/* Sales Card */}
      <Col md={4}>
        <Card className="shadow-sm border-0 bg-primary-subtle">
          <CardBody className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h6 className="text-primary fw-semibold mb-0">Total Sales</h6>
                <h4 className="fw-bold text-primary mb-0">
                  ${data.sales.total.toLocaleString()}
                </h4>
              </div>
              <div className="text-end">
                <ReactApexChart
                  options={{
                    ...sparklineOptions,
                    colors: ['#3e60d5']
                  }}
                  series={[{
                    name: 'Sales',
                    data: data.sales.data
                  }]}
                  type="line"
                  height={60}
                  width={120}
                />
              </div>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-success-subtle text-success me-2">
                <i className="ri-arrow-up-line"></i> 12.5%
              </span>
              <span className="text-muted small">vs last month</span>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Profit Card */}
      <Col md={4}>
        <Card className="shadow-sm border-0 bg-success-subtle">
          <CardBody className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h6 className="text-success fw-semibold mb-0">Total Profit</h6>
                <h4 className="fw-bold text-success mb-0">
                  ${data.profit.total.toLocaleString()}
                </h4>
              </div>
              <div className="text-end">
                <ReactApexChart
                  options={{
                    ...sparklineOptions,
                    colors: ['#47ad77']
                  }}
                  series={[{
                    name: 'Profit',
                    data: data.profit.data
                  }]}
                  type="line"
                  height={60}
                  width={120}
                />
              </div>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-success-subtle text-success me-2">
                <i className="ri-arrow-up-line"></i> 8.2%
              </span>
              <span className="text-muted small">vs last month</span>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Expenses Card */}
      <Col md={4}>
        <Card className="shadow-sm border-0 bg-warning-subtle">
          <CardBody className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h6 className="text-warning fw-semibold mb-0">Total Expenses</h6>
                <h4 className="fw-bold text-warning mb-0">
                  ${data.expenses.total.toLocaleString()}
                </h4>
              </div>
              <div className="text-end">
                <ReactApexChart
                  options={{
                    ...sparklineOptions,
                    colors: ['#ffbc00']
                  }}
                  series={[{
                    name: 'Expenses',
                    data: data.expenses.data
                  }]}
                  type="line"
                  height={60}
                  width={120}
                />
              </div>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-danger-subtle text-danger me-2">
                <i className="ri-arrow-down-line"></i> 3.1%
              </span>
              <span className="text-muted small">vs last month</span>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default SparkChart