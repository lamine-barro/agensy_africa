export const publicConfiguration = {
  branding: { name: 'Agensy Africa', colors: { primary: '#123f32', accent: '#d76531', leaf: '#58a521' } },
  commerce: {
    currency: 'XOF',
    serviceFee: 2000,
    businessTypes: ['shop', 'restaurant', 'hotel', 'canteen', 'reseller'],
    legalStatuses: ['formal', 'informal'],
    countries: ['CI', 'INTL'],
    scheduleTypes: ['asap', 'scheduled', 'recurring'],
    recurringFrequencies: ['weekly', 'monthly'],
    statuses: ['draft', 'submitted', 'adjusted', 'accepted', 'paid', 'delivered', 'cancelled'],
    transitions: { draft: ['submitted', 'cancelled'], submitted: ['adjusted', 'accepted', 'cancelled'], adjusted: ['accepted', 'cancelled'], accepted: ['paid', 'cancelled'], paid: ['delivered'], delivered: [], cancelled: [] },
    delivery: { validationHours: 24, defaultFee: 0 }
  }
};
