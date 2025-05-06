import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Button, ProgressBar } from 'react-bootstrap';

// Import from your icon library (adjust path as needed)
//import IconifyIcon from '../components/IconifyIcon'; // Adjust the import path as needed

const PaymentTypesChart = () => {
  // Payment types data with corresponding colors
  const [paymentData] = useState([
    { 
      name: "Cash", 
      amount: "$154,327.72", 
      percentage: 44,
      color: "primary" 
    },
    { 
      name: "Credit", 
      amount: "$86,594.78", 
      percentage: 25, 
      color: "success"
    },
    { 
      name: "Debit Card", 
      amount: "$47,891.25", 
      percentage: 14,
      color: "info"
    },
    { 
      name: "Bank Check", 
      amount: "$29,340.00", 
      percentage: 8,
      color: "warning"
    },
    { 
      name: "Transfer", 
      amount: "$18,275.50", 
      percentage: 5,
      color: "danger"
    },
    { 
      name: "Venmo", 
      amount: "$9,482.65", 
      percentage: 3,
      color: "secondary"
    },
    { 
      name: "PayPal", 
      amount: "$5,294.30", 
      percentage: 1,
      color: "dark"
    }
  ]);

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Payment Methods</h6>
        <div>
          {/* <Button variant="light" size="sm" className="btn-sm p-1">
            <IconifyIcon icon="tabler:filter" width={16} />
          </Button> */}
        </div>
      </CardHeader>
      
      <CardBody className="py-2">
        {/* Payment Method Progress Bars */}
        <div>
          {paymentData.map((payment, idx) => (
            <div key={idx} className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-muted">{payment.name}</span>
                <div className="d-flex align-items-center">
                  <span className="small fw-bold me-2">{payment.amount}</span>
                  <span className="text-muted small">{payment.percentage}%</span>
                </div>
              </div>
              <ProgressBar 
                variant={payment.color}
                now={payment.percentage} 
                style={{ height: "6px" }} 
              />
            </div>
          ))}
        </div>
        
        {/* Total Row */}
        <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
          <span className="small text-muted">Total Payments</span>
          <span className="fw-bold">$351,206.20</span>
        </div>
      </CardBody>
    </Card>
  );
};

export default PaymentTypesChart;