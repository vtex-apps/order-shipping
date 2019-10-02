import gql from 'graphql-tag'

export const estimateShipping = gql`
  mutation MockMutation($addressInput: Address) {
    estimateShipping(addressInput: $addressInput) {
      shipping {
        selectedAddress {
          addressId
          addressType
          city
          complement
          country
          neighborhood
          number
          postalCode
          receiverName
          reference
          state
          street
        }
      }
    }
  }
`
export const selectDeliveryOption = gql`
  mutation MockMutation($deliveryOptionId: String) {
    selectDeliveryOption(deliveryOptionId: $deliveryOptionId) {
      shipping {
        deliveryOptions {
          id
          price
          estimate
          isSelected
        }
      }
    }
  }
`
