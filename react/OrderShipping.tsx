import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useMutation } from 'react-apollo'
import { OrderQueue, OrderForm } from 'vtex.order-manager'
import {
  OrderForm as CheckoutOrderForm,
  Address as CheckoutAddress,
  DeliveryOption,
} from 'vtex.checkout-graphql'
import EstimateShippingMutation from 'vtex.checkout-resources/MutationEstimateShipping'
import SelectDeliveryOptionMutation from 'vtex.checkout-resources/MutationSelectDeliveryOption'
import UpdateSelectedAddressMutation from 'vtex.checkout-resources/MutationUpdateSelectedAddress'

const { QueueStatus, useOrderQueue, useQueueStatus } = OrderQueue

const { useOrderForm } = OrderForm

interface InsertAddressResult {
  success: boolean
  orderForm?: CheckoutOrderForm
}

interface SelectDeliveryOptionResult {
  success: boolean
  orderForm?: CheckoutOrderForm
}

interface SelectAddressResult {
  success: boolean
  orderForm?: CheckoutOrderForm
}

interface Context {
  searchedAddress: CheckoutAddress | null
  countries: string[]
  canEditData: boolean
  selectedAddress?: CheckoutAddress
  updateSelectedAddress: (
    address: CheckoutAddress
  ) => Promise<SelectAddressResult>
  insertAddress: (address: CheckoutAddress) => Promise<InsertAddressResult>
  deliveryOptions: DeliveryOption[]
  selectDeliveryOption: (option: string) => Promise<SelectDeliveryOptionResult>
}

const OrderShippingContext = createContext<Context | undefined>(undefined)

const TASK_CANCELLED = 'TASK_CANCELLED'

export const OrderShippingProvider: React.FC = ({ children }) => {
  const [estimateShipping] = useMutation(EstimateShippingMutation)
  const [selectDeliveryOption] = useMutation(SelectDeliveryOptionMutation)
  const [updateSelectedAddress] = useMutation(UpdateSelectedAddressMutation)
  const [
    searchedAddress,
    setSearchedAddress,
  ] = useState<CheckoutAddress | null>(null)

  const { enqueue, listen } = useOrderQueue()
  const { orderForm, setOrderForm } = useOrderForm()

  const queueStatusRef = useQueueStatus(listen)

  const {
    canEditData,
    shipping: { countries, selectedAddress, deliveryOptions },
  } = orderForm

  const handleInsertAddress = useCallback(
    async (address: CheckoutAddress) => {
      const task = async () => {
        const {
          data: { estimateShipping: newOrderForm },
        } = await estimateShipping({
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
        const {
          data: { selectDeliveryOption: updatedOrderForm },
        } = await selectDeliveryOption({
          variables: {
            deliveryOptionId,
          },
        })

        return updatedOrderForm
      }

      try {
        const newOrderForm = await enqueue(task, 'selectDeliveryOption')

        if (queueStatusRef.current === QueueStatus.FULFILLED) {
          setOrderForm(newOrderForm)
        }

        return { success: true, orderForm: newOrderForm as CheckoutOrderForm }
      } catch (err) {
        if (!err || err.code !== TASK_CANCELLED) {
          throw err
        }
        return { success: false }
      }
    },
    [queueStatusRef, selectDeliveryOption, enqueue, setOrderForm]
  )

  const handleSelectAddress = useCallback(
    async (address: CheckoutAddress) => {
      const task = async () => {
        const {
          data: { updateSelectedAddress: newOrderForm },
        } = await updateSelectedAddress({
          variables: {
            address,
          },
        })

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
      selectDeliveryOption: handleSelectDeliveryOption,
    }),
    [
      searchedAddress,
      canEditData,
      countries,
      selectedAddress,
      handleSelectAddress,
      handleInsertAddress,
      deliveryOptions,
      handleSelectDeliveryOption,
    ]
  )

  return (
    <OrderShippingContext.Provider value={contextValue}>
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
