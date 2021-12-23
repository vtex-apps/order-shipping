import { useCallback } from 'react'
import { useMutation } from 'react-apollo'
import { OrderQueue, OrderForm } from 'vtex.order-manager'
import { Address as CheckoutAddress } from '@vtex/checkout-types'
import EstimateShippingMutation from 'vtex.checkout-resources/MutationEstimateShipping'
import SelectDeliveryOptionMutation from 'vtex.checkout-resources/MutationSelectDeliveryOption'
import SelectPickupOptionMutation from 'vtex.checkout-resources/MutationSelectPickupOption'
import UpdateSelectedAddressMutation from 'vtex.checkout-resources/MutationUpdateSelectedAddress'

import { useLogger } from './utils/logger'
import {
  createOrderShippingProvider,
  useOrderShipping,
} from './components/createOrderShippingProvider'

const { useOrderQueue, useQueueStatus } = OrderQueue

const { useOrderForm } = OrderForm

function useEstimateShipping() {
  const [estimateShipping] = useMutation(EstimateShippingMutation)

  return {
    estimateShipping: useCallback(
      async (address: CheckoutAddress) => {
        const {
          data: { estimateShipping: newOrderForm },
        } = await estimateShipping({
          variables: { addressInput: address },
        })

        return newOrderForm
      },
      [estimateShipping]
    ),
  }
}

function useSelectDeliveryOption() {
  const [selectDeliveryOption] = useMutation(SelectDeliveryOptionMutation)
  return {
    selectDeliveryOption: useCallback(
      async (deliveryOptionId: string) => {
        const {
          data: { selectDeliveryOption: newOrderForm },
        } = await selectDeliveryOption({
          variables: {
            deliveryOptionId,
          },
        })

        return newOrderForm
      },
      [selectDeliveryOption]
    ),
  }
}

function useSelectPickupOption() {
  const [selectPickupOption] = useMutation(SelectPickupOptionMutation)
  return {
    selectPickupOption: useCallback(
      async (pickupOptionId: string) => {
        const {
          data: { selectPickupOption: newOrderForm },
        } = await selectPickupOption({
          variables: {
            pickupOptionId,
          },
        })

        return newOrderForm
      },
      [selectPickupOption]
    ),
  }
}

function useUpdateSelectedAddress() {
  const [updateSelectedAddress] = useMutation(UpdateSelectedAddressMutation)
  return {
    updateSelectedAddress: useCallback(
      async (address: CheckoutAddress) => {
        const {
          data: { updateSelectedAddress: newOrderForm },
        } = await updateSelectedAddress({
          variables: {
            address,
          },
        })

        return newOrderForm
      },
      [updateSelectedAddress]
    ),
  }
}

const { OrderShippingProvider } = createOrderShippingProvider({
  useOrderForm,
  useOrderQueue,
  useQueueStatus,
  useSelectPickupOption,
  useEstimateShipping,
  useSelectDeliveryOption,
  useLogger,
  useUpdateSelectedAddress,
})

export { OrderShippingProvider, useOrderShipping }
export default { OrderShippingProvider, useOrderShipping }
