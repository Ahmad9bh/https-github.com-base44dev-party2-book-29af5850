import * as React from "react";

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

const labelVariants = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants, className)}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };