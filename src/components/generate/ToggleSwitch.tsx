"use client";

interface ToggleSwitchProps {
  options: [string, string];
  selected: string;
  onChange: (value: string) => void;
}

export function ToggleSwitch({ options, selected, onChange }: ToggleSwitchProps) {
  return (
    <div className="inline-flex rounded-full bg-neutral-200 p-1">
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition ${
            selected === option
              ? 'bg-black text-white shadow-sm'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
