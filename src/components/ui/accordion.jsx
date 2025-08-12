import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const AccordionContext = createContext();

export const Accordion = ({ type = "single", collapsible = false, children, className = "" }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (value) => {
    const newOpenItems = new Set(openItems);
    
    if (type === "single") {
      if (newOpenItems.has(value)) {
        if (collapsible) {
          newOpenItems.delete(value);
        }
      } else {
        newOpenItems.clear();
        newOpenItems.add(value);
      }
    } else {
      if (newOpenItems.has(value)) {
        newOpenItems.delete(value);
      } else {
        newOpenItems.add(value);
      }
    }
    
    setOpenItems(newOpenItems);
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({ value, children, className = "" }) => {
  return (
    <div className={className} data-value={value}>
      {children}
    </div>
  );
};

export const AccordionTrigger = ({ children, className = "" }) => {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const value = React.Children.toArray(children)[0]?.props?.['data-value'] || 
                document.querySelector('[data-value]')?.getAttribute('data-value');
  
  const isOpen = openItems.has(value);

  return (
    <button
      className={`flex w-full items-center justify-between py-4 font-medium transition-all hover:underline ${className}`}
      onClick={() => toggleItem(value)}
      type="button"
    >
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

export const AccordionContent = ({ children, className = "" }) => {
  const { openItems } = useContext(AccordionContext);
  const value = React.Children.toArray(children)[0]?.props?.['data-value'] || 
                document.querySelector('[data-value]')?.getAttribute('data-value');
  
  const isOpen = openItems.has(value);

  return (
    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'animate-accordion-down' : 'animate-accordion-up'}`}>
      {isOpen && (
        <div className={`pb-4 pt-0 ${className}`}>
          {children}
        </div>
      )}
    </div>
  );
};