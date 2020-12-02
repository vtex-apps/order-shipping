import gql from 'graphql-tag'

export default gql`
  mutation MockMutation($pickupOptionId: String) {
    selectPickupOption(pickupOptionId: $pickupOptionId) {
      shipping {
        pickupOptions {
          id
          price
          estimate
          isSelected
        }
      }
    }
  }
`
