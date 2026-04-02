'use client'
import React from 'react'
import { Form, Button } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface ProductTableRowProps {
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

const ProductTableRow: React.FC<ProductTableRowProps> = ({
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
    <tr>
      <td>
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
        {shouldShowErrors && productErrors?.referenceNumber && (
          <Form.Control.Feedback type="invalid" className="small d-block">
            {productErrors.referenceNumber.message}
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
        {shouldShowErrors && productErrors?.name && (
          <Form.Control.Feedback type="invalid" className="small d-block">
            {productErrors.name.message}
          </Form.Control.Feedback>
        )}
      </td>
      <td style={{ width: '100px' }}>
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
        {shouldShowErrors && productErrors?.qty && (
          <Form.Control.Feedback type="invalid" className="small d-block">
            {productErrors.qty.message}
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
              <option value="">Unit</option>
              {unitOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </Form.Select>
          )}
        />
        {shouldShowErrors && productErrors?.unit && (
          <Form.Control.Feedback type="invalid" className="small d-block">
            {productErrors.unit.message}
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
              <option value="">Measure</option>
              {measurementOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          )}
        />
        {shouldShowErrors && productErrors?.measurement && (
          <Form.Control.Feedback type="invalid" className="small d-block">
            {productErrors.measurement.message}
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
              <option value="">Category</option>
              {userCategories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          )}
        />
        {shouldShowErrors && productErrors?.category && (
          <Form.Control.Feedback type="invalid" className="small d-block">
            {productErrors.category.message}
          </Form.Control.Feedback>
        )}
      </td>
      <td style={{ width: '100px' }}>
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
        {shouldShowErrors && productErrors?.price && (
          <Form.Control.Feedback type="invalid" className="small d-block">
            {productErrors.price.message}
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
              <option value="">Type</option>
              {productTypes.map((type: any) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </Form.Select>
          )}
        />
        {shouldShowErrors && productErrors?.product_type && (
          <Form.Control.Feedback type="invalid" className="small d-block">
            {productErrors.product_type.message}
          </Form.Control.Feedback>
        )}
      </td>
      <td>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => remove(index)}
          disabled={fieldsCount === 1}
        >
          <IconifyIcon icon="tabler:trash" />
        </Button>
      </td>
    </tr>
  )
}

export default React.memo(ProductTableRow)
