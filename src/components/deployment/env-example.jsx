// Environment variables template
// Create a .env file in your project root with these variables

export const envExample = `
# Base44 Configuration
VITE_BASE44_API_URL=https://app--party2-go-29af5850.base44.app
VITE_BASE44_API_KEY=your_api_key_here

# Analytics (Optional)
VITE_PLAUSIBLE_DOMAIN=your-domain.com

# Sentry Error Tracking (Optional)  
VITE_SENTRY_DSN=your_sentry_dsn_here

# Environment
VITE_NODE_ENV=production

# App Configuration
VITE_APP_NAME="Party2Go"
VITE_APP_URL="https://your-domain.com"
VITE_SUPPORT_EMAIL="support@party2go.co"
VITE_COMPANY_NAME="Party2Go Ltd"
`;