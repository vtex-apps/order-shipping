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
  PickupOption,
} from 'vtex.checkout-graphql'
import EstimateShippingMutation from 'vtex.checkout-resources/MutationEstimateShipping'
import EstimateCarbonFreeShippingMutation from 'vtex.checkout-resources/MutationEstimateCarbonFreeShipping'
import ClearCarbonFreeShippingMutation from 'vtex.checkout-resources/MutationClearCarbonFreeShipping'
import SelectDeliveryOptionMutation from 'vtex.checkout-resources/MutationSelectDeliveryOption'
import SelectPickupOptionMutation from 'vtex.checkout-resources/MutationSelectPickupOption'
import UpdateSelectedAddressMutation from 'vtex.checkout-resources/MutationUpdateSelectedAddress'

const { QueueStatus, useOrderQueue, useQueueStatus } = OrderQueue

const { useOrderForm } = OrderForm

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

interface EstimateCarbonFreeShippingResult {
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
  pickupOptions: PickupOption[]
  selectDeliveryOption: (option: string) => Promise<SelectShippingOptionResult>
  selectPickupOption: (option: string) => Promise<SelectShippingOptionResult>
  estimateCarbonFreeShipping: () => Promise<EstimateCarbonFreeShippingResult>
  clearCarbonFreeShipping: () => Promise<EstimateCarbonFreeShippingResult>
}

const OrderShippingContext = createContext<Context | undefined>(undefined)

const TASK_CANCELLED = 'TASK_CANCELLED'

export const OrderShippingProvider: React.FC = ({ children }) => {
  const [estimateShipping] = useMutation(EstimateShippingMutation)
  const [selectDeliveryOption] = useMutation(SelectDeliveryOptionMutation)
  const [selectPickupOption] = useMutation(SelectPickupOptionMutation)
  const [updateSelectedAddress] = useMutation(UpdateSelectedAddressMutation)
  const [estimateCarbonFreeShipping] = useMutation(
    EstimateCarbonFreeShippingMutation
  )
  const [clearCarbonFreeShipping] = useMutation(ClearCarbonFreeShippingMutation)
  const [
    searchedAddress,
    setSearchedAddress,
  ] = useState<CheckoutAddress | null>(null)

  const { enqueue, listen } = useOrderQueue()
  const { orderForm, setOrderForm } = useOrderForm()

  const queueStatusRef = useQueueStatus(listen)

  const {
    canEditData,
    shipping: { countries, selectedAddress, deliveryOptions, pickupOptions },
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

  const handleEstimateCarbonFreeShipping = useCallback(async () => {
    const task = async () => {
      const {
        data: { estimateCarbonFreeShipping: updatedOrderForm },
      } = await estimateCarbonFreeShipping()

      return updatedOrderForm
    }

    const newOrderForm = await enqueue(task, 'estimateCarbonFreeShipping')
    if (queueStatusRef.current === QueueStatus.FULFILLED) {
      setOrderForm(newOrderForm)
    }

    return { orderForm: newOrderForm }
  }, [queueStatusRef, estimateCarbonFreeShipping, enqueue, setOrderForm])

  const handleClearCarbonFreeShipping = useCallback(async () => {
    const task = async () => {
      const {
        data: { clearCarbonFreeShipping: updatedOrderForm },
      } = await clearCarbonFreeShipping()

      return updatedOrderForm
    }

    const newOrderForm = await enqueue(task, 'clearCarbonFreeShipping')
    if (queueStatusRef.current === QueueStatus.FULFILLED) {
      setOrderForm(newOrderForm)
    }

    return { orderForm: newOrderForm }
  }, [queueStatusRef, clearCarbonFreeShipping, enqueue, setOrderForm])

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

      enqueue(task, 'selectDeliveryOption').then(newOrderForm => {
        if (queueStatusRef.current === QueueStatus.FULFILLED) {
          setOrderForm(newOrderForm)
        }
      })

      return { success: true }
    },
    [queueStatusRef, selectDeliveryOption, enqueue, setOrderForm]
  )

  const handleSelectPickupOption = useCallback(
    async (pickupOptionId: string) => {
      const task = async () => {
        const {
          data: { selectPickupOption: updatedOrderForm },
        } = await selectPickupOption({
          variables: {
            pickupOptionId,
          },
        })

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

      enqueue(task, 'selectPickupOption').then(newOrderForm => {
        if (queueStatusRef.current === QueueStatus.FULFILLED) {
          setOrderForm(newOrderForm)
        }
      })

      return { success: true }
    },
    [queueStatusRef, selectPickupOption, enqueue, setOrderForm]
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
      pickupOptions: pickupOptions as PickupOption[],
      selectDeliveryOption: handleSelectDeliveryOption,
      selectPickupOption: handleSelectPickupOption,
      estimateCarbonFreeShipping: handleEstimateCarbonFreeShipping,
      clearCarbonFreeShipping: handleClearCarbonFreeShipping,
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
      handleEstimateCarbonFreeShipping,
      handleClearCarbonFreeShipping,
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
