import React, { createContext, ReactNode, useContext } from 'react'

import { useOrderForm } from 'vtex.order-manager/OrderForm'

interface Context {
  countries: string[]
}

interface OrderShippingProps {
  children: ReactNode
}

const OrderShippingContext = createContext<Context | undefined>(undefined)

export const OrderShippingProvider = ({ children }: OrderShippingProps) => {
  const {
    orderForm: {
      shipping: { countries },
    },
  } = useOrderForm()

  return (
    <OrderShippingContext.Provider value={{ countries }}>
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
