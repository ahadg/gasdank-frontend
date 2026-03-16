'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Button, Form, Table, Modal } from 'react-bootstrap'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
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

// Enhanced Account Selector Component
const AccountSelector = ({
  dropdownOpen,
  setDropdownOpen,
  selectedAccount,
  setSelectedAccount,
  searchQuery,
  setSearchQuery,
  filteredAccounts
}: {
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  selectedAccount: any;
  setSelectedAccount: (acc: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredAccounts: any[];
}) => (
  <div className="mb-4">
    <div className="d-flex align-items-center justify-content-between mb-3">
      <h6 className="mb-0 fw-semibold text-dark">
        Client Selection
      </h6>
      <span className="badge bg-light text-muted small">Optional</span>
    </div>

    <div className="position-relative">
      <div
        className={`form-control d-flex align-items-center justify-content-between cursor-pointer ${dropdownOpen ? 'border-primary shadow-sm' : ''}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{ cursor: 'pointer', minHeight: '48px' }}
      >
        <div className="d-flex align-items-center flex-grow-1">
          {selectedAccount ? (
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: '36px', height: '36px', fontSize: '14px', fontWeight: '600' }}
              >
                {selectedAccount.firstName.charAt(0)}{selectedAccount.lastName.charAt(0)}
              </div>
              <div>
                <div className="fw-semibold text-dark">
                  {selectedAccount.firstName} {selectedAccount.lastName}
                </div>
                <div className="small text-muted">Assigned Account</div>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-3"
                style={{ width: '36px', height: '36px' }}
              >
                <IconifyIcon icon="tabler:building-store" className="text-muted" />
              </div>
              <div>
                <div className="text-muted">General Inventory</div>
                <div className="small text-muted">No specific account assigned</div>
              </div>
            </div>
          )}
        </div>
        <IconifyIcon
          icon={dropdownOpen ? "tabler:chevron-up" : "tabler:chevron-down"}
          className="text-muted"
        />
      </div>

      {dropdownOpen && (
        <div
          className="position-absolute w-100 bg-white border rounded-3 shadow-lg mt-1"
          style={{ zIndex: 1000 }}
        >
          {/* Search Input - Fixed */}
          <div className="p-3 border-bottom bg-light rounded-top">
            <div className="position-relative">
              <IconifyIcon
                icon="tabler:search"
                className="position-absolute text-muted"
                style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <Form.Control
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-5 border-0 shadow-none"
                style={{ backgroundColor: 'white' }}
                onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                onFocus={(e) => e.stopPropagation()} // Prevent dropdown from closing
                autoFocus // Auto focus when dropdown opens
              />
            </div>
          </div>

          {/* Account List */}
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {/* General Inventory Option */}
            <div
              className={`p-3 d-flex align-items-center cursor-pointer border-bottom ${!selectedAccount ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAccount(null);
                setDropdownOpen(false);
                setSearchQuery('');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-3"
                style={{ width: '40px', height: '40px' }}
              >
                <IconifyIcon icon="tabler:building-store" className="text-primary" />
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold text-primary">General Inventory</div>
                <div className="small text-muted">Products without specific account assignment</div>
              </div>
              {!selectedAccount && (
                <IconifyIcon icon="tabler:check" className="text-primary" />
              )}
            </div>

            {/* Account Options */}
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((acc) => (
                <div
                  key={acc._id}
                  className={`p-3 d-flex align-items-center cursor-pointer border-bottom ${selectedAccount?._id === acc._id ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAccount(acc);
                    setDropdownOpen(false);
                    setSearchQuery('');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: '36px', height: '36px', fontSize: '14px', fontWeight: '600' }}
                  >
                    {acc.firstName.charAt(0)}{acc.lastName.charAt(0)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-dark">{acc.firstName} {acc.lastName}</div>
                  </div>
                  {selectedAccount?._id === acc._id && (
                    <IconifyIcon icon="tabler:check" className="text-primary" />
                  )}
                </div>
              ))
            ) : searchQuery ? (
              <div className="p-4 text-center text-muted">
                <IconifyIcon icon="tabler:search-off" className="mb-2" style={{ fontSize: '32px' }} />
                <div>No accounts found matching "{searchQuery}"</div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted">
                <IconifyIcon icon="tabler:users-off" className="mb-2" style={{ fontSize: '32px' }} />
                <div>No accounts available</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
)

// Mobile Product Card Component with validation
const MobileProductCard = ({
  index,
  control,
  errors,
  touchedFields,
  showValidationErrors,
  remove,
  fieldsCount,
  unitOptions,
  userCategories,
  productTypes
}: {
  index: number;
  control: any;
  errors: any;
  touchedFields: any;
  showValidationErrors: boolean;
  remove: (index: number) => void;
  fieldsCount: number;
  unitOptions: string[];
  userCategories: any[];
  productTypes: any[];
}) => {
  const user = useAuthStore((state) => state.user)
  const productErrors = errors.products?.[index];
  const shouldShowErrors = showValidationErrors || !!touchedFields.products?.[index];

  return (
    <Card className="mb-3 d-md-none border-light">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Product {index + 1}</h6>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => remove(index)}
            disabled={fieldsCount === 1}
          >
            <IconifyIcon icon="tabler:trash" />
          </Button>
        </div>

        <Row className="g-2">
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Reference #</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.referenceNumber` as const}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  placeholder="Enter reference number"
                  size="sm"
                  isInvalid={!!productErrors?.referenceNumber && shouldShowErrors}
                  {...field}
                />
              )}
            />
            {shouldShowErrors && (
              <Form.Control.Feedback type="invalid" className="small">
                {productErrors?.referenceNumber?.message}
              </Form.Control.Feedback>
            )}
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Product Name</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.name` as const}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  placeholder="(optional)"
                  size="sm"
                  isInvalid={!!productErrors?.name && shouldShowErrors}
                  {...field}
                />
              )}
            />
            {shouldShowErrors && (
              <Form.Control.Feedback type="invalid" className="small">
                {productErrors?.name?.message}
              </Form.Control.Feedback>
            )}
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Quantity *</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.qty` as const}
              render={({ field }) => (
                <Form.Control
                  type="number"
                  placeholder="Enter quantity"
                  step="any"
                  size="sm"
                  isInvalid={!!productErrors?.qty && shouldShowErrors}
                  {...field}
                />
              )}
            />
            {shouldShowErrors && (
              <Form.Control.Feedback type="invalid" className="small">
                {productErrors?.qty?.message}
              </Form.Control.Feedback>
            )}
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Unit *</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.unit` as const}
              render={({ field }) => (
                <Form.Select
                  size="sm"
                  isInvalid={!!productErrors?.unit && shouldShowErrors}
                  {...field}
                >
                  <option value="">Select unit</option>
                  {unitOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </Form.Select>
              )}
            />
            {shouldShowErrors && (
              <Form.Control.Feedback type="invalid" className="small">
                {productErrors?.unit?.message}
              </Form.Control.Feedback>
            )}
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Measurement *</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.measurement` as const}
              render={({ field }) => (
                <Form.Select
                  size="sm"
                  isInvalid={!!productErrors?.measurement && shouldShowErrors}
                  {...field}
                >
                  <option value="">Select measurement</option>
                  {measurementOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              )}
            />
            {shouldShowErrors && (
              <Form.Control.Feedback type="invalid" className="small">
                {productErrors?.measurement?.message}
              </Form.Control.Feedback>
            )}
          </Col>
          {
            //user?.showProductPrice !== false && (
            <Col xs={6}>
              <Form.Label className="small fw-semibold">Price *</Form.Label>
              <Controller
                control={control}
                name={`products.${index}.price` as const}
                render={({ field }) => (
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    step="any"
                    size="sm"
                    isInvalid={!!productErrors?.price && shouldShowErrors}
                    {...field}
                  />
                )}
              />
              {shouldShowErrors && (
                <Form.Control.Feedback type="invalid" className="small">
                  {productErrors?.price?.message}
                </Form.Control.Feedback>
              )}
            </Col>
            // )
          }
          <Col xs={12}>
            <Form.Label className="small fw-semibold">Category *</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.category` as const}
              render={({ field }) => (
                <Form.Select
                  size="sm"
                  isInvalid={!!productErrors?.category && shouldShowErrors}
                  {...field}
                >
                  <option value="">Select category</option>
                  {userCategories.map((cat: any) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            />
            {shouldShowErrors && (
              <Form.Control.Feedback type="invalid" className="small">
                {productErrors?.category?.message}
              </Form.Control.Feedback>
            )}
          </Col>
          <Col xs={12}>
            <Form.Label className="small fw-semibold">Product Type</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.product_type` as const}
              render={({ field }) => (
                <Form.Select
                  size="sm"
                  isInvalid={!!productErrors?.product_type && shouldShowErrors}
                  {...field}
                >
                  <option value="">Select product type</option>
                  {productTypes.map((type: any) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            />
            {shouldShowErrors && (
              <Form.Control.Feedback type="invalid" className="small">
                {productErrors?.product_type?.message}
              </Form.Control.Feedback>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card >
  )
}

function AddProductsPage() {
  const router = useRouter()
  const { showNotification } = useNotificationContext()
  const user = useAuthStore((state) => state.user)
  let { units: unitOptions, default_unit } = useAuthStore(state => state.settings)

  const { control, handleSubmit, getValues, reset, formState: { errors, touchedFields } } = useForm<MultipleProductFormData>({
    resolver: yupResolver(multipleProductSchema),
    defaultValues: {
      products: [{ referenceNumber: '', name: '', qty: 0, unit: default_unit, category: '', measurement: 1, price: 0, product_type: "" }],
      shippingCost: 0,
    },
    mode: 'onChange', // Validate on change to show errors as user types
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  // Use useWatch for real-time updates
  const productsData = useWatch({
    control,
    name: 'products',
    defaultValue: [{ referenceNumber: '', name: '', qty: 0, unit: default_unit, category: '', measurement: 1, price: 0, product_type: "" }]
  })
  console.log("productsData", productsData)
  const shippingCost = useWatch({
    control,
    name: 'shippingCost',
    defaultValue: 0
  })

  // Calculate total quantity
  const totalQuantity = useMemo(
    () => productsData.reduce((sum, item) => sum + Number(item?.qty || 0), 0),
    [productsData]
  )

  // Calculate average shipping per unit
  const avgShipping = useMemo(
    () => (totalQuantity > 0 ? Number(shippingCost || 0) / totalQuantity : 0),
    [shippingCost, totalQuantity]
  )

  // Calculate total amount correctly: qty * (price + avgShipping) for each product
  const totalAmount = useMemo(() => {
    const productsTotal = productsData.reduce((sum, item) => {
      const qty = Number(item?.qty || 0);
      const price = Number(item?.price || 0);

      // Calculate avg_shipping per item (as number, rounded to 2 decimals)
      let avg_shipping = totalQuantity > 0 ? Number(shippingCost || 0) / totalQuantity : 0;
      avg_shipping = Math.round(avg_shipping * 100) / 100; // Round to 2 decimal places

      const itemTotal = qty * (price + avg_shipping);
      return sum + itemTotal;
    }, 0);

    return productsTotal;
  }, [productsData, shippingCost, totalQuantity]);

  // State for account (buyer) selector
  const [accounts, setAccounts] = useState<any[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [processingStatus, setProcessingStatus] = useState({ current: 0, total: 0 })
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<MultipleProductFormData | null>(null)

  // Fetch buyers for the current user
  useEffect(() => {
    async function fetchAccounts() {
      if (user?._id) {
        try {
          const response = await api.get(`/api/buyers?user_id=${user._id}`)
          setAccounts(response.data)
        } catch (error: any) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching accounts', variant: 'danger' })
          console.error('Error fetching accounts:', error)
        }
      }
    }
    fetchAccounts()
  }, [user?._id])

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter((acc) =>
    `${acc.firstName} ${acc.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Fetch user-specific categories
  const [userCategories, setUserCategories] = useState<any[]>([])
  useEffect(() => {
    async function fetchUserCategories() {
      if (user?._id) {
        try {
          const response = await api.get(`/api/categories/${user._id}`)
          setUserCategories(response.data)
        } catch (error: any) {
          showNotification({ message: error?.response?.data?.error || 'Error fetching categories', variant: 'danger' })
          console.error('Error fetching user categories:', error)
        }
      }
    }
    fetchUserCategories()
  }, [user?._id])

  // Fetch product types
  const [productTypes, setProductTypes] = useState<any[]>([])
  useEffect(() => {
    async function fetchProductTypes() {
      if (user?._id) {
        try {
          const response = await api.get(`/api/product-types/${user._id}`)
          setProductTypes(response.data)
        } catch (error: any) {
          console.error('Error fetching product types:', error)
          showNotification({ message: 'Error fetching product types', variant: 'danger' })
        }
      }
    }
    fetchProductTypes()
  }, [user?._id])




  const handleAddRow = () => {
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
  }

  const loadTestData = () => {
    const testData = [
      { "qty": 11, "unit": "pounds", "name": "Hyberberry haze", "price": 275, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#DI" },
      { "qty": 7, "unit": "pounds", "name": "Purple runtz", "price": 275, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 3, "unit": "pounds", "name": "Purple star", "price": 275, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "Cake platium", "price": 275, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 10, "unit": "pounds", "name": "Apex60", "price": 350, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 16.5, "unit": "pounds", "name": "Pink crack", "price": 500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#39" },
      { "qty": 12.5, "unit": "pounds", "name": "pink trap", "price": 575, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#40" },
      { "qty": 11, "unit": "pounds", "name": "pink samuria", "price": 575, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#43" },
      { "qty": 10.5, "unit": "pounds", "name": "pink galactic", "price": 600, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#38" },
      { "qty": 12, "unit": "pounds", "name": "Pink sapphire", "price": 575, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#36" },
      { "qty": 26.5, "unit": "pounds", "name": "Pink Obsidian", "price": 500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#41" },
      { "qty": 20.5, "unit": "pounds", "name": "Pink elixir", "price": 650, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#42" },
      { "qty": 14, "unit": "pounds", "name": "pink drip", "price": 725, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#57" },
      { "qty": 6, "unit": "pounds", "name": "pink lava", "price": 750, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#59" },
      { "qty": 7.5, "unit": "pounds", "name": "Pink ice", "price": 775, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#54" },
      { "qty": 6, "unit": "pounds", "name": "Pink venom", "price": 825, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#53" },
      { "qty": 22.5, "unit": "pounds", "name": "Pink frost", "price": 925, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#56 " },
      { "qty": 21, "unit": "pounds", "name": "Pink prestige", "price": 875, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#58" },
      { "qty": 3, "unit": "pounds", "name": "Lso Pink truck", "price": 2200, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#3" },
      { "qty": 4, "unit": "pounds", "name": "LSO Pink dystany", "price": 2200, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#4" },
      { "qty": 4.5, "unit": "pounds", "name": "LSO pink warfare", "price": 2200, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#5" },
      { "qty": 24.5, "unit": "pounds", "name": "Pink nova", "price": 600, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#45" },
      { "qty": 8, "unit": "pounds", "name": "Pink black gas", "price": 600, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#44" },
      { "qty": 20, "unit": "pounds", "name": "Pink inferno ", "price": 925, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#47" },
      { "qty": 14, "unit": "pounds", "name": "Pink vortex", "price": 600, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#48" },
      { "qty": 0.25, "unit": "kg", "name": "Bulldog", "price": 4500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 5.5, "unit": "kg", "name": "Chocolate hash", "price": 600, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 200, "unit": "per piece", "name": "Krt", "price": 5, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "kg", "name": "Kief", "price": 4500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1.5, "unit": "kg", "name": "Mercedes", "price": 800, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "kg", "name": "Romeo", "price": 800, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1.5, "unit": "kg", "name": "Afghan ", "price": 800, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1.5, "unit": "kg", "name": "Rolex", "price": 800, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "PinkLoad", "price": 75260, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 2000, "unit": "per piece", "name": "Gas gang", "price": 14, "shippingCost": 0, "active": true, "notes": "", "reference_number": "1Gram" },
      { "qty": 200, "unit": "per piece", "name": "Gas gang", "price": 18, "shippingCost": 0, "active": true, "notes": "", "reference_number": "2Grams" },
      { "qty": 27, "unit": "pounds", "name": "UK Chesse", "price": 120, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 14, "unit": "pounds", "name": "Apple Fritter", "price": 160, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#AP" },
      { "qty": 1, "unit": "pounds", "name": "white rhion", "price": 155, "shippingCost": 0, "active": true, "notes": "", "reference_number": "Outdoor" },
      { "qty": 1, "unit": "pounds", "name": "OB", "price": 240, "shippingCost": 0, "active": true, "notes": "", "reference_number": "GH" },
      { "qty": 7, "unit": "pounds", "name": "purple mendocino", "price": 500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 11, "unit": "pounds", "name": "Pineapple pink", "price": 200, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 6, "unit": "pounds", "name": "Smalls pink cookies", "price": 350, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 2, "unit": "pounds", "name": "Small purple", "price": 350, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 2.5, "unit": "pounds", "name": "Hit man ", "price": 550, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 2, "unit": "pounds", "name": "GMO cookies", "price": 350, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 2, "unit": "pounds", "name": "Grandpa stash", "price": 450, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 2, "unit": "pounds", "name": "Sugar Kush", "price": 450, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 5, "unit": "pounds", "name": "Blue dream ", "price": 225, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 14, "unit": "pounds", "name": "Dys", "price": 225, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 43, "unit": "pounds", "name": "Mimosa", "price": 225, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 28, "unit": "pounds", "name": "White truffle", "price": 200, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 6, "unit": "pounds", "name": "Mandarine cookies", "price": 200, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 7, "unit": "pounds", "name": "Permanent marker", "price": 275, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "Clementine", "price": 225, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "Pink gealto", "price": 1500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 10, "unit": "pounds", "name": "DYS new", "price": 275, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "Exotics gas", "price": 1500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "pink crack ", "price": 800, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "Pink fuel", "price": 1100, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "Pink panties", "price": 1500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "Pink trap", "price": 925, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "pink obsidian", "price": 850, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "Pink elixir", "price": 975, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "Island pink", "price": 2100, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 23, "unit": "pounds", "name": "Gas smalls ", "price": 200, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "##69", "price": 800, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#69" },
      { "qty": 1, "unit": "pounds", "name": "##70", "price": 850, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#70" },
      { "qty": 1, "unit": "pounds", "name": "##75", "price": 925, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#75" },
      { "qty": 1, "unit": "pounds", "name": "##82", "price": 975, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#82" },
      { "qty": 1, "unit": "pounds", "name": "##45", "price": 900, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#45" },
      { "qty": 1, "unit": "pounds", "name": "Death bubba", "price": 950, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "Midnight og ", "price": 925, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "Pink black gas ", "price": 900, "shippingCost": 0, "active": true, "notes": "", "reference_number": "#44" },
      { "qty": 0.5, "unit": "pounds", "name": "Pink grape", "price": 1500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "pounds", "name": "Island pink2 ", "price": 950, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "Pink death bubba", "price": 1500, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "Pink diablo", "price": 2150, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 0.5, "unit": "pounds", "name": "Pink champange", "price": 2100, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1000, "unit": "pounds", "name": "Pink emipre", "price": 1, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 1, "unit": "kg", "name": "Mystical gealto", "price": 375, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 3, "unit": "kg", "name": "Sherb crasher", "price": 375, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 100, "unit": "per piece", "name": "Heisenbergs", "price": 39.5, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 12, "unit": "kg", "name": "AFganh gold", "price": 1200, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 5, "unit": "kg", "name": "CAli plate", "price": 300, "shippingCost": 0, "active": true, "notes": "", "reference_number": "" },
      { "qty": 40, "unit": "per piece", "name": "gasgang", "price": 22, "shippingCost": 0, "active": true, "notes": "", "reference_number": "2g" },
      { "qty": 8, "unit": "pounds", "name": "pr2", "price": 90, "shippingCost": 0.33, "active": true, "notes": "", "reference_number": "4234" },
      { "qty": 10, "unit": "pounds", "name": "rr", "price": 80, "shippingCost": 0.33, "active": true, "notes": "", "reference_number": "3432" },
      { "qty": 10, "unit": "pounds", "name": "rr", "price": 90, "shippingCost": 0.33, "active": true, "notes": "", "reference_number": "2312" }
    ];

    const mappedProducts = testData.map(item => ({
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

  // Error callback for form submission
  const onError = (errors: any) => {
    console.log("Form errors", errors)
    setShowValidationErrors(true)
    showNotification({
      message: 'Please fix the validation errors before submitting',
      variant: 'danger'
    })

    // Scroll to the first error
    const firstErrorElement = document.querySelector('.is-invalid')
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Additional transaction production function
  const produce_transaction = async (data: any[], avg_shipping: number, shippingCost: number) => {
    try {
      console.log("data", data)
      setLoading(true)
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

      const productsTotal = productsData.reduce((sum, item) => {
        const qty = Number(item?.qty || 0);
        const price = Number(item?.price || 0);

        const itemTotal = qty * (price);
        return sum + itemTotal;
      }, 0);

      const payload = {
        user_id: user._id,
        buyer_id: selectedAccount?._id || null,
        items: transformedItems,
        price: productsTotal.toFixed(2),
        total_shipping: Number(shippingCost),
        type: 'inventory_addition',
      }

      console.log('payload', payload)
      const response = await api.post('/api/transaction', payload)
      console.log('Transaction processed:', response.data)
      showNotification({ message: 'Transaction processed successfully', variant: 'success' })
    } catch (error: any) {
      console.error('Error processing transaction:', error.response)
      showNotification({ message: error?.response?.data?.error || 'Error processing transaction', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  // Main form submission handler
  const processFormSubmission = async (data: MultipleProductFormData) => {
    setLoading(true)
    const totalProducts = data.products.length
    setProcessingStatus({ current: 0, total: totalProducts })

    const total_quantity = data.products.reduce((sum, currval) => sum + Number(currval.qty), 0)
    const avg_shipping = total_quantity > 0 ? Number(shippingCost) / total_quantity : 0

    let createdProducts: any[] = []
    let successIndices: number[] = []

    try {
      // Process products one by one
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
        } catch (error: any) {
          console.error(`Error adding product ${prod.name || i}:`, error)
          // Stop processing further if a product fails, so user can fix and continue
          throw error
        }
      }

      // If all succeeded, produce transaction
      await produce_transaction(createdProducts, avg_shipping, shippingCost)

      // Remove all products from form since they are all uploaded
      reset({
        products: [],
        shippingCost: 0
      })

      showNotification({ message: 'All products added successfully', variant: 'success' })
      router.back()
    } catch (error: any) {
      console.error('Error in batch processing:', error)

      // Remove successfully processed products from the form
      // We sort descending to avoid index shifting issues while removing
      const sortedIndices = [...successIndices].sort((a, b) => b - a)
      sortedIndices.forEach(idx => remove(idx))

      const errorMessage = error?.response?.data?.error || 'Error adding products. Successfully processed items have been removed from the list.'
      showNotification({
        message: errorMessage,
        variant: 'danger',
        autohide: false
      })
    } finally {
      setLoading(false)
      setProcessingStatus({ current: 0, total: 0 })
    }
  }

  const onSubmit = async (data: MultipleProductFormData) => {
    // Check if no account is selected and show confirmation
    if (!selectedAccount) {
      setPendingFormData(data)
      setShowConfirmModal(true)
      return
    }

    // Proceed with submission if account is selected
    await processFormSubmission(data)
  }

  const handleConfirmSubmission = async () => {
    setShowConfirmModal(false)
    if (pendingFormData) {
      await processFormSubmission(pendingFormData)
      setPendingFormData(null)
    }
  }

  const handleCancelSubmission = () => {
    setShowConfirmModal(false)
    setPendingFormData(null)
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
          {/* Enhanced Account Selector */}
          <AccountSelector
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredAccounts={filteredAccounts}
          />

          {/* Product Form */}
          <Form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
            {/* Desktop Table - Hidden on mobile */}
            <div className="d-none d-md-block">
              <div className="table-responsive">
                <Table bordered className="mb-3">
                  <thead className="table-light">
                    <tr>
                      <th className="small">Reference #</th>
                      <th className="small">Product Name</th>
                      <th className="small">Quantity *</th>
                      <th className="small">Unit *</th>
                      <th className="small">Measurement *</th>
                      <th className="small">Category *</th>
                      <th className="small">Price *</th>
                      <th className="small">Product Type</th>
                      <th className="small">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => {
                      const productErrors = errors.products?.[index];
                      const shouldShowErrors = showValidationErrors || !!touchedFields.products?.[index];

                      return (
                        <tr key={field.id}>
                          <td>
                            <Controller
                              control={control}
                              name={`products.${index}.referenceNumber` as const}
                              render={({ field }) => (
                                <Form.Control
                                  type="text"
                                  placeholder="Reference number"
                                  size="sm"
                                  isInvalid={!!productErrors?.referenceNumber && shouldShowErrors}
                                  {...field}
                                />
                              )}
                            />
                            {shouldShowErrors && (
                              <Form.Control.Feedback type="invalid" className="small d-block">
                                {productErrors?.referenceNumber?.message}
                              </Form.Control.Feedback>
                            )}
                          </td>
                          <td>
                            <Controller
                              control={control}
                              name={`products.${index}.name` as const}
                              render={({ field }) => (
                                <Form.Control
                                  type="text"
                                  placeholder="Product Name"
                                  size="sm"
                                  isInvalid={!!productErrors?.name && shouldShowErrors}
                                  {...field}
                                />
                              )}
                            />
                            {shouldShowErrors && (
                              <Form.Control.Feedback type="invalid" className="small d-block">
                                {productErrors?.name?.message}
                              </Form.Control.Feedback>
                            )}
                          </td>
                          <td>
                            <Controller
                              control={control}
                              name={`products.${index}.qty` as const}
                              render={({ field }) => (
                                <Form.Control
                                  type="number"
                                  placeholder="Enter quantity"
                                  step="any"
                                  size="sm"
                                  isInvalid={!!productErrors?.qty && shouldShowErrors}
                                  {...field}
                                />
                              )}
                            />
                            {shouldShowErrors && (
                              <Form.Control.Feedback type="invalid" className="small d-block">
                                {productErrors?.qty?.message}
                              </Form.Control.Feedback>
                            )}
                          </td>
                          <td>
                            <Controller
                              control={control}
                              name={`products.${index}.unit` as const}
                              render={({ field }) => (
                                <Form.Select
                                  size="sm"
                                  isInvalid={!!productErrors?.unit && shouldShowErrors}
                                  {...field}
                                >
                                  <option value="">Select unit</option>
                                  {unitOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                                </Form.Select>
                              )}
                            />
                            {shouldShowErrors && (
                              <Form.Control.Feedback type="invalid" className="small d-block">
                                {productErrors?.unit?.message}
                              </Form.Control.Feedback>
                            )}
                          </td>
                          <td>
                            <Controller
                              control={control}
                              name={`products.${index}.measurement` as const}
                              render={({ field }) => (
                                <Form.Select
                                  size="sm"
                                  isInvalid={!!productErrors?.measurement && shouldShowErrors}
                                  {...field}
                                >
                                  <option value="">Select measurement</option>
                                  {measurementOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </Form.Select>
                              )}
                            />
                            {shouldShowErrors && (
                              <Form.Control.Feedback type="invalid" className="small d-block">
                                {productErrors?.measurement?.message}
                              </Form.Control.Feedback>
                            )}
                          </td>
                          <td>
                            <Controller
                              control={control}
                              name={`products.${index}.category` as const}
                              render={({ field }) => (
                                <Form.Select
                                  size="sm"
                                  isInvalid={!!productErrors?.category && shouldShowErrors}
                                  {...field}
                                >
                                  <option value="">Select category</option>
                                  {userCategories.map((cat: any) => (
                                    <option key={cat._id} value={cat.name}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              )}
                            />
                            {shouldShowErrors && (
                              <Form.Control.Feedback type="invalid" className="small d-block">
                                {productErrors?.category?.message}
                              </Form.Control.Feedback>
                            )}
                          </td>

                          <td>
                            <Controller
                              control={control}
                              name={`products.${index}.price` as const}
                              render={({ field }) => (
                                <Form.Control
                                  type="number"
                                  placeholder="Enter price"
                                  step="any"
                                  size="sm"
                                  isInvalid={!!productErrors?.price && shouldShowErrors}
                                  {...field}
                                />
                              )}
                            />
                            {shouldShowErrors && (
                              <Form.Control.Feedback type="invalid" className="small d-block">
                                {productErrors?.price?.message}
                              </Form.Control.Feedback>
                            )}
                          </td>

                          <td>
                            <Controller
                              control={control}
                              name={`products.${index}.product_type` as const}
                              render={({ field }) => (
                                <Form.Select
                                  size="sm"
                                  isInvalid={!!productErrors?.product_type && shouldShowErrors}
                                  {...field}
                                >
                                  <option value="">Select product type</option>
                                  {productTypes.map((type: any) => (
                                    <option key={type._id} value={type._id}>
                                      {type.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              )}
                            />
                            {shouldShowErrors && (
                              <Form.Control.Feedback type="invalid" className="small d-block">
                                {productErrors?.product_type?.message}
                              </Form.Control.Feedback>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <IconifyIcon icon="tabler:trash" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            </div>

            {/* Mobile Cards - Hidden on desktop */}
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
              <Button
                variant="outline-primary"
                onClick={handleAddRow}
                className="w-md-auto"
                size="sm"
              >
                <IconifyIcon icon="tabler:plus" className="me-1" />
                Add Another Product
              </Button>

              {/* <Button
                variant="outline-warning"
                onClick={loadTestData}
                className="w-md-auto"
                size="sm"
              >
                <IconifyIcon icon="tabler:test-pipe" className="me-1" />
                Load Test Data
              </Button> */}
            </div>

            {/* Shipping Cost */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-semibold">
                  Total Shipping Cost *
                </Form.Label>
                <Controller
                  control={control}
                  name="shippingCost"
                  render={({ field }) => (
                    <Form.Control
                      type="number"
                      placeholder="Enter total shipping cost"
                      step="any"
                      isInvalid={!!errors.shippingCost && showValidationErrors}
                      {...field}
                    />
                  )}
                />
                {showValidationErrors && (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors.shippingCost?.message}
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  This will be distributed evenly across all products
                </Form.Text>
              </Col>
            </Row>

            {/* Summary Section */}
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

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
              <Button
                variant="outline-secondary"
                onClick={() => router.back()}
                disabled={loading}
                className="order-2 order-md-1"
              >
                <IconifyIcon icon="tabler:arrow-left" className="me-1" />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="order-1 order-md-2"
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Processing {processingStatus.current} of {processingStatus.total}...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="tabler:check" className="me-1" />
                    Add Products
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onHide={handleCancelSubmission}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header className="border-bottom-0 pb-2">
          <Modal.Title className="h5">
            <IconifyIcon icon="tabler:alert-triangle" className="me-2 text-warning" />
            Confirm Product Addition
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <div className="alert alert-warning border-0 bg-warning bg-opacity-10">
            <div className="d-flex align-items-start">
              <IconifyIcon icon="tabler:info-circle" className="me-2 text-warning mt-1" />
              <div>
                <strong>No Account Selected</strong>
                <p className="mb-0 mt-1">
                  You haven't assigned these products to a specific account.
                  They will be added to your general inventory instead.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h6 className="mb-2">Products to be added:</h6>
            <ul className="list-unstyled">
              {pendingFormData?.products.map((product, index) => (
                <li key={index} className="mb-2 p-2 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{product.name || `Product ${index + 1}`}</strong>
                      {product.referenceNumber && (
                        <span className="text-muted ms-2">({product.referenceNumber})</span>
                      )}
                      <div className="small text-muted">
                        {product.qty} {product.unit} × ${product.price}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold">
                        ${(Number(product.qty) * Number(product.price)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-top pt-2 mt-3">
              <div className="d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>${(pendingFormData?.products.reduce((sum, p) => sum + (Number(p.qty) * Number(p.price)), 0) || 0).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Shipping:</span>
                <span>${Number(pendingFormData?.shippingCost || 0).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button
            variant="outline-secondary"
            onClick={handleCancelSubmission}
            disabled={loading}
          >
            <IconifyIcon icon="tabler:x" className="me-1" />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmSubmission}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Adding...
              </>
            ) : (
              <>
                <IconifyIcon icon="tabler:check" className="me-1" />
                Confirm & Add Products
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 999 }}
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  )
}

export default AddProductsPage;