import React, { FC } from 'react'
import {
  useOrderForm,
  useOrderQueue,
  useQueueStatus,
  OrderQueueProvider,
} from '@vtex/order-manager'
import { renderHook, act } from '@testing-library/react-hooks'

import {
  createOrderShippingProvider,
  useOrderShipping,
} from '../components/createOrderShippingProvider'
import { LogParams } from '../utils/logger'
import { OrderFormProvider } from '../__fixtures__/OrderFormProvider'
import { mockOrderForm } from '../__fixtures__/orderForm'

const mockLog = jest.fn()

function useLogger() {
  const log = ({
    type,
    level,
    event,
    workflowType,
    workflowInstance,
  }: LogParams) => {
    mockLog({
      type,
      level,
      event,
      workflowType: workflowType ?? 'OrderProfileTest',
      workflowInstance,
    })
  }

  return { log }
}

const mockUseSelectPickupOption = jest.fn().mockResolvedValue(true)
const mockUseEstimateShipping = jest.fn().mockResolvedValue(true)
const mockUseSelectDeliveryOption = jest.fn().mockResolvedValue(true)
const mockUseUpdateSelectedAddress = jest.fn().mockResolvedValue(true)

const createWrapperOrderProviders = () => {
  const useSelectPickupOption = () => ({
    selectPickupOption: mockUseSelectPickupOption,
  })

  const useEstimateShipping = () => ({
    estimateShipping: mockUseEstimateShipping,
  })

  const useUpdateSelectedAddress = () => ({
    updateSelectedAddress: mockUseUpdateSelectedAddress,
  })
  const useSelectDeliveryOption = () => ({
    selectDeliveryOption: mockUseSelectDeliveryOption,
  })

  const { OrderShippingProvider } = createOrderShippingProvider({
    useLogger,
    useOrderQueue,
    useOrderForm,
    useQueueStatus,
    useSelectPickupOption,
    useEstimateShipping,
    useUpdateSelectedAddress,
    useSelectDeliveryOption,
  })

  const Wrapper: FC = ({ children }) => {
    return (
      <OrderQueueProvider>
        <OrderFormProvider>
          <OrderShippingProvider>{children}</OrderShippingProvider>
        </OrderFormProvider>
      </OrderQueueProvider>
    )
  }

  return { Wrapper }
}

const mockAddress = {
  addressId: '1569522356557',
  addressType: 'residential',
  city: 'Rio de Janeiro',
  complement: '',
  country: 'BRA',
  neighborhood: 'Flamengo',
  number: '',
  postalCode: '22250-040',
  receiverName: '',
  reference: '',
  state: 'RJ',
  street: '',
  geoCoordinates: [],
}

describe('OrderProfile', () => {
  it('should throw an error if theres no OrderShippingProvider on the tree', () => {
    const {
      result: { error },
    } = renderHook(() => useOrderShipping())

    expect(error).not.toBeNull()
    expect(error?.message).toEqual(
      'useOrderShipping must be used within a OrderShippingProvider'
    )
  })

  it('should get the right values from the orderForm', () => {
    const { Wrapper } = createWrapperOrderProviders()

    const {
      result: { error, current },
    } = renderHook(() => useOrderShipping(), { wrapper: Wrapper })

    expect(error).toBeUndefined()
    expect(current.selectedAddress).toEqual(
      mockOrderForm.shipping.selectedAddress
    )
    expect(current.countries).toEqual(mockOrderForm.shipping.countries)
    expect(current.deliveryOptions).toEqual(
      mockOrderForm.shipping.deliveryOptions
    )
  })

  it('should call estimateShipping if insertAddress was executed', async () => {
    const { Wrapper } = createWrapperOrderProviders()

    const {
      result: {
        current: { insertAddress },
      },
    } = renderHook(() => useOrderShipping(), { wrapper: Wrapper })

    await act(async () => {
      const { success } = await insertAddress(mockAddress)

      expect(success).toBeTruthy()
    })
    expect(mockUseEstimateShipping).toHaveBeenCalledWith(
      mockAddress,
      mockOrderForm.id
    )
    expect(mockLog).not.toHaveBeenCalled()
  })

  it('should call selectedDeliveryOption query if selectDeliveryOption was executed', async () => {
    const { Wrapper } = createWrapperOrderProviders()

    const {
      result: {
        current: { selectDeliveryOption },
      },
    } = renderHook(() => useOrderShipping(), { wrapper: Wrapper })

    await act(async () => {
      const { success } = await selectDeliveryOption(
        mockOrderForm.shipping.deliveryOptions[1].id
      )

      expect(success).toBeTruthy()
    })
    expect(mockUseSelectDeliveryOption).toHaveBeenCalledWith(
      mockOrderForm.shipping.deliveryOptions[1].id,
      mockOrderForm.id
    )
    expect(mockLog).not.toHaveBeenCalled()
  })

  it('should call selectedPickupOption query if selectedPickupOption was executed', async () => {
    const { Wrapper } = createWrapperOrderProviders()

    const {
      result: {
        current: { selectPickupOption },
      },
    } = renderHook(() => useOrderShipping(), { wrapper: Wrapper })

    await act(async () => {
      const { success } = await selectPickupOption(
        mockOrderForm.shipping.deliveryOptions[1].id
      )

      expect(success).toBeTruthy()
    })
    expect(mockUseSelectPickupOption).toHaveBeenCalledWith(
      mockOrderForm.shipping.deliveryOptions[1].id,
      mockOrderForm.id
    )
    expect(mockLog).not.toHaveBeenCalled()
  })

  it('should call updateSelectedAddress if selectAddress was executed', async () => {
    const { Wrapper } = createWrapperOrderProviders()

    const {
      result: {
        current: { updateSelectedAddress },
      },
    } = renderHook(() => useOrderShipping(), { wrapper: Wrapper })

    await act(async () => {
      const { success } = await updateSelectedAddress(mockAddress)

      expect(success).toBeTruthy()
    })
    expect(mockUseUpdateSelectedAddress).toHaveBeenCalledWith(
      mockAddress,
      mockOrderForm.id
    )
    expect(mockLog).not.toHaveBeenCalled()
  })
})
