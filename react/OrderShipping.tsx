import React, { createContext, useContext, useCallback } from 'react'
import { useMutation } from 'react-apollo'
import { OrderQueue, OrderForm } from 'vtex.order-manager'
import EstimateShippingMutation from 'vtex.checkout-resources/MutationEstimateShipping'
import SelectDeliveryOptionMutation from 'vtex.checkout-resources/MutationSelectDeliveryOption'

const { QueueStatus, useOrderQueue, useQueueStatus } = OrderQueue

const { useOrderForm } = OrderForm

interface InsertAddressResult {
  success: boolean
}

interface Context {
  countries: string[]
  canEditData: boolean
  selectedAddress: CheckoutAddress
  insertAddress: (address: CheckoutAddress) => Promise<InsertAddressResult>
  deliveryOptions: DeliveryOption[]
  selectDeliveryOption: (option: string) => void
}

const OrderShippingContext = createContext<Context | undefined>(undefined)

const shippingId = 'Shipping'
const TASK_CANCELLED = 'TASK_CANCELLED'

const changeSelectedDeliveryOption = (
  deliveryOptions: DeliveryOption[],
  selectedDeliveryOptionId: string
) => {
  return deliveryOptions.map(option => {
    if (option.isSelected) {
      option.isSelected = false
    } else if (option.id === selectedDeliveryOptionId) {
      option.isSelected = true
    }

    return option
  })
}

const updateShipping = (totalizers: Totalizer[], newShippingValue: number) => {
  return totalizers.map(totalizer => {
    if (totalizer.id === shippingId) {
      totalizer.value = newShippingValue
    }
    return totalizer
  })
}

const getShipping = (totalizers: Totalizer[]) => {
  return totalizers.find(totalizer => {
    return totalizer.id === shippingId
  })
}

const findDeliveryOptionById = (
  deliveryOptions: DeliveryOption[],
  deliveryOptionId: string
): DeliveryOption => {
  return deliveryOptions.find(option => {
    return option.id === deliveryOptionId
  })!
}

export const OrderShippingProvider: React.FC = ({ children }) => {
  const [EstimateShipping] = useMutation(EstimateShippingMutation)
  const [SelectDeliveryOption] = useMutation(SelectDeliveryOptionMutation)

  const { enqueue, listen } = useOrderQueue()
  const { orderForm, setOrderForm } = useOrderForm()

  const queueStatusRef = useQueueStatus(listen)

  const {
    canEditData,
    shipping: { countries, selectedAddress, deliveryOptions },
  } = orderForm

  const insertAddress = useCallback(
    async (address: CheckoutAddress) => {
      const task = async () => {
        const {
          data: { estimateShipping: newOrderForm },
        } = await EstimateShipping({
          variables: {
            addressInput: address,
          },
        })

        return newOrderForm
      }

      try {
        const newOrderForm = await enqueue(task, 'insertAddress')

        if (queueStatusRef.current === QueueStatus.FULFILLED) {
          setOrderForm(newOrderForm)
        }

        return { success: true }
      } catch (error) {
        if (!error || error.code !== TASK_CANCELLED) {
          throw error
        }
        return { success: false }
      }
    },
    [EstimateShipping, enqueue, queueStatusRef, setOrderForm]
  )

  const selectDeliveryOption = useCallback(
    (deliveryOptionId: string) => {
      const { price } = findDeliveryOptionById(
        deliveryOptions,
        deliveryOptionId
      )

      const shipping = getShipping(orderForm.totalizers)
      if (!shipping) {
        throw new Error('Shipping totalizer not found')
      }

      const oldShippingPrice = shipping.value

      const newOrderForm = {
        ...orderForm,
        shipping: {
          ...orderForm.shipping,
          deliveryOptions: changeSelectedDeliveryOption(
            deliveryOptions,
            deliveryOptionId
          ),
        },
        totalizers: updateShipping(orderForm.totalizers, price),
        value: orderForm.value - oldShippingPrice + price,
      }
      setOrderForm(newOrderForm)
      const task = async () => {
        const {
          data: { selectDeliveryOption: updatedOrderForm },
        } = await SelectDeliveryOption({
          variables: {
            deliveryOptionId,
          },
        })

        return updatedOrderForm
      }

      enqueue(task, 'selectDeliveryOption')
    },
    [SelectDeliveryOption, deliveryOptions, enqueue, orderForm, setOrderForm]
  )

  return (
    <OrderShippingContext.Provider
      value={{
        canEditData,
        countries,
        selectedAddress,
        insertAddress,
        deliveryOptions,
        selectDeliveryOption,
      }}
    >
      {children}
    </OrderShippingContext.Provider>
  )
}

export const useOrderShipping = () => {
  const context = useContext(OrderShippingContext)
  if (context === undefined) {
    throw new Error(
      'useOrderShipping must be used within a OrderShippingProvider'
    )
  }

  return context
}

export default { OrderShippingProvider, useOrderShipping }
