'use client'
import React from 'react'
import { Card, CardBody, Row, Col } from 'react-bootstrap'

interface SummarySectionProps {
  totalQuantity: number;
  shippingCost: number;
  avgShipping: number;
  totalAmount: number;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  totalQuantity,
  shippingCost,
  avgShipping,
  totalAmount
}) => {
  return (
    <Card className="mb-4 border-light bg-light">
      <CardBody className="p-3">
        <h6 className="mb-3 text-dark">
          Summary
        </h6>
        <Row className="g-3">
          <Col sm={6} md={3}>
            <div className="text-center p-3 bg-white rounded border">
              <div className="h4 mb-1 text-primary">{totalQuantity}</div>
              <div className="small text-muted">Total Items</div>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="text-center p-3 bg-white rounded border">
              <div className="h4 mb-1 text-warning">${Number(shippingCost || 0).toFixed(2)}</div>
              <div className="small text-muted">Shipping Cost</div>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="text-center p-3 bg-white rounded border">
              <div className="h4 mb-1 text-info">${avgShipping.toFixed(2)}</div>
              <div className="small text-muted">Avg. Shipping/Item</div>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="text-center p-3 bg-white rounded border border-primary">
              <div className="h4 mb-1 text-success">${totalAmount.toFixed(2)}</div>
              <div className="small text-muted fw-semibold">Total Amount</div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default React.memo(SummarySection)
