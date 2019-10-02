import React, { FunctionComponent, useEffect } from 'react'
import { act, render, fireEvent } from '@vtex/test-tools/react'
import {
  estimateShipping as EstimateShipping,
  selectDeliveryOption as SelectDeliveryOption,
} from 'vtex.checkout-resources/Mutations'
import { OrderFormProvider, useOrderForm } from 'vtex.order-manager/OrderForm'
import { OrderQueueProvider } from 'vtex.order-manager/OrderQueue'

import { mockOrderForm } from '../__mocks__/mockOrderForm'
import { OrderShippingProvider, useOrderShipping } from '../OrderShipping'

const mockedAddress = {
  addressId: '1569522356558',
  addressType: 'residential',
  city: 'Rio de Janeiro',
  complement: '',
  country: 'BRA',
  neighborhood: 'Botafogo',
  number: '',
  postalCode: '22230-005',
  receiverName: '',
  reference: '',
  state: 'RJ',
  street: '',
  geoCoordinates: [],
}

const mockedDeliveryOptions = [
  { id: 'Motoboy', price: 500, estimate: '8d', isSelected: false },
  { id: 'PAC', price: 1000, estimate: '5d', isSelected: true },
  { id: 'Expressa', price: 1000, estimate: '7d', isSelected: false },
]

const mockInsertAddressMutation = (
  args: CheckoutAddress,
  result: CheckoutAddress
) => ({
  request: {
    query: EstimateShipping,
    variables: {
      addressInput: args,
    },
  },
  result: {
    data: {
      estimateShipping: {
        ...mockOrderForm,
        shipping: {
          selectedAddress: result,
        },
      },
    },
  },
})

const mockSelectDeliveryOptionMutation = (
  args: string,
  result: DeliveryOption[]
) => ({
  request: {
    query: SelectDeliveryOption,
    variables: {
      deliveryOptionId: args,
    },
  },
  result: {
    data: {
      selectDeliveryOption: {
        ...mockOrderForm,
        shipping: {
          deliveryOptions: result,
        },
      },
    },
  },
})

describe('OrderShipping', () => {
  it('should throw when useOrderShipping is used outside a OrderShippingProvider', () => {
    const oldConsoleError = console.error
    console.error = () => {}

    const Component: FunctionComponent = () => {
      useOrderShipping()
      return <div>foo</div>
    }

    expect(() => render(<Component />)).toThrow(
      'useOrderShipping must be used within a OrderShippingProvider'
    )

    console.error = oldConsoleError
  })

  it('should change selectedAddress', async () => {
    const Component: FunctionComponent = () => {
      const {
        orderForm: {
          shipping: {
            selectedAddress: { postalCode },
          },
        },
      } = useOrderForm()
      const { insertAddress } = useOrderShipping()

      return (
        <div>
          {postalCode}
          <button onClick={() => insertAddress(mockedAddress)}>mutate</button>
        </div>
      )
    }

    const mockInsertAddress = mockInsertAddressMutation(
      mockedAddress,
      mockedAddress
    )

    const { getByText } = render(
      <OrderQueueProvider>
        <OrderFormProvider>
          <OrderShippingProvider>
            <Component />
          </OrderShippingProvider>
        </OrderFormProvider>
      </OrderQueueProvider>,
      { graphql: { mocks: [mockInsertAddress] } }
    )

    const button = getByText('mutate')

    expect(getByText('22280-001')).toBeTruthy()
    act(() => {
      fireEvent.click(button)
    })

    await act(() => new Promise(resolve => setTimeout(() => resolve())))

    expect(getByText('22230-005')).toBeTruthy()
  })

  it('should change the selected delivery option', async () => {
    const Component: FunctionComponent = () => {
      const {
        orderForm: {
          shipping: { deliveryOptions },
        },
      } = useOrderForm()
      const { selectDeliveryOption } = useOrderShipping()

      const { id } = deliveryOptions.find((option: DeliveryOption) => {
        return option.isSelected
      })

      return (
        <div>
          {id}
          <button onClick={() => selectDeliveryOption('PAC')}>mutate</button>
        </div>
      )
    }

    const mockSelectDeliveryOptions = mockSelectDeliveryOptionMutation(
      'PAC',
      mockedDeliveryOptions
    )

    const { getByText } = render(
      <OrderQueueProvider>
        <OrderFormProvider>
          <OrderShippingProvider>
            <Component />
          </OrderShippingProvider>
        </OrderFormProvider>
      </OrderQueueProvider>,
      { graphql: { mocks: [mockSelectDeliveryOptions] } }
    )

    expect(getByText('Expressa')).toBeTruthy()

    const button = getByText('mutate')

    act(() => {
      fireEvent.click(button)
    })

    await act(() => new Promise(resolve => setTimeout(() => resolve())))
  })
})
