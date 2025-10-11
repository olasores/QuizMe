"use client";

interface GenerateButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GenerateButton({ onClick, disabled, loading }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="px-8 py-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow"
    >
      {loading ? 'Generating...' : 'Generate'}
    </button>
  );
}
