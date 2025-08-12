// Stripe Configuration Component
// This handles different environments and currency setup

export const StripeConfig = {
  // Test keys - replace with your actual Stripe keys
  // In production, these would be loaded from environment variables server-side
  publicKey: 'pk_test_51234567890abcdef...', // Your test publishable key
    
  // Currency configurations
  currencies: {
    USD: { code: 'usd', symbol: '$', decimal_places: 2 },
    EUR: { code: 'eur', symbol: '€', decimal_places: 2 },
    GBP: { code: 'gbp', symbol: '£', decimal_places: 2 },
    SAR: { code: 'sar', symbol: 'ر.س', decimal_places: 2 },
    AED: { code: 'aed', symbol: 'د.إ', decimal_places: 2 }
  },
  
  // Payment method types to enable
  paymentMethods: ['card', 'apple_pay', 'google_pay'],
  
  // Get currency config by code
  getCurrency: (code) => {
    return StripeConfig.currencies[code] || StripeConfig.currencies['USD'];
  },
  
  // Format amount for Stripe (convert to cents)
  formatAmountForStripe: (amount, currency) => {
    const config = StripeConfig.getCurrency(currency);
    return Math.round(amount * Math.pow(10, config.decimal_places));
  },
  
  // Format amount for display
  formatAmountForDisplay: (stripeAmount, currency) => {
    const config = StripeConfig.getCurrency(currency);
    return stripeAmount / Math.pow(10, config.decimal_places);
  }
};

export default StripeConfig;