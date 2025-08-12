import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameDay, isAfter, isBefore } from 'date-fns';

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

function Calendar({
  className,
  mode = 'single',
  selected,
  onSelect,
  month,
  onMonthChange,
  disabled,
  modifiers = {},
  modifiersStyles = {},
  ...props
}) {
  const displayMonth = month || new Date();
  const year = displayMonth.getFullYear();
  const monthIndex = displayMonth.getMonth();

  const handlePrevMonth = () => {
    if (onMonthChange) {
      onMonthChange(new Date(year, monthIndex - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (onMonthChange) {
      onMonthChange(new Date(year, monthIndex + 1, 1));
    }
  };

  const handleDayClick = (date) => {
    if (!onSelect) return;
    if (mode === 'single') {
      onSelect(date);
    } else if (mode === 'range') {
      const range = selected || {};
      if (!range.from || range.to) {
        onSelect({ from: date, to: null });
      } else {
        if (isBefore(date, range.from)) {
          onSelect({ from: date, to: null });
        } else {
          onSelect({ from: range.from, to: date });
        }
      }
    }
  };

  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Create weeks array
  const allDays = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    allDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    allDays.push(new Date(year, monthIndex, day));
  }
  
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return (
    <div className={cn("p-3 bg-white", className)} {...props}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-semibold">
            {monthNames[monthIndex]} {year}
        </div>
        <button onClick={handleNextMonth} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {dayNames.map(dayName => (
              <th key={dayName} className="pb-2 text-xs text-gray-500 font-medium text-center">{dayName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((date, dayIndex) => {
                if (!date) return <td key={dayIndex}></td>;
                date.setHours(0, 0, 0, 0);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = isSameDay(date, today);

                let isDisabled = false;
                if (disabled) {
                  if (typeof disabled === 'function') isDisabled = disabled(date);
                  else if (disabled.before && isBefore(date, disabled.before)) isDisabled = true;
                  else if (disabled.after && isAfter(date, disabled.after)) isDisabled = true;
                }

                let dayStyle = {};
                let dayClassName = 'h-9 w-9 p-0 font-normal text-sm flex items-center justify-center rounded-md transition-colors';
                let modifierApplied = false;

                // Apply modifiers first
                for (const modifier in modifiers) {
                  if (modifiers[modifier]?.some(d => d && isSameDay(date, d))) {
                    dayStyle = { ...dayStyle, ...modifiersStyles[modifier] };
                    modifierApplied = true;
                    break;
                  }
                }
                
                // Apply selected style if not already styled by a modifier
                if (!modifierApplied && mode === 'single' && selected && isSameDay(date, new Date(selected))) {
                  dayClassName = cn(dayClassName, 'bg-blue-600 text-white hover:bg-blue-700');
                }

                if (isToday && !dayClassName.includes('bg-blue-600') && Object.keys(dayStyle).length === 0) {
                  dayClassName = cn(dayClassName, 'ring-1 ring-blue-500');
                }

                if (!isDisabled) {
                  dayClassName = cn(dayClassName, 'cursor-pointer hover:bg-gray-100');
                } else {
                  dayClassName = cn(dayClassName, 'text-gray-400 cursor-not-allowed');
                }

                return (
                  <td key={dayIndex} className="text-center p-0.5">
                    <button className={dayClassName} style={dayStyle} disabled={isDisabled} onClick={() => !isDisabled && handleDayClick(date)}>
                      {date.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };