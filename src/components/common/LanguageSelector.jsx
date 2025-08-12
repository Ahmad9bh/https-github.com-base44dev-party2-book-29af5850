import React from 'react';
import { useLocalization } from '@/components/common/LocalizationContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ onSelection = () => {} }) => {
  const { currentLanguage, setCurrentLanguage } = useLocalization();

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    setCurrentLanguage(newLang);
    onSelection(newLang);
  };

  return (
    <Button variant="ghost" onClick={toggleLanguage} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
      <Globe className="w-5 h-5" />
      <span className="text-sm font-medium">
        {currentLanguage === 'en' ? 'العربية' : 'English'}
      </span>
    </Button>
  );
};

export default LanguageSelector;