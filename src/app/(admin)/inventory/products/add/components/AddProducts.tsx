'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Button, Form, Table, Modal } from 'react-bootstrap'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

// Sub-components
import AccountSelector from './sub-components/AccountSelector'
import ProductTableRow from './sub-components/ProductTableRow'
import MobileProductCard from './sub-components/MobileProductCard'
import SummarySection from './sub-components/SummarySection'
import { testProducts } from './testData'

const multipleProductSchema = yup.object({
  products: yup.array().of(
    yup.object({
      referenceNumber: yup.string().optional(),
      name: yup.string().optional(),
      qty: yup
        .number()
        .required('Quantity is required')
        .min(0.01, 'Minimum quantity is 0.01')
        .typeError('Quantity must be a number'),
      unit: yup.string().required('Unit is required'),
      measurement: yup
        .number()
        .required('Measurement is required')
        .oneOf([1, 0.5, 0.25], 'Invalid measurement')
        .typeError('Measurement must be a number'),
      category: yup.string().required('Category is required'),
      price: yup
        .number()
        .required('Price is required')
        .min(0, 'Price must be non-negative')
        .typeError('Price must be a number'),
      product_type: yup.string().required('Product type is required'),
    })
  ).min(1, 'At least one product is required'),
  shippingCost: yup
    .number()
    .required('Shipping cost is required')
    .min(0, 'Must be non-negative')
    .typeError('Shipping cost must be a number'),
})

type MultipleProductFormData = yup.InferType<typeof multipleProductSchema>

const measurementOptions = [
  { label: 'Full', value: 1 },
  { label: 'Half', value: 0.5 },
  { label: 'Quarter', value: 0.25 },
]

function AddProductsPage() {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user)
  const { units: unitOptions = [], default_unit = '' } = useAuthStore(state => state.settings || {})

  // State
  const [accounts, setAccounts] = useState<any[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [processingStatus, setProcessingStatus] = useState({ current: 0, total: 0 })
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [userCategories, setUserCategories] = useState<any[]>([])
  const [productTypes, setProductTypes] = useState<any[]>([])
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<MultipleProductFormData | null>(null)

  const { control, handleSubmit, reset, formState: { errors, touchedFields } } = useForm<MultipleProductFormData>({
    resolver: yupResolver(multipleProductSchema),
    defaultValues: {
      products: [{ referenceNumber: '', name: '', qty: 0, unit: default_unit, category: '', measurement: 1, price: 0, product_type: "" }],
      shippingCost: 0,
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  // Watch for real-time summary updates
  const productsData = useWatch({
    control,
    name: 'products',
  })
  
  const shippingCost = useWatch({
    control,
    name: 'shippingCost',
    defaultValue: 0
  })

  // Memoized calculations
  const totalQuantity = useMemo(
    () => productsData?.reduce((sum, item) => sum + Number(item?.qty || 0), 0) || 0,
    [productsData]
  )

  const avgShipping = useMemo(
    () => (totalQuantity > 0 ? Number(shippingCost || 0) / totalQuantity : 0),
    [shippingCost, totalQuantity]
  )

  const totalAmount = useMemo(() => {
    if (!productsData) return 0;
    const avg_s = Math.round(avgShipping * 100) / 100;
    return productsData.reduce((sum, item) => {
      const qty = Number(item?.qty || 0);
      const price = Number(item?.price || 0);
      return sum + (qty * (price + avg_s));
    }, 0);
  }, [productsData, avgShipping]);

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        const [accountsRes, categoriesRes, typesRes] = await Promise.all([
          api.get(`/api/buyers?user_id=${user._id}`),
          api.get(`/api/categories/${user._id}`),
          api.get(`/api/product-types/${user._id}`)
        ]);
        setAccounts(accountsRes.data);
        setUserCategories(categoriesRes.data);
        setProductTypes(typesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification({ message: 'Error loading required data', variant: 'danger' });
      }
    };
    fetchData();
  }, [user?._id]);

  const filteredAccounts = useMemo(() => 
    accounts.filter((acc) =>
      `${acc.firstName} ${acc.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    ), [accounts, searchQuery]);

  const handleAddRow = useCallback(() => {
    append({
      referenceNumber: "",
      name: '',
      qty: 0,
      unit: default_unit,
      category: '',
      price: 0,
      measurement: 1,
      product_type: ""
    })
  }, [append, default_unit]);

  const loadTestData = () => {
    const mappedProducts = testProducts.map(item => ({
      referenceNumber: item.reference_number,
      name: item.name,
      qty: item.qty,
      unit: item.unit,
      category: userCategories.length > 0 ? userCategories[0].name : '',
      price: item.price,
      measurement: 1,
      product_type: "6981e1367477d1f54528db8c"
    }));

    reset({
      products: mappedProducts,
      shippingCost: 0
    });
    showNotification({ message: 'Test data loaded', variant: 'info' });
  }

  const produce_transaction = async (data: any[], avg_shipping: number, totalShipping: number) => {
    try {
      const transformedItems = data.map((item) => ({
        inventory_id: item._id,
        qty: Number(item.qty),
        measurement: item.measurement,
        name: item?.name,
        unit: item.unit,
        price: item.price,
        shipping: avg_shipping.toFixed(2),
        product_type: item?.product_type
      }))

      const productsTotal = data.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);

      const payload = {
        user_id: user._id,
        buyer_id: selectedAccount?._id || null,
        items: transformedItems,
        price: productsTotal.toFixed(2),
        total_shipping: Number(totalShipping),
        type: 'inventory_addition',
      }

      await api.post('/api/transaction', payload)
      showNotification({ message: 'Transaction processed successfully', variant: 'success' })
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      showNotification({ message: 'Error processing transaction records', variant: 'danger' })
    }
  }

  const processFormSubmission = async (data: MultipleProductFormData) => {
    setLoading(true)
    const totalProducts = data.products.length
    const total_quantity = data.products.reduce((sum, currval) => sum + Number(currval.qty), 0)
    const avg_shipping = total_quantity > 0 ? Number(data.shippingCost) / total_quantity : 0

    let createdProducts: any[] = []
    let successIndices: number[] = []

    try {
      for (let i = 0; i < data.products.length; i++) {
        const prod = data.products[i]
        setProcessingStatus({ current: i + 1, total: totalProducts })

        try {
          const the_category = userCategories.find((cat) => cat.name === prod.category)
          const res = await api.post('/api/inventory', {
            user_id: user._id,
            buyer_id: selectedAccount?._id || null,
            reference_number: prod.referenceNumber,
            name: prod.name,
            qty: prod.qty * prod.measurement,
            unit: prod.unit,
            category: the_category?._id,
            price: prod.price,
            shippingCost: avg_shipping.toFixed(2),
            product_type: prod.product_type,
            status: "",
            notes: "",
          })

          createdProducts.push({ ...res.data, measurement: prod.measurement, qty: prod.qty })
          successIndices.push(i)
        } catch (error) {
          throw error
        }
      }

      await produce_transaction(createdProducts, avg_shipping, data.shippingCost)
      
      reset({ products: [], shippingCost: 0 })
      showNotification({ message: 'All products added successfully', variant: 'success' })
      router.back()
    } catch (error: any) {
      const sortedIndices = [...successIndices].sort((a, b) => b - a)
      sortedIndices.forEach(idx => remove(idx))
      showNotification({
        message: error?.response?.data?.error || 'Error adding products. Partial progress saved.',
        variant: 'danger',
        autohide: false
      })
    } finally {
      setLoading(false)
      setProcessingStatus({ current: 0, total: 0 })
    }
  }

  const onSubmit = async (data: MultipleProductFormData) => {
    if (!selectedAccount) {
      setPendingFormData(data)
      setShowConfirmModal(true)
      return
    }
    await processFormSubmission(data)
  }

  const handleConfirmSubmission = async () => {
    setShowConfirmModal(false)
    if (pendingFormData) {
      await processFormSubmission(pendingFormData)
      setPendingFormData(null)
    }
  }

  const onError = (errors: any) => {
    setShowValidationErrors(true)
    showNotification({ message: 'Please fix validation errors', variant: 'danger' })
    document.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="container-fluid px-2 px-md-3">
      <div className="d-flex align-items-center mb-3 mb-md-4">
        <h4 className="mb-0 fs-5 fs-md-4">Add Products</h4>
      </div>

      <Card>
        <CardHeader className="border-bottom border-light">
          <CardTitle as="h5" className="mb-0 fs-6 fs-md-5">Add Multiple Products</CardTitle>
        </CardHeader>
        <CardBody className="p-2 p-md-3">
          <AccountSelector
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredAccounts={filteredAccounts}
          />

          <Form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <Table bordered className="mb-3">
                  <thead className="table-light">
                    <tr>
                      <th className="small">Ref #</th>
                      <th className="small">Product Name</th>
                      <th className="small">Quantity *</th>
                      <th className="small">Unit *</th>
                      <th className="small">Measure *</th>
                      <th className="small">Category *</th>
                      <th className="small">Price *</th>
                      <th className="small">Type</th>
                      <th className="small">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <ProductTableRow
                        key={field.id}
                        index={index}
                        control={control}
                        errors={errors}
                        touchedFields={touchedFields}
                        showValidationErrors={showValidationErrors}
                        remove={remove}
                        fieldsCount={fields.length}
                        unitOptions={unitOptions}
                        measurementOptions={measurementOptions}
                        userCategories={userCategories}
                        productTypes={productTypes}
                      />
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="d-md-none">
              {fields.map((field, index) => (
                <MobileProductCard
                  key={field.id}
                  index={index}
                  control={control}
                  errors={errors}
                  touchedFields={touchedFields}
                  showValidationErrors={showValidationErrors}
                  remove={remove}
                  fieldsCount={fields.length}
                  unitOptions={unitOptions}
                  measurementOptions={measurementOptions}
                  userCategories={userCategories}
                  productTypes={productTypes}
                />
              ))}
            </div>

            {showValidationErrors && errors.products?.root && (
              <div className="alert alert-danger mb-3">
                <IconifyIcon icon="tabler:alert-circle" className="me-2" />
                {errors.products.root.message}
              </div>
            )}

            <div className="d-flex gap-2 mb-3">
              <Button variant="outline-primary" onClick={handleAddRow} size="sm">
                <IconifyIcon icon="tabler:plus" className="me-1" /> Add Product
              </Button>
              {/* <Button variant="outline-warning" onClick={loadTestData} size="sm">
                <IconifyIcon icon="tabler:test-pipe" className="me-1" /> Load Test Data
              </Button> */}
            </div>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-semibold">Total Shipping Cost *</Form.Label>
                <Controller
                  control={control}
                  name="shippingCost"
                  render={({ field }) => (
                    <Form.Control
                      type="number"
                      placeholder="Total shipping"
                      step="any"
                      isInvalid={!!errors.shippingCost && showValidationErrors}
                      {...field}
                    />
                  )}
                />
                <Form.Text className="text-muted small">Distributed evenly per item quantity</Form.Text>
              </Col>
            </Row>

            <SummarySection
              totalQuantity={totalQuantity}
              shippingCost={shippingCost}
              avgShipping={avgShipping}
              totalAmount={totalAmount}
            />

            <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
              <Button
                variant="outline-secondary"
                onClick={() => router.back()}
                disabled={loading}
                className="order-2 order-md-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="order-1 order-md-2"
              >
                {loading ? `Processing ${processingStatus.current}/${processingStatus.total}...` : 'Add Products'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Addition</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>No account selected. Products will be added to general inventory.</p>
          <p className="fw-bold">Total Items: {totalQuantity}</p>
          <p className="fw-bold">Total Amount: ${totalAmount.toFixed(2)}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmSubmission}>Confirm & Add</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AddProductsPage;