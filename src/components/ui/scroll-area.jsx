
import React from 'react';

export const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div 
    ref={ref} 
    className={`overflow-auto ${className}`} 
    {...props}
  >
    {children}
  </div>
));

ScrollArea.displayName = "ScrollArea";

export const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <div 
    ref={ref} 
    className={`${orientation === "horizontal" ? "h-2.5 flex-col border-t" : "w-2.5 border-r"} ${className}`}
    {...props}
  />
));

ScrollBar.displayName = "ScrollBar";
