export const mockOrderForm = {
  items: [],
  shipping: {
    countries: ['BRA'],
    deliveryOptions: [
      { id: 'Motoboy', price: 500, estimate: '8d', isSelected: false },
      { id: 'PAC', price: 1000, estimate: '5d', isSelected: false },
      { id: 'Expressa', price: 1000, estimate: '7d', isSelected: true },
    ],
    selectedAddress: {
      addressId: '1569522356557',
      addressType: 'residential',
      city: 'Rio de Janeiro',
      complement: '',
      country: 'BRA',
      neighborhood: 'Flamengo',
      number: '',
      postalCode: '22280-001',
      receiverName: '',
      reference: '',
      state: 'RJ',
      street: '',
      geoCoordinates: [],
    },
  },
  marketingData: null,
  totalizers: [{ id: 'Shipping', value: 0 }],
  value: 0,
}
