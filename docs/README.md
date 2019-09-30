# Order Shipping

> Centralizes all shipping related requests to the Checkout API.

Any kind of shipping query or manipulation should be made through this component. This ensures that each interaction with the Checkout API happens in succession, avoiding concurrency issues.

## Usage

Use the function `useOrderShipping` to get access to the API methods. Your component must be contained in a `OrderShippingProvider`, which in turn must be contained in a `OrderFormProvider` inside a `OrderQueueProvider`.

```tsx
import { OrderFormProvider } from 'vtex.order-manager/OrderForm'
import { OrderQueueProvider } from 'vtex.order-manager/OrderQueue'
import {
  OrderShippingProvider,
  useOrderShipping,
} from 'vtex.order-shipping/OrderShipping'

const MainComponent: FunctionComponent = () => (
  <OrderQueueProvider>
    <OrderFormProvider>
      <OrderShippingProvider>
        <MyComponent />
      </OrderShippingProvider>
    </OrderFormProvider>
  </OrderQueueProvider>
)

const MyComponent: FunctionComponent = () => {
  const { insertAddress, selectDeliveryOption } = useOrderShipping()
  // ...
}
```

## API

### `insertAddress: (props: { addressId: string, addressType: string, city: string, country: string, state: string, street: string, postalCode: string, neighborhood: string, geocoordinates: number[], number: string, complement: string, receiverName: string, reference: string, addressQuery: string}) => void`

Sets the `selectedAddress` inside `shipping` property of the `orderForm`.

#### Example

```tsx
insertAddress({
  addressId: '1569522356557',
  addressType: 'residential',
  city: 'Rio de Janeiro',
  country: 'BRA',
  state: 'RJ',
  street: 'Rua General Polidoro',
  postalCode: '22230-060',
  neighborhood: 'Botafogo',
  geocoordinates: [],
  complement: '',
  number: '',
  receiverName: '',
  reference: '',
  addressQuery: '',
})
```

### `selectDeliveryOption: ( deliveryOptionId: string ) => void`

Changes the selected delivery option to be the one which has the given `deliveryOptionId`.

#### Example

```tsx
selectDeliveryOption('PAC')
```
