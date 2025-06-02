import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, ProgressBar } from 'react-bootstrap';
import api from '@/utils/axiosInstance';
import { useNotificationContext } from '@/context/useNotificationContext';

const PaymentTypesChart = ({ startDate, endDate }) => {
  const [paymentData, setPaymentData] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationContext();

  // Color mapping for different payment types
  const getColorForPaymentType = (name, index) => {
    const colorMap = {
      'Cash': 'primary',
      'EFT': 'success',
      'Card': 'info',
      'Credit Card': 'info',
      'Debit Card': 'warning',
      'Bank Transfer': 'success',
      'Crypto': 'secondary',
      'Cryptocurrency': 'secondary',
      'Check': 'dark',
      'Cheque': 'dark',
      'Mobile Payment': 'danger',
      'PayPal': 'info',
      'Stripe': 'primary',
      'Other': 'light'
    };

    // Try to match by name first
    for (const [key, color] of Object.entries(colorMap)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }

    // Fallback to index-based colors
    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
    return colors[index % colors.length];
  };

  const fetchPaymentTypes = async () => {
    try {
      setLoading(true);
      
      const params = {} as any;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/api/dashboard/payment-types', { params });
      
      const formattedData = response.data.paymentTypes.map((payment, index) => ({
        name: payment.name,
        amount: `$${payment.amount.toLocaleString()}`,
        amountRaw: payment.amount,
        percentage: payment.percentage,
        count: payment.count,
        color: getColorForPaymentType(payment.name, index)
      }));

      setPaymentData(formattedData);
      setTotalPayments(response.data.totalPayments);
      
    } catch (error) {
      console.error('Error fetching payment types:', error);
      showNotification({ 
        message: error?.response?.data?.error || 'Error fetching payment data', 
        variant: 'danger' 
      });
      
      // Set empty data on error
      setPaymentData([]);
      setTotalPayments(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentTypes();
  }, [startDate, endDate]);

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-transparent py-2 border-0 d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Payment Methods</h6>
        <div>
          <Button 
            variant="light" 
            size="sm" 
            className="btn-sm p-1"
            onClick={fetchPaymentTypes}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <i className="tabler-refresh" style={{ fontSize: '16px' }}></i>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardBody className="py-2">
        {loading ? (
          <div className="text-center p-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : paymentData.length > 0 ? (
          <>
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
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted" style={{ fontSize: '11px' }}>{payment.count} transactions</span>
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
              <span className="fw-bold">${totalPayments.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <div className="text-center text-muted p-3">
            <p className="mb-0">No payment data available</p>
            <small>Try adjusting your date filters</small>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PaymentTypesChart;