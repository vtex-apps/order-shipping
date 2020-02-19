import gql from 'graphql-tag'

export default gql`
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
