import React, { createContext, ReactNode, useContext, useCallback } from 'react'
import { compose, graphql } from 'react-apollo'
import { useOrderQueue, useQueueStatus } from 'vtex.order-manager/OrderQueue'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import {
  estimateShipping as EstimateShipping,
  selectDeliveryOption as SelectDeliveryOption,
} from 'vtex.checkout-resources/Mutations'

interface Context {
  countries: string[]
  selectedAddress: CheckoutAddress
  insertAddress: (address: CheckoutAddress) => void
  deliveryOptions: DeliveryOption[]
  selectDeliveryOption: (option: string) => void
}

interface OrderShippingProps {
  children: ReactNode
  EstimateShipping: any
  SelectDeliveryOption: any
}

const OrderShippingContext = createContext<Context | undefined>(undefined)

const shippingId = 'Shipping'
const TASK_CANCELLED = 'TASK_CANCELLED'

const QueueStatus = {
  PENDING: 'Pending',
  FULFILLED: 'Fulfilled',
}

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

export const OrderShippingProvider = compose(
  graphql(EstimateShipping, { name: 'EstimateShipping' }),
  graphql(SelectDeliveryOption, { name: 'SelectDeliveryOption' })
)(
  ({
    children,
    EstimateShipping,
    SelectDeliveryOption,
  }: OrderShippingProps) => {
    const { enqueue, listen } = useOrderQueue()
    const { orderForm, setOrderForm } = useOrderForm()

    const queueStatusRef = useQueueStatus(listen)

    const {
      shipping: { countries, selectedAddress, deliveryOptions },
    } = orderForm

    const insertAddress = useCallback(
      (address: CheckoutAddress) => {
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

        enqueue(task, shippingId)
          .then((newOrderForm: OrderForm) => {
            if (queueStatusRef.current === QueueStatus.FULFILLED) {
              setOrderForm(newOrderForm)
            }
          })
          .catch((error: any) => {
            if (!error || error.code !== TASK_CANCELLED) {
              throw error
            }
          })
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
            data: { selectDeliveryOption: newOrderForm },
          } = await SelectDeliveryOption({
            variables: {
              deliveryOptionId: deliveryOptionId,
            },
          })

          return newOrderForm
        }

        enqueue(task, shippingId)
          .then((newOrderForm: OrderForm) => {
            if (queueStatusRef.current === QueueStatus.FULFILLED) {
              setOrderForm(newOrderForm)
            }
          })
          .catch((error: any) => {
            if (!error || error.code !== TASK_CANCELLED) {
              throw error
            }
          })
      },
      [
        SelectDeliveryOption,
        deliveryOptions,
        enqueue,
        queueStatusRef,
        orderForm,
        setOrderForm,
      ]
    )

    return (
      <OrderShippingContext.Provider
        value={{
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
)

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
