import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
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

export function createOrderShippingProvider() {}
