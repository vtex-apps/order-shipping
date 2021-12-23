export const mockOrderForm = {
  id: '123',
  loggedIn: false,
  paymentData: {
    installmentOptions: [
      {
        value: 100,
        paymentSystem: '1',
        installments: [],
      },
    ],
    isValid: true,
    payments: [],
    paymentSystems: [],
    availableAccounts: [],
  },
  items: [
    {
      additionalInfo: {
        brandName: 'Test Brand 0',
      },
      id: '1',
      uniqueId: '1',
      detailUrl: '/work-shirt/p',
      imageUrls: {
        at1x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155476-55-55/Frame-4.jpg?v=636793808441900000',
        at2x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155476-55-55/Frame-4.jpg?v=636793808441900000',
        at3x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155476-55-55/Frame-4.jpg?v=636793808441900000',
      },
      listPrice: 2800000,
      measurementUnit: 'un',
      name: 'قميص العمل الأعلى',
      price: 2400000,
      productId: '1',
      quantity: 3,
      sellingPrice: 2400000,
      skuName: 'Test SKU 0',
      skuSpecifications: [],
      attachmentOfferings: [],
      bundleItems: [],

      attachments: [],
      offerings: [],
      priceTags: [],
    },
    {
      additionalInfo: {
        brandName: 'Test Brand 1',
      },
      id: '30',
      uniqueId: '30',
      detailUrl: '/long-sleeve-shirt/p',
      imageUrls: {
        at1x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155487-55-55/Frame-7.jpg?v=636793837686400000',
        at2x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155487-55-55/Frame-7.jpg?v=636793837686400000',
        at3x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155487-55-55/Frame-7.jpg?v=636793837686400000',
      },
      listPrice: 945000,
      measurementUnit: 'un',
      name: '上品なサングラス',
      price: 945000,
      productId: '2000005',
      quantity: 1,
      sellingPrice: 945000,
      skuName: 'Test SKU 1',
      skuSpecifications: [],
      attachmentOfferings: [],
      bundleItems: [],
      isGift: false,
      attachments: [],
      offerings: [],
      priceTags: [],
    },
    {
      additionalInfo: {
        brandName: 'Test Brand 2',
      },
      id: '2000535',
      uniqueId: '2000535',
      detailUrl: '/classy--sunglasses/p',
      imageUrls: {
        at1x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155469-55-55/Frame-8.jpg?v=636793757498800000',
        at2x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155469-55-55/Frame-8.jpg?v=636793757498800000',
        at3x:
          'http://storecomponents.vteximg.com.br/arquivos/ids/155469-55-55/Frame-8.jpg?v=636793757498800000',
      },
      listPrice: 400000,
      measurementUnit: 'un',
      name: 'กางเกงขาสั้น St Tropez',
      price: 360000,
      productId: '13',
      quantity: 4,
      sellingPrice: 360000,
      skuName: 'Test SKU 2',
      skuSpecifications: [],
      attachmentOfferings: [],
      bundleItems: [],
      isGift: false,
      attachments: [],
      offerings: [],
      priceTags: [],
    },
  ],
  marketingData: {},
  totalizers: [
    {
      id: 'Items',
      name: 'Items Total',
      value: 9585000,
    },
  ],
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
  messages: {
    couponMessages: [],
    generalMessages: [],
  },
  clientProfileData: {
    email: 'fulanodetal@vtex.com',
    firstName: 'Fulano',
    lastName: 'Di Tal',
    isValid: true,
  },
  canEditData: false,
  value: 9585000,
}
