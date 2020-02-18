import gql from 'graphql-tag'

export default gql`
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
