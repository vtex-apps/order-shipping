📢 Use this project, [contribute](https://github.com/{OrganizationName}/{AppName}) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

# ORDERS SHIPPING

⚠️ **This is an ongoing, unsupported, unfinished and undocumented project. We do not guarantee any results after installation.** ⚠️

<!-- DOCS-IGNORE:start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- DOCS-IGNORE:end -->

> Centralizes all shipping related requests to the Checkout API.

Any kind of shipping query or manipulation should be made through this component. This ensures that each interaction with the Checkout API happens in succession, avoiding concurrency issues.

## Configuration 

Use the hook `useOrderShipping` to get access to the API methods. Your component must be contained in a `OrderShippingProvider`, which in turn must be contained in a `OrderFormProvider` inside a `OrderQueueProvider`.

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

## Customization

TBC

<!-- DOCS-IGNORE:start -->

## Contributors ✨

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!

<!-- DOCS-IGNORE:end -->
