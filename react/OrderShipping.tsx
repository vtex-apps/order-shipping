import React, {
  createContext,
  ReactNode,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { compose, graphql } from 'react-apollo'
import { useOrderQueue } from 'vtex.order-manager/OrderQueue'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import {
  estimateShipping as EstimateShipping,
  selectDeliveryOption as SelectDeliveryOption,
} from 'vtex.checkout-resources/Mutations'

interface Context {
  countries: string[]
  selectedAddress: any
  insertAddress: any
  deliveryOptions: any
  selectDeliveryOption: any
}

interface OrderShippingProps {
  children: ReactNode
  EstimateShipping: any
  SelectDeliveryOption: any
}

const OrderShippingContext = createContext<Context | undefined>(undefined)

const shippingId = 'shipping'

const getNewDeliveryOptions = (
  deliveryOptions: DeliveryOption[],
  selectedDeliveryOption: string
) => {
  return deliveryOptions.map(option => {
    if (option.isSelected) {
      option.isSelected = false
    } else if (option.id === selectedDeliveryOption) {
      option.isSelected = true
    }

    return option
  })
}

const updateShipping = (totalizers: Totalizer[], newShippingValue: number) => {
  return totalizers.map(totalizer => {
    if (totalizer.id === 'Shipping') {
      totalizer.value = newShippingValue
    }
    return totalizer
  })
}

const getShipping = (totalizers: Totalizer[]) => {
  return totalizers.find(totalizer => {
    return totalizer.id === 'Shipping'
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

    const {
      shipping: { countries, selectedAddress, deliveryOptions },
    } = orderForm

    const isQueueBusy = useRef(false)
    useEffect(() => {
      const unlisten = listen('Pending', () => (isQueueBusy.current = true))
      return unlisten
    })
    useEffect(() => {
      const unlisten = listen('Fulfilled', () => (isQueueBusy.current = false))
      return unlisten
    })

    const insertAddress = useCallback(
      (address: any) => {
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
            if (!isQueueBusy.current) {
              setOrderForm(newOrderForm)
            }
          })
          .catch((error: any) => {
            if (!error || error.code !== 'TASK_CANCELLED') {
              throw error
            }
          })
      },
      [EstimateShipping, enqueue, setOrderForm]
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
            deliveryOptions: getNewDeliveryOptions(
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
            if (!isQueueBusy.current) {
              setOrderForm(newOrderForm)
            }
          })
          .catch((error: any) => {
            if (!error || error.code !== 'TASK_CANCELLED') {
              throw error
            }
          })
      },
      [SelectDeliveryOption, deliveryOptions, enqueue, orderForm, setOrderForm]
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
