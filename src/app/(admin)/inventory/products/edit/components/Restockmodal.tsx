'use client'
import { useState, useEffect } from 'react'
import { Button, Form, Modal, Spinner, Alert } from 'react-bootstrap'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'

interface RestockModalProps {
  show: boolean
  onHide: () => void
  product: any
  onRestockComplete?: () => void
}

export default function RestockModal({ show, onHide, product, onRestockComplete }: RestockModalProps) {
  const [loading, setLoading] = useState(false)
  const [productDetails, setProductDetails] = useState<any>(null)
  const user = useAuthStore((state) => state.user)
  const { showNotification } = useNotificationContext()
  // Simplified restock form data state - only quantity
  const [quantity, setQuantity] = useState<number>(0)

  // Calculate new total stock
  const newTotalStock = (productDetails?.qty || 0) + (quantity || 0)

  // Fetch product details when modal opens
  useEffect(() => {
    if (show && product?._id) {
      fetchProductDetails()
    }
  }, [show, product?._id])

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setQuantity(0)
    }
  }, [show])

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/api/inventory/product/${product._id}`)
      setProductDetails(response.data)
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
  }

  const handleRestockSubmit = async () => {
    // Basic validation
    if (!quantity || quantity <= 0) {
      showNotification({ message: 'Transaction processed successfully', variant: 'danger' })
      return
    }

    setLoading(true)
    console.log('Restock transaction productDetails:', productDetails)
    try {
      // Create a restock transaction with simplified payload
      const payload = {
        user_id: user._id,
        buyer_id: productDetails?.buyer_id?._id, // No buyer for restocking
        //payment: 0, // No payment details since we removed price inputs
        notes: `Restocked ${quantity} ${productDetails.unit} of ${productDetails.name}`,
        type: "restock",
        price: (productDetails?.price) * quantity, // No price since we removed price input
        total_shipping: quantity * productDetails?.shippingCost, // No shipping since we removed shipping input
        items: [
          {
            inventory_id: product._id,
            qty: quantity,
            measurement: 1, // Default to full measurement
            unit: productDetails.unit, // Use existing product unit
            name: productDetails.name,
            price: productDetails.price, // No price
            shipping: productDetails.shippingCost, // No shipping
            //supplier_name: '', // No supplier name
          },
        ],
      }
      console.log('Restock transaction created:', payload)
      const response = await api.post('/api/transaction/', payload)
      console.log('Restock transaction created:', response.data)
      showNotification({ message: 'Transaction processed successfully', variant: 'success' })
      // Call completion callback if provided
      if (onRestockComplete) {
        onRestockComplete()
      }
      
      onHide()
    } catch (error: any) {
      console.error('Error restocking product:', error)
      alert(error?.response?.data?.error || 'Error restocking product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onHide()
    }
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="tabler:package" className="me-2" />
          Restock Product
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {productDetails && (
          <>
            {/* Product Information */}
            <div className="mb-4">
              <h6 className="text-muted mb-2">Product Information</h6>
              <div className="bg-light p-3 rounded">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Product ID:</strong> {productDetails.product_id}</p>
                    <p className="mb-1"><strong>Name:</strong> {productDetails.name}</p>
                    <p className="mb-0"><strong>Category:</strong> {productDetails.category?.name}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Current Stock:</strong> {productDetails.qty} {productDetails.unit}</p>
                    <p className="mb-1"><strong>Current Price:</strong> ${productDetails.price?.toFixed(2)}</p>
                    <p className="mb-0"><strong>Shipping Cost:</strong> ${productDetails.shippingCost?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Form>
              {/* Only Quantity Input */}
              <Form.Group className="mb-3">
                <Form.Label>Quantity to Add *</Form.Label>
                <Form.Control 
                  type="number" 
                  placeholder="Enter quantity to add" 
                  step="any" 
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={loading}
                />
              </Form.Group>

              {/* Stock Summary */}
              {quantity > 0 && (
                <Alert variant="info" className="mb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Adding Quantity:</strong> {quantity} {productDetails.unit}
                    </div>
                    <div className="col-md-6">
                      <strong>Current Stock:</strong> {productDetails.qty} {productDetails.unit}
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-12">
                      <strong>New Total Stock:</strong> {newTotalStock} {productDetails.unit}
                    </div>
                  </div>
                </Alert>
              )}
            </Form>
          </>
        )}

        {/* Loading state */}
        {!productDetails && show && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          variant="success" 
          onClick={handleRestockSubmit}
          disabled={loading || !quantity || quantity <= 0}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            <>
              <IconifyIcon icon="tabler:package" className="me-1" />
              Restock Product
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}