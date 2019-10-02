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
  selectedAddress: CheckoutAddress
  insertAddress: any
  deliveryOptions: DeliveryOption[]
  selectDeliveryOption: any
}

interface OrderShippingProps {
  children: ReactNode
  EstimateShipping: any
  SelectDeliveryOption: any
}

const OrderShippingContext = createContext<Context | undefined>(undefined)

const shippingId = 'Shipping'

const STATUS = {
  PENDING: 'Pending',
  FULFILLED: 'Fulfilled',
}

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
      const unlisten = listen(
        STATUS.PENDING,
        () => (isQueueBusy.current = true)
      )
      return unlisten
    }, [listen])
    useEffect(() => {
      const unlisten = listen(
        STATUS.FULFILLED,
        () => (isQueueBusy.current = false)
      )
      return unlisten
    }, [listen])

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
            if (!isQueueBusy.current) {
              setOrderForm(newOrderForm)
            }
          })
          .catch((error: any) => {
            if (!error || error.code !== TASK_CANCELLED) {
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
            if (!isQueueBusy.current) {
              setOrderForm(newOrderForm)
            }
          })
          .catch((error: any) => {
            if (!error || error.code !== TASK_CANCELLED) {
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
