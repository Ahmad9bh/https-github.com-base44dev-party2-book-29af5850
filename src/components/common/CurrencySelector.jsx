import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { useLocalization } from '@/components/common/LocalizationContext';

const currencies = [
  { 
    code: 'USD', 
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    countries: ['US', 'EC', 'SV', 'PA']
  },
  { 
    code: 'EUR', 
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'FI', 'IE']
  },
  { 
    code: 'GBP', 
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    countries: ['GB']
  },
  { 
    code: 'SAR', 
    name: 'Saudi Riyal',
    symbol: 'ر.س',
    flag: '🇸🇦',
    countries: ['SA']
  },
  { 
    code: 'AED', 
    name: 'UAE Dirham',
    symbol: 'د.إ',
    flag: '🇦🇪',
    countries: ['AE']
  },
  { 
    code: 'CAD', 
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    countries: ['CA']
  },
  { 
    code: 'AUD', 
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    countries: ['AU']
  }
];

export default function CurrencySelector() {
  const { currentCurrency, setCurrentCurrency } = useLocalization();
  
  const currentCurr = currencies.find(curr => curr.code === currentCurrency) || currencies[0];

  return (
    <Select value={currentCurrency} onValueChange={setCurrentCurrency}>
      <SelectTrigger className="w-auto h-10 px-3 border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{currentCurr.symbol}</span>
          <span>{currentCurr.code}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {currencies.map(currency => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{currency.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{currency.code}</span>
                <span className="text-xs text-gray-500">{currency.name}</span>
              </div>
              <span className="font-mono ml-auto">{currency.symbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Export currencies for use in other components
export { currencies };