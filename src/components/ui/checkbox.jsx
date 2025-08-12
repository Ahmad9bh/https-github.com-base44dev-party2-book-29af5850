import * as React from "react";
import { Check } from "lucide-react";

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  
  const handleClick = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={handleClick}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600",
        className
      )}
      {...props}
    >
      {checked && (
        <div className="flex items-center justify-center text-current">
          <Check className="h-4 w-4" />
        </div>
      )}
    </button>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };