'use client'
import React from 'react'
import { Form, Button, Row, Col, Card, CardBody } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface MobileProductCardProps {
  index: number;
  control: any;
  errors: any;
  touchedFields: any;
  showValidationErrors: boolean;
  remove: (index: number) => void;
  fieldsCount: number;
  unitOptions: string[];
  measurementOptions: { label: string; value: number }[];
  userCategories: any[];
  productTypes: any[];
}

const preventNumberInputStepping = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
  }
}

const preventWheelNumberChange = (event: React.WheelEvent<HTMLInputElement>) => {
  event.currentTarget.blur()
}

const MobileProductCard: React.FC<MobileProductCardProps> = ({
  index,
  control,
  errors,
  touchedFields,
  showValidationErrors,
  remove,
  fieldsCount,
  unitOptions,
  measurementOptions,
  userCategories,
  productTypes
}) => {
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
                  placeholder="Ref #"
                  size="sm"
                  isInvalid={!!productErrors?.referenceNumber && shouldShowErrors}
                  {...field}
                />
              )}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Product Name</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.name` as const}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  placeholder="Name"
                  size="sm"
                  isInvalid={!!productErrors?.name && shouldShowErrors}
                  {...field}
                />
              )}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Quantity *</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.qty` as const}
              render={({ field }) => (
                <Form.Control
                  type="number"
                  placeholder="Qty"
                  step="any"
                  size="sm"
                  isInvalid={!!productErrors?.qty && shouldShowErrors}
                  onKeyDown={preventNumberInputStepping}
                  onWheel={preventWheelNumberChange}
                  {...field}
                />
              )}
            />
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
                  <option value="">Unit</option>
                  {unitOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </Form.Select>
              )}
            />
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
                  <option value="">Measure</option>
                  {measurementOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              )}
            />
          </Col>
          <Col xs={6}>
            <Form.Label className="small fw-semibold">Price *</Form.Label>
            <Controller
              control={control}
              name={`products.${index}.price` as const}
              render={({ field }) => (
                <Form.Control
                  type="number"
                  placeholder="Price"
                  step="any"
                  size="sm"
                  isInvalid={!!productErrors?.price && shouldShowErrors}
                  onKeyDown={preventNumberInputStepping}
                  onWheel={preventWheelNumberChange}
                  {...field}
                />
              )}
            />
          </Col>
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
          </Col>
        </Row>
      </CardBody>
    </Card >
  )
}

export default React.memo(MobileProductCard)
