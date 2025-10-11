"use client";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextInputArea({ value, onChange, placeholder }: TextInputAreaProps) {
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Paste in your notes or content"}
        className="w-full h-72 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black resize-none"
      />
    </div>
  );
}
