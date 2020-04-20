import gql from 'graphql-tag'

export default gql`
  mutation MockUpdateSelectedAddress($address: AddressInput!) {
    updateSelectedAddresS(input: $address) {
      shipping {
        selectedAddress {
          id
        }
      }
    }
  }
`
