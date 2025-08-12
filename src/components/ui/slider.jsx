import * as React from "react";

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

const Slider = React.forwardRef(({ className, min, max, step, value, onValueChange, ...props }, ref) => {
  const handleChange = (event) => {
    if (onValueChange) {
      onValueChange([Number(event.target.value)]);
    }
  };

  // The 'value' prop is expected to be an array, so we take the first element for the input range.
  const currentValue = Array.isArray(value) ? value[0] : (value || 0);

  return (
    <div className={cn("relative flex w-full items-center", className)}>
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        {...props}
      />
    </div>
  );
});

Slider.displayName = "Slider";

export { Slider };