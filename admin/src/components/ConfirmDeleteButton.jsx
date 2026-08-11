import { useState } from "react";

// Replaces window.confirm() for delete actions — native confirm() dialogs can
// be silently blocked by browser extensions/settings with no visible error,
// which is exactly what made delete buttons across the admin look "broken."
export default function ConfirmDeleteButton({ onConfirm, label = "Delete", confirmLabel = "delete this", className = "" }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  if (confirming) {
    return (
      <span className={`inline-flex items-center gap-2 text-xs bg-red-50 border border-red-200 rounded px-2 py-1 ${className}`}>
        Sure?
        <button
          onClick={async () => {
            setError(null);
            try {
              await onConfirm();
            } catch (err) {
              setError(err.message);
              setConfirming(false);
            }
          }}
          className="text-red-700 font-medium hover:underline"
        >
          Yes
        </button>
        <button onClick={() => setConfirming(false)} className="text-gray-500 hover:underline">
          No
        </button>
        {error && <span className="text-red-600">{error}</span>}
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className={`text-red-600 hover:underline ${className}`}>
      {label}
    </button>
  );
}
