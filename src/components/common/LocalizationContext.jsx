
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { getLocalizedText as getLocalizedTextUtil } from '@/components/common/FormatUtils';

const LocalizationContext = createContext({
  currentLanguage: 'en',
  setCurrentLanguage: () => {},
  currentCurrency: 'USD',
  setCurrentCurrency: () => {},
  isRTL: false,
  getLocalizedText: (key) => key,
});

export const LocalizationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.preferred_language) {
        setCurrentLanguage(userData.preferred_language);
      }
      if (userData.preferred_currency) {
        setCurrentCurrency(userData.preferred_currency);
      }
    } catch (error) {
      // User not logged in, use defaults
      const savedLanguage = localStorage.getItem('preferred_language') || 'en';
      const savedCurrency = localStorage.getItem('preferred_currency') || 'USD';
      setCurrentLanguage(savedLanguage);
      setCurrentCurrency(savedCurrency);
    }
  };

  const updateLanguage = async (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('preferred_language', newLanguage);
    
    if (user) {
      try {
        await User.updateMyUserData({ preferred_language: newLanguage });
      } catch (error) {
        console.error('Failed to update user language preference:', error);
      }
    }
  };

  const updateCurrency = async (newCurrency) => {
    setCurrentCurrency(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
    
    if (user) {
      try {
        await User.updateMyUserData({ preferred_currency: newCurrency });
      } catch (error) {
        console.error('Failed to update user currency preference:', error);
      }
    }
  };

  const isRTL = currentLanguage === 'ar';

  const getLocalizedText = (key, variables) => {
    return getLocalizedTextUtil(key, currentLanguage, variables);
  };

  return (
    <LocalizationContext.Provider value={{
      currentLanguage,
      setCurrentLanguage: updateLanguage,
      currentCurrency,
      setCurrentCurrency: updateCurrency,
      isRTL,
      getLocalizedText,
    }}>
      <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    // This provides a fallback for consumers outside the provider, or during initial render
    return {
      currentLanguage: 'en',
      setCurrentLanguage: () => {},
      currentCurrency: 'USD',
      setCurrentCurrency: () => {},
      isRTL: false,
      getLocalizedText: (key) => key,
    };
  }
  return context;
};
