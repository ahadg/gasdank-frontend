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
  
  // Form data state
  const [quantity, setQuantity] = useState<number>(0)
  const [price, setPrice] = useState<number>(0)
  const [totalShipping, setTotalShipping] = useState<number>(0)

  // Calculate new total stock and shipping cost per unit
  const newTotalStock = (productDetails?.qty || 0) + (quantity || 0)
  const shippingCostPerUnit = quantity > 0 ? totalShipping / quantity : 0

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
      setPrice(productDetails?.price || 0)
      setTotalShipping(0)
    }
  }, [show, productDetails?.price])

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
      showNotification({ message: 'Please enter a valid quantity', variant: 'danger' })
      return
    }

    if (!price || price <= 0) {
      showNotification({ message: 'Please enter a valid price', variant: 'danger' })
      return
    }

    setLoading(true)
    console.log('Restock transaction productDetails:', productDetails)
    try {
      // Create a restock transaction with updated payload
      const payload = {
        user_id: user._id,
        buyer_id: productDetails?.buyer_id?._id,
        notes: `Restocked ${quantity} ${productDetails.unit} of ${productDetails.name}`,
        type: "restock",
        price: price * quantity,
        total_shipping: totalShipping,
        items: [
          {
            inventory_id: product._id,
            qty: quantity,
            measurement: 1,
            unit: productDetails.unit,
            name: productDetails.name,
            price: price,
            shipping: shippingCostPerUnit.toFixed(2),
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
        <Modal.Title className='flex flex-row'>
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
                    <p className="mb-0"><strong>Current Shipping Cost:</strong> ${productDetails.shippingCost?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Form>
              {/* Quantity Input */}
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

              {/* Price Input */}
              <Form.Group className="mb-3">
                <Form.Label>Price per Unit *</Form.Label>
                <Form.Control 
                  type="number" 
                  placeholder="Enter price per unit" 
                  step="0.01" 
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={loading}
                />
              </Form.Group>

              {/* Total Shipping Input */}
              <Form.Group className="mb-3">
                <Form.Label>Total Shipping Cost</Form.Label>
                <Form.Control 
                  type="number" 
                  placeholder="Enter total shipping cost" 
                  step="0.01" 
                  value={totalShipping || ''}
                  onChange={(e) => setTotalShipping(Number(e.target.value))}
                  disabled={loading}
                />
                {quantity > 0 && totalShipping > 0 && (
                  <Form.Text className="text-muted">
                    Shipping cost per unit: ${shippingCostPerUnit.toFixed(2)}
                  </Form.Text>
                )}
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
                    <div className="col-md-6">
                      <strong>New Total Stock:</strong> {newTotalStock} {productDetails.unit}
                    </div>
                    <div className="col-md-6">
                      <strong>Total Cost:</strong> ${(price * quantity + totalShipping).toFixed(2)}
                    </div>
                  </div>
                  {quantity > 0 && totalShipping > 0 && (
                    <div className="row mt-1">
                      <div className="col-12">
                        <strong>Shipping per Unit:</strong> ${shippingCostPerUnit.toFixed(2)}
                      </div>
                    </div>
                  )}
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
          disabled={loading || !quantity || quantity <= 0 || !price || price <= 0}
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