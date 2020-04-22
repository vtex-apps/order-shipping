import gql from 'graphql-tag'

export default gql`
  mutation MockUpdateSelectedAddress($address: AddressInput!) {
    updateSelectedAddress(input: $address) {
      shipping {
        selectedAddress {
          id
        }
      }
    }
  }
`
