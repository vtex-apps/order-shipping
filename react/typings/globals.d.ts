interface OrderForm {
  items: Item[]
  shipping: Shipping
  marketingData: MarketingData | null
  totalizers: Totalizer[]
  value: number
}

interface Item {
  additionalInfo: ItemAdditionalInfo
  detailUrl: string
  id: string
  imageUrl: string
  listPrice: number
  measurementUnit: string
  name: string
  price: number
  productId: string
  quantity: number
  sellingPrice: number
  skuName: string
  skuSpecifications: SKUSpecification[]
}

interface ItemAdditionalInfo {
  brandName: string
}

interface MarketingData {
  coupon: string
}

interface SKUSpecification {
  fieldName: string
  fieldValues: string[]
}

interface Totalizer {
  id: string
  name: string
  value: number
}

interface Shipping {
  availableAddresses: CheckoutAddress[]
  countries: string[]
  deliveryOptions: DeliveryOption[]
  selectedAddress: CheckoutAddress | null
}

interface DeliveryOption {
  id: string
  price: number
  estimate: string
  isSelected: boolean
}

interface CheckoutAddress {
  addressType: string
  receiverName: string
  addressId: string
  postalCode: string
  city: string
  state: string
  country: string
  street: string
  number: string
  neighborhood: string
  complement: string
  reference: string | null
  geoCoordinates: number[]
}
