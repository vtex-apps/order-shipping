import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  FC,
} from 'react'
import { OrderQueueContext } from '@vtex/order-manager'
import {
  OrderForm as CheckoutOrderForm,
  Address as CheckoutAddress,
  DeliveryOption,
  PickupOption,
} from '@vtex/checkout-types'

import { UseLogger } from '../utils/logger'

export const QueueStatus = {
  PENDING: 'Pending',
  FULFILLED: 'Fulfilled',
} as const

interface InsertAddressResult {
  success: boolean
  orderForm?: CheckoutOrderForm
}

interface SelectShippingOptionResult {
  success: boolean
  orderForm?: CheckoutOrderForm
}

interface SelectAddressResult {
  success: boolean
}

interface ShippingContext {
  searchedAddress: CheckoutAddress | null
  countries: string[]
  canEditData: boolean
  selectedAddress?: CheckoutAddress
  updateSelectedAddress: (
    address: CheckoutAddress
  ) => Promise<SelectAddressResult>
  insertAddress: (address: CheckoutAddress) => Promise<InsertAddressResult>
  deliveryOptions: DeliveryOption[]
  pickupOptions: PickupOption[]
  selectDeliveryOption: (option: string) => Promise<SelectShippingOptionResult>
  selectPickupOption: (option: string) => Promise<SelectShippingOptionResult>
}

const OrderShippingContext = createContext<ShippingContext | undefined>(
  undefined
)

const TASK_CANCELLED = 'TASK_CANCELLED'

type ListenFunction = (event: any, callback: () => void) => () => void
interface QueueContext {
  enqueue: (task: () => Promise<CheckoutOrderForm>, id?: string) => any
  listen: ListenFunction
  isWaiting: (id: string) => boolean
}
declare type OrderFormUpdate<O> =
  | Partial<O>
  | ((prevOrderForm: O) => Partial<O>)

interface OrderContext<O extends CheckoutOrderForm> {
  loading: boolean
  setOrderForm: (nextValue: OrderFormUpdate<O>) => void
  error: any | undefined
  orderForm: O
}

type UseEstimateShipping = () => {
  estimateShipping: (
    address: CheckoutAddress,
    orderFormId?: string
  ) => Promise<CheckoutOrderForm>
}

type UseSelectDeliveryOption = () => {
  selectDeliveryOption: (
    deliveryOptionId: string,
    orderFormId?: string
  ) => Promise<CheckoutOrderForm>
}

type UseSelectPickupOption = () => {
  selectPickupOption: (
    pickupOptionId: string,
    orderFormId?: string
  ) => Promise<CheckoutOrderForm>
}

type UseUpdateSelectedAddress = () => {
  updateSelectedAddress: (
    address: CheckoutAddress,
    orderFormId?: string
  ) => Promise<CheckoutOrderForm>
}

interface CreateOrderShippingProvider<O extends CheckoutOrderForm> {
  useLogger: UseLogger
  useOrderQueue: () => QueueContext
  useOrderForm: () => OrderContext<O>
  useQueueStatus: (listen: OrderQueueContext<O>['listen']) => any
  useEstimateShipping: UseEstimateShipping
  useSelectDeliveryOption: UseSelectDeliveryOption
  useSelectPickupOption: UseSelectPickupOption
  useUpdateSelectedAddress: UseUpdateSelectedAddress
}

export function createOrderShippingProvider({
  useLogger,
  useOrderQueue,
  useOrderForm,
  useQueueStatus,
  useEstimateShipping,
  useSelectDeliveryOption,
  useSelectPickupOption,
  useUpdateSelectedAddress,
}: CreateOrderShippingProvider<CheckoutOrderForm>) {
  const OrderShippingProvider: FC = ({ children }) => {
    const { enqueue, listen } = useOrderQueue()
    const { orderForm, setOrderForm } = useOrderForm()
    const { estimateShipping } = useEstimateShipping()
    const { selectDeliveryOption } = useSelectDeliveryOption()
    const { selectPickupOption } = useSelectPickupOption()
    const { updateSelectedAddress } = useUpdateSelectedAddress()
    const queueStatusRef = useQueueStatus(listen)
    const {
      canEditData,
      shipping: { countries, selectedAddress, deliveryOptions, pickupOptions },
    } = orderForm

    const [
      searchedAddress,
      setSearchedAddress,
    ] = useState<CheckoutAddress | null>(null)

    const handleInsertAddress = useCallback(
      async (address: CheckoutAddress) => {
        const task = async () => {
          const orderFormUpdate = await estimateShipping(address)

          return orderFormUpdate
        }

        try {
          const newOrderForm = await enqueue(task, 'insertAddress')

          if (queueStatusRef.current === QueueStatus.FULFILLED) {
            setOrderForm(newOrderForm)
          }

          setSearchedAddress(address)

          return { success: true, orderForm: newOrderForm as CheckoutOrderForm }
        } catch (error) {
          if (!error || error.code !== TASK_CANCELLED) {
            throw error
          }
          return { success: false }
        }
      },
      [estimateShipping, enqueue, queueStatusRef, setOrderForm]
    )

    const handleSelectDeliveryOption = useCallback(
      async (deliveryOptionId: string) => {
        const task = async () => {
          const updatedOrderForm = await selectDeliveryOption(deliveryOptionId)

          return updatedOrderForm
        }

        setOrderForm(prevOrderForm => ({
          ...prevOrderForm,
          shipping: {
            ...prevOrderForm.shipping,
            deliveryOptions: prevOrderForm.shipping.deliveryOptions?.map(
              deliveryOption => ({
                ...deliveryOption,
                isSelected: deliveryOption?.id === deliveryOptionId,
              })
            ),
          },
        }))

        enqueue(task, 'selectDeliveryOption').then(
          (newOrderForm: CheckoutOrderForm) => {
            if (queueStatusRef.current === QueueStatus.FULFILLED) {
              setOrderForm(newOrderForm)
            }
          }
        )

        return { success: true }
      },
      [queueStatusRef, selectDeliveryOption, enqueue, setOrderForm]
    )

    const handleSelectPickupOption = useCallback(
      async (pickupOptionId: string) => {
        const task = async () => {
          const updatedOrderForm = await selectPickupOption(pickupOptionId)

          return updatedOrderForm
        }

        setOrderForm(prevOrderForm => ({
          ...prevOrderForm,
          shipping: {
            ...prevOrderForm.shipping,
            pickupOptions: prevOrderForm.shipping.pickupOptions?.map(
              pickupOption => ({
                ...pickupOption,
                isSelected: pickupOption?.id === pickupOptionId,
              })
            ),
          },
        }))

        enqueue(task, 'selectPickupOption').then(
          (newOrderForm: CheckoutOrderForm) => {
            if (queueStatusRef.current === QueueStatus.FULFILLED) {
              setOrderForm(newOrderForm)
            }
          }
        )

        return { success: true }
      },
      [queueStatusRef, selectPickupOption, enqueue, setOrderForm]
    )

    const handleSelectAddress = useCallback(
      async (address: CheckoutAddress) => {
        const task = async () => {
          const newOrderForm = await updateSelectedAddress(address)

          return newOrderForm
        }

        try {
          const newOrderForm = await enqueue(task, 'selectAddress')

          if (queueStatusRef.current === QueueStatus.FULFILLED) {
            setOrderForm(newOrderForm)
          }

          return { success: true, orderForm: newOrderForm as CheckoutOrderForm }
        } catch (error) {
          if (!error || error.code !== TASK_CANCELLED) {
            throw error
          }
          return { success: false }
        }
      },
      [enqueue, queueStatusRef, updateSelectedAddress, setOrderForm]
    )

    const contextValue = useMemo(
      () => ({
        searchedAddress,
        canEditData,
        countries: countries as string[],
        selectedAddress: selectedAddress!,
        updateSelectedAddress: handleSelectAddress,
        insertAddress: handleInsertAddress,
        deliveryOptions: deliveryOptions as DeliveryOption[],
        pickupOptions: pickupOptions as PickupOption[],
        selectDeliveryOption: handleSelectDeliveryOption,
        selectPickupOption: handleSelectPickupOption,
      }),
      [
        searchedAddress,
        canEditData,
        countries,
        selectedAddress,
        handleSelectAddress,
        handleInsertAddress,
        deliveryOptions,
        pickupOptions,
        handleSelectDeliveryOption,
        handleSelectPickupOption,
      ]
    )

    return (
      <OrderShippingContext.Provider value={contextValue}>
        {children}
      </OrderShippingContext.Provider>
    )
  }

  return { OrderShippingProvider }
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

export default { createOrderShippingProvider, useOrderShipping }
