'use client'
import { useState, useEffect } from 'react'
import PageTitle from "@/components/PageTitle"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import { Card, CardHeader, CardFooter, CardTitle, Row, Col, Button, Form, Modal, Alert, Dropdown } from "react-bootstrap"
import api from '@/utils/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useNotificationContext } from '@/context/useNotificationContext'

interface PersonalSettings {
  _id?: string
  user_id: string
  units: string[]
  default_unit: string
  created_at?: Date
  updated_at?: Date
}

interface ProductType {
  _id: string
  name: string
  active: boolean
}

export default function PersonalSettingsPage() {
  // State management
  const [settings, setSettings] = useState<PersonalSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUnit, setNewUnit] = useState('')
  const [editingUnits, setEditingUnits] = useState<string[]>([])
  const [editingDefaultUnit, setEditingDefaultUnit] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)

  // Product Types state
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [showProductTypeModal, setShowProductTypeModal] = useState(false)
  const [newProductType, setNewProductType] = useState('')
  const [productTypeLoading, setProductTypeLoading] = useState(false)

  const setSettingsZustand = useAuthStore((state) => state.setSettings)

  const user = useAuthStore((state) => state.user)
  const { showNotification } = useNotificationContext()

  async function fetchSettings() {
    setLoading(true)
    try {
      const response = await api.get('/api/personal-settings')
      setSettings(response.data)
      setSettingsZustand(response.data)
      setEditingUnits(response.data.units || [])
      setEditingDefaultUnit(response.data.default_unit || '')
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error fetching personal settings',
        variant: 'danger'
      })
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load personal settings from API on component mount
  useEffect(() => {
    if (user?._id) {
      fetchSettings()
      fetchProductTypes()
    }
  }, [user?._id])

  async function fetchProductTypes() {
    setProductTypeLoading(true)
    try {
      const response = await api.get(`/api/product-types/${user?._id}`)
      setProductTypes(response.data)
    } catch (error: any) {
      console.error("Error fetching product types:", error)
    } finally {
      setProductTypeLoading(false)
    }
  }

  const handleAddProductType = async () => {
    if (!newProductType.trim()) return

    setSaving(true)
    try {
      await api.post('/api/product-types', {
        name: newProductType.trim(),
        user_id: user?._id
      })
      setNewProductType('')
      setShowProductTypeModal(false)
      fetchProductTypes()
      showNotification({ message: 'Product type added successfully', variant: 'success' })
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error adding product type',
        variant: 'danger'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveProductType = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product type?')) return

    setSaving(true)
    try {
      await api.delete('/api/product-types', { data: { id } })
      fetchProductTypes()
      showNotification({ message: 'Product type removed successfully', variant: 'success' })
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error removing product type',
        variant: 'danger'
      })
    } finally {
      setSaving(false)
    }
  }

  // Save settings to API
  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await api.post('/api/personal-settings', {
        units: editingUnits,
        default_unit: editingDefaultUnit
      })

      setSettings(response.data.settings)
      setIsEditing(false)
      showNotification({
        message: response.data.message || 'Settings saved successfully',
        variant: 'success'
      })
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error saving settings',
        variant: 'danger'
      })
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  // Update units specifically
  const handleUpdateUnits = async (units: string[]) => {
    setSaving(true)
    try {
      const response = await api.patch('/api/personal-settings/units', { units })

      setSettings(response.data.settings)
      setEditingUnits(units)

      // If the current default unit is not in the new units array, update it
      if (!units.includes(editingDefaultUnit) && units.length > 0) {
        setEditingDefaultUnit(units[0])
        await handleUpdateDefaultUnit(units[0])
      }

      showNotification({
        message: response.data.message || 'Units updated successfully',
        variant: 'success'
      })
      fetchSettings()
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error updating units',
        variant: 'danger'
      })
      console.error("Error updating units:", error)
    } finally {
      setSaving(false)
    }
  }

  // Update default unit
  const handleUpdateDefaultUnit = async (defaultUnit: string) => {
    setSaving(true)
    try {
      const response = await api.patch('/api/personal-settings/default-unit', {
        default_unit: defaultUnit
      })

      setSettings(response.data.settings)
      setEditingDefaultUnit(defaultUnit)
      showNotification({
        message: response.data.message || 'Default unit updated successfully',
        variant: 'success'
      })
      fetchSettings()
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error updating default unit',
        variant: 'danger'
      })
      console.error("Error updating default unit:", error)
    } finally {
      setSaving(false)
    }
  }

  // Delete settings
  const handleDeleteSettings = async () => {
    if (!confirm('Are you sure you want to delete all personal settings?')) return

    setSaving(true)
    try {
      await api.delete('/api/personal-settings')

      setSettings(null)
      setEditingUnits([])
      setEditingDefaultUnit('')
      showNotification({
        message: 'Settings deleted successfully',
        variant: 'success'
      })
    } catch (error: any) {
      showNotification({
        message: error?.response?.data?.error || 'Error deleting settings',
        variant: 'danger'
      })
      console.error("Error deleting settings:", error)
    } finally {
      setSaving(false)
    }
  }

  // Add new unit
  const handleAddUnit = () => {
    if (newUnit.trim() && !editingUnits.includes(newUnit.trim())) {
      const updatedUnits = [...editingUnits, newUnit.trim()]
      setEditingUnits(updatedUnits)

      // If no default unit is set, set the new unit as default
      if (!editingDefaultUnit) {
        setEditingDefaultUnit(newUnit.trim())
      }

      setNewUnit('')
      setShowAddModal(false)

      if (!isEditing) {
        handleUpdateUnits(updatedUnits)
      }
    }
  }

  // Remove unit
  const handleRemoveUnit = (unitToRemove: string) => {
    const updatedUnits = editingUnits.filter(unit => unit !== unitToRemove)
    setEditingUnits(updatedUnits)

    // If removing the default unit, set the first remaining unit as default
    if (editingDefaultUnit === unitToRemove && updatedUnits.length > 0) {
      setEditingDefaultUnit(updatedUnits[0])
    } else if (updatedUnits.length === 0) {
      setEditingDefaultUnit('')
    }

    if (!isEditing) {
      handleUpdateUnits(updatedUnits)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUnits(settings?.units || [])
    setEditingDefaultUnit(settings?.default_unit || '')
    setIsEditing(false)
  }

  return (
    <>
      {/* Page Title */}
      <PageTitle title="Personal Settings" subTitle="Manage Your Personal Settings" />

      <Row>
        <Col xs={12}>
          <Card>
            {/* Header with Title and Action Buttons */}
            <CardHeader className="d-flex align-items-center justify-content-between border-bottom border-light">
              <CardTitle as="h4" className="mb-0">
                Personal Settings
              </CardTitle>
            </CardHeader>

            {/* Settings Content */}
            <div className="p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading personal settings...</p>
                </div>
              ) : settings ? (
                <div>
                  {/* Units Section */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 className="mb-0">Units</h5>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        disabled={saving}
                      >
                        <IconifyIcon icon="tabler:plus" className="me-1" />
                        Add Unit
                      </Button>
                    </div>

                    {editingUnits.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {editingUnits.map((unit, index) => (
                          <div key={index} className="badge bg-light text-dark border p-2 d-flex align-items-center">
                            <span className="me-2">{unit}</span>
                            {unit === editingDefaultUnit && (
                              <span className="badge bg-primary me-2" style={{ fontSize: '0.6em' }}>
                                DEFAULT
                              </span>
                            )}
                            {(isEditing || editingUnits.length > 1) && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-danger"
                                onClick={() => handleRemoveUnit(unit)}
                                disabled={saving}
                              >
                                <IconifyIcon icon="tabler:x" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info">
                        No units configured. Click "Add Unit" to add measurement units.
                      </Alert>
                    )}
                  </div>

                  {/* Default Unit Section */}
                  {editingUnits.length > 0 && (
                    <div className="mb-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="mb-0">Default Unit</h6>
                      </div>

                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          id="default-unit-dropdown"
                          disabled={saving}
                        >
                          {editingDefaultUnit || 'Select Default Unit'}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          {editingUnits.map((unit, index) => (
                            <Dropdown.Item
                              key={index}
                              active={unit === editingDefaultUnit}
                              onClick={() => {
                                setEditingDefaultUnit(unit)
                                if (!isEditing) {
                                  handleUpdateDefaultUnit(unit)
                                }
                              }}
                            >
                              {unit}
                              {unit === editingDefaultUnit && (
                                <IconifyIcon icon="tabler:check" className="ms-2 text-success" />
                              )}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>

                      <small className="text-muted d-block mt-2">
                        This unit will be selected by default when adding new items.
                      </small>
                    </div>
                  )}

                  {/* Product Types Section */}
                  <div className="mb-4 pt-4 border-top">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 className="mb-0">Product Types</h5>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowProductTypeModal(true)}
                        disabled={saving}
                      >
                        <IconifyIcon icon="tabler:plus" className="me-1" />
                        Add Product Type
                      </Button>
                    </div>

                    {productTypeLoading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : productTypes.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {productTypes.map((type) => (
                          <div key={type._id} className="badge bg-light text-dark border p-2 d-flex align-items-center">
                            <span className="me-2">{type.name}</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-danger"
                              onClick={() => handleRemoveProductType(type._id)}
                              disabled={saving}
                            >
                              <IconifyIcon icon="tabler:x" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info">
                        No product types configured. Click "Add Product Type" to add them.
                      </Alert>
                    )}
                  </div>

                  {/* Settings Info */}
                  <div className="border-top pt-3">
                    <small className="text-muted">
                      <strong>Created:</strong> {settings.created_at ? new Date(settings.created_at).toLocaleString() : 'N/A'}
                      <br />
                      <strong>Last Updated:</strong> {settings.updated_at ? new Date(settings.updated_at).toLocaleString() : 'N/A'}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <IconifyIcon icon="tabler:settings" className="fs-1 text-muted mb-3" />
                  <h5 className="text-muted">No personal settings found</h5>
                  <p className="text-muted">Your settings will be created automatically when you make changes.</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Add Unit Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Unit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Unit Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter unit name (e.g., ounces, liters)"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddUnit()}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUnit}
            disabled={!newUnit.trim() || editingUnits.includes(newUnit.trim())}
          >
            Add Unit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Type Modal */}
      <Modal show={showProductTypeModal} onHide={() => setShowProductTypeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Product Type Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product type (e.g., Indica, Sativa, Hybrid, Gear)"
                value={newProductType}
                onChange={(e) => setNewProductType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddProductType()}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductTypeModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddProductType}
            disabled={!newProductType.trim() || saving}
          >
            {saving ? 'Adding...' : 'Add Product Type'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}